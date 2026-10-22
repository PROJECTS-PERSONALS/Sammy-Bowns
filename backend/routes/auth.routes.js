const express = require("express");
const { login, verify } = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/login", login);
router.get("/verify", requireAuth, verify);

module.exports = router;
