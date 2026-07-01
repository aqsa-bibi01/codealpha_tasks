const API = 'http://localhost:5000/api';
let token = localStorage.getItem('token');
let user = JSON.parse(localStorage.getItem('user') || 'null');
let cart = [];

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  if (page === 'products') loadProducts();
  if (page === 'cart') loadCart();
  if (page === 'orders') loadOrders();
}

function updateAuthUI() {
  const authLinks = document.getElementById('authLinks');
  const userInfo = document.getElementById('userInfo');
  const userName = document.getElementById('userName');
  if (token && user) {
    authLinks.style.display = 'none';
    userInfo.style.display = 'inline';
    userName.textContent = 'Hi, ' + user.name + ' | ';
  } else {
    authLinks.style.display = 'inline';
    userInfo.style.display = 'none';
  }
}

async function register() {
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const res = await fetch(API + '/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  if (res.ok) {
    token = data.token; user = data.user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    updateAuthUI(); showPage('products');
  } else { document.getElementById('regMsg').textContent = data.message; }
}

async function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const res = await fetch(API + '/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (res.ok) {
    token = data.token; user = data.user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    updateAuthUI(); showPage('products');
  } else { document.getElementById('loginMsg').textContent = data.message; }
}

function logout() {
  token = null; user = null;
  localStorage.removeItem('token'); localStorage.removeItem('user');
  updateAuthUI(); showPage('home');
}

async function loadProducts() {
  const search = document.getElementById('searchInput')?.value || '';
  const category = document.getElementById('categoryFilter')?.value || '';
  let url = API + '/products?';
  if (search) url += 'search=' + search + '&';
  if (category) url += 'category=' + category;
  const res = await fetch(url);
  const products = await res.json();
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = products.length ? products.map(p => `
    <div class="card">
      <img src="${p.image || 'https://via.placeholder.com/300x200?text=Product'}" alt="${p.name}"/>
      <div class="card-body">
        <div class="cat">${p.category}</div>
        <h3>${p.name}</h3>
        <div class="price">$${p.price.toFixed(2)}</div>
        <button onclick="viewProduct('${p._id}')">View Details</button>
        <button onclick="addToCart('${p._id}')" style="margin-top:8px;background:#16213e">Add to Cart</button>
      </div>
    </div>`).join('') : '<p>No products found.</p>';
}

async function viewProduct(id) {
  const res = await fetch(API + '/products/' + id);
  const p = await res.json();
  document.getElementById('productDetail').innerHTML = `
    <div class="detail-box">
      <img src="${p.image || 'https://via.placeholder.com/400x300?text=Product'}" alt="${p.name}"/>
      <div>
        <span class="cat">${p.category}</span>
        <h2 style="margin:10px 0">${p.name}</h2>
        <p style="color:#888;margin-bottom:15px">${p.description}</p>
        <div class="price" style="font-size:2rem">$${p.price.toFixed(2)}</div>
        <p style="margin:10px 0;color:${p.stock>0?'green':'red'}">${p.stock>0?'In Stock ('+p.stock+')':'Out of Stock'}</p>
        <button onclick="addToCart('${p._id}')" ${p.stock===0?'disabled':''}>Add to Cart</button>
        <button onclick="showPage('products')" style="margin-left:10px;background:#555">Back</button>
      </div>
    </div>`;
  showPage('detail');
}

async function addToCart(productId) {
  if (!token) { alert('Please login first'); showPage('login'); return; }
  await fetch(API + '/cart/add', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ productId, quantity: 1 })
  });
  await updateCartCount();
  alert('Added to cart!');
}

async function loadCart() {
  if (!token) { document.getElementById('cartItems').innerHTML = '<p>Please login to view cart.</p>'; return; }
  const res = await fetch(API + '/cart', { headers: { 'Authorization': 'Bearer ' + token } });
  cart = await res.json();
  const el = document.getElementById('cartItems');
  if (!cart.length) { el.innerHTML = '<p>Your cart is empty.</p>'; document.getElementById('cartTotal').innerHTML = ''; document.getElementById('checkoutBtn').style.display = 'none'; return; }
  let total = 0;
  el.innerHTML = cart.map(item => {
    const subtotal = item.product.price * item.quantity;
    total += subtotal;
    return `<div class="cart-item">
      <div><strong>${item.product.name}</strong><br><small>$${item.product.price} x ${item.quantity}</small></div>
      <div>$${subtotal.toFixed(2)} <button onclick="removeFromCart('${item.product._id}')" style="margin-left:10px;background:#dc3545;padding:6px 12px">Remove</button></div>
    </div>`;
  }).join('');
  document.getElementById('cartTotal').innerHTML = `<h3 style="text-align:right;margin-top:15px">Total: $${total.toFixed(2)}</h3>`;
  document.getElementById('checkoutBtn').style.display = 'block';
}

async function removeFromCart(productId) {
  await fetch(API + '/cart/remove/' + productId, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } });
  await updateCartCount(); loadCart();
}

async function updateCartCount() {
  if (!token) return;
  const res = await fetch(API + '/cart', { headers: { 'Authorization': 'Bearer ' + token } });
  const c = await res.json();
  document.getElementById('cartCount').textContent = c.length;
}

function showCheckout() { showPage('checkout'); }

async function placeOrder() {
  const address = {
    street: document.getElementById('street').value,
    city: document.getElementById('city').value,
    zip: document.getElementById('zip').value,
    country: document.getElementById('country').value
  };
  const items = cart.map(i => ({ product: i.product._id, quantity: i.quantity, price: i.product.price }));
  const res = await fetch(API + '/orders', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ items, address })
  });
  if (res.ok) { alert('Order placed successfully!'); await updateCartCount(); showPage('orders'); }
  else { const d = await res.json(); alert(d.message); }
}

async function loadOrders() {
  if (!token) return;
  const res = await fetch(API + '/orders/my', { headers: { 'Authorization': 'Bearer ' + token } });
  const orders = await res.json();
  document.getElementById('ordersList').innerHTML = orders.length ? orders.map(o => `
    <div class="order-card">
      <div style="display:flex;justify-content:space-between;margin-bottom:10px">
        <strong>Order #${o._id.slice(-6).toUpperCase()}</strong>
        <span class="status ${o.status}">${o.status.toUpperCase()}</span>
      </div>
      <div>${o.items.map(i => `${i.product?.name || 'Item'} x${i.quantity}`).join(', ')}</div>
      <div style="margin-top:8px"><strong>Total: $${o.total.toFixed(2)}</strong> &nbsp; <small style="color:#888">${new Date(o.createdAt).toLocaleDateString()}</small></div>
    </div>`).join('') : '<p>No orders yet.</p>';
}

updateAuthUI();
