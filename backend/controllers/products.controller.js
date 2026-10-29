/* products.controller.js — CRUD de productos. */
const { readJSON, mutateJSON } = require("../data/db");
const { httpError } = require("../middleware/error.middleware");

const FILE = "products.json";
const CATEGORIES_FILE = "categories.json";

const MAX_NAME = 200;
const MAX_DESCRIPTION = 2000;
const MAX_IMAGE = 500;

function isMoney(value) {
	return typeof value !== "boolean" && String(value).trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0;
}

function validateProduct(body, { partial = false } = {}) {
	const errors = [];
	const p = {};

	if (!partial || body.name !== undefined) {
		if (!body.name || typeof body.name !== "string" || !body.name.trim()) errors.push("name es obligatorio.");
		else if (body.name.trim().length > MAX_NAME) errors.push(`name no puede superar ${MAX_NAME} caracteres.`);
		else p.name = body.name.trim();
	}
	if (!partial || body.category !== undefined) {
		if (!body.category || typeof body.category !== "string" || !body.category.trim()) errors.push("category es obligatorio.");
		else p.category = body.category.trim();
	}
	if (!partial || body.price !== undefined) {
		if (!isMoney(body.price)) errors.push("price debe ser un número mayor o igual a 0.");
		else p.price = Number(body.price);
	}
	if (body.oldPrice !== undefined) {
		if (body.oldPrice === null || body.oldPrice === "") p.oldPrice = null;
		else if (!isMoney(body.oldPrice)) errors.push("oldPrice debe ser un número mayor o igual a 0.");
		else p.oldPrice = Number(body.oldPrice);
	}
	if (body.description !== undefined) {
		const description = String(body.description).trim();
		if (description.length > MAX_DESCRIPTION) errors.push(`description no puede superar ${MAX_DESCRIPTION} caracteres.`);
		else p.description = description;
	}
	if (body.image !== undefined) {
		const image = String(body.image).trim();
		if (image.length > MAX_IMAGE) errors.push("image es demasiado larga.");
		else p.image = image;
	}
	if (body.active !== undefined) p.active = Boolean(body.active);
	if (body.featured !== undefined) p.featured = Boolean(body.featured);
	if (body.promo !== undefined) p.promo = Boolean(body.promo);
	if (body.sales !== undefined) p.sales = Number.isFinite(Number(body.sales)) ? Number(body.sales) : 0;

	return { errors, data: p };
}

// Un producto solo puede apuntar a una categoría que exista.
async function assertCategoryExists(name) {
	const categories = await readJSON(CATEGORIES_FILE, []);
	if (!categories.some(c => c.name === name)) throw httpError(400, "La categoría indicada no existe.");
}

async function getAll(req, res) {
	const products = await readJSON(FILE, []);
	res.json(products);
}

async function create(req, res) {
	const { errors, data } = validateProduct(req.body || {});
	if (errors.length) return res.status(400).json({ message: errors.join(" ") });
	await assertCategoryExists(data.category);

	let product;
	await mutateJSON(FILE, [], (products) => {
		product = {
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
		return [...products, product];
	});
	res.status(201).json(product);
}

async function update(req, res) {
	const { errors, data } = validateProduct(req.body || {}, { partial: true });
	if (errors.length) return res.status(400).json({ message: errors.join(" ") });
	if (data.category !== undefined) await assertCategoryExists(data.category);

	let updated;
	await mutateJSON(FILE, [], (products) => {
		const index = products.findIndex(p => p.id === req.params.id);
		if (index === -1) throw httpError(404, "Producto no encontrado.");
		updated = { ...products[index], ...data };
		return products.map((p, i) => (i === index ? updated : p));
	});
	res.json(updated);
}

async function remove(req, res) {
	await mutateJSON(FILE, [], (products) => {
		if (!products.some(p => p.id === req.params.id)) throw httpError(404, "Producto no encontrado.");
		return products.filter(p => p.id !== req.params.id);
	});
	res.status(204).send();
}

module.exports = { getAll, create, update, remove };
