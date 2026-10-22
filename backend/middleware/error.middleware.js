/* error.middleware.js — manejo centralizado de errores.
 * Nunca se devuelve el stack trace ni detalles internos al cliente. */
function notFound(req, res) {
	res.status(404).json({ message: "Recurso no encontrado." });
}

function errorHandler(err, req, res, next) {
	console.error(err); // el detalle completo solo queda en el log del servidor
	const status = err.status || 500;
	const message = status === 500 ? "Error interno del servidor." : err.message;
	res.status(status).json({ message });
}

module.exports = { notFound, errorHandler };
