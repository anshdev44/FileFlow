const express = require("express");
const { checkconnection } = require("../controllers/checknetwork");

const router = express.Router();

router.get('/',checkconnection)

module.exports=router;