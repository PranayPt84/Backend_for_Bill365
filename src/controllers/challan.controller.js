const pool = require("../config/db");

// Create a new challan
exports.createChallan = async (req, res) => {
  const {
     partyDetail,
     bankDetails,
     businessDetail,
     tax_amount,
     challan_prefix,
     sales_challan_date,
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
     const newchallan = await pool.query(`
         INSERT INTO challan (customername,shippingaddress,billingaddress,
                              accountnumber,ifsccode,bankbranch,accountholder,
                              challan_prefix,sales_challan_date,payment_terms,due_date,total_amount,tax_amount,taxable_amount,cgst,sgst,add_notes,business_name,mobile_no,pan_no,gst,logo,signature_box,customer_id,userid)
              values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25) Returning challan_id                
            `,
           [customerName,shippingaddress,billingaddress,accountNumber,ifscCode,bankBranch,accountHolder,challan_prefix,sales_challan_date,payment_terms,due_date,total_amount,tax_amount,taxable_amount,cgstAmount,sgstAmount,add_notes,business_name,mobile_no,pan_no,gst,logo,signature_box,customer_id,userid]);
          const challan_id=newchallan.rows[0].challan_id;
   
 
       for(const [index,productitem] of productdetail.entries()){
         const{productName,hsnCode,gstRate,gstCalculate,unitPrice,quantity,total,discount_amount,discount_amountPer,taxable_amount}=productitem;
 
            const calculatedGst=perTaxAmount[index];  
            const sgst=calculatedGst/2;
            const cgst=calculatedGst/2;
           
     const newinvoice_item = await pool.query(`
       INSERT INTO challan_item (challan_id, productname, hsncode, gstrate, gstcalculate, unitprice, quantity, total, discount_amount, discount_amount_per ,calculatedgst,cgst,sgst,taxableamount, userid)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
    [challan_id,productName,hsnCode,gstRate,gstCalculate,unitPrice,quantity,total,discount_amount,discount_amountPer,calculatedGst,cgst,sgst,taxable_amount,userid]);
       }
     res.status(201).json({ success: true, message: "challan added successfully"});
 
 }
  catch (error) {
     console.error(error);
     res.status(500).json({ success: false, message: "Server error" });
 }
};

// Get all challans
exports.getAllChallans = async (req, res) => {
  const userid=req.userId;
  try {
    const result = await pool.query("SELECT * FROM challan where userid=$1 order by update_at desc",[userid]);
    if(result.rowCount===0){
      return res.status(404).json({success:false,message:"Challan not available"});
    }
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching challans:", error);
    res.status(500).json({ success: false, message: "server error to fetch challans" });
  }
};

//get challan by CustomerNumber and Challanids
exports.getChallanbyCustomerNumberandChallanids = async (req,res)=>{
    const customerNumber = req.params.customerNumber;
    const challan_ids = req.params.challan_ids;
    const userid=req.userId;
  
    if (!customerNumber || !challan_ids || !userid) {
        return res.json({ success: false, message: "required fields" });
    }
    const challanIdArray = challan_ids.split(',').map(id => id.trim());
    try {
        const results = [];
        for (const challanId of challanIdArray) {
            const query = `
                SELECT 
                    c.*,
                    ch.*,
                    ci.*
                FROM 
                    public.customers c
                LEFT JOIN 
                    public.challan ch ON c.customer_id = ch.customer_id
                LEFT JOIN 
                    public.challan_item ci ON ch.challan_id = ci.challan_id
                WHERE 
                    c.mobile_no = $1
                    AND ch.challan_id = $2
                    and ch.userid=$3
            `;
  
            const result = await pool.query(query, [customerNumber, challanId,userid]);
  
            if (result.rowCount > 0) {
                results.push(result.rows);
            }
        }
        if (results.length === 0) {
            return res.status(401).json({ success: false, message: "result not available" });
        }
     
        res.json(results); 
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "server Error" });
    }
};
// // Get challan details by ID
exports.getChallanDetails = async (req, res) => {
  const { id } = req.params;
  const userid=req.userId;
  try {
    const result = await pool.query("SELECT * FROM challan_item WHERE challan_id = $1 and userid=$2", [id,userid]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Challan not found" });
    }
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching challan details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateChallan = async (req, res) => {
  const {
    challanId,
    challanDate,
    challanDueDate,
    challanPrefix,
    paymentTerms,
    sgstAmount,
    cgstAmount,
    taxableAmount,
    totalAmount,
    customerId,
    customerName,
    billing_address,
    shipping_address,
    challanNotes,
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
  
 const business_name=businessprofile[0].business_name;
 const mobile_no=businessprofile[0].mobile_no;
 const pan_no =businessprofile[0].pan_no;
 const gst=businessprofile[0].gst;
 const logo =businessprofile[0].logo;

  try {
    const existingChallan = await pool.query('SELECT challan_id FROM challan WHERE challan_id = $1 AND userid = $2', [challanId, userid]);
    if (existingChallan.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Challan not found' });
    }
    const updatedChallan = await pool.query(
      ` UPDATE challan
        SET
          customername = $1,
          shippingaddress = $2,
          billingaddress = $3,
          accountnumber = $4,
          ifsccode = $5,
          bankbranch = $6,
          accountholder = $7,
          challan_prefix = $8,
          sales_challan_date = $9,
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
        WHERE challan_id = $24 AND userid = $25
        RETURNING challan_id
      `,
      [
        customerName,
        shipping_address,
        billing_address,
        accountNumber,
        ifscCode,
        bankBranch,
        accountHolder,
        challanPrefix,
        challanDate,
        paymentTerms,
        challanDueDate,
        totalAmount,
        taxableAmount,
        cgstAmount,
        sgstAmount,
        challanNotes,
        business_name,
        mobile_no,
        pan_no,
        gst,
        logo,
        signature_box,
        customerId,
        challanId,
        userid,
      ]
    );

    if (updatedChallan.rows.length > 0) {
      const updated_challan_id = updatedChallan.rows[0].challan_id;

      await pool.query('DELETE FROM challan_item WHERE challan_id = $1 AND userid = $2', [updated_challan_id, userid]);

      for (const [index, productitem] of productData.entries()) {
        console.log(productitem);
        const { id,productName, hsnCode, gstRate, unitPrice, quantity, total, discount_amount, discount_amountPer,taxable_amount,gstCalculate} = productitem;
        const calculatedGst = taxAmount[index];
        const sgst = calculatedGst / 2;
        const cgst = calculatedGst / 2;

        await pool.query(
          `
            INSERT INTO challan_item (challan_id, productname, hsncode, gstrate, unitprice, quantity, total, discount_amount, discount_amount_per ,calculatedgst,cgst,sgst, taxableamount ,userid)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
          `,
          [updated_challan_id, productName, hsnCode, gstRate, unitPrice, quantity, total, discount_amount, discount_amountPer, calculatedGst, cgst, sgst,taxable_amount, userid]
        );
      }

      res.status(201).json({ success: true, message: 'Challan updated successfully', challan_id: updated_challan_id });
    } else {
      res.status(500).json({ success: false, message: 'Failed to update challan' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete a challan
exports.deleteChallan = async (req, res) => {
  const { id } = req.params;
  const userid=req.userId;

  try {
    await pool.query("DELETE FROM challan_item WHERE challan_id = $1 AND userid=$2", [id,userid]);
    const result = await pool.query("DELETE FROM challan WHERE challan_id = $1 AND userid=$2", [id,userid]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Challan not found" });
    }

    res.json({ success: true, message: "Challan deleted successfully" });
  } catch (error) {
    console.error("Error deleting challan:", error);
    res.status(500).json({ success: false, message: "Failed to delete challan" });
  }
};