const express = require("express");
const {
  getAllProducts,
  addProduct,
  getProductNameForinvoice,
  updateProduct,
  deleteProduct,
  getProductDetailsByName
} = require("../controllers/product.controller");
const authenticateToken = require("../middlewares/auth.middleware");
const router = express.Router();

router.get("/", authenticateToken, getAllProducts); 
router.post("/", authenticateToken, addProduct); 
router.put("/", authenticateToken, updateProduct); 
router.delete("/:product_id", authenticateToken, deleteProduct); 
router.get("/productName",authenticateToken, getProductNameForinvoice);
router.get("/detail/:productName", authenticateToken, getProductDetailsByName);

module.exports = router;