/* api.test.js — pruebas de integración de la API (sin librerías extra).
 *
 * Arranca el servidor de verdad en un puerto libre, con una copia temporal de
 * los datos (DATA_DIR) y una carpeta temporal de fotos, así que NO toca
 * backend/data ni MongoDB. Ejecutar:  npm test   (desde la carpeta backend/)
 */
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const net = require("node:net");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ADMIN_EMAIL = "admin@test.local";
const ADMIN_PASSWORD = "clave-de-prueba-123";
const JWT_SECRET = "secreto-solo-para-pruebas-0123456789abcdef";
const ORIGIN = "http://localhost:5500";

let server, base, tmpDir, token;

const freePort = () => new Promise((resolve, reject) => {
	const s = net.createServer();
	s.listen(0, () => { const { port } = s.address(); s.close(() => resolve(port)); });
	s.on("error", reject);
});

async function api(method, route, { body, headers = {}, raw } = {}) {
	const res = await fetch(`${base}${route}`, {
		method,
		headers: { ...(body !== undefined && !raw ? { "Content-Type": "application/json" } : {}), ...headers },
		body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
	});
	const text = await res.text();
	let json = null;
	try { json = JSON.parse(text); } catch { /* sin cuerpo JSON */ }
	return { status: res.status, json, headers: res.headers };
}
const auth = () => ({ Authorization: `Bearer ${token}` });

before(async () => {
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sammy-test-"));
	fs.cpSync(path.join(__dirname, "..", "data"), path.join(tmpDir, "data"), { recursive: true, filter: (src) => !src.endsWith("db.js") });
	const port = await freePort();
	base = `http://127.0.0.1:${port}/api`;
	server = spawn(process.execPath, ["server.js"], {
		cwd: path.join(__dirname, ".."),
		env: {
			PATH: process.env.PATH,
			PORT: String(port),
			DATA_DIR: path.join(tmpDir, "data"),
			UPLOADS_DIR: path.join(tmpDir, "uploads"),
			ADMIN_EMAIL,
			ADMIN_PASSWORD_HASH: bcrypt.hashSync(ADMIN_PASSWORD, 4),
			JWT_SECRET,
			CORS_ORIGIN: ORIGIN,
			LOGIN_RATE_MAX: "8",
		},
		stdio: ["ignore", "pipe", "pipe"],
	});
	server.stderr.on("data", () => {}); // los errores esperados no ensucian la salida
	await new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error("El servidor no arrancó a tiempo")), 10000);
		server.stdout.on("data", (d) => { if (String(d).includes("escuchando")) { clearTimeout(timer); resolve(); } });
		server.on("exit", (code) => reject(new Error(`El servidor terminó con código ${code}`)));
	});
});

after(() => {
	server?.kill();
	if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true });
});

test("la API responde y las rutas públicas leen datos", async () => {
	assert.equal((await api("GET", "")).json.status, "ok");
	for (const route of ["/products", "/categories", "/site"]) {
		const r = await api("GET", route);
		assert.equal(r.status, 200, route);
	}
	assert.ok(Array.isArray((await api("GET", "/products")).json));
});

test("rutas administrativas rechazan peticiones sin sesión válida (401)", async () => {
	const rutas = [
		["POST", "/products"], ["PUT", "/products/p1"], ["PATCH", "/products/p1"], ["DELETE", "/products/p1"],
		["POST", "/categories"], ["PUT", "/categories/cat1"], ["DELETE", "/categories/cat1"],
		["PUT", "/site"], ["POST", "/uploads"], ["GET", "/auth/verify"],
	];
	for (const [method, route] of rutas) {
		assert.equal((await api(method, route, method === "GET" ? {} : { body: {} })).status, 401, `${method} ${route}`);
	}
	const falso = await api("GET", "/auth/verify", { headers: { Authorization: "Bearer a.b.c" } });
	assert.equal(falso.status, 401);
	const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
	const sinFirma = `${b64({ alg: "none", typ: "JWT" })}.${b64({ email: ADMIN_EMAIL })}.`;
	assert.equal((await api("GET", "/auth/verify", { headers: { Authorization: `Bearer ${sinFirma}` } })).status, 401);
	const otroSecreto = jwt.sign({ email: ADMIN_EMAIL }, "otro-secreto-distinto-0123456789abcdef");
	assert.equal((await api("GET", "/auth/verify", { headers: { Authorization: `Bearer ${otroSecreto}` } })).status, 401);
});

test("login: datos con tipo incorrecto devuelven 400 y NO tumban el servidor", async () => {
	for (const body of [{ email: 123, password: "x" }, { email: ADMIN_EMAIL, password: ["x"] }, { email: {}, password: {} }, {}]) {
		assert.equal((await api("POST", "/auth/login", { body })).status, 400, JSON.stringify(body));
	}
	assert.equal((await api("POST", "/auth/login", { body: "{mal", raw: "{mal", headers: { "Content-Type": "application/json" } })).status, 400);
	assert.equal((await api("GET", "")).status, 200, "el servidor sigue vivo");
});

test("login correcto entrega un token que abre /auth/verify", async () => {
	const bad = await api("POST", "/auth/login", { body: { email: ADMIN_EMAIL, password: "incorrecta" } });
	assert.equal(bad.status, 401);
	const ok = await api("POST", "/auth/login", { body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
	assert.equal(ok.status, 200);
	token = ok.json.token;
	assert.ok(token);
	const v = await api("GET", "/auth/verify", { headers: auth() });
	assert.equal(v.json.email, ADMIN_EMAIL);
});

test("CORS: un origen no permitido recibe 403 y el permitido recibe su cabecera", async () => {
	const mal = await api("GET", "/products", { headers: { Origin: "https://evil.example" } });
	assert.equal(mal.status, 403);
	const bien = await api("GET", "/products", { headers: { Origin: ORIGIN } });
	assert.equal(bien.headers.get("access-control-allow-origin"), ORIGIN);
	assert.equal(bien.headers.get("x-powered-by"), null);
});

test("productos: validación de campos", async () => {
	const base = { name: "Prueba", category: "Navidad", price: 10 };
	const casos = [
		[{ ...base, price: "abc" }, "price no numérico"],
		[{ ...base, price: "" }, "price vacío"],
		[{ ...base, price: -1 }, "price negativo"],
		[{ ...base, oldPrice: "abc" }, "oldPrice no numérico"],
		[{ ...base, category: "NoExiste" }, "categoría inexistente"],
		[{ ...base, name: "x".repeat(201) }, "name demasiado largo"],
		[{ ...base, name: "  " }, "name vacío"],
	];
	for (const [body, why] of casos) {
		assert.equal((await api("POST", "/products", { body, headers: auth() })).status, 400, why);
	}
});

test("productos: crear, leer, actualizar y eliminar persisten en el almacenamiento", async () => {
	const antes = (await api("GET", "/products")).json.length;
	const creado = await api("POST", "/products", { body: { name: "Colero de prueba", category: "Navidad", price: 12345 }, headers: auth() });
	assert.equal(creado.status, 201);
	const id = creado.json.id;
	assert.equal((await api("GET", "/products")).json.length, antes + 1);

	const edit = await api("PATCH", `/products/${id}`, { body: { price: 999, active: false }, headers: auth() });
	assert.equal(edit.status, 200);
	const guardado = (await api("GET", "/products")).json.find(p => p.id === id);
	assert.equal(guardado.price, 999);
	assert.equal(guardado.active, false);
	// el archivo en disco (no solo la memoria) tiene el cambio
	const enDisco = JSON.parse(fs.readFileSync(path.join(tmpDir, "data", "products.json"), "utf-8"));
	assert.equal(enDisco.find(p => p.id === id).price, 999);

	assert.equal((await api("PATCH", "/products/no-existe", { body: { price: 1 }, headers: auth() })).status, 404);
	assert.equal((await api("DELETE", `/products/${id}`, { headers: auth() })).status, 204);
	assert.equal((await api("GET", "/products")).json.length, antes);
	assert.equal((await api("DELETE", `/products/${id}`, { headers: auth() })).status, 404);
});

test("concurrencia: 25 guardados simultáneos no se pisan entre sí", async () => {
	const productos = (await api("GET", "/products")).json.slice(0, 25);
	const marca = 424242;
	const respuestas = await Promise.all(productos.map(p => api("PATCH", `/products/${p.id}`, { body: { sales: marca }, headers: auth() })));
	assert.ok(respuestas.every(r => r.status === 200));
	const despues = (await api("GET", "/products")).json;
	assert.equal(despues.filter(p => p.sales === marca).length, 25);
});

test("categorías: nombre duplicado, renombrar actualiza productos y activar/desactivar", async () => {
	const dup = await api("POST", "/categories", { body: { name: "navidad" }, headers: auth() });
	assert.equal(dup.status, 409);

	const nueva = await api("POST", "/categories", { body: { name: "Categoría QA" }, headers: auth() });
	assert.equal(nueva.status, 201);
	const prod = await api("POST", "/products", { body: { name: "Producto QA", category: "Categoría QA", price: 1 }, headers: auth() });
	assert.equal(prod.status, 201);

	assert.equal((await api("DELETE", `/categories/${nueva.json.id}`, { headers: auth() })).status, 409, "no se borra con productos");

	const ren = await api("PUT", `/categories/${nueva.json.id}`, { body: { name: "Categoría QA 2" }, headers: auth() });
	assert.equal(ren.status, 200);
	assert.equal((await api("GET", "/products")).json.find(p => p.id === prod.json.id).category, "Categoría QA 2");

	const off = await api("PATCH", `/categories/${nueva.json.id}`, { body: { active: false }, headers: auth() });
	assert.equal(off.json.active, false);

	await api("DELETE", `/products/${prod.json.id}`, { headers: auth() });
	assert.equal((await api("DELETE", `/categories/${nueva.json.id}`, { headers: auth() })).status, 204);
});

test("sitio: solo campos permitidos y enlaces http(s)", async () => {
	const mal = await api("PUT", "/site", { body: { tiktok: "javascript:alert(1)" }, headers: auth() });
	assert.equal(mal.status, 400);
	const ok = await api("PUT", "/site", { body: { tagline: "Frase QA", campoExtra: "no", whatsappNumero: "+57 321-000" }, headers: auth() });
	assert.equal(ok.status, 200);
	assert.equal(ok.json.tagline, "Frase QA");
	assert.equal(ok.json.campoExtra, undefined);
	assert.equal(ok.json.whatsappNumero, "57321000");
});

test("imágenes: solo formatos reales y de hasta 5 MB", async () => {
	const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
	const up = (type, data) => api("POST", "/uploads", { raw: data, headers: { ...auth(), "Content-Type": type } });

	assert.equal((await up("text/plain", Buffer.from("hola"))).status, 400);
	assert.equal((await up("image/png", Buffer.from("esto no es un png"))).status, 400, "contenido falso con Content-Type image/png");
	assert.equal((await up("image/png", Buffer.alloc(6 * 1024 * 1024, 1))).status, 413);

	const ok = await up("image/png", png);
	assert.equal(ok.status, 201);
	assert.match(ok.json.path, /^uploads\/[\w-]+\.png$/);
	const img = await fetch(`${base.replace("/api", "")}/${ok.json.path}`);
	assert.equal(img.status, 200);
	assert.equal(img.headers.get("content-type"), "image/png");

	const traversal = await fetch(`${base.replace("/api", "")}/uploads/..%2f..%2fserver.js`);
	assert.equal(traversal.status, 404);
});

test("tiempo real: /api/events avisa cuando se guarda un cambio", async () => {
	const ctrl = new AbortController();
	const res = await fetch(`${base}/events`, { signal: ctrl.signal });
	assert.match(res.headers.get("content-type"), /^text\/event-stream/);
	const reader = res.body.getReader();
	await reader.read(); // "retry: 5000"
	await api("PATCH", "/site", { body: { tagline: "SSE QA" }, headers: auth() });
	let texto = "";
	const limite = Date.now() + 3000;
	while (!texto.includes("catalog-updated") && Date.now() < limite) {
		const { value } = await reader.read();
		texto += Buffer.from(value).toString();
	}
	ctrl.abort();
	assert.match(texto, /event: catalog-updated/);
});

test("límite de intentos: tras LOGIN_RATE_MAX intentos fallidos responde 429", async () => {
	const codigos = [];
	for (let i = 0; i < 12; i++) {
		codigos.push((await api("POST", "/auth/login", { body: { email: ADMIN_EMAIL, password: "mala" } })).status);
	}
	assert.ok(codigos.includes(429), `códigos: ${codigos.join(",")}`);
	assert.equal((await api("GET", "")).status, 200);
});
