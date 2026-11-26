"use strict";
let PRODUCTS = [
    {
    id:'chocolate-cake',
    name:'Moist Chocolate Cake',
    category:'cakes',
    price:18,
    image:'Moist Chocolate Cake 1.jpg',
    description:'Rich, soft chocolate cake with a wonderfully moist crumb.',tag:'Best seller'},
    {
    id:'colorful-cake',
    name:'Celebration Cake',
    category:'cakes',
    price:24,
    image:'colorfull cake.avif',
    description:'A colorful cake for birthdays and special little moments.',tag:'Special'},
{id:'chocolate-cookie',name:'Chocolate Chip Cookies',category:'cookies',price:9,image:'Chocolate Chip Cookie 1.jpg',description:'Golden cookies filled with chocolate chips and a soft center.',tag:'Best seller'},
{id:'cookie-box',name:'Cookie Gift Box',category:'cookies',price:12,image:'Chocolate Chip Cookie 2.jpg',description:'A sweet selection of cookies, perfect for sharing.',tag:''},
{id:'panna-cotta',name:'Classic Panna Cotta',category:'desserts',price:7,image:'Panna Cotta 1.jpg',description:'Silky, delicate panna cotta with an elegant finish.',tag:'Best seller'},
{id:'cupcakes',name:'Sweet Cupcakes',category:'cakes',price:11,image:'cup cake 1.avif',description:'Pretty little cupcakes for an afternoon treat.',tag:''},
{id:'panna-special',name:'Panna Cotta Delight',category:'desserts',price:8,image:'Panna Cotta 2.jpg',description:'A creamy, beautifully presented individual dessert.',tag:''},
{id:'mini-cupcakes',name:'Mini Cupcake Selection',category:'cakes',price:14,image:'cup cake 2.avif',description:'A charming assortment of bite-sized sweet treats.',tag:''},
{id:'cookie-classic',name:'Classic Cookie Selection',category:'cookies',price:10,image:'Chocolate Chip Cookie 3.jpg',description:'A comforting selection of homemade-style cookies.',tag:''}
];
const STORAGE_KEY='sweet-heaven-cart-v1';
const $=id=>document.getElementById(id);

const money = n => '£' + Number(n).toFixed(2);

let category='all';
let cart={};
try {const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved)){for(const [id,quantity] of Object.entries(saved)){if(PRODUCTS.some(p=>p.id===id)&&Number.isInteger(quantity)&&quantity>0&&quantity<=99)cart[id]=quantity;}}}catch(e){cart={};}
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(cart));}catch(e){/* Storage unavailable: cart still works for this session. */}}
function renderProducts(){const query=$('productSearch').value.trim().toLowerCase();let list=PRODUCTS.filter(p=>(category==='all'||p.category===category)&&(p.name.toLowerCase().includes(query)||p.description.toLowerCase().includes(query)));const sort=$('productSort').value;if(sort==='price-asc')list.sort((a,b)=>a.price-b.price);if(sort==='price-desc')list.sort((a,b)=>b.price-a.price);if(sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name));$('resultsCount').textContent=list.length+' treats';$('emptyState').hidden=list.length!==0;$('productGrid').innerHTML=list.map(p=>`<article class="treat-card"><div class="treat-image"><img src="pictures/${encodeURIComponent(p.image)}" alt="${p.name}" loading="lazy">${p.tag?`<span class="treat-tag">${p.tag}</span>`:''}</div><div class="treat-body"><span class="treat-category">${p.category}</span><h3>${p.name}</h3><p>${p.description}</p><div class="treat-bottom"><strong class="treat-price">${money(p.price)}</strong><button class="add-cart" data-add="${p.id}" aria-label="Add ${p.name} to bag"><i class="fa-solid fa-plus"></i> Add to bag</button></div></div></article>`).join('');}
function renderCart(){const items=PRODUCTS.filter(p=>cart[p.id]);const count=items.reduce((sum,p)=>sum+cart[p.id],0);$('cartCount').textContent=count;$('mobileCartCount').textContent=count;$('cartSubtotal').textContent=money(items.reduce((sum,p)=>sum+
Number(p.price) * cart[p.id],0));$('cartItems').innerHTML=items.length?items.map(p=>`<div class="cart-item"><img src="pictures/${encodeURIComponent(p.image)}" alt=""><div><h3>${p.name}</h3><small>${money(p.price)} each</small><div class="cart-item-controls"><div class="quantity-control"><button data-minus="${p.id}" aria-label="Decrease ${p.name}">−</button><span>${cart[p.id]}</span><button data-plus="${p.id}" aria-label="Increase ${p.name}">+</button></div><button class="remove-item" data-remove="${p.id}" aria-label="Remove ${p.name}"><i class="fa-solid fa-trash-can"></i></button></div></div></div>`).join(''):'<div class="cart-empty"><i class="fa-solid fa-cookie-bite"></i><p>Your bag is waiting for something sweet.</p></div>';}
let previousFocus=null;
function openCart(){previousFocus=document.activeElement;$('cartBackdrop').hidden=false;$('cartDrawer').classList.add('open');$('cartDrawer').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';$('closeCart').focus();}
function closeCart(){ $('cartDrawer').classList.remove('open');$('cartDrawer').setAttribute('aria-hidden','true');$('cartBackdrop').hidden=true;document.body.style.overflow='';if(previousFocus&&typeof previousFocus.focus==='function')previousFocus.focus();}
let toastTimer;function toast(message){const el=$('cartToast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),1800);}
document.querySelectorAll('[data-category]').forEach(btn=>btn.addEventListener('click',()=>{category=btn.dataset.category;document.querySelectorAll('[data-category]').forEach(b=>{const selected=b===btn;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});
renderProducts();}));
$('productSearch').addEventListener('input',renderProducts);$('productSort').addEventListener('change',renderProducts);

$('productGrid').addEventListener('click', e => {


  // Add to Cart button
  const addButton = e.target.closest('[data-add]');

  if (addButton) {
    const id = addButton.dataset.add;

    cart[id] = Math.min(99, (cart[id] || 0) + 1);

    save();
    renderCart();
    toast('Added to your bag!');
    return;
  }

  // Open product details
  const card = e.target.closest('.treat-card');

  if (card) {
    const productName = card.querySelector('h3').textContent;

    const product = PRODUCTS.find(
      p => p.name === productName
    );

    if (product) {
      window.location.href =
        `product.html?id=${encodeURIComponent(product.id)}`;
    }
  }

});


$('cartItems').addEventListener('click',e=>{const btn=e.target.closest('button[data-plus],button[data-minus],button[data-remove]');if(!btn)return;const id=btn.dataset.plus||btn.dataset.minus||btn.dataset.remove;if(!(id in cart))return;if(btn.hasAttribute('data-remove'))delete cart[id];else if(btn.hasAttribute('data-plus'))cart[id]=Math.min(99,cart[id]+1);else{cart[id]--;if(cart[id]<=0)delete cart[id];}save();renderCart();});
$('openCart').addEventListener('click',openCart);$('mobileCart').addEventListener('click',openCart);$('closeCart').addEventListener('click',closeCart);$('continueShopping').addEventListener('click',closeCart);$('cartBackdrop').addEventListener('click',closeCart);
document.addEventListener('keydown',e=>{if(!$('cartDrawer').classList.contains('open'))return;if(e.key==='Escape')closeCart();if(e.key==='Tab'){const focusable=[...$('cartDrawer').querySelectorAll('button:not([disabled])')];const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});

async function loadProducts() {
  const grid = document.getElementById("productGrid");

  try {
    const response = await fetch(
      "http://localhost:3000/api/products"
    );

    if (!response.ok) {
      throw new Error("Failed to load products");
    }

    PRODUCTS = await response.json();

    // Remove invalid or outdated cart items
    for (const id of Object.keys(cart)) {
      if (!PRODUCTS.some(p => p.id === id)) {
        delete cart[id];
      }
    }

    save();

    renderProducts();
    renderCart();

    console.log("Products loaded from API:", PRODUCTS);

  } catch (error) {
    console.error(error);

    grid.textContent =
      "Unable to load products. Please check the server.";
  }
}

loadProducts();

