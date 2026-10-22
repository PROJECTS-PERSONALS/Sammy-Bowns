/* config.js — configuración centralizada del frontend.
 *
 * Un solo lugar para la URL del backend, en vez de repetirla por todo el
 * código. Cambia SOLO este valor cuando el backend quede desplegado en
 * producción (ver README.md, sección "Deploy del backend").
 *
 * Este mismo archivo (config.js) también existe en dashboard/js/config.js
 * — mantén ambos con la misma URL.
 */
const API_BASE_URL = "http://localhost:4000/api";

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
