const express=require("express");
const router = express.Router();
const quatationcontroller=require("../controllers/quotation.controller");
const authenticateToken = require("../middlewares/auth.middleware");

router.get("/",authenticateToken,quatationcontroller.getallquotation);
router.post("/",authenticateToken,quatationcontroller.createquotation);
// router.put("/",authenticateToken,quatationcontroller.updatequotation);
// router.delete("/",authenticateToken,quatationcontroller.deletequotation);

module.exports=router;
