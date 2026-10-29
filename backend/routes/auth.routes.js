const express = require("express");
const rateLimit = require("express-rate-limit");
const { login, verify } = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { asyncHandler } = require("../middleware/error.middleware");

const router = express.Router();

// Freno a la fuerza bruta: por defecto 10 intentos de login cada 15 minutos
// por IP (configurable con LOGIN_RATE_MAX / LOGIN_RATE_WINDOW_MIN).
const loginLimiter = rateLimit({
	windowMs: (Number(process.env.LOGIN_RATE_WINDOW_MIN) || 15) * 60 * 1000,
	limit: Number(process.env.LOGIN_RATE_MAX) || 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: { message: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." },
});

router.post("/login", loginLimiter, asyncHandler(login));
router.get("/verify", requireAuth, verify);

module.exports = router;
