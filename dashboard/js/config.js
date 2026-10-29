/* config.js — configuración centralizada del frontend.
 *
 * Un solo lugar para la URL del backend, en vez de repetirla por todo el
 * código. Si la URL de Render cambia, actualiza PRODUCTION_API_URL (ver
 * README.md, sección "Deploy del backend").
 *
 * Este mismo archivo (config.js) también existe en dashboard/js/config.js
 * — mantén ambos con la misma URL.
 */
// Abierto en tu PC (Live Server o doble clic al archivo) usa el backend local; publicado
// (GitHub Pages) usa el backend de Render.
const LOCAL_API_URL = "http://localhost:4000/api";
const PRODUCTION_API_URL = "https://sammy-bowns-api.onrender.com/api";

const API_BASE_URL = ["localhost", "127.0.0.1", ""].includes(location.hostname)
	? LOCAL_API_URL
	: PRODUCTION_API_URL;

/* Las imágenes subidas desde el dashboard viven en el backend
 * ("uploads/..."); las demás son archivos del frontend ("img/...").
 * resolveImage arma la URL correcta para cada caso. `localPrefix` es la
 * ruta hasta la carpeta frontend/ desde la página que la usa. */
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

function resolveImage(imagePath, localPrefix = "") {
	if (!imagePath) return "";
	if (/^(https?:|data:)/.test(imagePath)) return imagePath;
	if (imagePath.startsWith("uploads/")) return `${API_ORIGIN}/${imagePath}`;
	return `${localPrefix}${imagePath}`;
}

/* Escapa texto antes de meterlo en un innerHTML: nombres, descripciones y
 * categorías las escribe el administrador y no deben interpretarse como HTML
 * (evita XSS almacenado). Para textContent / .value no hace falta. */
function escapeHTML(value) {
	return String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}
