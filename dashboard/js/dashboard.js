/* dashboard.js — Panel administrativo de Sammy Bowns
 *
 * Autenticación real contra el backend (ver /backend). La contraseña
 * jamás viaja ni se guarda en este archivo ni en el navegador — solo se
 * envía una vez al hacer login, y lo único que queda guardado en
 * sessionStorage es el token (JWT) que el servidor entrega. Ese token es
 * lo que se envía en cada operación administrativa (Authorization: Bearer).
 *
 * Las rutas de escritura (crear/editar/eliminar) están protegidas en el
 * BACKEND, no solo aquí: si alguien intenta llamarlas sin un token válido
 * (con curl, Postman, etc.) el servidor las rechaza con 401, sin importar
 * lo que haga este archivo.
 */

const SESSION_KEY = "dash_session"; // { token, email } — nunca la contraseña

/* Elementos de login */
const loginView = document.getElementById("dash-view-login");
const dashApp = document.getElementById("dash-app");
const loginForm = document.getElementById("dash-login-form");
const loginError = document.getElementById("dash-login-error");
const loginSubmitBtn = document.getElementById("dash-login-submit");

function getSession() {
	try {
		return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
	} catch {
		return null;
	}
}

function setSession(session) {
	try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch { /* ver nota abajo */ }
}

function clearSession() {
	try { sessionStorage.removeItem(SESSION_KEY); } catch { /* algunos navegadores restringen sessionStorage en ciertos contextos */ }
}

function showError(message) {
	loginError.textContent = message;
	loginError.hidden = false;
}

/* Cliente HTTP centralizado para la API. Agrega automáticamente el token
 * de sesión y maneja el caso de sesión vencida/该inválida en un solo lugar. */
async function apiFetch(path, options = {}) {
	const session = getSession();
	const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
	if (session?.token) headers.Authorization = `Bearer ${session.token}`;

	const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

	if (res.status === 401) {
		clearSession();
		showLogin();
		showError("Tu sesión expiró. Inicia sesión de nuevo.");
		throw new Error("Sesión expirada");
	}

	if (!res.ok) {
		let message = `Error ${res.status}`;
		try { message = (await res.json()).message || message; } catch { /* respuesta sin cuerpo JSON */ }
		throw new Error(message);
	}

	if (res.status === 204) return null;
	return res.json();
}

/* Envío del formulario de login */
loginForm.addEventListener("submit", async (e) => {
	e.preventDefault();
	loginError.hidden = true;
	loginSubmitBtn.disabled = true;
	loginSubmitBtn.textContent = "Verificando...";

	const email = document.getElementById("dash-email").value.trim();
	const password = document.getElementById("dash-password").value;

	try {
		const res = await fetch(`${API_BASE_URL}/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		});
		const data = await res.json().catch(() => ({}));

		if (!res.ok) {
			showError(data.message || "Correo o contraseña incorrectos.");
			return;
		}

		setSession({ token: data.token, email: data.email });
		document.getElementById("dash-password").value = "";
		await enterDashboard(data.email);
	} catch (err) {
		// Sin conexión con el backend, servidor caído, CORS mal configurado, etc.
		showError("No se pudo conectar con el servidor. Verifica que el backend esté corriendo (ver README.md).");
		console.error("Error en el login del panel:", err);
	} finally {
		loginSubmitBtn.disabled = false;
		loginSubmitBtn.textContent = "Entrar al panel";
	}
});

/* Verificación de sesión al cargar la página. No basta con que exista un
 * token guardado: se revalida contra el servidor (GET /api/auth/verify),
 * así que un token vencido o revocado se detecta de inmediato y manda de
 * vuelta al login — esta es la "protección de ruta" real que pide el
 * proyecto, no solo ocultar el contenido con CSS. */
async function verifySessionAndEnter() {
	const session = getSession();
	if (!session?.token) {
		showLogin();
		return;
	}

	try {
		const res = await fetch(`${API_BASE_URL}/auth/verify`, {
			headers: { Authorization: `Bearer ${session.token}` },
		});
		if (!res.ok) throw new Error("Sesión inválida");
		await enterDashboard(session.email);
	} catch {
		clearSession();
		showLogin();
	}
}

function showLogin() {
	loginView.hidden = false;
	dashApp.hidden = true;
}

async function enterDashboard(email) {
	loginView.hidden = true;
	dashApp.hidden = false;
	document.getElementById("dash-admin-email").textContent = email;
	await loadAllData();
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

/* DATOS — se leen y escriben en el backend, nunca en localStorage. */
let CONFIG = {};
let CATEGORIES = [];
let PRODUCTS = [];

async function loadAllData() {
	[CONFIG, CATEGORIES, PRODUCTS] = await Promise.all([
		apiFetch("/site"),
		apiFetch("/categories"),
		apiFetch("/products"),
	]);
}

function categoryCount(name) {
	return PRODUCTS.filter(p => p.category === name).length;
}

/* RESUMEN */
function renderResumen() {
	document.getElementById("stat-active-products").textContent = PRODUCTS.filter(p => p.active !== false).length;
	document.getElementById("stat-inactive-products").textContent = PRODUCTS.filter(p => p.active === false).length;
	document.getElementById("stat-categories").textContent = CATEGORIES.length;
	document.getElementById("stat-promo").textContent = PRODUCTS.filter(p => p.promo).length;
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
			<td><img src="../frontend/${p.image}" alt="${p.name}"></td>
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

productForm.addEventListener("submit", async (e) => {
	e.preventDefault();
	const id = document.getElementById("p-id").value;
	const payload = {
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

	try {
		if (id) {
			await apiFetch(`/products/${id}`, { method: "PUT", body: JSON.stringify(payload) });
		} else {
			await apiFetch("/products", { method: "POST", body: JSON.stringify(payload) });
		}
		PRODUCTS = await apiFetch("/products");
		productModal.hidden = true;
		renderProductsTable();
		renderCategoriesTable();
		renderResumen();
	} catch (err) {
		alert(err.message || "No se pudo guardar el producto.");
	}
});

document.getElementById("dash-products-tbody").addEventListener("click", async (e) => {
	const editId = e.target.dataset.editProduct;
	const toggleId = e.target.dataset.toggleProduct;
	const deleteId = e.target.dataset.deleteProduct;

	if (editId) openProductModal(PRODUCTS.find(p => p.id === editId));

	if (toggleId) {
		const p = PRODUCTS.find(prod => prod.id === toggleId);
		try {
			await apiFetch(`/products/${toggleId}`, { method: "PATCH", body: JSON.stringify({ active: p.active === false }) });
			PRODUCTS = await apiFetch("/products");
			renderProductsTable();
			renderResumen();
		} catch (err) {
			alert(err.message || "No se pudo actualizar el producto.");
		}
	}

	if (deleteId) {
		if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) return;
		try {
			await apiFetch(`/products/${deleteId}`, { method: "DELETE" });
			PRODUCTS = await apiFetch("/products");
			renderProductsTable();
			renderCategoriesTable();
			renderResumen();
		} catch (err) {
			alert(err.message || "No se pudo eliminar el producto.");
		}
	}
});

/* CATEGORÍAS — tabla + modal crear/editar */
const categoryModal = document.getElementById("dash-modal-category");
const categoryForm = document.getElementById("dash-category-form");

function renderCategoriesTable() {
	const tbody = document.getElementById("dash-categories-tbody");
	tbody.innerHTML = CATEGORIES.map(c => `
		<tr>
			<td>${c.image ? `<img src="../frontend/${c.image}" alt="${c.name}">` : (c.emoji || "🎀")}</td>
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

categoryForm.addEventListener("submit", async (e) => {
	e.preventDefault();
	const id = document.getElementById("c-id").value;
	const payload = {
		name: document.getElementById("c-name").value.trim(),
		emoji: document.getElementById("c-emoji").value.trim() || "🎀",
		image: document.getElementById("c-image").value.trim(),
	};

	try {
		if (id) {
			await apiFetch(`/categories/${id}`, { method: "PUT", body: JSON.stringify(payload) });
		} else {
			await apiFetch("/categories", { method: "POST", body: JSON.stringify(payload) });
		}
		[CATEGORIES, PRODUCTS] = await Promise.all([apiFetch("/categories"), apiFetch("/products")]);
		categoryModal.hidden = true;
		renderCategoriesTable();
		renderProductsTable();
		renderResumen();
	} catch (err) {
		alert(err.message || "No se pudo guardar la categoría.");
	}
});

document.getElementById("dash-categories-tbody").addEventListener("click", async (e) => {
	const editId = e.target.dataset.editCategory;
	const deleteId = e.target.dataset.deleteCategory;

	if (editId) openCategoryModal(CATEGORIES.find(c => c.id === editId));

	if (deleteId) {
		if (!confirm("¿Eliminar esta categoría?")) return;
		try {
			await apiFetch(`/categories/${deleteId}`, { method: "DELETE" });
			CATEGORIES = await apiFetch("/categories");
			renderCategoriesTable();
			renderResumen();
		} catch (err) {
			// Ej: 409 porque hay productos usando esta categoría — el backend
			// explica el motivo exacto, aquí solo se muestra tal cual.
			alert(err.message || "No se pudo eliminar la categoría.");
		}
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

document.getElementById("dash-store-form").addEventListener("submit", async (e) => {
	e.preventDefault();
	const payload = {
		nombreEmpresa: document.getElementById("store-name").value.trim(),
		tagline: document.getElementById("store-tagline").value.trim(),
		email: document.getElementById("store-email").value.trim(),
		whatsappNumero: document.getElementById("store-whatsapp").value.trim(),
		whatsappMensaje: document.getElementById("store-whatsapp-msg").value.trim(),
		tiktok: document.getElementById("store-tiktok").value.trim(),
		instagram: document.getElementById("store-instagram").value.trim(),
	};

	try {
		CONFIG = await apiFetch("/site", { method: "PUT", body: JSON.stringify(payload) });
		const msg = document.getElementById("store-saved");
		msg.hidden = false;
		setTimeout(() => { msg.hidden = true; }, 2500);
	} catch (err) {
		alert(err.message || "No se pudo guardar la información de la tienda.");
	}
});

/* INICIALIZACIÓN */
verifySessionAndEnter();
