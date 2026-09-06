import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  { name: "Hostel breakfast kit", description: "Oats, bananas, milk & honey", category: "breakfast", price: 149, stock: 30 },
  { name: "Midnight munchies", description: "Chips, cookies & chocolate", category: "snacks", price: 189, stock: 40 },
  { name: "Masala noodles pack", description: "5-pack · Ready in 3 minutes", category: "meals", price: 119, stock: 50 },
  { name: "Exam week essentials", description: "Coffee, snacks & stationery", category: "bundle", price: 249, stock: 20 },
  { name: "Cold coffee six-pack", description: "Chilled · 6 x 200 ml", category: "drinks", price: 199, stock: 25 },
  { name: "Care mini-kit", description: "Soap, toothpaste & laundry tabs", category: "care", price: 179, stock: 25 },
];

const adminPassword = process.env.ADMIN_PASSWORD || "StudentPantryAdmin2026!";

await prisma.user.upsert({
  where: { email: "admin@studentpantry.local" },
  update: { role: "ADMIN", passwordHash: await bcrypt.hash(adminPassword, 12) },
  create: { name: "Student Pantry Admin", email: "admin@studentpantry.local", passwordHash: await bcrypt.hash(adminPassword, 12), role: "ADMIN" },
});

for (const product of products) {
  await prisma.product.upsert({ where: { id: products.indexOf(product) + 1 }, update: product, create: product });
}

console.log("Student Pantry seed complete.");
console.log("Admin email: admin@studentpantry.local");
console.log(`Admin password: ${adminPassword}`);
await prisma.$disconnect();