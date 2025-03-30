const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoice.controller");
const authenticateToken = require("../middlewares/auth.middleware");

router.get("/", authenticateToken, invoiceController.getAllInvoices);
router.post("/", authenticateToken, invoiceController.addInvoice);
router.get("/invoicesdetails/:customerNumber",authenticateToken, invoiceController.getInvoicesbyCustomerNumber);
// router.put("/:id", authenticateToken, invoiceController.updateInvoice);
// router.delete("/:id", authenticateToken, invoiceController.deleteInvoice);
// router.get("/:id", authenticateToken, invoiceController.getInvoiceDetails);

module.exports = router;