const express = require("express");
const ctrl = require("../controllers/products.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", ctrl.getAll);                    // público: el landing lee el catálogo
router.post("/", requireAuth, ctrl.create);       // admin
router.put("/:id", requireAuth, ctrl.update);     // admin
router.patch("/:id", requireAuth, ctrl.update);   // admin (alias de update parcial)
router.delete("/:id", requireAuth, ctrl.remove);  // admin

module.exports = router;
