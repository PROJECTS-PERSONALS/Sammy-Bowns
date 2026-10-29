/* server.js — punto de entrada del backend de Sammy Bowns.
 *
 * API REST simple (Express) que sirve productos, categorías e información
 * del sitio al Landing Page, y protege las operaciones de escritura para
 * que solo el administrador autenticado pueda usarlas.
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { notFound, errorHandler } = require("./middleware/error.middleware");
const authRoutes = require("./routes/auth.routes");
const productsRoutes = require("./routes/products.routes");
const categoriesRoutes = require("./routes/categories.routes");
const siteRoutes = require("./routes/site.routes");
const uploadsRoutes = require("./routes/uploads.routes");
const { UPLOADS_DIR, serveFromDb } = require("./controllers/uploads.controller");
const { useMongo, getDb } = require("./data/db");
const { eventsHandler } = require("./realtime");

// Falla rápido y con un mensaje claro si falta configuración esencial —
// mejor eso que un servidor "funcionando" que en realidad no puede
// autenticar a nadie.
["ADMIN_EMAIL", "ADMIN_PASSWORD_HASH", "JWT_SECRET"].forEach((key) => {
	if (!process.env[key]) {
		console.error(`Falta la variable de entorno ${key}. Revisa tu archivo .env (usa .env.example como plantilla).`);
		process.exit(1);
	}
});
if (!/^\$2[aby]\$\d{2}\$.{53}$/.test(process.env.ADMIN_PASSWORD_HASH)) {
	console.error("ADMIN_PASSWORD_HASH no parece un hash bcrypt (debe empezar por $2a$, $2b$ o $2y$). Si en Render el valor se recorta, ponlo entre comillas simples en tu .env o revisa que no tenga espacios.");
	process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
	console.warn("JWT_SECRET tiene menos de 32 caracteres: usa una cadena aleatoria más larga (ver .env.example).");
}
if (process.env.MONGODB_URI && !/^mongodb(\+srv)?:\/\//.test(process.env.MONGODB_URI)) {
	console.error("MONGODB_URI debe empezar por mongodb:// o mongodb+srv://.");
	process.exit(1);
}

const app = express();
app.disable("x-powered-by");
// Detrás del proxy de Render hay que confiar en 1 salto para que el límite de
// intentos de login cuente la IP real del visitante y no la del proxy.
if (process.env.RENDER) app.set("trust proxy", 1);

const allowedOrigins = (process.env.CORS_ORIGIN || "").split(",").map(o => o.trim()).filter(Boolean);
app.use(cors({
	origin(origin, callback) {
		// Sin "origin" = llamadas desde herramientas como curl/Postman: se permiten.
		if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
		callback(Object.assign(new Error("Origen no permitido por CORS."), { status: 403 }));
	},
}));

app.use(express.json({ limit: "1mb" }));

app.get("/api", (req, res) => {
	res.json({ name: "Sammy Bowns API", status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/site", siteRoutes);
app.use("/api/uploads", uploadsRoutes);
app.get("/api/events", eventsHandler); // público: actualizaciones en vivo para la tienda

// Imágenes subidas desde el dashboard (públicas, como las de frontend/img).
if (useMongo()) app.get("/uploads/:name", serveFromDb);
else app.use("/uploads", express.static(UPLOADS_DIR, { maxAge: "7d" }));

app.use(notFound);
app.use(errorHandler);

// Una promesa rechazada sin capturar se registra en vez de tumbar el servidor.
process.on("unhandledRejection", (reason) => console.error("Promesa rechazada sin capturar:", reason));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`API de Sammy Bowns escuchando en http://localhost:${PORT}`);
	// Conecta a MongoDB al arrancar para que el log de Render diga enseguida si funciona.
	if (useMongo()) {
		getDb()
			.then(() => console.log("MongoDB Atlas conectado."))
			.catch((err) => console.error("No se pudo conectar a MongoDB Atlas:", err.message));
	}
});
