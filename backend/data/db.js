/* db.js — acceso centralizado a los archivos JSON de datos.
 *
 * Es una persistencia sencilla a propósito (el catálogo es pequeño), pero
 * aislada detrás de estas funciones: el día que se quiera migrar a una base
 * de datos real (Postgres, MongoDB, etc.) solo hay que reescribir este
 * archivo — nada más del backend depende de que los datos vivan en JSON.
 *
 * Escritura seguRA: se escribe primero a un archivo temporal y luego se
 * renombra (operación atómica en la mayoría de sistemas de archivos), para
 * no dejar el JSON corrupto si el proceso se interrumpe a mitad de guardado.
 * Además, cada archivo tiene su propia cola de escrituras en memoria para
 * evitar que dos guardados concurrentes se pisen entre sí.
 */
const fs = require("fs/promises");
const path = require("path");
const { notifyChange } = require("../realtime");

const DATA_DIR = __dirname;
const queues = new Map(); // una promesa "cola" por archivo

function withQueue(file, task) {
	const prev = queues.get(file) || Promise.resolve();
	const next = prev.then(task, task);
	queues.set(file, next.catch(() => {}));
	return next;
}

async function readJSON(fileName, fallback) {
	const filePath = path.join(DATA_DIR, fileName);
	try {
		const raw = await fs.readFile(filePath, "utf-8");
		return JSON.parse(raw);
	} catch (err) {
		if (err.code === "ENOENT") return fallback;
		throw new Error(`No se pudo leer ${fileName}: ${err.message}`);
	}
}

async function writeJSON(fileName, data) {
	return withQueue(fileName, async () => {
		const filePath = path.join(DATA_DIR, fileName);
		const tmpPath = `${filePath}.tmp`;
		await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), "utf-8");
		await fs.rename(tmpPath, filePath);
		// Avisa en vivo a las tiendas abiertas (ver realtime.js).
		notifyChange(fileName.replace(/\.json$/, ""));
	});
}

module.exports = { readJSON, writeJSON };
