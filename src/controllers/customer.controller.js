const pool = require("../config/db");

// Get All Customers
exports.getAllCustomers = async (req, res) => {
  try {
    const userid=req.userId;  
 
    const result = await pool.query("SELECT * FROM customers where userid=$1 ",[userid]);
    if(result.rowCount===0){
      return res.status(401).json({success:false ,message:"customer not avilable"});
    };
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch customers" });
  }
};

// Add a Customer
exports.addCustomer = async (req, res) => {
  const {
    email,customer_name,customer_category, pan_no, mobile_no, customer_type, shipping_address, city, state, zip_code, country, tax_id, is_active, opening_value, party , notes ,birth_date , anniversary_date , personal_notes ,billing_address ,company_name,custom_field
  } = req.body;

  const userid=req.userId;
   
   if(!email || !customer_name || !customer_category || !pan_no || !mobile_no || !customer_type || !shipping_address || !city || !state || !zip_code || !country || !tax_id || !is_active || !opening_value || !party || !notes || !birth_date || !anniversary_date || !personal_notes || !billing_address || !company_name ||!custom_field||!userid ){
    return res.status(403).json({success:false , message:"required all feilds"});
   }
  try {
    const result = await pool.query(
      `INSERT INTO customers (email,customer_name,customer_category, pan_number, mobile_no, customer_type, shipping_address, city, state, zip_code, country, tax_id, is_active, opening_value, party , notes , date_of_birth , anniversary_date, personal_notes, billing_address ,company_name,custom_fields, userid) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,$21,$22,$23) RETURNING customer_id`,
      [email,customer_name,customer_category, pan_no, mobile_no, customer_type, shipping_address, city, state, zip_code, country, tax_id, is_active, opening_value, party , notes , birth_date , anniversary_date , personal_notes, billing_address ,company_name,custom_field,userid]
    );

    res.status(201).json({ success: true, message: "Customer added successfully", id: result.rows[0].customer_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to add customer" });
  }
};


// Update a Customer
exports.updateCustomer = async (req, res) => {
  const {
   email, customer_name, customer_category, pan_no, mobile_no, customer_type, shipping_address, city,  state,zip_code, country, tax_id, is_active, opening_value, party, notes, birth_date, anniversary_date,personal_notes,billing_address ,company_name ,customer_id,custom_field
  } = req.body;

  const userid=req.userId;
  
if(!email || !customer_name || !customer_category || !mobile_no || !customer_type || !shipping_address || !city || !state || !zip_code || !country || !tax_id  || !opening_value || !party || !notes || !birth_date || !anniversary_date || !personal_notes || !billing_address || !company_name || !customer_id || !custom_field ||!userid){
  return res.status(403).json({success:false ,message:"required all feilds"});
}
  try {
    const result = await pool.query(
      `UPDATE customers
       SET email = $1,
           customer_name = $2,
           customer_category = $3,
           pan_number = $4,
           mobile_no = $5,
           customer_type = $6,
           shipping_address = $7,
           city = $8,
           state = $9,
           zip_code = $10,
           country = $11,
           tax_id = $12,
           is_active = $13,
           opening_value = $14,
           party = $15,
           notes = $16,
           date_of_birth = $17,
           anniversary_date = $18,
           personal_notes = $19,
           billing_address = $20,
           company_name =$21,
           custom_fields=$22,
           update_at = CURRENT_TIMESTAMP
       WHERE customer_id =$23  and userid=$24`,
      [email, customer_name, customer_category, pan_no, mobile_no, customer_type, shipping_address, city, state, zip_code, country, tax_id, is_active, opening_value, party, notes, birth_date, anniversary_date, personal_notes, billing_address,company_name,custom_field,customer_id, userid]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    res.status(200).json({ success: true, message: "Customer updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update customer" });
  }
};

// Delete a Customer
exports.deleteCustomer = async (req, res) => {
  const { customer_id } = req.params;
  const userid=req.userId;

  try {
    const result = await pool.query("DELETE FROM customers WHERE customer_id=$1 and userid=$2" , [customer_id,userid]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    res.json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete customer" });
  }
};

// Get Customer Details for Invoice
exports.getCustomerDetailsForInvoice = async (req, res) => {
  const customerNumber = req.params.customerNumber;
  const userid=req.userId;
  
  if (!customerNumber) {
    return res.status(400).json({ success: false, message: "Field required" }); 
  }

  try {
    const customerDetails = await pool.query(`SELECT * FROM customers WHERE mobile_no = $1 and userid=$2`, [customerNumber ,userid]);
    if (customerDetails.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Customer not available" });
    }
    res.json(customerDetails.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error for customer" });
  }
};