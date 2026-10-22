/* products.controller.js — CRUD de productos. */
const { readJSON, writeJSON } = require("../data/db");

const FILE = "products.json";

function validateProduct(body, { partial = false } = {}) {
	const errors = [];
	const p = {};

	if (!partial || body.name !== undefined) {
		if (!body.name || typeof body.name !== "string" || !body.name.trim()) errors.push("name es obligatorio.");
		else p.name = body.name.trim();
	}
	if (!partial || body.category !== undefined) {
		if (!body.category || typeof body.category !== "string") errors.push("category es obligatorio.");
		else p.category = body.category.trim();
	}
	if (!partial || body.price !== undefined) {
		const price = Number(body.price);
		if (Number.isNaN(price) || price < 0) errors.push("price debe ser un número mayor o igual a 0.");
		else p.price = price;
	}
	if (body.oldPrice !== undefined) {
		p.oldPrice = body.oldPrice === null || body.oldPrice === "" ? null : Number(body.oldPrice);
	}
	if (body.description !== undefined) p.description = String(body.description).trim();
	if (body.image !== undefined) p.image = String(body.image).trim();
	if (body.active !== undefined) p.active = Boolean(body.active);
	if (body.featured !== undefined) p.featured = Boolean(body.featured);
	if (body.promo !== undefined) p.promo = Boolean(body.promo);
	if (body.sales !== undefined) p.sales = Number(body.sales) || 0;

	return { errors, data: p };
}

async function getAll(req, res) {
	const products = await readJSON(FILE, []);
	res.json(products);
}

async function create(req, res) {
	const { errors, data } = validateProduct(req.body);
	if (errors.length) return res.status(400).json({ message: errors.join(" ") });

	const products = await readJSON(FILE, []);
	const product = {
		id: `p${Date.now()}`,
		oldPrice: null,
		description: "",
		active: true,
		featured: false,
		promo: false,
		sales: 0,
		dateAdded: new Date().toISOString().slice(0, 10),
		image: "img/Logo.jpeg",
		...data,
	};
	products.push(product);
	await writeJSON(FILE, products);
	res.status(201).json(product);
}

async function update(req, res) {
	const { errors, data } = validateProduct(req.body, { partial: true });
	if (errors.length) return res.status(400).json({ message: errors.join(" ") });

	const products = await readJSON(FILE, []);
	const index = products.findIndex(p => p.id === req.params.id);
	if (index === -1) return res.status(404).json({ message: "Producto no encontrado." });

	products[index] = { ...products[index], ...data };
	await writeJSON(FILE, products);
	res.json(products[index]);
}

async function remove(req, res) {
	const products = await readJSON(FILE, []);
	const exists = products.some(p => p.id === req.params.id);
	if (!exists) return res.status(404).json({ message: "Producto no encontrado." });

	await writeJSON(FILE, products.filter(p => p.id !== req.params.id));
	res.status(204).send();
}

module.exports = { getAll, create, update, remove };
