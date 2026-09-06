const state = { token: localStorage.getItem("student-pantry-admin-token") };
const loginPanel = document.querySelector("#login-panel");
const dashboard = document.querySelector("#dashboard");
const message = document.querySelector("#login-message");

async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${state.token}`, ...options.headers } });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.error || "Request failed");
  return data;
}

async function loadDashboard() {
  const [products, orders] = await Promise.all([api("/api/products"), api("/api/orders")]);
  document.querySelector("#stats").innerHTML = `<div class="stat"><span>Active products</span><strong>${products.length}</strong></div><div class="stat"><span>Units in stock</span><strong>${products.reduce((sum, product) => sum + product.stock, 0)}</strong></div><div class="stat"><span>Orders to prepare</span><strong>${orders.filter((order) => order.status === "PLACED").length}</strong></div>`;
  document.querySelector("#product-table").innerHTML = products.map((product) => `<tr><td><strong>${product.name}</strong></td><td>${product.category}</td><td>₹${product.price}</td><td><span class="stock">${product.stock}</span></td></tr>`).join("");
  document.querySelector("#orders-list").innerHTML = orders.length ? orders.slice(0, 8).map((order) => `<article class="order"><div class="order-top"><span>Order #${order.id}</span><span class="status">${order.status.replaceAll("_", " ")}</span></div><small>${order.user?.name || "Student"} · ₹${order.total} · ${order.items.length} item(s)</small></article>`).join("") : `<p class="empty">No pickup orders yet.</p>`;
}

function showDashboard() {
  loginPanel.hidden = true;
  dashboard.hidden = false;
  document.querySelector("#logout").hidden = false;
  loadDashboard().catch((error) => { loginPanel.hidden = false; dashboard.hidden = true; message.textContent = error.message; });
}

document.querySelector("#login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  message.textContent = "";
  try {
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Login failed");
    if (result.user.role !== "ADMIN") throw new Error("This account does not have admin access");
    state.token = result.token;
    localStorage.setItem("student-pantry-admin-token", state.token);
    showDashboard();
  } catch (error) { message.textContent = error.message; }
});
document.querySelector("#logout").addEventListener("click", () => { localStorage.removeItem("student-pantry-admin-token"); state.token = null; location.reload(); });
document.querySelector("#refresh-products").addEventListener("click", () => loadDashboard());
document.querySelector("#refresh-orders").addEventListener("click", () => loadDashboard());
if (state.token) showDashboard();
