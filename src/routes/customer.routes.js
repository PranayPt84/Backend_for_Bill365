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
// router.put("/:id",  authenticateToken , updateCustomer);
// router.delete("/:id",  authenticateToken , deleteCustomer);
router.get("/invoices/:customerNumber",  authenticateToken , getCustomerDetailsForInvoice);

module.exports = router;