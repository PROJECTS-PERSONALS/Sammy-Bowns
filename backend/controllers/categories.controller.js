/* categories.controller.js — CRUD de categorías. */
const { readJSON, mutateJSON } = require("../data/db");
const { httpError } = require("../middleware/error.middleware");

const CATEGORIES_FILE = "categories.json";
const PRODUCTS_FILE = "products.json";

const MAX_NAME = 100;
const MAX_IMAGE = 500;

function validateCategory(body, { partial = false } = {}) {
	const errors = [];
	const c = {};

	if (!partial || body.name !== undefined) {
		if (!body.name || typeof body.name !== "string" || !body.name.trim()) errors.push("name es obligatorio.");
		else if (body.name.trim().length > MAX_NAME) errors.push(`name no puede superar ${MAX_NAME} caracteres.`);
		else c.name = body.name.trim();
	}
	if (body.emoji !== undefined) c.emoji = String(body.emoji).trim().slice(0, 16) || "🎀";
	if (body.image !== undefined) {
		const image = String(body.image).trim();
		if (image.length > MAX_IMAGE) errors.push("image es demasiado larga.");
		else c.image = image;
	}
	if (body.active !== undefined) c.active = Boolean(body.active);

	return { errors, data: c };
}

async function getAll(req, res) {
	res.json(await readJSON(CATEGORIES_FILE, []));
}

async function create(req, res) {
	const { errors, data } = validateCategory(req.body || {});
	if (errors.length) return res.status(400).json({ message: errors.join(" ") });

	let category;
	await mutateJSON(CATEGORIES_FILE, [], (categories) => {
		if (categories.some(c => c.name.toLowerCase() === data.name.toLowerCase())) {
			throw httpError(409, "Ya existe una categoría con ese nombre.");
		}
		category = { id: `cat${Date.now()}`, emoji: "🎀", image: "", active: true, ...data };
		return [...categories, category];
	});
	res.status(201).json(category);
}

async function update(req, res) {
	const { errors, data } = validateCategory(req.body || {}, { partial: true });
	if (errors.length) return res.status(400).json({ message: errors.join(" ") });

	let updated;
	let renamedFrom = null;
	await mutateJSON(CATEGORIES_FILE, [], (categories) => {
		const index = categories.findIndex(c => c.id === req.params.id);
		if (index === -1) throw httpError(404, "Categoría no encontrada.");
		if (data.name && categories.some((c, i) => i !== index && c.name.toLowerCase() === data.name.toLowerCase())) {
			throw httpError(409, "Ya existe una categoría con ese nombre.");
		}
		if (data.name && data.name !== categories[index].name) renamedFrom = categories[index].name;
		updated = { ...categories[index], ...data };
		return categories.map((c, i) => (i === index ? updated : c));
	});

	// Si se renombra la categoría, los productos que la usaban se actualizan
	// para no quedar "huérfanos" apuntando a un nombre que ya no existe.
	if (renamedFrom) {
		await mutateJSON(PRODUCTS_FILE, [], (products) =>
			products.map(p => (p.category === renamedFrom ? { ...p, category: updated.name } : p)));
	}

	res.json(updated);
}

async function remove(req, res) {
	const categories = await readJSON(CATEGORIES_FILE, []);
	const category = categories.find(c => c.id === req.params.id);
	if (!category) return res.status(404).json({ message: "Categoría no encontrada." });

	const products = await readJSON(PRODUCTS_FILE, []);
	if (products.some(p => p.category === category.name)) {
		return res.status(409).json({ message: "No se puede eliminar: hay productos usando esta categoría. Reasígnalos primero." });
	}

	await mutateJSON(CATEGORIES_FILE, [], (current) => current.filter(c => c.id !== req.params.id));
	res.status(204).send();
}

module.exports = { getAll, create, update, remove };
