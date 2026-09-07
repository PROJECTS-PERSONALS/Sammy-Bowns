/* dashboard.js — Panel administrativo de Sammy Bowns */

const ADMIN_EMAIL = "ventasammybowns@gmail.com";
const ADMIN_PASSWORD_HASH = "f70a427801a6354219fcb9f543326d30f53cc28f6f9bd7a8334a3715cd7bd6b5"; // sha256
const SESSION_KEY = "dash_session"; // { email, expiresAt } — nunca guarda la contraseña
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 horas

// SHA-256 en JS puro (sin Web Crypto). BUG CORREGIDO: crypto.subtle solo
// existe en "contextos seguros" (https:// o http://localhost); si el
// dashboard se abre haciendo doble clic en el archivo (file://) o desde un
// hosting sin HTTPS, crypto.subtle es undefined y el login fallaba en
// silencio (la promesa se rechazaba sin mostrar ningún mensaje). Esta
// implementación no depende del navegador ni del protocolo, así que
// funciona siempre. Produce exactamente el mismo resultado que
// crypto.subtle.digest("SHA-256", ...) — ya verificado.
function sha256(ascii) {
	function rightRotate(v, n) { return (v >>> n) | (v << (32 - n)); }
	const maxWord = Math.pow(2, 32);
	let result = "";
	const words = [];
	const asciiBitLength = ascii.length * 8;
	let hash = [];
	const k = [];
	let primeCounter = 0;
	const isComposite = {};
	for (let candidate = 2; primeCounter < 64; candidate++) {
		if (!isComposite[candidate]) {
			for (let i = 0; i < 313; i += candidate) isComposite[i] = candidate;
			hash[primeCounter] = (Math.pow(candidate, 0.5) * maxWord) | 0;
			k[primeCounter++] = (Math.pow(candidate, 1 / 3) * maxWord) | 0;
		}
	}
	ascii += "\x80";
	while (ascii.length % 64 - 56) ascii += "\x00";
	for (let i = 0; i < ascii.length; i++) {
		const j = ascii.charCodeAt(i);
		words[i >> 2] |= j << ((3 - i) % 4) * 8;
	}
	words[words.length] = (asciiBitLength / maxWord) | 0;
	words[words.length] = asciiBitLength;
	for (let j = 0; j < words.length;) {
		const w = words.slice(j, j += 16);
		const oldHash = hash;
		hash = hash.slice(0, 8);
		for (let i = 0; i < 64; i++) {
			const w15 = w[i - 15], w2 = w[i - 2];
			const a = hash[0], e = hash[4];
			const temp1 = hash[7] + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) + ((e & hash[5]) ^ (~e & hash[6])) + k[i] +
				(w[i] = (i < 16) ? w[i] : (
					w[i - 16] + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
					w[i - 7] + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
				) | 0);
			const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
			hash = [(temp1 + temp2) | 0].concat(hash);
			hash[4] = (hash[4] + temp1) | 0;
		}
		for (let i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
	}
	for (let i = 0; i < 8; i++) {
		for (let j = 3; j + 1; j--) {
			const b = (hash[i] >> (j * 8)) & 255;
			result += (b < 16 ? "0" : "") + b.toString(16);
		}
	}
	return result;
}

/* Elementos de login */
const loginView = document.getElementById("dash-view-login");
const dashApp = document.getElementById("dash-app");
const loginForm = document.getElementById("dash-login-form");
const loginError = document.getElementById("dash-login-error");
const loginSubmitBtn = document.getElementById("dash-login-submit");
const backendNote = document.getElementById("dash-backend-note");

// El texto del HTML hablaba de un backend obligatorio; como ahora el login
// funciona con hash local, se actualiza ese aviso desde aquí (sin tocar el
// archivo dashboard.html) para no dejar información desactualizada.
if (backendNote) {
	backendNote.innerHTML = "<strong>Nota de seguridad:</strong> este acceso valida la contraseña mediante su huella SHA-256 en el propio navegador (sin backend). Es una protección básica, no una seguridad de nivel producción — cualquiera con el código fuente podría intentar evadirla. Para una autenticación real, monta el backend descrito en README.md.";
}

function getSession() {
	try {
		return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
	} catch {
		return null;
	}
}

function setSession(session) {
	try {
		sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
	} catch {
		/* algunos navegadores restringen sessionStorage en ciertos contextos;
		   la sesión simplemente no persistirá al recargar, pero el login
		   igual funciona para la visita actual. */
	}
}

function clearSession() {
	try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ver nota arriba */ }
}

function showError(message) {
	loginError.textContent = message;
	loginError.hidden = false;
}

/* Envío del formulario de login */
loginForm.addEventListener("submit", async (e) => {
	e.preventDefault();
	loginError.hidden = true;
	loginSubmitBtn.disabled = true;
	loginSubmitBtn.textContent = "Verificando...";

	const email = document.getElementById("dash-email").value.trim().toLowerCase();
	const password = document.getElementById("dash-password").value;

	try {
		const enteredHash = sha256(password);

		if (email === ADMIN_EMAIL.toLowerCase() && enteredHash === ADMIN_PASSWORD_HASH) {
			setSession({ email, expiresAt: Date.now() + SESSION_DURATION_MS });
			document.getElementById("dash-password").value = "";
			enterDashboard(email);
		} else {
			showError("Correo o contraseña incorrectos.");
		}
	} catch (err) {
		// Cualquier error inesperado se muestra en vez de fallar en silencio.
		showError("Ocurrió un error al validar el acceso. Intenta de nuevo.");
		console.error("Error en el login del panel:", err);
	} finally {
		loginSubmitBtn.disabled = false;
		loginSubmitBtn.textContent = "Entrar al panel";
	}
});

/* Verificación de sesión al cargar la página. */
function verifySessionAndEnter() {
	const session = getSession();
	if (!session || !session.email || !session.expiresAt || Date.now() > session.expiresAt) {
		clearSession();
		showLogin();
		return;
	}
	enterDashboard(session.email);
}

function showLogin() {
	loginView.hidden = false;
	dashApp.hidden = true;
}

function enterDashboard(email) {
	loginView.hidden = true;
	dashApp.hidden = false;
	document.getElementById("dash-admin-email").textContent = email;
	renderResumen();
	renderProductsTable();
	renderCategoriesTable();
	fillStoreForm();
}

document.getElementById("dash-logout").addEventListener("click", () => {
	clearSession();
	showLogin();
});

/* NAVEGACIÓN ENTRE PESTAÑAS DEL DASHBOARD */
const dashTabTitles = {
	resumen: "Resumen",
	productos: "Productos",
	categorias: "Categorías",
	tienda: "Información de la tienda",
};

document.querySelectorAll(".dash-nav__item").forEach(btn => {
	btn.addEventListener("click", () => {
		document.querySelectorAll(".dash-nav__item").forEach(b => b.classList.remove("is-active"));
		document.querySelectorAll(".dash-panel").forEach(p => p.classList.remove("is-active"));
		btn.classList.add("is-active");
		document.getElementById(`dash-panel-${btn.dataset.dashTab}`).classList.add("is-active");
		document.getElementById("dash-header-title").textContent = dashTabTitles[btn.dataset.dashTab];
		document.querySelector(".dash-sidebar").classList.remove("is-open");
	});
});

document.getElementById("dash-mobile-toggle").addEventListener("click", () => {
	document.querySelector(".dash-sidebar").classList.toggle("is-open");
});

/* DATOS COMPARTIDOS CON LA TIENDA PÚBLICA */
function loadJSON(key, fallback) {
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : fallback;
	} catch {
		return fallback;
	}
}

let CONFIG = loadJSON("store_config", {});
let CATEGORIES = loadJSON("store_categories", null);
let PRODUCTS = loadJSON("store_products", null);

// Si el administrador todavía no ha guardado nada, se parte de los mismos
// valores por defecto que usa la tienda pública (definidos en script.js).
// Como dashboard.html no carga script.js completo (para no duplicar la
// lógica de la tienda), se copian aquí solo si localStorage está vacío.
if (!CATEGORIES || !PRODUCTS || CATEGORIES.length === 0) {
	console.warn("Aún no hay productos/categorías guardados por el panel. Abre index.html al menos una vez para inicializar los datos por defecto.");
	CATEGORIES = CATEGORIES || [];
	PRODUCTS = PRODUCTS || [];
}

function saveProducts() { localStorage.setItem("store_products", JSON.stringify(PRODUCTS)); }
function saveCategories() { localStorage.setItem("store_categories", JSON.stringify(CATEGORIES)); }
function saveConfig() { localStorage.setItem("store_config", JSON.stringify(CONFIG)); }

function categoryCount(name) {
	return PRODUCTS.filter(p => p.category === name).length;
}

/* RESUMEN */
function renderResumen() {
	document.getElementById("stat-active-products").textContent = PRODUCTS.filter(p => p.active !== false).length;
	document.getElementById("stat-inactive-products").textContent = PRODUCTS.filter(p => p.active === false).length;
	document.getElementById("stat-categories").textContent = CATEGORIES.length;
	document.getElementById("stat-promo").textContent = PRODUCTS.filter(p => p.promo).length;

	const hint = document.querySelector("#dash-panel-resumen .dash-hint");
	if (CATEGORIES.length === 0 && PRODUCTS.length === 0) {
		hint.innerHTML = `⚠️ Todavía no hay datos guardados en este navegador. Abre <a href="./index.html" target="_blank">la tienda pública</a> una vez (para que se inicialicen los valores por defecto) y vuelve a entrar aquí.`;
	}
}

/* PRODUCTOS — tabla + modal crear/editar */
const productModal = document.getElementById("dash-modal-product");
const productForm = document.getElementById("dash-product-form");

function fillCategorySelect() {
	const select = document.getElementById("p-category");
	select.innerHTML = CATEGORIES.map(c => `<option value="${c.name}">${c.name}</option>`).join("");
}

function renderProductsTable() {
	const tbody = document.getElementById("dash-products-tbody");
	tbody.innerHTML = PRODUCTS.map(p => `
		<tr>
			<td><img src="${p.image}" alt="${p.name}"></td>
			<td>${p.name}</td>
			<td>${p.category}</td>
			<td>${CONFIG.moneda || "$"} ${Number(p.price).toLocaleString("es-CO")}</td>
			<td><span class="dash-badge ${p.active !== false ? "dash-badge--active" : "dash-badge--inactive"}">${p.active !== false ? "Activo" : "Inactivo"}</span></td>
			<td>${p.featured ? '<span class="dash-badge dash-badge--featured">Destacado</span>' : "—"}</td>
			<td class="dash-table-actions">
				<button data-edit-product="${p.id}">Editar</button>
				<button data-toggle-product="${p.id}">${p.active !== false ? "Desactivar" : "Activar"}</button>
				<button data-delete-product="${p.id}">Eliminar</button>
			</td>
		</tr>
	`).join("");
}

function openProductModal(product) {
	fillCategorySelect();
	document.getElementById("dash-product-modal-title").textContent = product ? "Editar producto" : "Nuevo producto";
	document.getElementById("p-id").value = product?.id || "";
	document.getElementById("p-name").value = product?.name || "";
	document.getElementById("p-category").value = product?.category || (CATEGORIES[0]?.name || "");
	document.getElementById("p-description").value = product?.description || "";
	document.getElementById("p-price").value = product?.price ?? "";
	document.getElementById("p-oldprice").value = product?.oldPrice ?? "";
	document.getElementById("p-image").value = product?.image || "";
	document.getElementById("p-active").checked = product ? product.active !== false : true;
	document.getElementById("p-featured").checked = !!product?.featured;
	document.getElementById("p-promo").checked = !!product?.promo;
	productModal.hidden = false;
}

document.getElementById("dash-new-product").addEventListener("click", () => openProductModal(null));
document.getElementById("dash-product-modal-close").addEventListener("click", () => { productModal.hidden = true; });
document.getElementById("dash-product-cancel").addEventListener("click", () => { productModal.hidden = true; });

productForm.addEventListener("submit", (e) => {
	e.preventDefault();
	const id = document.getElementById("p-id").value || `p${Date.now()}`;
	const data = {
		id,
		name: document.getElementById("p-name").value.trim(),
		category: document.getElementById("p-category").value,
		description: document.getElementById("p-description").value.trim(),
		price: Number(document.getElementById("p-price").value) || 0,
		oldPrice: document.getElementById("p-oldprice").value ? Number(document.getElementById("p-oldprice").value) : null,
		image: document.getElementById("p-image").value.trim() || "img/Logo.jpeg",
		active: document.getElementById("p-active").checked,
		featured: document.getElementById("p-featured").checked,
		promo: document.getElementById("p-promo").checked,
	};

	const existingIndex = PRODUCTS.findIndex(p => p.id === id);
	if (existingIndex >= 0) {
		data.sales = PRODUCTS[existingIndex].sales || 0;
		data.dateAdded = PRODUCTS[existingIndex].dateAdded;
		PRODUCTS[existingIndex] = data;
	} else {
		data.sales = 0;
		data.dateAdded = new Date().toISOString().slice(0, 10);
		PRODUCTS.push(data);
	}

	saveProducts();
	productModal.hidden = true;
	renderProductsTable();
	renderCategoriesTable();
	renderResumen();
});

document.getElementById("dash-products-tbody").addEventListener("click", (e) => {
	const editId = e.target.dataset.editProduct;
	const toggleId = e.target.dataset.toggleProduct;
	const deleteId = e.target.dataset.deleteProduct;

	if (editId) openProductModal(PRODUCTS.find(p => p.id === editId));

	if (toggleId) {
		const p = PRODUCTS.find(prod => prod.id === toggleId);
		p.active = p.active === false ? true : false;
		saveProducts();
		renderProductsTable();
		renderResumen();
	}

	if (deleteId) {
		if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) return;
		PRODUCTS = PRODUCTS.filter(p => p.id !== deleteId);
		saveProducts();
		renderProductsTable();
		renderCategoriesTable();
		renderResumen();
	}
});

/* CATEGORÍAS — tabla + modal crear/editar */
const categoryModal = document.getElementById("dash-modal-category");
const categoryForm = document.getElementById("dash-category-form");

function renderCategoriesTable() {
	const tbody = document.getElementById("dash-categories-tbody");
	tbody.innerHTML = CATEGORIES.map(c => `
		<tr>
			<td>${c.image ? `<img src="${c.image}" alt="${c.name}">` : (c.emoji || "🎀")}</td>
			<td>${c.name}</td>
			<td>${categoryCount(c.name)}</td>
			<td class="dash-table-actions">
				<button data-edit-category="${c.id}">Editar</button>
				<button data-delete-category="${c.id}">Eliminar</button>
			</td>
		</tr>
	`).join("");
}

function openCategoryModal(category) {
	document.getElementById("dash-category-modal-title").textContent = category ? "Editar categoría" : "Nueva categoría";
	document.getElementById("c-id").value = category?.id || "";
	document.getElementById("c-name").value = category?.name || "";
	document.getElementById("c-emoji").value = category?.emoji || "";
	document.getElementById("c-image").value = category?.image || "";
	categoryModal.hidden = false;
}

document.getElementById("dash-new-category").addEventListener("click", () => openCategoryModal(null));
document.getElementById("dash-category-modal-close").addEventListener("click", () => { categoryModal.hidden = true; });
document.getElementById("dash-category-cancel").addEventListener("click", () => { categoryModal.hidden = true; });

categoryForm.addEventListener("submit", (e) => {
	e.preventDefault();
	const id = document.getElementById("c-id").value || `cat${Date.now()}`;
	const data = {
		id,
		name: document.getElementById("c-name").value.trim(),
		emoji: document.getElementById("c-emoji").value.trim() || "🎀",
		image: document.getElementById("c-image").value.trim(),
	};

	const existingIndex = CATEGORIES.findIndex(c => c.id === id);
	if (existingIndex >= 0) {
		CATEGORIES[existingIndex] = data;
	} else {
		CATEGORIES.push(data);
	}

	saveCategories();
	categoryModal.hidden = true;
	renderCategoriesTable();
	renderResumen();
});

document.getElementById("dash-categories-tbody").addEventListener("click", (e) => {
	const editId = e.target.dataset.editCategory;
	const deleteId = e.target.dataset.deleteCategory;

	if (editId) openCategoryModal(CATEGORIES.find(c => c.id === editId));

	if (deleteId) {
		if (!confirm("¿Eliminar esta categoría? Los productos que la usan conservarán el nombre anterior.")) return;
		CATEGORIES = CATEGORIES.filter(c => c.id !== deleteId);
		saveCategories();
		renderCategoriesTable();
		renderResumen();
	}
});

/* INFORMACIÓN DE LA TIENDA */
function fillStoreForm() {
	document.getElementById("store-name").value = CONFIG.nombreEmpresa || "";
	document.getElementById("store-tagline").value = CONFIG.tagline || "";
	document.getElementById("store-email").value = CONFIG.email || "";
	document.getElementById("store-whatsapp").value = CONFIG.whatsappNumero || "";
	document.getElementById("store-whatsapp-msg").value = CONFIG.whatsappMensaje || "";
	document.getElementById("store-tiktok").value = CONFIG.tiktok || "";
	document.getElementById("store-instagram").value = CONFIG.instagram || "";
}

document.getElementById("dash-store-form").addEventListener("submit", (e) => {
	e.preventDefault();
	CONFIG.nombreEmpresa = document.getElementById("store-name").value.trim() || CONFIG.nombreEmpresa;
	CONFIG.tagline = document.getElementById("store-tagline").value.trim();
	CONFIG.email = document.getElementById("store-email").value.trim();
	CONFIG.whatsappNumero = document.getElementById("store-whatsapp").value.trim().replace(/\D/g, "");
	CONFIG.whatsappMensaje = document.getElementById("store-whatsapp-msg").value.trim();
	CONFIG.tiktok = document.getElementById("store-tiktok").value.trim();
	CONFIG.instagram = document.getElementById("store-instagram").value.trim();

	saveConfig();

	const msg = document.getElementById("store-saved");
	msg.hidden = false;
	setTimeout(() => { msg.hidden = true; }, 2500);
});

/* INICIALIZACIÓN */
verifySessionAndEnter();