const express = require("express");
const { healthCheck } = require("../controllers/healthcheck");
const router = express.Router();

router.get("/", healthCheck);

module.exports = router;