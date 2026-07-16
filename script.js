// ============ MAVERICK — shared behaviour ============

// Header solid on scroll
const header = document.querySelector('.site-header');
const onScroll = () => {
  if(!header) return;
  header.classList.toggle('solid', window.scrollY > 40);
};
window.addEventListener('scroll', onScroll);
onScroll();

// Mobile nav
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const navOverlay = document.querySelector('.nav-overlay');
function closeNav(){
  menuToggle && menuToggle.classList.remove('open');
  mainNav && mainNav.classList.remove('open');
  navOverlay && navOverlay.classList.remove('open');
}
if(menuToggle){
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('open');
    mainNav.classList.toggle('open');
    navOverlay.classList.toggle('open');
  });
  navOverlay && navOverlay.addEventListener('click', closeNav);
  mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
}

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
if('IntersectionObserver' in window && revealEls.length){
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, {threshold:.15, rootMargin:'0px 0px -60px 0px'});
  revealEls.forEach(el => io.observe(el));
}

// ============ Cart (localStorage mock) ============
const CART_KEY = 'maverick_cart_demo';

function getCart(){
  try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch(e){ return []; }
}
function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}
function addToCart(item){
  const cart = getCart();
  const existing = cart.find(i => i.id === item.id && i.size === item.size && i.color === item.color);
  if(existing){ existing.qty += item.qty; }
  else{ cart.push(item); }
  saveCart(cart);
}
function removeFromCart(index){
  const cart = getCart();
  cart.splice(index,1);
  saveCart(cart);
  renderCart();
}
function updateQty(index, delta){
  const cart = getCart();
  if(!cart[index]) return;
  cart[index].qty = Math.max(1, cart[index].qty + delta);
  saveCart(cart);
  renderCart();
}
function updateCartCount(){
  const count = getCart().reduce((s,i) => s + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}
updateCartCount();

// Render cart page
function renderCart(){
  const list = document.getElementById('cartList');
  if(!list) return;
  const cart = getCart();
  const emptyState = document.getElementById('emptyState');
  const cartLayout = document.getElementById('cartLayout');

  if(cart.length === 0){
    if(emptyState) emptyState.style.display = 'block';
    if(cartLayout) cartLayout.style.display = 'none';
    return;
  }
  if(emptyState) emptyState.style.display = 'none';
  if(cartLayout) cartLayout.style.display = 'grid';

  list.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}">
      <div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">Talle ${item.size} · Color ${item.color}</div>
        <div class="qty-stepper">
          <button type="button" onclick="updateQty(${i},-1)">−</button>
          <span>${item.qty}</span>
          <button type="button" onclick="updateQty(${i},1)">+</button>
        </div>
        <div style="margin-top:12px;">
          <button class="cart-item-remove" type="button" onclick="removeFromCart(${i})">Eliminar</button>
        </div>
      </div>
      <div class="cart-item-price">$${(item.price * item.qty).toLocaleString('es-AR')}</div>
    </div>
  `).join('');

  const subtotal = cart.reduce((s,i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 0 ? (subtotal >= 80000 ? 0 : 4500) : 0;
  const total = subtotal + shipping;

  const subtotalEl = document.getElementById('subtotalAmount');
  const shippingEl = document.getElementById('shippingAmount');
  const totalEl = document.getElementById('totalAmount');
  if(subtotalEl) subtotalEl.textContent = '$' + subtotal.toLocaleString('es-AR');
  if(shippingEl) shippingEl.textContent = shipping === 0 ? 'Gratis' : '$' + shipping.toLocaleString('es-AR');
  if(totalEl) totalEl.textContent = '$' + total.toLocaleString('es-AR');
}
document.addEventListener('DOMContentLoaded', renderCart);

// ============ Product page interactions ============
function initProductPage(){
  const mainImg = document.getElementById('galleryMain');
  document.querySelectorAll('.gallery-thumbs button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.gallery-thumbs button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if(mainImg) mainImg.src = btn.querySelector('img').src;
    });
  });

  document.querySelectorAll('.color-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
      const label = document.getElementById('selectedColor');
      if(label) label.textContent = sw.dataset.color;
    });
  });

  document.querySelectorAll('.size-pill:not(.disabled)').forEach(sp => {
    sp.addEventListener('click', () => {
      document.querySelectorAll('.size-pill').forEach(s => s.classList.remove('active'));
      sp.classList.add('active');
    });
  });

  let qty = 1;
  const qtyDisplay = document.getElementById('qtyDisplay');
  document.getElementById('qtyMinus')?.addEventListener('click', () => {
    qty = Math.max(1, qty - 1);
    qtyDisplay.textContent = qty;
  });
  document.getElementById('qtyPlus')?.addEventListener('click', () => {
    qty += 1;
    qtyDisplay.textContent = qty;
  });

  document.querySelectorAll('.accordion-head').forEach(head => {
    head.addEventListener('click', () => {
      const item = head.parentElement;
      const body = item.querySelector('.accordion-body');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.accordion-item').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.accordion-body').style.maxHeight = null;
      });
      if(!isOpen){
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  const addBtn = document.getElementById('addToCartBtn');
  if(addBtn){
    addBtn.addEventListener('click', () => {
      const activeSize = document.querySelector('.size-pill.active');
      if(!activeSize){
        addBtn.textContent = 'Elegí un talle';
        setTimeout(() => addBtn.textContent = 'Agregar al carrito', 1600);
        return;
      }
      addToCart({
        id: addBtn.dataset.id,
        name: addBtn.dataset.name,
        price: parseInt(addBtn.dataset.price, 10),
        img: addBtn.dataset.img,
        size: activeSize.textContent.trim(),
        color: document.getElementById('selectedColor')?.textContent || '—',
        qty: qty
      });
      const original = addBtn.textContent;
      addBtn.textContent = 'Agregado ✓';
      setTimeout(() => addBtn.textContent = original, 1600);
    });
  }
}
document.addEventListener('DOMContentLoaded', initProductPage);

// ============ Category filters (visual only) ============
function initFilters(){
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => pill.classList.toggle('active'));
  });
}
document.addEventListener('DOMContentLoaded', initFilters);
