const express = require("express");
const {
  getAllCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerDetailsForInvoice
} = require("../controllers/customer.controller");
const authenticateToken = require("../middlewares/auth.middleware");
const router = express.Router();

router.get("/", authenticateToken , getAllCustomers);
router.post("/",  authenticateToken , addCustomer);
router.put("/",  authenticateToken , updateCustomer);
router.delete("/:customer_id",  authenticateToken , deleteCustomer);
router.get("/invoices/:customerName",  authenticateToken , getCustomerDetailsForInvoice);

module.exports = router;