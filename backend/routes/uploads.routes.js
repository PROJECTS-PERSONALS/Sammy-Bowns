const express = require("express");
const ctrl = require("../controllers/uploads.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

const rawImage = express.raw({ type: Object.keys(ctrl.ALLOWED_TYPES), limit: ctrl.MAX_BYTES });

// Traduce el error de tamaño de express.raw a un mensaje claro en español.
function parseImage(req, res, next) {
	rawImage(req, res, (err) => {
		if (err && err.type === "entity.too.large") {
			return res.status(413).json({ message: "La imagen pesa más de 5 MB." });
		}
		next(err);
	});
}

router.post("/", requireAuth, parseImage, ctrl.upload); // admin

module.exports = router;
