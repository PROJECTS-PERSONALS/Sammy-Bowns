/* site.controller.js — información pública editable del Landing Page
 * (nombre de la marca, frase, contacto, redes sociales, WhatsApp). */
const { readJSON, mutateJSON } = require("../data/db");

const FILE = "site.json";

const ALLOWED_FIELDS = [
	"nombreEmpresa", "tagline", "email", "whatsappNumero",
	"whatsappMensaje", "tiktok", "instagram", "moneda",
];

const MAX_FIELD = 500;

async function getSite(req, res) {
	res.json(await readJSON(FILE, {}));
}

async function updateSite(req, res) {
	const body = req.body || {};
	const updates = {};

	for (const field of ALLOWED_FIELDS) {
		if (body[field] !== undefined) updates[field] = String(body[field]).trim().slice(0, MAX_FIELD);
	}

	if (updates.whatsappNumero) {
		updates.whatsappNumero = updates.whatsappNumero.replace(/\D/g, "");
	}

	// Estos enlaces terminan en un <a href>: solo se aceptan http(s) (o vacío)
	// para que no se pueda guardar un "javascript:..." que se ejecute al hacer clic.
	for (const field of ["tiktok", "instagram"]) {
		if (updates[field] && !/^https?:\/\//i.test(updates[field])) {
			return res.status(400).json({ message: `${field} debe empezar por http:// o https://.` });
		}
	}

	const next = await mutateJSON(FILE, {}, (current) => ({ ...current, ...updates }));
	res.json(next);
}

module.exports = { getSite, updateSite };
