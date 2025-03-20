const express = require("express");
const {
  getAllProducts,
  addProduct,
//   updateProduct,
//   deleteProduct,
  getProductDetailsByName
} = require("../controllers/product.controller");
const authenticateToken = require("../middlewares/auth.middleware");
const router = express.Router();

router.get("/", authenticateToken, getAllProducts); 
router.post("/", authenticateToken, addProduct); 
// router.put("/:id", authenticateToken, updateProduct); 
// router.delete("/:id", authenticateToken, deleteProduct); 
router.get("/detail/:productName", authenticateToken, getProductDetailsByName);

module.exports = router;