
"use strict";

// =====================================
// SWEET HEAVEN - PRODUCT DETAILS
// Backend API Integration
// =====================================

const API_URL = "http://localhost:3000/api/products";
const STORAGE_KEY = "sweet-heaven-cart-v1";

const $ = (id) => document.getElementById(id);

const money = (value) => {
  return "£" + Number(value).toFixed(2);
};

const photo = (filename) => {
  return "pictures/" + encodeURIComponent(filename);
};

// Extra gallery photos stored locally.
// Product information comes from the API.
const GALLERY_IMAGES = {
  "chocolate-cake": [
    "Moist Chocolate Cake 2.jpg",
    "Moist Chocolate Cake 3.avif"
  ],
  "chocolate-cookie": [
    "Chocolate Chip Cookie 2.jpg",
    "Chocolate Chip Cookie 3.jpg"
  ],
  "panna-cotta": [
    "Panna Cotta 2.jpg",
    "Panna Cotta 4.avif"
  ],
  "cupcakes": [
    "cup cake 2.avif"
  ]
};

let PRODUCTS = [];
let product = null;
let cart = {};
let previousFocus = null;

// =====================================
// LOCAL STORAGE
// =====================================

try {
  const saved = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "{}"
  );

  if (
    saved &&
    typeof saved === "object" &&
    !Array.isArray(saved)
  ) {
    for (const [id, quantity] of Object.entries(saved)) {
      if (
        Number.isInteger(quantity) &&
        quantity > 0 &&
        quantity <= 99
      ) {
        cart[id] = quantity;
      }
    }
  }
} catch (error) {
  cart = {};
}

function saveCart() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(cart)
    );
  } catch (error) {
    console.warn("Cart storage unavailable.");
  }
}

// =====================================
// API REQUESTS
// =====================================

async function getProducts() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Unable to fetch products.");
  }

  return await response.json();
}

async function getProductById(id) {
  const response = await fetch(
    API_URL + "/" + encodeURIComponent(id)
  );

  if (response.status === 404) {
    throw new Error("Product not found.");
  }

  if (!response.ok) {
    throw new Error("Unable to fetch product.");
  }

  return await response.json();
}

// =====================================
// PRODUCT INFORMATION
// =====================================

function renderProduct() {
  document.title = product.name + " | Sweet Heaven";

  $("breadcrumbName").textContent = product.name;
  $("productCategory").textContent = product.category;
  $("productTitle").textContent = product.name;
  $("productPrice").textContent = money(product.price);
  $("productDescription").textContent =
    product.description;

  renderGallery();
}

// =====================================
// PRODUCT IMAGE GALLERY
// =====================================

function renderGallery() {
  const images = [
    product.image,
    ...(GALLERY_IMAGES[product.id] || [])
  ];

  const thumbnails = $("photoThumbnails");

  thumbnails.replaceChildren();

  function setPhoto(index) {
    $("mainPhoto").src = photo(images[index]);

    $("mainPhoto").alt =
      product.name + " photo " + (index + 1);

    thumbnails
      .querySelectorAll("button")
      .forEach((button, i) => {
        button.classList.toggle(
          "selected",
          i === index
        );
      });
  }

  images.forEach((filename, index) => {
    const button = document.createElement("button");

    button.type = "button";
    button.setAttribute(
      "aria-label",
      "View photo " + (index + 1)
    );

    const img = document.createElement("img");

    img.src = photo(filename);
    img.alt = "";

    button.appendChild(img);

    button.addEventListener("click", () => {
      setPhoto(index);
    });

    thumbnails.appendChild(button);
  });

  setPhoto(0);
}

// =====================================
// RELATED PRODUCTS
// =====================================

function renderRelatedProducts() {
  const container = $("relatedProducts");

  container.replaceChildren();

  const related = PRODUCTS
    .filter(p => p.id !== product.id)
    .sort((a, b) => {
      return Number(b.category === product.category) -
             Number(a.category === product.category);
    })
    .slice(0, 3);

  related.forEach(p => {
    const article = document.createElement("article");
    article.className = "related-card";

    const link = document.createElement("a");
    link.href =
      "product.html?id=" + encodeURIComponent(p.id);

    const img = document.createElement("img");
    img.src = photo(p.image);
    img.alt = p.name;
    img.loading = "lazy";

    const content = document.createElement("div");
    content.className = "related-content";

    const title = document.createElement("h3");
    title.textContent = p.name;

    const price = document.createElement("p");
    price.textContent = money(p.price);

    content.append(title, price);
    link.append(img, content);
    article.append(link);

    container.appendChild(article);
  });
}

// =====================================
// QUANTITY
// =====================================

function getQuantity() {
  const value = Number($("quantity").value);

  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(
    1,
    Math.min(99, Math.trunc(value))
  );
}

$("decreaseQuantity").addEventListener(
  "click",
  () => {
    $("quantity").value = Math.max(
      1,
      getQuantity() - 1
    );
  }
);

$("increaseQuantity").addEventListener(
  "click",
  () => {
    $("quantity").value = Math.min(
      99,
      getQuantity() + 1
    );
  }
);

$("quantity").addEventListener(
  "change",
  () => {
    $("quantity").value = getQuantity();
  }
);

// =====================================
// ADD TO CART
// =====================================

$("addToCart").addEventListener(
  "click",
  () => {
    if (!product) {
      return;
    }

    const quantity = getQuantity();

    cart[product.id] = Math.min(
      99,
      (cart[product.id] || 0) + quantity
    );

    saveCart();
    renderCart();

    $("productFeedback").textContent =
      "Added to your bag!";
  }
);

// =====================================
// RENDER SHOPPING CART
// =====================================

function renderCart() {
  const items = PRODUCTS.filter(
    p => cart[p.id]
  );

  const totalCount = items.reduce(
    (sum, p) => sum + cart[p.id],
    0
  );

  const subtotal = items.reduce(
    (sum, p) => sum + p.price * cart[p.id],
    0
  );

  $("cartCount").textContent = totalCount;
  $("cartSubtotal").textContent = money(subtotal);

  const container = $("cartItems");
  container.replaceChildren();

  if (!items.length) {
    const empty = document.createElement("p");

    empty.textContent =
      "Your bag is waiting for something sweet.";

    container.appendChild(empty);
    return;
  }

  items.forEach(p => {
    const item = document.createElement("div");
    item.className = "drawer-item";

    const img = document.createElement("img");
    img.src = photo(p.image);
    img.alt = "";

    const info = document.createElement("div");
    info.style.flex = "1";

    const title = document.createElement("h3");
    title.textContent = p.name;

    const price = document.createElement("small");
    price.textContent = money(p.price) + " each";

    const controls = document.createElement("div");
    controls.className = "drawer-controls";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "−";
    minus.setAttribute(
      "aria-label",
      "Decrease " + p.name
    );

    minus.addEventListener("click", () => {
      updateCart(p.id, -1);
    });

    const count = document.createElement("span");
    count.textContent = cart[p.id];

    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";
    plus.setAttribute(
      "aria-label",
      "Increase " + p.name
    );

    plus.addEventListener("click", () => {
      updateCart(p.id, 1);
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Remove";
    remove.className = "remove";

    remove.addEventListener("click", () => {
      delete cart[p.id];
      saveCart();
      renderCart();
    });

    controls.append(minus, count, plus, remove);

    info.append(title, price, controls);
    item.append(img, info);

    container.appendChild(item);
  });
}

// =====================================
// UPDATE CART
// =====================================

function updateCart(id, change) {
  if (!(id in cart)) {
    return;
  }

  cart[id] = Math.min(
    99,
    cart[id] + change
  );

  if (cart[id] <= 0) {
    delete cart[id];
  }

  saveCart();
  renderCart();
}

// =====================================
// CART DRAWER
// =====================================

function openCart() {
  previousFocus = document.activeElement;

  $("cartBackdrop").hidden = false;

  $("cartDrawer").classList.add("open");

  $("cartDrawer").setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.style.overflow = "hidden";

  $("closeCart").focus();
}

function closeCart() {
  $("cartDrawer").classList.remove("open");

  $("cartDrawer").setAttribute(
    "aria-hidden",
    "true"
  );

  $("cartBackdrop").hidden = true;

  document.body.style.overflow = "";

  if (previousFocus?.focus) {
    previousFocus.focus();
  }
}

$("openCart").addEventListener("click", openCart);
$("closeCart").addEventListener("click", closeCart);

$("continueShopping").addEventListener(
  "click",
  closeCart
);

$("cartBackdrop").addEventListener(
  "click",
  closeCart
);

document.addEventListener("keydown", e => {
  if (
    e.key === "Escape" &&
    $("cartDrawer").classList.contains("open")
  ) {
    closeCart();
  }
});

// =====================================
// MOBILE NAVIGATION
// =====================================

$("menuToggle").addEventListener(
  "click",
  () => {
    const isOpen = $("navLinks").classList.toggle(
      "open"
    );

    $("menuToggle").setAttribute(
      "aria-expanded",
      String(isOpen)
    );
  }
);

// =====================================
// INITIALIZE PRODUCT PAGE
// =====================================

async function initializeProductPage() {
  const params = new URLSearchParams(
    window.location.search
  );

  const productId = params.get("id") || "chocolate-cake";

  const addButton = $("addToCart");

  addButton.disabled = true;

  $("productTitle").textContent = "Loading product...";
  $("productDescription").textContent = "";
  $("productPrice").textContent = "";

  try {
    // Fetch selected product and product catalogue
    const [selectedProduct, allProducts] =
      await Promise.all([
        getProductById(productId),
        getProducts()
      ]);

    product = selectedProduct;
    PRODUCTS = allProducts;

    // Remove old cart entries not found in API
    for (const id of Object.keys(cart)) {
      if (!PRODUCTS.some(p => p.id === id)) {
        delete cart[id];
      }
    }

    saveCart();

    renderProduct();
    renderRelatedProducts();
    renderCart();

    addButton.disabled = false;

    console.log(
      "Product loaded from API:",
      product
    );

  } catch (error) {
    console.error("Product API error:", error);

    $("productTitle").textContent =
      "Product unavailable";

    $("productDescription").textContent =
      "We couldn't load this product. Please check the server and try again.";

    $("productPrice").textContent = "";

    $("mainPhoto").removeAttribute("src");

    $("photoThumbnails").replaceChildren();
    $("relatedProducts").replaceChildren();

    $("productFeedback").textContent =
      "Unable to load product details.";
  }
}

initializeProductPage();
