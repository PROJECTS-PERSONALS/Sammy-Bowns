const express = require("express");
const ctrl = require("../controllers/site.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", ctrl.getSite);
router.put("/", requireAuth, ctrl.updateSite);
router.patch("/", requireAuth, ctrl.updateSite);

module.exports = router;
