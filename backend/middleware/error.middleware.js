/* error.middleware.js — manejo centralizado de errores.
 * Nunca se devuelve el stack trace ni detalles internos al cliente. */
function notFound(req, res) {
	res.status(404).json({ message: "Recurso no encontrado." });
}

function errorHandler(err, req, res, next) {
	console.error(err); // el detalle completo solo queda en el log del servidor
	if (res.headersSent) return next(err);
	const status = err.status || 500;
	const message = status === 500 ? "Error interno del servidor." : err.message;
	res.status(status).json({ message });
}

/* Express 4 no captura los errores de funciones async: una promesa rechazada
 * (Mongo caído, dato inesperado...) tumbaba todo el proceso. Este envoltorio
 * los manda al errorHandler en vez de dejarlos escapar. */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function httpError(status, message) {
	const err = new Error(message);
	err.status = status;
	return err;
}

module.exports = { notFound, errorHandler, asyncHandler, httpError };
