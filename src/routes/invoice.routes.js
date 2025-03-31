const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoice.controller");
const authenticateToken = require("../middlewares/auth.middleware");

router.get("/", authenticateToken, invoiceController.getAllInvoices);
router.post("/", authenticateToken, invoiceController.addInvoice);
router.get("/invoicesdetails/:customerNumber",authenticateToken, invoiceController.getInvoicesbyCustomerNumber);
router.put("/", authenticateToken, invoiceController.updateInvoice);
router.delete("/:invoice_id", authenticateToken, invoiceController.deleteInvoice);
// router.get("/:id", authenticateToken, invoiceController.getInvoiceDetails);

module.exports = router;