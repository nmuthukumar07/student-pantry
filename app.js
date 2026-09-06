const categories = [
  { name: "Breakfast", icon: "🥣", filter: "breakfast" },
  { name: "Study snacks", icon: "🍪", filter: "snacks" },
  { name: "Quick meals", icon: "🍜", filter: "meals" },
  { name: "Drinks", icon: "🧃", filter: "drinks" },
  { name: "Personal care", icon: "🧼", filter: "care" },
  { name: "Bundles", icon: "📦", filter: "bundle" },
];

const fallbackProducts = [
  { id: 1, name: "Hostel breakfast kit", category: "breakfast", meta: "Oats, bananas, milk & honey", price: 149, tag: "Best value", image: "image-saffron", icon: "🥣", filter: "bundle" },
  { id: 2, name: "Midnight munchies", category: "snacks", meta: "Chips, cookies & chocolate", price: 189, tag: "Popular", image: "image-rose", icon: "🍪", filter: "under-200" },
  { id: 3, name: "Masala noodles pack", category: "meals", meta: "5-pack · Ready in 3 minutes", price: 119, tag: "Under ₹200", image: "image-green", icon: "🍜", filter: "veg" },
  { id: 4, name: "Exam week essentials", category: "bundle", meta: "Coffee, snacks & stationery", price: 249, tag: "Save ₹80", image: "image-blue", icon: "📦", filter: "bundle" },
  { id: 5, name: "Cold coffee six-pack", category: "drinks", meta: "Chilled · 6 x 200 ml", price: 199, tag: "Under ₹200", image: "image-blue", icon: "🧃", filter: "under-200" },
  { id: 6, name: "Care mini-kit", category: "care", meta: "Soap, toothpaste & laundry tabs", price: 179, tag: "Student pick", image: "image-saffron", icon: "🧼", filter: "bundle" },
];

let products = [];
const state = { cart: [], orders: [], filter: "all", category: "all" };
const categoryRow = document.querySelector("#category-row");
const restaurantGrid = document.querySelector("#restaurant-grid");
const cartDrawer = document.querySelector("#cart-drawer");

function renderCategories() {
  categoryRow.innerHTML = categories.map((category) => `
    <button class="category-card" data-category="${category.filter}" type="button">
      <span class="category-icon">${category.icon}</span><strong>${category.name}</strong>
    </button>`).join("");
  categoryRow.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
    state.category = state.category === button.dataset.category ? "all" : button.dataset.category;
    categoryRow.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button && state.category !== "all"));
    renderProducts();
  }));
}

function renderProducts() {
  const visible = products.filter((product) => {
    const matchesCategory = state.category === "all" || product.category === state.category || product.filter === state.category;
    const vegetarianCategories = ["breakfast", "snacks", "meals", "drinks"];
    const matchesVegetarian = state.filter === "veg" && vegetarianCategories.includes(product.category);
    const matchesFilter = state.filter === "all" || product.filter === state.filter || matchesVegetarian || (state.filter === "under-200" && product.price < 200);
    return matchesCategory && matchesFilter;
  });
  restaurantGrid.innerHTML = visible.length ? visible.map((product) => `
    <article class="restaurant-card">
      <div class="restaurant-image ${product.image}"><span class="rating">${product.tag}</span><span class="delivery-time">Pickup in 15 min</span></div>
      <div class="restaurant-info"><h3>${product.name}</h3><div class="restaurant-meta">${product.meta}</div>
        <div class="restaurant-footer"><span class="price">₹${product.price}</span><button class="add-button" data-product="${product.id}" type="button">Add to basket</button></div>
      </div>
    </article>`).join("") : `<p class="empty-cart">Nothing matches that filter yet. Try another pantry aisle.</p>`;
  restaurantGrid.querySelectorAll(".add-button").forEach((button) => button.addEventListener("click", () => addToCart(Number(button.dataset.product))));
}

function addToCart(id) {
  const product = products.find((item) => item.id === id);
  state.cart.push(product);
  renderCart();
  showToast(`${product.name} added to your basket`);
}

function renderCart() {
  const total = state.cart.reduce((sum, item) => sum + item.price, 0);
  document.querySelector("#basket-count").textContent = state.cart.length;
  document.querySelector("#cart-total").textContent = `₹${total}`;
  document.querySelector("#cart-grand-total").textContent = `₹${total}`;
  document.querySelector("#cart-items").innerHTML = state.cart.length ? state.cart.map((item) => `
    <div class="cart-item"><span class="cart-item-icon">${item.icon}</span><span class="cart-item-info"><strong>${item.name}</strong><small>1 item · pickup today</small></span><span class="cart-item-price">₹${item.price}</span></div>`).join("") : `<div class="empty-cart">Your basket is waiting for a few useful things.<br />Start with a student bundle.</div>`;
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2200);
}

document.querySelector("#filter-button").addEventListener("click", () => {
  const panel = document.querySelector("#filter-panel");
  panel.hidden = !panel.hidden;
});
document.querySelectorAll(".filter-chip").forEach((button) => button.addEventListener("click", () => {
  state.filter = button.dataset.filter;
  document.querySelectorAll(".filter-chip").forEach((item) => item.classList.toggle("active", item === button));
  renderProducts();
}));
document.querySelector("#grid-toggle").addEventListener("click", () => restaurantGrid.classList.toggle("list-view"));
document.querySelector("#basket-fab").addEventListener("click", () => cartDrawer.classList.add("open"));
document.querySelector("#close-cart").addEventListener("click", () => cartDrawer.classList.remove("open"));
document.querySelector("#checkout-button").addEventListener("click", () => {
  if (!state.cart.length) return showToast("Add something to your basket first");
  document.querySelector("#checkout-modal").hidden = false;
});
document.querySelector("#close-checkout").addEventListener("click", () => { document.querySelector("#checkout-modal").hidden = true; });
document.querySelectorAll(".payment-option").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".payment-option").forEach((item) => item.classList.toggle("active", item === button));
}));
document.querySelector("#confirm-payment").addEventListener("click", () => {
  const order = { id: `SP-${String(Date.now()).slice(-6)}`, total: state.cart.reduce((sum, item) => sum + item.price, 0), items: state.cart.length };
  state.orders.unshift(order);
  state.cart = [];
  renderCart();
  document.querySelector("#checkout-modal").hidden = true;
  cartDrawer.classList.remove("open");
  const orderSection = document.querySelector("#orders .utility-panel");
  orderSection.innerHTML = `<span class="utility-icon">✓</span><div><strong>Order ${order.id} confirmed</strong><p>${order.items} item(s) reserved for pickup at the Student Centre. Total: ₹${order.total}</p></div>`;
  showToast(`Order ${order.id} confirmed for pickup`);
  document.querySelector("#orders").scrollIntoView({ behavior: "smooth" });
});
document.querySelector("#view-all").addEventListener("click", () => { state.category = "all"; state.filter = "all"; renderCategories(); renderProducts(); document.querySelector("#restaurant-section").scrollIntoView({ behavior: "smooth" }); });

async function loadProducts() {
  try {
    const response = await fetch("/api/products");
    if (!response.ok) throw new Error("API unavailable");
    const apiProducts = await response.json();
    products = apiProducts.map((product) => ({
      ...product,
      meta: product.description,
      tag: product.stock > 0 ? "In stock" : "Sold out",
      image: "image-green",
      icon: product.category === "drinks" ? "🧃" : product.category === "care" ? "🧼" : "📦",
      filter: product.price < 200 ? "under-200" : "bundle",
    }));
  } catch {
    products = fallbackProducts;
  }
  renderCategories();
  renderProducts();
  renderCart();
}

loadProducts();