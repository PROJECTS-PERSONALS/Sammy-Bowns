const express = require("express");
const ctrl = require("../controllers/site.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { asyncHandler: wrap } = require("../middleware/error.middleware");

const router = express.Router();

router.get("/", wrap(ctrl.getSite));
router.put("/", requireAuth, wrap(ctrl.updateSite));
router.patch("/", requireAuth, wrap(ctrl.updateSite));

module.exports = router;
