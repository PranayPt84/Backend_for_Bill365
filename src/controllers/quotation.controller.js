const pool=require("../config/db");

exports.createquotation=async(req , res)=>{
  const {
    partyDetail,
    bankDetails,
    businessDetail,
    tax_amount,
    quotation_prefix,
    sales_quotation_date,
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
    const newquotation = await pool.query(`
        INSERT INTO quotation(customername,shippingaddress,billingaddress,
                             accountnumber,ifsccode,bankbranch,accountholder,
                             quotation_prefix,sales_quotation_date,payment_terms,due_date,total_amount,tax_amount,taxable_amount,cgst,sgst,add_notes,business_name,mobile_no,pan_no,gst,logo,signature_box,customer_id,userid)
             values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25) Returning quotation_id                
           `,
          [customerName,shippingaddress,billingaddress,accountNumber,ifscCode,bankBranch,accountHolder,quotation_prefix,sales_quotation_date,payment_terms,due_date,total_amount,tax_amount,taxable_amount,cgstAmount,sgstAmount,add_notes,business_name,mobile_no,pan_no,gst,logo,signature_box,customer_id,userid]);
         const quotation_id=newquotation.rows[0].quotation_id;
  

      for(const [index,productitem] of productdetail.entries()){
        const{productName,hsnCode,gstRate,gstCalculate,unitPrice,quantity,total,discount_amount,discount_amountPer,tax_amount}=productitem;

           const calculatedGst=perTaxAmount[index];  
           const sgst=calculatedGst/2;
           const cgst=calculatedGst/2;
          
    const newinvoice_item = await pool.query(`
      INSERT INTO quotation_item (quotation_id, productname, hsncode, gstrate, gstcalculate, unitprice, quantity, total, discount_amount, discount_amount_per ,calculatedgst,cgst,sgst,taxableamount, userid)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
   [quotation_id,productName,hsnCode,gstRate,gstCalculate,unitPrice,quantity,total,discount_amount,discount_amountPer,calculatedGst,cgst,sgst,tax_amount,userid]);
      }
    res.status(201).json({ success: true, message: "Quotation added successfully"});

}
 catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
}
    };

exports.updateQuotation =async(req , res)=>{
    const {
      quotationId,
      quotationDate,
      quotationDueDate,
      quotationPrefix,
      paymentTerms,
      sgstAmount,
      cgstAmount,
      taxableAmount,
      totalAmount,
      customerId,
      customerName,
      billing_address,
      shipping_address,
      quotationNotes,
      signature_box,
      bankDetail,
      businessprofile,
      taxAmount,
      productData
    } = req.body;
  
    const userid = req.userId;
    console.log(req.body);
   const accountNumber=bankDetail[0];
    const ifscCode=bankDetail[1];
    const bankBranch=bankDetail[2];
    const accountHolder=bankDetail[3];
    
   const business_name=businessprofile[0].name;
   const mobile_no=businessprofile[0].mobile_no;
   const pan_no =businessprofile[0].pan_no;
   const gst=businessprofile[0].gst;
   const logo =businessprofile[0].logo;
  
    try {
      const existingquotation = await pool.query('SELECT quotation_id FROM quotation WHERE quotation_id = $1 AND userid = $2', [quotationId, userid]);
      if (existingquotation.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Quotation not found' });
      }
      const updatedquotation = await pool.query(
        ` UPDATE quotation
          SET
            customername = $1,
            shippingaddress = $2,
            billingaddress = $3,
            accountnumber = $4,
            ifsccode = $5,
            bankbranch = $6,
            accountholder = $7,
            quotation_prefix = $8,
            sales_quotation_date = $9,
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
            customer_id = $23,
           update_at = CURRENT_TIMESTAMP
          WHERE quotation_id = $24 AND userid = $25
          RETURNING quotation_id
        `,
        [
          customerName,
          shipping_address,
          billing_address,
          accountNumber,
          ifscCode,
          bankBranch,
          accountHolder,
          quotationPrefix,
          quotationDate,
          paymentTerms,
          quotationDueDate,
          totalAmount,
          taxableAmount,
          cgstAmount,
          sgstAmount,
          quotationNotes,
          business_name,
          mobile_no,
          pan_no,
          gst,
          logo,
          signature_box,
          customerId,
          quotationId,
          userid,
        ]
      );
  
      if (updatedquotation.rows.length > 0) {
        const updated_quotation_id = updatedquotation.rows[0].quotation_id;
  
        await pool.query('DELETE FROM quotation_item WHERE quotation_id = $1 AND userid = $2', [updated_quotation_id, userid]);
  
        for (const [index, productitem] of productData.entries()) {
          console.log(productitem);
          const { id,productName, hsnCode, gstRate, unitPrice, quantity, total, discount_amount, discount_amountPer,taxable_amount,gstCalculate } = productitem;
          const calculatedGst = taxAmount[index];
          const sgst = calculatedGst / 2;
          const cgst = calculatedGst / 2;
  
          await pool.query(
            `
              INSERT INTO quotation_item (quotation_id, productname, hsncode, gstrate, unitprice, quantity, total, discount_amount, discount_amount_per ,calculatedgst,cgst,sgst,taxableamount, userid)
              VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
            `,
            [updated_quotation_id, productName, hsnCode, gstRate, unitPrice, quantity, total, discount_amount, discount_amountPer, calculatedGst, cgst, sgst,taxable_amount,userid]
          );
        }
  
        res.status(201).json({ success: true, message: 'quotation updated successfully', quotation_id: updated_quotation_id });
      } else {
        res.status(500).json({ success: false, message: 'Failed to update quotation' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };
  
    exports.getallquotation=async(req,res)=>{
        const userid=req.userId;
        try {
          const result = await pool.query("SELECT * FROM quotation where userid=$1 order by update_at desc",[userid]);
          if(result.rowCount===0){
            return res.status(404).json({success:false,message:"quotation not available"});
          }
          res.status(200).json(result.rows);
        } catch (error) {
          console.error("Error fetching challans:", error);
          res.status(500).json({ success: false, message: "Failed to fetch challans" });
        }
      };
   

exports.deletequotation = async (req, res) => {
  const { quotation_id } = req.params;
  const userid=req.userId;

  if(!quotation_id || !userid){
    return res.status(401).json({success:false,message:"require all fields"});
  }
  try {
    await pool.query("DELETE FROM quotation_item WHERE quotation_id = $1 and userid=$2", [quotation_id,userid]);
    const result= await pool.query("Delete from quotation where quotation_id=$1 and userid=$2",[quotation_id,userid]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }

    res.json({ success: true, message: "Quotation deleted successfully" });
  } catch (error) {
    console.error("Error deleting quotation:", error);
    res.status(500).json({ success: false, message: "Failed to delete quotation" });
  }
};
