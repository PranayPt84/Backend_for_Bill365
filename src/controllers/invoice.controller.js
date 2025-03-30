const pool = require("../config/db");

// Get All Invoices
exports.getAllInvoices = async (req, res) => {
  try {
    const userid=req.userId;
    const result = await pool.query("SELECT * FROM invoices where userid=$1",[userid]);
    if(result.rowCount===0){
      return res.status(401).json({success:false,message:"Invoce not available"});
    }
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ success: false, message: "Failed to fetch invoices" });
  }
};

// Add an Invoice
exports.addInvoice = async (req, res) => {
  const {
    invoiceDate,
    customerNumber,
    billing_address,
    shipping_address,
    references,
    subTotal,
    totalAmount,
    invoiceNotes,
    signature_box,
    productdetail
} = req.body;

const userid=req.userId;

if(!invoiceDate|| !customerNumber || !billing_address || !shipping_address || !references || !subTotal || !totalAmount || !invoiceNotes || !signature_box || !productdetail || !userid ){
return res.status(401).json({success:false ,message:"required all fields"});
}
const tax_amount = totalAmount - subTotal;

try {
    const newInvoice = await pool.query(`
        INSERT INTO invoices (
            invoice_date,customer_id,mob_number,billing_address,shipping_address,reference,sub_total,total_amount,tax_amount,invoicenotes,signature_box,userid)
           VALUES ( $1,(SELECT customer_id FROM customers WHERE mobile_no =$2 and userid=$11),$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING invoice_id`,
    [invoiceDate,customerNumber,billing_address,shipping_address, references, subTotal,totalAmount,tax_amount,invoiceNotes,signature_box,userid]);
      const invoice_id=newInvoice.rows[0].invoice_id;
  
      for(const item of productdetail){
        const{productName,hsnCode,gstRate,unitPrice,quantity,total}=item;
      
    
    const newinvoice_item = await pool.query(`
      INSERT INTO invoice_item (invoice_id, product_id,  product_name,  product_hsn_code,  unit_price,  tax_rate,  quantity,  total_price, userid)
       VALUES (  $1, (SELECT product_id FROM products WHERE product_hsn_code = $2 LIMIT 1),$3,$2,$4,$5,$6,$7,$8)`,
   [invoice_id, hsnCode, productName, unitPrice, gstRate, quantity, total,userid]);
      }
    res.status(201).json({ success: true, message: "Invoice added successfully"});
} catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
}
};

//get  Invoice by customerNumber 
exports.getInvoicesbyCustomerNumber = async(req,res)=>{
    const customerNumber=req.params.customerNumber;
    const userid=req.userId;
    try{
      if(!customerNumber || !userid){
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
        cu.mobile_no =$1 and c.userid=$2;`,[customerNumber,userid]);
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
exports.updateInvoice = async (req, res) => {
  
  const {invoiceDate, customerNumber, billing_address, shipping_address, references, subTotal, totalAmount, invoiceNotes, signature_box, invoice_id ,productdetail} = req.body;
  const userid=req.userId;
  if(!invoiceDate|| !customerNumber || !billing_address || !shipping_address || !references || !subTotal || !totalAmount || !invoiceNotes || !signature_box || !productdetail || !invoice_id|| !userid ){
   
    return res.status(401).json({success:false ,message:"required all fields"});
  }
    const tax_amount = totalAmount - subTotal;
  try {
    const result = await pool.query(`UPDATE invoices
      SET 
          invoice_date = $1,
          customer_id=(SELECT customer_id FROM customers WHERE mobile_no =$2 and userid=$11),
          mob_number = $2,
          billing_address = $3,
          shipping_address = $4,
          reference = $5,
          sub_total = $6,
          total_amount = $7,
          tax_amount = $8,
          invoicenotes = $9,
          signature_box = $10
      WHERE invoice_id = $12 and userid =$11
      RETURNING invoice_id`,
      [invoiceDate, customerNumber, billing_address, shipping_address, references, subTotal, totalAmount, tax_amount, invoiceNotes, signature_box, userid, invoice_id]
    );

    for (const item of productdetail) {
      const { productName, hsnCode, gstRate, unitPrice, quantity, total, invoice_item_id } = item; 
  
      const updatedInvoiceItem = await pool.query(`UPDATE invoice_item
          SET 
              product_id = (SELECT product_id FROM products WHERE product_hsn_code = $1 LIMIT 1),
              product_name = $2,
              product_hsn_code = $1,
              unit_price = $3,
              tax_rate = $4,
              quantity = $5,
              total_price = $6
          WHERE invoice_item_id = $8 and userid= $7`,
          [hsnCode, productName, unitPrice, gstRate, quantity, total, userid, invoice_item_id]);
  }
  res.status(200).json({ success: true, message: "Invoice updated successfully"});
 }
  catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).json({ success: false, message: "Failed to update invoice" });
  }
};

// Delete an Invoice
exports.deleteInvoice = async (req, res) => {
  const { invoice_id } = req.params;
  const userid=req.userId;

  if(!invoice_id || !userid){
    return res.status(401).json({success:false,message:"require all fields"});
  }

  try {
    await pool.query("DELETE FROM invoice_item WHERE invoice_id = $1 and userid=$2", [invoice_id,userid]);
    const result= await pool.query("Delete from invoices where invoice_id=$1 and userid=$2",[invoice_id,userid]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    res.json({ success: true, message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).json({ success: false, message: "Failed to delete invoice" });
  }
};

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