const express = require("express");
const ctrl = require("../controllers/products.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { asyncHandler: wrap } = require("../middleware/error.middleware");

const router = express.Router();

router.get("/", wrap(ctrl.getAll));                    // público: el landing lee el catálogo
router.post("/", requireAuth, wrap(ctrl.create));       // admin
router.put("/:id", requireAuth, wrap(ctrl.update));     // admin
router.patch("/:id", requireAuth, wrap(ctrl.update));   // admin (alias de update parcial)
router.delete("/:id", requireAuth, wrap(ctrl.remove));  // admin

module.exports = router;
