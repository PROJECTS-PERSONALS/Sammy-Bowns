/* auth.middleware.js — protege las rutas administrativas.
 *
 * Valida el JWT enviado como "Authorization: Bearer <token>". Esta es la
 * protección REAL: aunque alguien manipule el frontend o llame a la API
 * directamente (con curl, Postman, etc.), sin un token válido y no
 * expirado, ninguna operación de escritura se ejecuta. Ocultar botones en
 * el dashboard es solo una comodidad de UX, no la seguridad en sí.
 */
const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
	const header = req.headers.authorization || "";
	const [scheme, token] = header.split(" ");

	if (scheme !== "Bearer" || !token) {
		return res.status(401).json({ message: "No autenticado." });
	}

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		req.admin = { email: payload.email };
		next();
	} catch {
		return res.status(401).json({ message: "Sesión inválida o expirada." });
	}
}

module.exports = { requireAuth };
