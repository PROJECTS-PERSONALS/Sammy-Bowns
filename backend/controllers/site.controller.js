/* site.controller.js — información pública editable del Landing Page
 * (nombre de la marca, frase, contacto, redes sociales, WhatsApp). */
const { readJSON, writeJSON } = require("../data/db");

const FILE = "site.json";

const ALLOWED_FIELDS = [
	"nombreEmpresa", "tagline", "email", "whatsappNumero",
	"whatsappMensaje", "tiktok", "instagram", "moneda",
];

async function getSite(req, res) {
	res.json(await readJSON(FILE, {}));
}

async function updateSite(req, res) {
	const current = await readJSON(FILE, {});
	const updates = {};

	for (const field of ALLOWED_FIELDS) {
		if (req.body[field] !== undefined) updates[field] = String(req.body[field]).trim();
	}

	if (updates.whatsappNumero) {
		updates.whatsappNumero = updates.whatsappNumero.replace(/\D/g, "");
	}

	const next = { ...current, ...updates };
	await writeJSON(FILE, next);
	res.json(next);
}

module.exports = { getSite, updateSite };
