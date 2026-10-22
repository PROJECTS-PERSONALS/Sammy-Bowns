/* auth.controller.js — login del administrador.
 *
 * La contraseña real NUNCA está en el código: solo su hash bcrypt vive en
 * la variable de entorno ADMIN_PASSWORD_HASH. Se compara con bcrypt.compare
 * (resistente a timing attacks básicos) y, si es válida, se firma un JWT
 * de corta duración. Ese JWT es lo único que el frontend guarda — nunca la
 * contraseña ni su hash.
 */
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function login(req, res) {
	const { email, password } = req.body || {};

	if (!email || !password) {
		return res.status(400).json({ message: "Correo y contraseña son obligatorios." });
	}

	const validEmail = email.trim().toLowerCase() === (process.env.ADMIN_EMAIL || "").toLowerCase();
	const validPassword = validEmail && await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH || "");

	if (!validEmail || !validPassword) {
		// Mensaje genérico a propósito: no revela cuál de los dos campos falló.
		return res.status(401).json({ message: "Correo o contraseña incorrectos." });
	}

	const token = jwt.sign({ email }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN || "2h",
	});

	res.json({ token, email });
}

function verify(req, res) {
	// Si llegó hasta acá, requireAuth ya validó el token.
	res.json({ email: req.admin.email });
}

module.exports = { login, verify };
