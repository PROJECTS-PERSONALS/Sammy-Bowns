const express = require("express");
const ctrl = require("../controllers/categories.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", ctrl.getAll);
router.post("/", requireAuth, ctrl.create);
router.put("/:id", requireAuth, ctrl.update);
router.patch("/:id", requireAuth, ctrl.update);
router.delete("/:id", requireAuth, ctrl.remove);

module.exports = router;
