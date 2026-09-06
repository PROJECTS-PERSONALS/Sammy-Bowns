/* CONFIGURACIÓN GENERAL */
const CONFIG = {
	nombreEmpresa: "Sammy Bowns",
	whatsappNumero: "573217269632", 
	moneda: "$",
};

/* DATOS DE PRODUCTOS */
/* REEMPLAZAR: nombres, precios e imágenes reales. La "category" de cada producto
   debe coincidir EXACTAMENTE con el data-category de los chips en index.html. */
const PRODUCTS = [
	{ id: "p1", name: "Lazo Escolar Liso", category: "Colección Escolar", price: 12000, oldPrice: null, promo: false, image: "https://placehold.co/400x400/FBE1EC/7C5AA6?text=Producto" },
	{ id: "p2", name: "Diadema Escolar Bordada", category: "Colección Escolar", price: 15000, oldPrice: 19000, promo: true, image: "https://placehold.co/400x400/FBE1EC/7C5AA6?text=Producto" },
	{ id: "p3", name: "Lazo Princesa Brillante", category: "Colección Princesas", price: 18000, oldPrice: null, promo: false, image: "https://placehold.co/400x400/FBE1EC/7C5AA6?text=Producto" },
	{ id: "p4", name: "Corona Princesa Mini", category: "Colección Princesas", price: 22000, oldPrice: 28000, promo: true, image: "https://placehold.co/400x400/FBE1EC/7C5AA6?text=Producto" },
	{ id: "p5", name: "Lazo Bebé Suave", category: "Colección Bebés", price: 10000, oldPrice: null, promo: false, image: "https://placehold.co/400x400/FBE1EC/7C5AA6?text=Producto" },
	{ id: "p6", name: "Diadema Bebé Algodón", category: "Colección Bebés", price: 13000, oldPrice: null, promo: false, image: "https://placehold.co/400x400/FBE1EC/7C5AA6?text=Producto" },
	{ id: "p7", name: "Set Lazos Fiesta", category: "Fiestas", price: 25000, oldPrice: null, promo: false, image: "https://placehold.co/400x400/FBE1EC/7C5AA6?text=Producto" },
	{ id: "p8", name: "Diadema Fiesta Glitter", category: "Diademas", price: 17000, oldPrice: 21000, promo: true, image: "https://placehold.co/400x400/FBE1EC/7C5AA6?text=Producto" },
	{ id: "p9", name: "Clip Corazón Variado", category: "Clips Variados", price: 8000, oldPrice: null, promo: false, image: "https://placehold.co/400x400/FBE1EC/7C5AA6?text=Producto" },
	{ id: "p10", name: "Mechón Kanekalon Color", category: "Kanekalon", price: 9000, oldPrice: null, promo: false, image: "https://placehold.co/400x400/FBE1EC/7C5AA6?text=Producto" },
	{ id: "p11", name: "Kit Peinado Completo", category: "Kit Para Peinados", price: 35000, oldPrice: null, promo: false, image: "https://placehold.co/400x400/FBE1EC/7C5AA6?text=Producto" },
];

/* ESTADO (persistido en localStorage) */
const state = {
	cart: JSON.parse(localStorage.getItem("store_cart") || "[]"),
	favorites: JSON.parse(localStorage.getItem("store_favorites") || "[]"),
	user: JSON.parse(localStorage.getItem("store_user") || "null"),
	activeCategory: "todos",
	sort: "default",
};

function persist() {
	localStorage.setItem("store_cart", JSON.stringify(state.cart));
	localStorage.setItem("store_favorites", JSON.stringify(state.favorites));
	localStorage.setItem("store_user", JSON.stringify(state.user));
}

/* ELEMENTOS DEL DOM */
const grid = document.getElementById("products-grid");
const emptyState = document.getElementById("empty-state");
const cartCountEl = document.getElementById("cart-count");
const categoriesWrap = document.getElementById("categories");
const sortSelect = document.getElementById("sort-select");

const modalAdded = document.getElementById("modal-added");
const modalFavLogin = document.getElementById("modal-fav-login");
const modalLogin = document.getElementById("modal-login");
const modalCart = document.getElementById("modal-cart");

const viewShop = document.getElementById("view-shop");
const viewAbout = document.getElementById("view-about");

const menuToggle = document.getElementById("menu-toggle");

/* Acción pendiente que se ejecuta automáticamente después de iniciar sesión
   (agregar al carrito o marcar como favorito), para no perder el clic original. */
let pendingAction = null;

/* RENDER: PRODUCTOS */
function getFilteredProducts() {
	let list = [...PRODUCTS];

	if (state.activeCategory === "promo") {
		list = list.filter(p => p.promo);
	} else if (state.activeCategory !== "todos") {
		list = list.filter(p => p.category === state.activeCategory);
	}

	switch (state.sort) {
		case "price-asc":
			list.sort((a, b) => a.price - b.price);
			break;
		case "price-desc":
			list.sort((a, b) => b.price - a.price);
			break;
		case "name-asc":
			list.sort((a, b) => a.name.localeCompare(b.name));
			break;
	}

	return list;
}

function formatPrice(value) {
	return `${CONFIG.moneda} ${value.toFixed(2).replace(".", ",")}`;
}

function renderProducts() {
	const products = getFilteredProducts();
	grid.innerHTML = "";

	emptyState.hidden = products.length !== 0;

	products.forEach(product => {
		const isFav = state.favorites.includes(product.id);

		const card = document.createElement("article");
		card.className = "card";
		card.innerHTML =
		` 
			<div class="card__image-wrap"> 
				<img src="${product.image}" alt="${product.name}"> ${product.promo ? `<span class="card__badge"> Promoción </span>` : ""}
        		<button class="card__fav ${isFav ? "is-active" : ""}" data-fav="${product.id}" aria-label="Favorito">
          			<svg viewBox="0 0 24 24" fill="${isFav ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.6">
            			<path d="M12 21s-7.5-4.7-10-9.1C.5 8.4 2.3 5 5.8 5c2 0 3.4 1.1 4.2 2.3C10.8 6.1 12.2 5 14.2 5c3.5 0 5.3 3.4 3.8 6.9C19.5 16.3 12 21 12 21z"/>
          			</svg>
        		</button>
      		</div>
      		<div class="card__body">
        		<span class="card__category">${product.category}</span>
        		<h3 class="card__name">${product.name}</h3>
        		<div class="card__price-row">
          			<span class="card__price">${formatPrice(product.price)}</span> ${product.oldPrice ? `<span class="card__price--old">${formatPrice(product.oldPrice)}</span>` : ""}
        		</div>
        		<button class="card__add" data-add="${product.id}"> Añadir a la bolsa </button>
      		</div>
    	`;
		grid.appendChild(card);
	});
}

/* CATEGORÍAS Y ORDEN */
categoriesWrap.addEventListener("click", (e) => {
	const chip = e.target.closest(".chip");
	if (!chip) return;
	categoriesWrap.querySelectorAll(".chip").forEach(c => c.classList.remove("is-active"));
	chip.classList.add("is-active");
	state.activeCategory = chip.dataset.category;
	renderProducts();
});

sortSelect.addEventListener("change", (e) => {
	state.sort = e.target.value;
	renderProducts();
});

/* CARRITO */
function addToCart(productId) {
	const existing = state.cart.find(i => i.id === productId);
	if (existing) {
		existing.qty += 1;
	} else {
		state.cart.push({ id: productId, qty: 1 });
	}
	persist();
	updateCartCount();
	/* Compra directa: en vez de solo avisar que se añadió, se va directo a WhatsApp */
	goToWhatsappCheckout();
}

function updateCartCount() {
	const total = state.cart.reduce((sum, i) => sum + i.qty, 0);
	cartCountEl.textContent = total;
}

function renderCart() {
	const wrap = document.getElementById("cart-items");
	const emptyMsg = document.getElementById("cart-empty");
	const totalEl = document.getElementById("cart-total-value");

	wrap.innerHTML = "";
	emptyMsg.hidden = state.cart.length !== 0;

	let total = 0;

	state.cart.forEach(item => {
		const product = PRODUCTS.find(p => p.id === item.id);
		if (!product) return;
		total += product.price * item.qty;

		const row = document.createElement("div");
		row.className = "cart-item";
		row.innerHTML = 
		`
			<img src="${product.image}" alt="${product.name}">
      		<div class="cart-item__info">
        		<div class="cart-item__name">${product.name}</div>
        		<div class="cart-item__qty">
          			<button data-qty="down" data-id="${item.id}"> - </button>
          			<span>${item.qty}</span>
          			<button data-qty="up" data-id="${item.id}"> + </button>
        		</div>
      		</div>
      		<div>
        		<div class="cart-item__price">${formatPrice(product.price * item.qty)}</div>
        		<button class="cart-item__remove" data-remove="${item.id}"> Eliminar </button>
      		</div>
    	`;
		wrap.appendChild(row);
	});
	totalEl.textContent = formatPrice(total);
}

document.getElementById("cart-items").addEventListener("click", (e) => {
	const id = e.target.dataset.id || e.target.dataset.remove;
	if (e.target.dataset.qty === "up") {
		state.cart.find(i => i.id === id).qty += 1;
	} else if (e.target.dataset.qty === "down") {
		const item = state.cart.find(i => i.id === id);
		item.qty -= 1;
		if (item.qty <= 0) state.cart = state.cart.filter(i => i.id !== id);
	} else if (e.target.dataset.remove) {
		state.cart = state.cart.filter(i => i.id !== e.target.dataset.remove);
	}
	persist();
	updateCartCount();
	renderCart();
});

document.getElementById("btn-cart").addEventListener("click", () => {
	renderCart();
	showModal(modalCart);
});
document.getElementById("cart-close").addEventListener("click", () => hideModal(modalCart));

/* Checkout vía WhatsApp: arma un mensaje con el resumen del pedido */
function goToWhatsappCheckout() {
	if (state.cart.length === 0) {
		hideModal(modalCart);
		return;
	}
	const lines = state.cart.map(item => {
		const product = PRODUCTS.find(p => p.id === item.id);
		return `- ${product.name} x${item.qty} (${formatPrice(product.price * item.qty)})`;
	});
	const total = state.cart.reduce((sum, item) => {
		const product = PRODUCTS.find(p => p.id === item.id);
		return sum + product.price * item.qty;
	}, 0);

	const message = `Hola! Quiero hacer este pedido:%0A${lines.join("%0A")}%0A%0ATotal: ${formatPrice(total)}`;
	window.open(`https://wa.me/${CONFIG.whatsappNumero}?text=${message}`, "_blank");
}

document.getElementById("cart-checkout").addEventListener("click", goToWhatsappCheckout);
document.getElementById("modal-added-checkout").addEventListener("click", () => {
	hideModal(modalAdded);
	renderCart();
	showModal(modalCart);
});
document.getElementById("modal-added-continue").addEventListener("click", () => hideModal(modalAdded));

/* AÑADIR AL CARRITO Y FAVORITOS (delegación en el grid) */
grid.addEventListener("click", (e) => {
	const addBtn = e.target.closest("[data-add]");
	const favBtn = e.target.closest("[data-fav]");

	if (addBtn) {
		const id = addBtn.dataset.add;
		requireLogin("Necesitas iniciar sesión para comprar", () => addToCart(id));
	}

	if (favBtn) {
		const id = favBtn.dataset.fav;
		requireLogin("Necesitas iniciar sesión para añadir productos a favoritos", () => toggleFavorite(id));
	}
});

/* Exige inicio de sesión antes de ejecutar una acción (comprar / favoritos).
   Si ya hay sesión, ejecuta la acción de una vez. Si no, guarda la acción
   como pendiente y la retoma automáticamente apenas el usuario inicia sesión. */
function requireLogin(message, action) {
	if (state.user) {
		action();
		return;
	}
	pendingAction = action;
	document.getElementById("modal-fav-login-text").textContent = message;
	showModal(modalFavLogin);
}

function toggleFavorite(id) {
	if (state.favorites.includes(id)) {
		state.favorites = state.favorites.filter(f => f !== id);
	} else {
		state.favorites.push(id);
	}
	persist();
	renderProducts();
}

document.getElementById("modal-fav-cancel").addEventListener("click", () => {
	pendingAction = null;
	hideModal(modalFavLogin);
});
document.getElementById("modal-fav-login-btn").addEventListener("click", () => {
	hideModal(modalFavLogin);
	showModal(modalLogin);
});

/* LOGIN (simulado con localStorage, sin backend real) */
document.getElementById("btn-login").addEventListener("click", () => showModal(modalLogin));
document.getElementById("footer-login").addEventListener("click", (e) => {
	e.preventDefault();
	showModal(modalLogin);
});
document.getElementById("login-close").addEventListener("click", () => hideModal(modalLogin));

document.getElementById("login-form").addEventListener("submit", (e) => {
	e.preventDefault();
	const email = document.getElementById("login-email").value;
	state.user = { email };
	persist();
	hideModal(modalLogin);
	updateLoginUI();

	if (pendingAction) {
		const action = pendingAction;
		pendingAction = null;
		action();
	}
});

document.getElementById("go-signup").addEventListener("click", () => {
	// REEMPLAZAR: aquí puedes redirigir a una página real de registro
	alert("Aquí se abriría el formulario de creación de cuenta.");
});

function updateLoginUI() {
	const loginBtn = document.getElementById("btn-login");
	loginBtn.textContent = state.user ? "Mi cuenta" : "Entrar";
}

/* MODALES: helpers */
function showModal(modal) { modal.hidden = false; }
function hideModal(modal) { modal.hidden = true; }

[modalAdded, modalFavLogin, modalLogin, modalCart].forEach(modal => {
	modal.addEventListener("click", (e) => {
		if (e.target === modal) hideModal(modal);
	});
});

/* NAVEGACIÓN ENTRE VISTAS (Tienda / Sobre) */
document.querySelectorAll("[data-view-link]").forEach(link => {
	link.addEventListener("click", (e) => {
		e.preventDefault();
		const target = link.dataset.viewLink;
		viewShop.hidden = target !== "shop";
		viewAbout.hidden = target !== "about";
		window.scrollTo({ top: 0, behavior: "smooth" });
	});
});

/* MENÚ HAMBURGUESA DE CATEGORÍAS
   Escritorio: visible por defecto, se puede ocultar con el botón.
   Celular: oculto por defecto, se abre voluntariamente con el botón. */
function setMenuOpen(isOpen) {
	categoriesWrap.classList.toggle("is-hidden", !isOpen);
	menuToggle.setAttribute("aria-expanded", String(isOpen));
}

menuToggle.addEventListener("click", () => {
	const isOpen = !categoriesWrap.classList.contains("is-hidden");
	setMenuOpen(!isOpen);
});

/* INICIALIZACIÓN */
function init() {
	document.getElementById("whatsapp-link-hero").href = `https://wa.me/${CONFIG.whatsappNumero}`;
	document.querySelector(".brand__name").textContent = CONFIG.nombreEmpresa;
	document.title = CONFIG.nombreEmpresa;

	const isDesktop = window.matchMedia("(min-width: 769px)").matches;
	setMenuOpen(isDesktop);

	renderProducts();
	updateCartCount();
	updateLoginUI();
}

init();