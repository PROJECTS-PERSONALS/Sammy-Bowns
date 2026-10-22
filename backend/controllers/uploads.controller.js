/* uploads.controller.js — subida de imágenes desde el dashboard.
 *
 * El dashboard envía el archivo tal cual en el cuerpo de la petición
 * (Content-Type: image/jpeg, image/png...), sin multipart: así no hace
 * falta ninguna librería extra. El archivo se guarda en backend/uploads/
 * con un nombre único y se devuelve la ruta "uploads/<archivo>", que es la
 * que se guarda en el producto o la categoría.
 *
 * Igual que los JSON de /data, esta carpeta vive en el disco del servidor:
 * en el hosting hay que usar un disco persistente para no perderla.
 */
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
const MAX_BYTES = 5 * 1024 * 1024;

// Solo formatos de imagen comunes; la extensión sale del tipo, nunca del
// nombre que manda el navegador.
const ALLOWED_TYPES = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
	"image/gif": "gif",
};

async function upload(req, res) {
	const type = (req.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
	const ext = ALLOWED_TYPES[type];
	if (!ext) return res.status(400).json({ message: "Formato no permitido. Usa JPG, PNG, WEBP o GIF." });
	if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
		return res.status(400).json({ message: "No se recibió ninguna imagen." });
	}

	await fs.mkdir(UPLOADS_DIR, { recursive: true });
	const fileName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
	await fs.writeFile(path.join(UPLOADS_DIR, fileName), req.body);

	res.status(201).json({ path: `uploads/${fileName}` });
}

module.exports = { upload, UPLOADS_DIR, ALLOWED_TYPES, MAX_BYTES };
