const pool = require("../config/db");

// Create a new challan
exports.createChallan = async (req, res) => {
  const {
    challandate,
    customerNumber,
    billing_address,
    shipping_address,
    references,
    subTotal,
    totalAmount,
    challanNotes,
    signature_box,
    productdetail
  } = req.body;
 
   const userid=req.userId;
  const tax_amount = totalAmount - subTotal;

  try {
    const newChallan = await pool.query(`
      INSERT INTO challan (
        challan_date, customer_id, mob_number, billing_address, shipping_address, reference, sub_total, total_amount, tax_amount, challannotes, signature_box ,userid
      ) VALUES (
        $1, (SELECT customer_id FROM customers WHERE mobile_no =$2), $2, $3, $4, $5, $6, $7, $8, $9, $10,$11
      ) RETURNING challan_id`,
      [challandate, customerNumber, billing_address, shipping_address, references, subTotal, totalAmount, tax_amount, challanNotes, signature_box,userid]
    );

    const challan_id = newChallan.rows[0].challan_id;

    for (const item of productdetail) {
      const { productName, hsnCode, gstRate, unitPrice, quantity, total } = item;

    const newchallanitem=await pool.query(`
        INSERT INTO challan_item (challan_id, product_id, product_name, product_hsn_code, unit_price, tax_rate, quantity, total_price ,userid)
        VALUES (
          $1, (SELECT product_id FROM products WHERE product_hsn_code =$2 LIMIT 1), $3, $2, $4, $5, $6, $7,$8
        )`,
        [challan_id, hsnCode, productName, unitPrice, gstRate, quantity, total , userid]
      );
    }

    res.status(201).json({ success: true, message: "Challan added successfully" });
  } catch (error) {
    console.error("Error creating challan:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all challans
exports.getAllChallans = async (req, res) => {
  const userid=req.userId;
  try {
    const result = await pool.query("SELECT * FROM challan where userid=$1",[userid]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching challans:", error);
    res.status(500).json({ success: false, message: "Failed to fetch challans" });
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
// exports.getChallanDetails = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const result = await pool.query("SELECT * FROM challan WHERE challan_id = $1", [id]);
//     if (result.rowCount === 0) {
//       return res.status(404).json({ success: false, message: "Challan not found" });
//     }
//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error("Error fetching challan details:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

exports.updateChallan = async (req, res) => {
  
  const {challanDate, customerNumber, billing_address, shipping_address, references, subTotal, totalAmount, challanNotes, signature_box, challan_id ,productdetail} = req.body;
  const userid=req.userId;
  if(!challanDate|| !customerNumber || !billing_address || !shipping_address || !references || !subTotal || !totalAmount || !challanNotes || !signature_box || !productdetail || !challan_id|| !userid ){
   
    return res.status(401).json({success:false ,message:"required all fields"});
  }
    const tax_amount = totalAmount - subTotal;
  try {
    const result = await pool.query(`UPDATE challan
      SET 
          challan_date = $1,
          customer_id=(SELECT customer_id FROM customers WHERE mobile_no =$2 and userid=$11),
          mob_number = $2,
          billing_address = $3,
          shipping_address = $4,
          reference = $5,
          sub_total = $6,
          total_amount = $7,
          tax_amount = $8,
          challannotes = $9,
          signature_box = $10
      WHERE challan_id = $12 and userid =$11
      RETURNING challan_id`,
      [challanDate, customerNumber, billing_address, shipping_address, references, subTotal, totalAmount, tax_amount, challanNotes, signature_box, userid, challan_id]
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


// // Delete a challan
// exports.deleteChallan = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const result = await pool.query("DELETE FROM challan WHERE challan_id = $1", [id]);
//     if (result.rowCount === 0) {
//       return res.status(404).json({ success: false, message: "Challan not found" });
//     }

//     res.json({ success: true, message: "Challan deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting challan:", error);
//     res.status(500).json({ success: false, message: "Failed to delete challan" });
//   }
// };