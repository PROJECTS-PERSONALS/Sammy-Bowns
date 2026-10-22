/* categories.controller.js — CRUD de categorías. */
const { readJSON, writeJSON } = require("../data/db");

const CATEGORIES_FILE = "categories.json";
const PRODUCTS_FILE = "products.json";

function validateCategory(body, { partial = false } = {}) {
	const errors = [];
	const c = {};

	if (!partial || body.name !== undefined) {
		if (!body.name || typeof body.name !== "string" || !body.name.trim()) errors.push("name es obligatorio.");
		else c.name = body.name.trim();
	}
	if (body.emoji !== undefined) c.emoji = String(body.emoji).trim() || "🎀";
	if (body.image !== undefined) c.image = String(body.image).trim();

	return { errors, data: c };
}

async function getAll(req, res) {
	res.json(await readJSON(CATEGORIES_FILE, []));
}

async function create(req, res) {
	const { errors, data } = validateCategory(req.body);
	if (errors.length) return res.status(400).json({ message: errors.join(" ") });

	const categories = await readJSON(CATEGORIES_FILE, []);
	const category = { id: `cat${Date.now()}`, emoji: "🎀", image: "", ...data };
	categories.push(category);
	await writeJSON(CATEGORIES_FILE, categories);
	res.status(201).json(category);
}

async function update(req, res) {
	const { errors, data } = validateCategory(req.body, { partial: true });
	if (errors.length) return res.status(400).json({ message: errors.join(" ") });

	const categories = await readJSON(CATEGORIES_FILE, []);
	const index = categories.findIndex(c => c.id === req.params.id);
	if (index === -1) return res.status(404).json({ message: "Categoría no encontrada." });

	// Si se renombra la categoría, los productos que la usaban se actualizan
	// para no quedar "huérfanos" apuntando a un nombre que ya no existe.
	if (data.name && data.name !== categories[index].name) {
		const products = await readJSON(PRODUCTS_FILE, []);
		const oldName = categories[index].name;
		let changed = false;
		products.forEach(p => {
			if (p.category === oldName) { p.category = data.name; changed = true; }
		});
		if (changed) await writeJSON(PRODUCTS_FILE, products);
	}

	categories[index] = { ...categories[index], ...data };
	await writeJSON(CATEGORIES_FILE, categories);
	res.json(categories[index]);
}

async function remove(req, res) {
	const categories = await readJSON(CATEGORIES_FILE, []);
	const category = categories.find(c => c.id === req.params.id);
	if (!category) return res.status(404).json({ message: "Categoría no encontrada." });

	const products = await readJSON(PRODUCTS_FILE, []);
	const inUse = products.some(p => p.category === category.name);
	if (inUse) {
		return res.status(409).json({ message: "No se puede eliminar: hay productos usando esta categoría. Reasígnalos primero." });
	}

	await writeJSON(CATEGORIES_FILE, categories.filter(c => c.id !== req.params.id));
	res.status(204).send();
}

module.exports = { getAll, create, update, remove };
