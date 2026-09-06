import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const port = Number(process.env.PORT || 4000);
const jwtSecret = process.env.JWT_SECRET || "development-secret";

app.use(cors());
app.use(express.json());
app.use(express.static("."));

function createToken(user) {
  return jwt.sign({ id: user.id, role: user.role, email: user.email }, jwtSecret, { expiresIn: "7d" });
}

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Authentication required" });
  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Admin access required" });
  next();
}

app.get("/api/health", (_req, res) => res.json({ service: "student-pantry-api", status: "ok" }));

app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 8) return res.status(400).json({ error: "Name, email and an 8-character password are required" });
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return res.status(409).json({ error: "An account with this email already exists" });
  const user = await prisma.user.create({ data: { name, email, passwordHash: await bcrypt.hash(password, 12) } });
  res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token: createToken(user) });
});

app.post("/api/auth/login", async (req, res) => {
  const user = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (!user || !(await bcrypt.compare(req.body.password || "", user.passwordHash))) return res.status(401).json({ error: "Invalid email or password" });
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token: createToken(user) });
});

app.get("/api/products", async (req, res) => {
  const where = { isActive: true, ...(req.query.category ? { category: req.query.category } : {}) };
  res.json(await prisma.product.findMany({ where, orderBy: { createdAt: "desc" } }));
});

app.post("/api/products", requireAuth, requireAdmin, async (req, res) => {
  const product = await prisma.product.create({ data: { ...req.body, price: Number(req.body.price), stock: Number(req.body.stock || 0) } });
  res.status(201).json(product);
});

app.patch("/api/products/:id", requireAuth, requireAdmin, async (req, res) => {
  const product = await prisma.product.update({ where: { id: Number(req.params.id) }, data: req.body });
  res.json(product);
});

app.delete("/api/products/:id", requireAuth, requireAdmin, async (req, res) => {
  await prisma.product.update({ where: { id: Number(req.params.id) }, data: { isActive: false } });
  res.status(204).end();
});

app.post("/api/orders", requireAuth, async (req, res) => {
  const requestedItems = Array.isArray(req.body.items) ? req.body.items : [];
  if (!requestedItems.length) return res.status(400).json({ error: "At least one product is required" });
  const productIds = requestedItems.map((item) => Number(item.productId));
  const products = await prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } });
  const productMap = new Map(products.map((product) => [product.id, product]));
  const items = requestedItems.map((item) => ({ product: productMap.get(Number(item.productId)), quantity: Number(item.quantity) }));
  if (items.some((item) => !item.product || item.quantity < 1 || item.quantity > item.product.stock)) return res.status(400).json({ error: "One or more products are unavailable" });
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const order = await prisma.$transaction(async (transaction) => {
    for (const item of items) await transaction.product.update({ where: { id: item.product.id }, data: { stock: { decrement: item.quantity } } });
    return transaction.order.create({ data: { userId: req.user.id, total, pickupSlot: req.body.pickupSlot, items: { create: items.map((item) => ({ productId: item.product.id, quantity: item.quantity, unitPrice: item.product.price })) } }, include: { items: { include: { product: true } } } });
  });
  res.status(201).json(order);
});

app.get("/api/orders", requireAuth, async (req, res) => {
  const where = req.user.role === "ADMIN" ? {} : { userId: req.user.id };
  res.json(await prisma.order.findMany({ where, include: { items: { include: { product: true } }, user: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" } }));
});

app.patch("/api/orders/:id/status", requireAuth, requireAdmin, async (req, res) => {
  const order = await prisma.order.update({ where: { id: Number(req.params.id) }, data: { status: req.body.status } });
  res.json(order);
});

app.listen(port, () => console.log(`Student Pantry API running on http://localhost:${port}`));