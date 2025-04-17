const pool = require("../config/db");

// Get All Invoices
exports.getAllInvoices = async (req, res) => {
  try {
    const userid=req.userId;
    const result = await pool.query("SELECT * FROM invoices where userid=$1 order by update_at desc",[userid]);
    if(result.rowCount===0){
      return res.status(404).json({success:false,message:"Invoce not available"});
    }
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ success: false, message: "Failed to fetch invoices" });
  }
};

// Add an Invoice
exports.addInvoice = async (req, res) => {
    const {
    partyDetail,
    bankDetails,
    businessDetail,
    tax_amount,
    invoice_prefix,
    sales_invoice_date,
    payment_terms,
    due_date,
    total_amount,
    taxable_amount,
    sgstAmount,
    cgstAmount,
    add_notes,
    perTaxAmount,
    productdetail
} = req.body;

    const userid=req.userId;
  
    const customer_id =partyDetail[0];
    const customerName =partyDetail[1];
    const shippingaddress =partyDetail[2];
    const billingaddress =partyDetail[3];

    const{accountNumber,ifscCode,bankBranch,accountHolder}=bankDetails;
    const business_name=businessDetail[0].business_name;
    const mobile_no=businessDetail[0].mobile_no;
    const pan_no =businessDetail[0].pan_no;
    const gst=businessDetail[0].gst;
    const logo =businessDetail[0].logo;
    const signature_box =businessDetail[0].signature_box;
    try{
    const newInvoice = await pool.query(`
        INSERT INTO invoices(customername,shippingaddress,billingaddress,
                             accountnumber,ifsccode,bankbranch,accountholder,
                             invoice_prefix,sales_invoice_date,payment_terms,due_date,total_amount,tax_amount,taxable_amount,cgst,sgst,add_notes,business_name,mobile_no,pan_no,gst,logo,signature_box,customer_id,userid)
             values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25) Returning invoice_id                
           `,
          [customerName,shippingaddress,billingaddress,accountNumber,ifscCode,bankBranch,accountHolder,invoice_prefix,sales_invoice_date,payment_terms,due_date,total_amount,tax_amount,taxable_amount,cgstAmount,sgstAmount,add_notes,business_name,mobile_no,pan_no,gst,logo,signature_box,customer_id,userid]);
         const invoice_id=newInvoice.rows[0].invoice_id;
  

      for(const [index,productitem] of productdetail.entries()){
        const{productName,hsnCode,gstRate,gstCalculate,unitPrice,quantity,total,discount_amount,discount_amountPer}=productitem;

           const calculatedGst=perTaxAmount[index];  
           const sgst=calculatedGst/2;
           const cgst=calculatedGst/2;
          
    const newinvoice_item = await pool.query(`
      INSERT INTO invoice_item (invoice_id, productname, hsncode, gstrate, gstcalculate, unitprice, quantity, total, discount_amount, discount_amount_per ,calculatedgst,cgst,sgst, userid)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
   [invoice_id,productName,hsnCode,gstRate,gstCalculate,unitPrice,quantity,total,discount_amount,discount_amountPer,calculatedGst,cgst,sgst,userid]);
      }
    res.status(201).json({ success: true, message: "Invoice added successfully"});

}
 catch (error) {
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
  const {
    invoiceId,
    invoiceDate,
    invoiceDueDate,
    invoicePrefix,
    paymentTerms,
    sgstAmount,
    cgstAmount,
    taxableAmount,
    totalAmount,
    customerId,
    customerName,
    billing_address,
    shipping_address,
    invoiceNotes,
    signature_box,
    bankDetail,
    businessprofile,
    taxAmount,
    productData
  } = req.body;

  const userid = req.userId;
 const accountNumber=bankDetail[0];
  const ifscCode=bankDetail[1];
  const bankBranch=bankDetail[2];
  const accountHolder=bankDetail[3];
  
 const business_name=businessprofile[0].business_name;
 const mobile_no=businessprofile[0].mobile_no;
 const pan_no =businessprofile[0].pan_no;
 const gst =businessprofile[0].gst;
 const logo =businessprofile[0].logo;

  try {
    const existingInvoice = await pool.query('SELECT invoice_id FROM invoices WHERE invoice_id = $1 AND userid = $2', [invoiceId, userid]);
    if (existingInvoice.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    const updatedInvoice = await pool.query(
      ` UPDATE invoices
        SET
          customername = $1,
          shippingaddress = $2,
          billingaddress = $3,
          accountnumber = $4,
          ifsccode = $5,
          bankbranch = $6,
          accountholder = $7,
          invoice_prefix = $8,
          sales_invoice_date = $9,
          payment_terms = $10,
          due_date = $11,
          total_amount = $12,
          taxable_amount = $13,
          cgst = $14,
          sgst = $15,
          add_notes = $16,
          business_name = $17,
          mobile_no = $18,
          pan_no = $19,
          gst = $20,
          logo = $21,
          signature_box = $22,
          customer_id = $23
        WHERE invoice_id = $24 AND userid = $25
        RETURNING invoice_id
      `,
      [
        customerName,
        shipping_address,
        billing_address,
        accountNumber,
        ifscCode,
        bankBranch,
        accountHolder,
        invoicePrefix,
        invoiceDate,
        paymentTerms,
        invoiceDueDate,
        totalAmount,
        taxableAmount,
        cgstAmount,
        sgstAmount,
        invoiceNotes,
        business_name,
        mobile_no,
        pan_no,
        gst,
        logo,
        signature_box,
        customerId,
        invoiceId,
        userid,
      ]
    );

    if (updatedInvoice.rows.length > 0) {
      const updated_invoice_id = updatedInvoice.rows[0].invoice_id;

      await pool.query('DELETE FROM invoice_item WHERE invoice_id = $1 AND userid = $2', [updated_invoice_id, userid]);

      for (const [index, productitem] of productData.entries()) {
        console.log(productitem);
        const { id,productName, hsnCode, gstRate, unitPrice, quantity, total, discount_amount, discount_amountPer,taxable_amount,gstCalculate } = productitem;
        const calculatedGst = taxAmount[index];
        const sgst = calculatedGst / 2;
        const cgst = calculatedGst / 2;

        await pool.query(
          `
            INSERT INTO invoice_item (invoice_id, productname, hsncode, gstrate, unitprice, quantity, total, discount_amount, discount_amount_per ,calculatedgst,cgst,sgst, userid)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
          `,
          [updated_invoice_id, productName, hsnCode, gstRate, unitPrice, quantity, total, discount_amount, discount_amountPer, calculatedGst, cgst, sgst, userid]
        );
      }

      res.status(201).json({ success: true, message: 'Invoice updated successfully', invoice_id: updated_invoice_id });
    } else {
      res.status(500).json({ success: false, message: 'Failed to update invoice' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
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