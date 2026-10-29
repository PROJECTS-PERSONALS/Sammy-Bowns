const express = require("express");
const ctrl = require("../controllers/categories.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { asyncHandler: wrap } = require("../middleware/error.middleware");

const router = express.Router();

router.get("/", wrap(ctrl.getAll));
router.post("/", requireAuth, wrap(ctrl.create));
router.put("/:id", requireAuth, wrap(ctrl.update));
router.patch("/:id", requireAuth, wrap(ctrl.update));
router.delete("/:id", requireAuth, wrap(ctrl.remove));

module.exports = router;
