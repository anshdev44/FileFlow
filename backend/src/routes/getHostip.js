const express = require("express");
const { checkip } = require("../controllers/getHostip");
const router = express.Router();

router.get('/',checkip)

module.exports=router