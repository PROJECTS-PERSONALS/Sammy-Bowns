/* realtime.js — canal en vivo (Server-Sent Events) hacia la tienda.
 *
 * Cada navegador con la tienda abierta mantiene una conexión a
 * GET /api/events. Cuando el dashboard guarda algo (productos, categorías
 * o información del sitio), db.js llama a notifyChange() y todos los
 * clientes conectados reciben un evento "catalog-updated" para volver a
 * pedir los datos — sin recargar la página.
 *
 * SSE en vez de WebSockets: solo hace falta enviar del servidor al
 * navegador, funciona sobre HTTP normal (pasa por proxies y CORS igual que
 * el resto de la API) y el navegador reconecta solo si se corta.
 */
const clients = new Set();

// Comentario vacío cada 25 s para que proxies/hostings no cierren la
// conexión por inactividad.
const HEARTBEAT_MS = 25000;

function eventsHandler(req, res) {
	res.set({
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache",
		Connection: "keep-alive",
		"X-Accel-Buffering": "no", // evita el buffering de nginx
	});
	res.flushHeaders();
	res.write("retry: 5000\n\n");

	clients.add(res);
	const heartbeat = setInterval(() => res.write(": ping\n\n"), HEARTBEAT_MS);

	req.on("close", () => {
		clearInterval(heartbeat);
		clients.delete(res);
	});
}

function notifyChange(resource) {
	const payload = JSON.stringify({ resource, at: Date.now() });
	for (const res of clients) {
		res.write(`event: catalog-updated\ndata: ${payload}\n\n`);
	}
}

module.exports = { eventsHandler, notifyChange };
