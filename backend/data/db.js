/* db.js — acceso centralizado a los datos (productos, categorías, sitio).
 *
 * Dos modos, con las mismas funciones para el resto del backend:
 *
 * - Con MONGODB_URI (producción en Render): los datos viven en MongoDB
 *   Atlas, porque el plan gratis de Render borra sus archivos en cada
 *   reinicio. Cada "archivo" es un documento de la colección "docs"
 *   ({ _id: "products.json", data: [...] }). La primera vez, si la base
 *   está vacía, se usan los JSON de esta carpeta como datos iniciales.
 *
 * - Sin MONGODB_URI (desarrollo en tu PC): se leen y escriben los JSON de
 *   esta carpeta, como siempre. Escritura segura: primero a un archivo
 *   temporal y luego se renombra, para no dejar el JSON corrupto.
 *
 * En ambos modos cada archivo tiene su propia cola de escrituras en memoria
 * para evitar que dos guardados concurrentes se pisen entre sí.
 */
const fs = require("fs/promises");
const path = require("path");
const { notifyChange } = require("../realtime");

const DATA_DIR = __dirname;
const queues = new Map(); // una promesa "cola" por archivo

let dbPromise = null;

function useMongo() {
	return Boolean(process.env.MONGODB_URI);
}

// Una sola conexión compartida; si falla, el siguiente intento reconecta.
function getDb() {
	if (!dbPromise) {
		const { MongoClient } = require("mongodb");
		const client = new MongoClient(process.env.MONGODB_URI);
		dbPromise = client.connect().then(c => c.db(process.env.MONGODB_DB || "sammy_bowns"));
		dbPromise.catch(() => { dbPromise = null; });
	}
	return dbPromise;
}

function withQueue(file, task) {
	const prev = queues.get(file) || Promise.resolve();
	const next = prev.then(task, task);
	queues.set(file, next.catch(() => {}));
	return next;
}

async function readFileJSON(fileName, fallback) {
	const filePath = path.join(DATA_DIR, fileName);
	try {
		const raw = await fs.readFile(filePath, "utf-8");
		return JSON.parse(raw);
	} catch (err) {
		if (err.code === "ENOENT") return fallback;
		throw new Error(`No se pudo leer ${fileName}: ${err.message}`);
	}
}

async function readJSON(fileName, fallback) {
	if (!useMongo()) return readFileJSON(fileName, fallback);

	const db = await getDb();
	const doc = await db.collection("docs").findOne({ _id: fileName });
	// Base nueva: arranca con los datos del repositorio.
	return doc ? doc.data : readFileJSON(fileName, fallback);
}

async function writeJSON(fileName, data) {
	return withQueue(fileName, async () => {
		if (useMongo()) {
			const db = await getDb();
			await db.collection("docs").replaceOne(
				{ _id: fileName },
				{ _id: fileName, data, updatedAt: new Date() },
				{ upsert: true },
			);
		} else {
			const filePath = path.join(DATA_DIR, fileName);
			const tmpPath = `${filePath}.tmp`;
			await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), "utf-8");
			await fs.rename(tmpPath, filePath);
		}
		// Avisa en vivo a las tiendas abiertas (ver realtime.js).
		notifyChange(fileName.replace(/\.json$/, ""));
	});
}

module.exports = { readJSON, writeJSON, useMongo, getDb };
