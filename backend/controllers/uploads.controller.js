/* uploads.controller.js — subida de imágenes desde el dashboard.
 *
 * El dashboard envía el archivo tal cual en el cuerpo de la petición
 * (Content-Type: image/jpeg, image/png...), sin multipart: así no hace
 * falta ninguna librería extra. El archivo se guarda en backend/uploads/
 * con un nombre único y se devuelve la ruta "uploads/<archivo>", que es la
 * que se guarda en el producto o la categoría.
 *
 * Con MONGODB_URI (producción) la imagen se guarda en MongoDB, en la
 * colección "images", porque el disco de Render gratis se borra en cada
 * reinicio. Sin MONGODB_URI (tu PC) se guarda en backend/uploads/.
 * En ambos casos la tienda la pide igual: GET /uploads/<archivo>.
 */
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { useMongo, getDb } = require("../data/db");

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, "..", "uploads");
const MAX_BYTES = 5 * 1024 * 1024;

// Solo formatos de imagen comunes; la extensión sale del tipo, nunca del
// nombre que manda el navegador.
const ALLOWED_TYPES = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
	"image/gif": "gif",
};

// Firmas ("magic bytes") de cada formato: comprueba que el contenido sea de
// verdad una imagen y no solo que el encabezado Content-Type lo diga.
const SIGNATURES = {
	"image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
	"image/png": (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
	"image/gif": (b) => ["GIF87a", "GIF89a"].includes(b.subarray(0, 6).toString("latin1")),
	"image/webp": (b) => b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP",
};

async function upload(req, res) {
	const type = (req.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
	const ext = ALLOWED_TYPES[type];
	if (!ext) return res.status(400).json({ message: "Formato no permitido. Usa JPG, PNG, WEBP o GIF." });
	if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
		return res.status(400).json({ message: "No se recibió ninguna imagen." });
	}

	if (!SIGNATURES[type](req.body)) {
		return res.status(400).json({ message: "El archivo no es una imagen válida." });
	}

	const fileName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
	if (useMongo()) {
		const db = await getDb();
		await db.collection("images").insertOne({
			_id: fileName,
			contentType: type,
			data: req.body,
			size: req.body.length,
			createdAt: new Date(),
		});
	} else {
		await fs.mkdir(UPLOADS_DIR, { recursive: true });
		await fs.writeFile(path.join(UPLOADS_DIR, fileName), req.body);
	}

	res.status(201).json({ path: `uploads/${fileName}` });
}

// GET /uploads/<archivo> en modo MongoDB (en modo archivos lo sirve
// express.static desde server.js). Los nombres son únicos y nunca se
// reescriben, así que el navegador puede guardarlas en caché sin miedo.
async function serveFromDb(req, res, next) {
	try {
		const db = await getDb();
		const image = await db.collection("images").findOne({ _id: req.params.name });
		if (!image) return res.status(404).json({ message: "Imagen no encontrada." });
		res.set("Cache-Control", "public, max-age=604800, immutable");
		res.set("X-Content-Type-Options", "nosniff");
		res.type(image.contentType).send(Buffer.from(image.data.buffer));
	} catch (err) {
		next(err);
	}
}

module.exports = { upload, serveFromDb, UPLOADS_DIR, ALLOWED_TYPES, MAX_BYTES };
