const express = require("express");
const authenticateToken = require("../middlewares/auth.middleware");
const router = express.Router();
const businessprofile =require('../controllers/businessprofile.controller');
router.get('/',authenticateToken,businessprofile.getbusinessprofile);
router.post('/',authenticateToken,businessprofile.createbusinessprofile);

module.exports=router;