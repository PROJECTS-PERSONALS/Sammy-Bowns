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

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "").split(",").map(o => o.trim()).filter(Boolean);
app.use(cors({
	origin(origin, callback) {
		// Sin "origin" = llamadas desde herramientas como curl/Postman: se permiten.
		if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
		callback(new Error("Origen no permitido por CORS."));
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
app.get("/api/events", eventsHandler); // público: actualizaciones en vivo para la tienda

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`API de Sammy Bowns escuchando en http://localhost:${PORT}`);
});
