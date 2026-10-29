/* CONFIGURACIÓN Y DATOS
 * Productos, categorías e información del sitio ya NO viven embebidos en
 * este archivo: ahora los sirve el backend (ver /backend). Este bloque
 * los consulta por API al cargar la página. La URL del backend está
 * centralizada en config.js (API_BASE_URL), cargado antes que este script.
 *
 * Resiliencia: cada respuesta exitosa se guarda en localStorage como
 * caché. Si en una futura carga la API no responde (servidor caído,
 * sin internet), se usa esa última copia conocida en vez de mostrar la
 * tienda completamente vacía — y se avisa igual que la información podría
 * no estar actualizada.
 */
const FALLBACK_CONFIG = {
	nombreEmpresa: "Sammy Bowns",
	moneda: "$",
	tagline: "",
	email: "",
	whatsappNumero: "",
	whatsappMensaje: "Hola, estoy interesado en los productos de Sammy Bowns.",
	tiktok: "#",
	instagram: "#",
};

function loadJSON(key, fallback) {
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : fallback;
	} catch {
		return fallback;
	}
}

let CONFIG = loadJSON("cache_site", FALLBACK_CONFIG);
let CATEGORIES = loadJSON("cache_categories", []);
let PRODUCTS = loadJSON("cache_products", []);
let apiReachable = true;

async function fetchAPI(path) {
	const res = await fetch(`${API_BASE_URL}${path}`);
	if (!res.ok) throw new Error(`Error ${res.status} al consultar ${path}`);
	return res.json();
}

/* Trae productos, categorías e información del sitio en paralelo y los
 * deja listos en CONFIG/CATEGORIES/PRODUCTS. Devuelve false (sin lanzar
 * error) si el backend no responde, para que init() decida qué mostrar. */
async function loadStoreData() {
	try {
		const [site, categories, products] = await Promise.all([
			fetchAPI("/site"),
			fetchAPI("/categories"),
			fetchAPI("/products"),
		]);
		CONFIG = site;
		CATEGORIES = categories;
		PRODUCTS = products;
		localStorage.setItem("cache_site", JSON.stringify(site));
		localStorage.setItem("cache_categories", JSON.stringify(categories));
		localStorage.setItem("cache_products", JSON.stringify(products));
		apiReachable = true;
		return true;
	} catch (err) {
		console.error("No se pudo conectar con el backend:", err);
		apiReachable = false;
		return false;
	}
}

/* ESTADO DE LA TIENDA (cliente) — el carrito y favoritos NO requieren login */
const state = {
	cart: loadJSON("store_cart", []),
	favorites: loadJSON("store_favorites", []),
	activeCategory: "todos",
	sort: "relevancia",
	search: "",
};

function persistCart() {
	localStorage.setItem("store_cart", JSON.stringify(state.cart));
	localStorage.setItem("store_favorites", JSON.stringify(state.favorites));
}

/* ELEMENTOS DEL DOM */
const grid = document.getElementById("products-grid");
const emptyState = document.getElementById("empty-state");
const cartCountEl = document.getElementById("cart-count");
const categoriesList = document.getElementById("categories-list");
const drawerCategories = document.getElementById("nav-drawer-categories");
const sortSelect = document.getElementById("sort-select");
const categoryTitle = document.getElementById("category-title");
const resultsCount = document.getElementById("results-count");
const categoryBanner = document.getElementById("category-banner");
const categoryBannerImg = document.getElementById("category-banner-img");

const modalCart = document.getElementById("modal-cart");

const viewShop = document.getElementById("view-shop");
const viewAbout = document.getElementById("view-about");
const ALL_VIEWS = [viewShop, viewAbout];

function showView(view) {
	ALL_VIEWS.forEach(v => { v.hidden = v !== view; });
	window.scrollTo({ top: 0, behavior: "smooth" });
}

/* VISIBILIDAD — una categoría desactivada en el dashboard desaparece de la
 * tienda junto con sus productos, sin borrar nada: al reactivarla vuelven. */
function isCategoryActive(categoryName) {
	return !CATEGORIES.some(c => c.name === categoryName && c.active === false);
}

function isProductVisible(product) {
	return product.active !== false && isCategoryActive(product.category);
}

/* BÚSQUEDA, CATEGORÍAS Y ORDEN — RENDER DE PRODUCTOS */
function getFilteredProducts() {
	let list = PRODUCTS.filter(isProductVisible);

	if (state.search.trim() !== "") {
		const q = state.search.trim().toLowerCase();
		list = list.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
	} else if (state.activeCategory === "promo") {
		list = list.filter(p => p.promo);
	} else if (state.activeCategory !== "todos") {
		list = list.filter(p => p.category === state.activeCategory);
	}

	switch (state.sort) {
		case "popular":
			list.sort((a, b) => (b.sales || 0) - (a.sales || 0));
			break;
		case "price-asc":
			list.sort((a, b) => a.price - b.price);
			break;
		case "price-desc":
			list.sort((a, b) => b.price - a.price);
			break;
		case "name-asc":
			list.sort((a, b) => a.name.localeCompare(b.name));
			break;
		case "name-desc":
			list.sort((a, b) => b.name.localeCompare(a.name));
			break;
		case "newest":
			list.sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0));
			break;
		case "oldest":
			list.sort((a, b) => new Date(a.dateAdded || 0) - new Date(b.dateAdded || 0));
			break;
		default:
			// "relevancia": destacados primero, luego el orden original
			list.sort((a, b) => (b.featured === true) - (a.featured === true));
	}

	return list;
}

function formatPrice(value) {
	return `${CONFIG.moneda} ${Number(value).toLocaleString("es-CO")}`;
}

/* Actualiza el título de la sección + contador de resultados + banner de
   categoría. Separado de renderProducts() para que cada función tenga una
   sola responsabilidad. */
function updateResultsHeader(products) {
	const searching = state.search.trim() !== "";

	if (searching) {
		categoryTitle.textContent = `Resultados de "${state.search.trim()}"`;
	} else if (state.activeCategory === "todos") {
		categoryTitle.textContent = "Todos los productos";
	} else if (state.activeCategory === "promo") {
		categoryTitle.textContent = "Solo promoción";
	} else {
		categoryTitle.textContent = state.activeCategory;
	}
	resultsCount.textContent = `${products.length} resultado${products.length === 1 ? "" : "s"} encontrado${products.length === 1 ? "" : "s"}`;

	const activeCat = CATEGORIES.find(c => c.name === state.activeCategory);
	if (activeCat && activeCat.image && !searching) {
		categoryBannerImg.src = resolveImage(activeCat.image);
		categoryBannerImg.alt = activeCat.name;
		categoryBanner.hidden = false;
	} else {
		categoryBanner.hidden = true;
	}
}

/* Arma el HTML de una sola tarjeta de producto. Aislar esto de
   renderProducts() facilita reutilizarlo y mantenerlo si cambia el diseño
   de la tarjeta más adelante. */
function buildProductCard(product) {
	const isFav = state.favorites.includes(product.id);
	const card = document.createElement("article");
	card.className = "card";
	card.innerHTML = `
		<div class="card__image-wrap">
			<img src="${escapeHTML(resolveImage(product.image))}" alt="${escapeHTML(product.name)}" loading="lazy">
			${product.promo ? `<span class="card__badge">Promoción</span>` : ""}
			${product.featured ? `<span class="card__badge card__badge--featured">Destacado</span>` : ""}
			<button class="card__fav ${isFav ? "is-active" : ""}" data-fav="${escapeHTML(product.id)}" aria-label="Favorito">
				<svg viewBox="0 0 24 24" fill="${isFav ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.6">
					<path d="M12 21s-7.5-4.7-10-9.1C.5 8.4 2.3 5 5.8 5c2 0 3.4 1.1 4.2 2.3C10.8 6.1 12.2 5 14.2 5c3.5 0 5.3 3.4 3.8 6.9C19.5 16.3 12 21 12 21z"/>
				</svg>
			</button>
		</div>
		<div class="card__body">
			<span class="card__category">${escapeHTML(product.category)}</span>
			<h3 class="card__name">${escapeHTML(product.name)}</h3>
			${product.description ? `<p class="card__description">${escapeHTML(product.description)}</p>` : ""}
			<div class="card__price-row">
				<span class="card__price">${formatPrice(product.price)}</span>
				${product.oldPrice ? `<span class="card__price--old">${formatPrice(product.oldPrice)}</span>` : ""}
			</div>
			<button class="card__add" data-add="${escapeHTML(product.id)}">Añadir a la bolsa</button>
		</div>
	`;
	return card;
}

function renderProducts() {
	const products = getFilteredProducts();

	emptyState.hidden = products.length !== 0;
	emptyState.textContent = state.search.trim() !== ""
		? `No se encontraron resultados para "${state.search.trim()}"`
		: "Ningún producto encontrado";

	updateResultsHeader(products);

	// Se arma todo en un DocumentFragment y se inserta una sola vez, en vez
	// de tocar el DOM (appendChild) producto por producto — con 100+
	// productos esto evita un reflow por cada tarjeta.
	const fragment = document.createDocumentFragment();
	products.forEach(product => fragment.appendChild(buildProductCard(product)));
	grid.innerHTML = "";
	grid.appendChild(fragment);
}

/* CATEGORÍAS (sidebar desktop + menú hamburguesa móvil) */
function categoryCount(categoryName) {
	return PRODUCTS.filter(p => isProductVisible(p) && p.category === categoryName).length;
}

function renderCategoriesUI() {
	const totalActive = PRODUCTS.filter(isProductVisible).length;
	const totalPromo = PRODUCTS.filter(p => isProductVisible(p) && p.promo).length;

	const items = [
		{ key: "todos", name: "Todos los productos", emoji: "🛍️", count: totalActive },
		{ key: "promo", name: "Solo promoción", emoji: "🏷️", count: totalPromo },
		...CATEGORIES.filter(c => c.active !== false).map(c => ({ key: c.name, name: c.name, emoji: c.emoji, image: c.image, count: categoryCount(c.name) })),
	];

	const renderList = (target, isDrawer) => {
		if (!target) return;
		target.innerHTML = "";
		items.forEach(item => {
			const isActive = state.activeCategory === item.key;
			const el = document.createElement(isDrawer ? "button" : "li");
			if (isDrawer) {
				el.type = "button";
				el.className = isActive ? "is-active" : "";
				el.dataset.category = item.key;
				el.dataset.closeDrawer = "";
				el.innerHTML = `<span>${escapeHTML(item.emoji || "🎀")}</span><span>${escapeHTML(item.name)}</span>`;
			} else {
				el.innerHTML = `
					<button class="category-item ${isActive ? "is-active" : ""}" data-category="${escapeHTML(item.key)}">
						<span class="category-item__thumb">${item.image ? `<img src="${escapeHTML(resolveImage(item.image))}" alt="${escapeHTML(item.name)}">` : escapeHTML(item.emoji || "🎀")}</span>
						<span class="category-item__name">${escapeHTML(item.name)}</span>
						<span class="category-item__count">${item.count}</span>
					</button>
				`;
			}
			target.appendChild(el);
		});
	};

	renderList(categoriesList, false);
	renderList(drawerCategories, true);
}

function selectCategory(key) {
	state.activeCategory = key;
	state.search = "";
	if (searchInput) searchInput.value = "";
	if (searchInputMobile) searchInputMobile.value = "";
	if (searchClearBtn) searchClearBtn.hidden = true;
	renderCategoriesUI();
	renderProducts();
}

if (categoriesList) {
	categoriesList.addEventListener("click", (e) => {
		const btn = e.target.closest("[data-category]");
		if (!btn) return;
		selectCategory(btn.dataset.category);
	});
}

if (drawerCategories) {
	drawerCategories.addEventListener("click", (e) => {
		const btn = e.target.closest("[data-category]");
		if (!btn) return;
		selectCategory(btn.dataset.category);
		closeNavDrawer();
	});
}

if (sortSelect) {
	sortSelect.addEventListener("change", (e) => {
		state.sort = e.target.value;
		renderProducts();
	});
}

/* 
   BUSCADOR (escritorio + móvil)
   Todo este bloque está DESACOPLADO del resto de la tienda: cada elemento
   se busca de forma independiente y se comprueba que exista antes de
   usarlo. Si en el futuro se elimina o modifica la barra de búsqueda móvil
   (o la de escritorio), el resto de la tienda —categorías, productos,
   carrito, menú— sigue funcionando con total normalidad.
*/
const searchInput = document.getElementById("search-input");
const searchInputMobile = document.getElementById("search-input-mobile");
const searchClearBtn = document.getElementById("search-clear");
const mobileSearchBar = document.getElementById("mobile-search");

function runSearch(value) {
	state.search = value || "";
	if (searchClearBtn) searchClearBtn.hidden = state.search.trim() === "";
	renderProducts();
}

const searchBtnDesktop = document.getElementById("search-btn");
if (searchBtnDesktop && searchInput) {
	searchBtnDesktop.addEventListener("click", () => runSearch(searchInput.value));
	searchInput.addEventListener("input", () => runSearch(searchInput.value));
	searchInput.addEventListener("keydown", (e) => { if (e.key === "Enter") runSearch(searchInput.value); });
}

const searchBtnMobile = document.getElementById("search-btn-mobile");
if (searchBtnMobile && searchInputMobile) {
	searchBtnMobile.addEventListener("click", () => runSearch(searchInputMobile.value));
	searchInputMobile.addEventListener("input", () => runSearch(searchInputMobile.value));
	searchInputMobile.addEventListener("keydown", (e) => { if (e.key === "Enter") runSearch(searchInputMobile.value); });
}

if (searchClearBtn) {
	searchClearBtn.addEventListener("click", () => {
		if (searchInput) searchInput.value = "";
		if (searchInputMobile) searchInputMobile.value = "";
		runSearch("");
	});
}

/* Botón de lupa en móvil: muestra/oculta la barra de búsqueda (si existe) */
const searchToggleBtn = document.getElementById("search-toggle");
if (searchToggleBtn && mobileSearchBar) {
	searchToggleBtn.addEventListener("click", () => {
		mobileSearchBar.hidden = !mobileSearchBar.hidden;
		if (!mobileSearchBar.hidden && searchInputMobile) searchInputMobile.focus();
	});
}

/* MENÚ HAMBURGUESA (drawer lateral móvil) */
const navDrawer = document.getElementById("nav-drawer");
const navDrawerOverlay = document.getElementById("nav-drawer-overlay");
const navToggle = document.getElementById("nav-toggle");

function openNavDrawer() {
	if (!navDrawer) return;
	navDrawer.classList.add("is-open");
	navDrawer.setAttribute("aria-hidden", "false");
	if (navDrawerOverlay) navDrawerOverlay.hidden = false;
	if (navToggle) navToggle.setAttribute("aria-expanded", "true");
}

function closeNavDrawer() {
	if (!navDrawer) return;
	navDrawer.classList.remove("is-open");
	navDrawer.setAttribute("aria-hidden", "true");
	if (navDrawerOverlay) navDrawerOverlay.hidden = true;
	if (navToggle) navToggle.setAttribute("aria-expanded", "false");
}

if (navToggle) navToggle.addEventListener("click", openNavDrawer);
const navDrawerCloseBtn = document.getElementById("nav-drawer-close");
if (navDrawerCloseBtn) navDrawerCloseBtn.addEventListener("click", closeNavDrawer);
if (navDrawerOverlay) navDrawerOverlay.addEventListener("click", closeNavDrawer);

if (navDrawer) {
	navDrawer.querySelectorAll("[data-close-drawer]").forEach(el => {
		el.addEventListener("click", () => {
			if (!el.hasAttribute("data-category")) closeNavDrawer();
		});
	});
}

const drawerCartBtn = document.getElementById("drawer-cart");
if (drawerCartBtn) {
	drawerCartBtn.addEventListener("click", () => {
		closeNavDrawer();
		renderCart();
		showModal(modalCart);
	});
}

/* Desplazamiento suave a una sección (usado por "Productos" en el drawer) */
document.querySelectorAll("[data-scroll-to]").forEach(el => {
	el.addEventListener("click", (e) => {
		e.preventDefault();
		showView(viewShop);
		setTimeout(() => {
			document.getElementById(el.dataset.scrollTo)?.scrollIntoView({ behavior: "smooth" });
		}, 50);
	});
});

/* CARRITO DE COMPRA (sin necesidad de registro ni inicio de sesión) */
function addToCart(productId) {
	const existing = state.cart.find(i => i.id === productId);
	if (existing) {
		existing.qty += 1;
	} else {
		state.cart.push({ id: productId, qty: 1 });
	}
	persistCart();
	updateCartCount();
	renderCart();
	showModal(modalCart);
}

function updateCartCount() {
	const total = state.cart.reduce((sum, i) => sum + i.qty, 0);
	cartCountEl.textContent = total;
}

function renderCart() {
	const wrap = document.getElementById("cart-items");
	const emptyMsg = document.getElementById("cart-empty");
	const totalEl = document.getElementById("cart-total-value");
	const itemsCountEl = document.getElementById("cart-items-count");

	wrap.innerHTML = "";
	emptyMsg.hidden = state.cart.length !== 0;

	let total = 0;
	let itemsCount = 0;

	state.cart.forEach(item => {
		const product = PRODUCTS.find(p => p.id === item.id);
		if (!product) return;
		total += product.price * item.qty;
		itemsCount += item.qty;

		const row = document.createElement("div");
		row.className = "cart-item";
		row.innerHTML = `
			<img src="${escapeHTML(resolveImage(product.image))}" alt="${escapeHTML(product.name)}">
			<div class="cart-item__info">
				<div class="cart-item__name">${escapeHTML(product.name)}</div>
				<div class="cart-item__qty">
					<button data-qty="down" data-id="${escapeHTML(item.id)}">−</button>
					<span>${item.qty}</span>
					<button data-qty="up" data-id="${escapeHTML(item.id)}">+</button>
				</div>
			</div>
			<div>
				<div class="cart-item__price">${formatPrice(product.price * item.qty)}</div>
				<button class="cart-item__remove" data-remove="${escapeHTML(item.id)}">Eliminar</button>
			</div>
		`;
		wrap.appendChild(row);
	});

	totalEl.textContent = formatPrice(total);
	itemsCountEl.textContent = itemsCount;
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
	persistCart();
	updateCartCount();
	renderCart();
});

document.getElementById("btn-cart").addEventListener("click", () => {
	renderCart();
	showModal(modalCart);
});
document.getElementById("cart-close").addEventListener("click", () => hideModal(modalCart));
document.getElementById("cart-continue").addEventListener("click", () => hideModal(modalCart));

/* Añadir al carrito y marcar favoritos: no requieren iniciar sesión */
grid.addEventListener("click", (e) => {
	const addBtn = e.target.closest("[data-add]");
	const favBtn = e.target.closest("[data-fav]");

	if (addBtn) addToCart(addBtn.dataset.add);

	if (favBtn) {
		const id = favBtn.dataset.fav;
		if (state.favorites.includes(id)) {
			state.favorites = state.favorites.filter(f => f !== id);
		} else {
			state.favorites.push(id);
		}
		persistCart();
		renderProducts();
	}
});

/* Finalizar compra por WhatsApp: arma el mensaje con el resumen del pedido.
 * El texto completo pasa por encodeURIComponent: antes, nombres con "+", "&" o
 * "#" (p. ej. "Combo Maxi + Par") llegaban cortados o con espacios de más. */
function goToWhatsappCheckout() {
	// Solo productos que todavía existen y se muestran en la tienda.
	const items = state.cart
		.map(item => ({ item, product: PRODUCTS.find(p => p.id === item.id) }))
		.filter(({ product }) => product && isProductVisible(product));
	if (items.length === 0) return;

	const lines = items.map(({ item, product }) => `- ${item.qty}x ${product.name} — ${formatPrice(product.price * item.qty)}`);
	const totalProductos = items.reduce((sum, { item }) => sum + item.qty, 0);
	const total = items.reduce((sum, { item, product }) => sum + product.price * item.qty, 0);

	const message =
		`Hola, ${CONFIG.nombreEmpresa}.\n\nQuiero realizar el siguiente pedido:\n\n${lines.join("\n")}` +
		`\n\nTotal de productos: ${totalProductos}\nTotal: ${formatPrice(total)}\n\nQuedo atento/a para continuar con la compra.`;

	window.open(`https://wa.me/${CONFIG.whatsappNumero}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
}

document.getElementById("cart-checkout").addEventListener("click", goToWhatsappCheckout);

/* MODALES: */
function showModal(modal) { modal.hidden = false; }
function hideModal(modal) { modal.hidden = true; }

[modalCart].forEach(modal => {
	modal.addEventListener("click", (e) => { if (e.target === modal) hideModal(modal); });
});
document.addEventListener("keydown", (e) => {
	if (e.key !== "Escape") return;
	hideModal(modalCart);
	closeNavDrawer();
});

/* NAVEGACIÓN ENTRE VISTAS PÚBLICAS (Tienda / Sobre) */
document.querySelectorAll("[data-view-link]").forEach(link => {
	link.addEventListener("click", (e) => {
		e.preventDefault();
		const target = link.dataset.viewLink;
		showView(target === "about" ? viewAbout : viewShop);
	});
});

/* 
   ACCESO ADMINISTRATIVO (discreto, a través del logo)
   El panel administrativo vive por completo en un archivo aparte
   (dashboard.html / dashboard.css / dashboard.js) y requiere su propio
   inicio de sesión — ver ese archivo y el README para más detalles.
   Aquí solo se detecta la interacción discreta sobre el logo:
     - Escritorio: doble clic sobre el logo.
     - Móvil: mantener presionado el logo (~700ms).
   Un clic normal en el logo sigue llevando a la tienda con normalidad.
*/
const brandLink = document.querySelector(".brand");
if (brandLink) {
	brandLink.addEventListener("dblclick", (e) => {
		e.preventDefault();
		window.location.href = "../dashboard/dashboard.html";
	});

	let pressTimer = null;
	brandLink.addEventListener("touchstart", () => {
		pressTimer = setTimeout(() => { window.location.href = "../dashboard/dashboard.html"; }, 700);
	});
	brandLink.addEventListener("touchend", () => clearTimeout(pressTimer));
	brandLink.addEventListener("touchmove", () => clearTimeout(pressTimer));
}

/* APLICAR INFORMACIÓN DE LA TIENDA AL RESTO DE LA PÁGINA */
function applyStoreInfoToPage() {
	document.title = CONFIG.nombreEmpresa;
	document.querySelectorAll(".brand__name").forEach(el => { el.textContent = CONFIG.nombreEmpresa; });
	document.getElementById("hero-tagline").textContent = CONFIG.tagline;
	document.getElementById("footer-tagline").textContent = CONFIG.tagline;

	document.getElementById("footer-email").href = `mailto:${CONFIG.email}`;
	document.getElementById("footer-email").textContent = CONFIG.email;
	document.getElementById("footer-phone").textContent = `+${CONFIG.whatsappNumero}`;

	document.getElementById("footer-tiktok").href = CONFIG.tiktok;
	document.getElementById("footer-instagram").href = CONFIG.instagram;

	const whatsappMsg = encodeURIComponent(CONFIG.whatsappMensaje);
	document.getElementById("whatsapp-float").href = `https://wa.me/${CONFIG.whatsappNumero}?text=${whatsappMsg}`;

	document.getElementById("footer-copyright").textContent = `© ${new Date().getFullYear()} ${CONFIG.nombreEmpresa}. Todos los derechos reservados.`;
}

/* Quita del carrito lo que ya no existe o se ocultó (producto borrado,
 * desactivado o de una categoría inactiva): si no, el total lo contaba. */
function pruneCart() {
	state.cart = state.cart.filter(item => {
		const product = PRODUCTS.find(p => p.id === item.id);
		return product && isProductVisible(product);
	});
	persistCart();
}

function renderStore() {
	applyStoreInfoToPage();
	renderCategoriesUI();
	renderProducts();
	updateCartCount();
}

/* INICIALIZACIÓN */
async function init() {
	// Con datos en caché (visita anterior) se pinta al instante; mientras tanto
	// se consulta la API. Sin caché, se avisa: el plan gratis de Render tarda
	// hasta ~1 minuto en despertar tras un rato sin visitas.
	if (PRODUCTS.length > 0) {
		renderStore();
	} else {
		emptyState.hidden = false;
		emptyState.textContent = "Cargando productos… la primera visita puede tardar hasta un minuto.";
	}

	const ok = await loadStoreData();
	if (ok) pruneCart();

	renderStore();

	if (!ok && PRODUCTS.length === 0) {
		// Ni la API respondió ni había nada en caché (primera visita sin backend disponible).
		// Va después de renderStore() porque renderProducts() reescribe este texto.
		emptyState.hidden = false;
		emptyState.textContent = "No se pudo conectar con el servidor. Intenta recargar la página en unos minutos.";
	} else if (!ok) {
		console.warn("Mostrando la última información guardada en este navegador: el servidor no respondió.");
	}
}

/* TIEMPO REAL — el backend avisa por /api/events (Server-Sent Events) cada
 * vez que el dashboard guarda un cambio, y la tienda vuelve a pedir los
 * datos y se redibuja sin recargar. Si la conexión se corta, EventSource
 * reconecta solo; al reconectar se recarga por si hubo cambios mientras
 * tanto. */
async function refreshStore() {
	const ok = await loadStoreData();
	if (!ok) return;
	// Si desactivaron la categoría que el cliente estaba viendo, vuelve a "Todos".
	if (!["todos", "promo"].includes(state.activeCategory) && !isCategoryActive(state.activeCategory)) {
		state.activeCategory = "todos";
	}
	pruneCart();
	renderStore();
	if (!modalCart.hidden) renderCart();
}

function connectLiveUpdates() {
	if (!("EventSource" in window)) return;
	let refreshTimer = null;
	let wasDisconnected = false;
	// Varios guardados seguidos (p. ej. categoría + productos) generan una sola recarga.
	const scheduleRefresh = () => {
		clearTimeout(refreshTimer);
		refreshTimer = setTimeout(refreshStore, 300);
	};

	const source = new EventSource(`${API_BASE_URL}/events`);
	source.addEventListener("catalog-updated", scheduleRefresh);
	source.addEventListener("open", () => {
		if (wasDisconnected) scheduleRefresh();
		wasDisconnected = false;
	});
	source.addEventListener("error", () => { wasDisconnected = true; });
}

init().then(connectLiveUpdates);
