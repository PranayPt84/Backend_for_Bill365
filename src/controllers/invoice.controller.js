const pool = require("../config/db");

// Get All Invoices
exports.getAllInvoices = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM invoices");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ success: false, message: "Failed to fetch invoices" });
  }
};

// Add an Invoice
exports.addInvoice = async (req, res) => {
  const { customer_id, amount, due_date, status } = req.body;

  if (!customer_id || !amount || !due_date) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO invoices (customer_id, amount, due_date, status) 
       VALUES ($1, $2, $3, $4) RETURNING invoice_id`,
      [customer_id, amount, due_date, status]
    );

    res.status(201).json({ success: true, message: "Invoice added successfully", id: result.rows[0].invoice_id });
  } catch (error) {
    console.error("Error adding invoice:", error);
    res.status(500).json({ success: false, message: "Failed to add invoice" });
  }
};

//get  Invoice by customerNumber 
exports.getInvoicesbyCustomerNumber = async(req,res)=>{
    const customerNumber=req.params.customerNumber;
    try{
      if(!customerNumber){
        res.status(401).json({message:"required customerNumber "})
      }
     const invoicedetails=await pool.query(`SELECT 
      c.invoice_id,
      c.invoice_date,
      c.mob_number ,
      c.billing_address,
      c.shipping_address,
      c.sub_total,
      c.tax_amount,
      c.total_amount,
      c.reference,
      c.invoicenotes,
      c.signature_box
  FROM 
      public.invoices c
  JOIN 
      public.customers cu ON c.customer_id = cu.customer_id
  WHERE 
        cu.mobile_no =$1;`,[customerNumber]);
        if(invoicedetails.rowCount===0){
          res.status(401).json({success:false,message:"challan not available"})
        }
        console.log(invoicedetails.rows)
       res.json(invoicedetails.rows); 
    }
    catch(error){
      console.log(error);
      res.status(401).json({success:false ,message:"server Error"})
    }
};
// Update an Invoice
// exports.updateInvoice = async (req, res) => {
//   const { id } = req.params;
//   const { amount, due_date, status } = req.body;

//   try {
//     const result = await pool.query(
//       "UPDATE invoices SET amount = $1, due_date = $2, status = $3 WHERE invoice_id = $4 RETURNING *",
//       [amount, due_date, status, id]
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({ success: false, message: "Invoice not found" });
//     }

//     res.json({ success: true, message: "Invoice updated successfully", invoice: result.rows[0] });
//   } catch (error) {
//     console.error("Error updating invoice:", error);
//     res.status(500).json({ success: false, message: "Failed to update invoice" });
//   }
// };

// // Delete an Invoice
// exports.deleteInvoice = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const result = await pool.query("DELETE FROM invoices WHERE invoice_id = $1", [id]);
//     if (result.rowCount === 0) {
//       return res.status(404).json({ success: false, message: "Invoice not found" });
//     }

//     res.json({ success: true, message: "Invoice deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting invoice:", error);
//     res.status(500).json({ success: false, message: "Failed to delete invoice" });
//   }
// };

// // Get Invoice Details
// exports.getInvoiceDetails = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const result = await pool.query("SELECT * FROM invoices WHERE invoice_id = $1", [id]);
//     if (result.rowCount === 0) {
//       return res.status(404).json({ success: false, message: "Invoice not found" });
//     }
//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error("Error fetching invoice details:", error);
//     res.status(500).json({ success: false, message: "Server error for invoice" });
//   }
// };