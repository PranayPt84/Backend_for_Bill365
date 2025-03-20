const pool = require("../config/db");

// Get All Customers
exports.getAllCustomers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM customers");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch customers" });
  }
};

// Add a Customer
exports.addCustomer = async (req, res) => {
  const {
    email, company_name, first_name, last_name, phone, mobile, address1, address2, city, state, zip_code, country, tax_id, fax, currency, language, is_active, billing_address1, billing_address2, billing_city, billing_state, billing_zip, billing_country
  } = req.body;

  if (!email || !company_name || !first_name || !last_name || !phone) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO customers (email, company_name, first_name, last_name, phone, mobile_no, address1, address2, city, state, zip_code, country, tax_id, fax, currency, language, is_active, billing_address1, billing_address2, billing_city, billing_state, billing_zip, billing_country) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) RETURNING customer_id`,
      [email, company_name, first_name, last_name, phone, mobile, address1, address2, city, state, zip_code, country, tax_id, fax, currency, language, is_active, billing_address1, billing_address2, billing_city, billing_state, billing_zip, billing_country]
    );

    res.status(201).json({ success: true, message: "Customer added successfully", id: result.rows[0].customer_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to add customer" });
  }
};

// // Update a Customer
// exports.updateCustomer = async (req, res) => {
//   const { id } = req.params;
//   const { company_name, first_name, last_name, email, phone } = req.body;

//   try {
//     const result = await pool.query(
//       "UPDATE customers SET company_name = $1, first_name = $2, last_name = $3, email = $4, phone = $5 WHERE customer_id = $6 RETURNING *",
//       [company_name, first_name, last_name, email, phone, id]
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({ success: false, message: "Customer not found" });
//     }

//     res.json({ success: true, message: "Customer updated successfully", customer: result.rows[0] });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Failed to update customer" });
//   }
// };

// // Delete a Customer
// exports.deleteCustomer = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const result = await pool.query("DELETE FROM customers WHERE customer_id = $1", [id]);
//     if (result.rowCount === 0) {
//       return res.status(404).json({ success: false, message: "Customer not found" });
//     }

//     res.json({ success: true, message: "Customer deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Failed to delete customer" });
//   }
// };

// Get Customer Details for Invoice
exports.getCustomerDetailsForInvoice = async (req, res) => {
  const customerNumber = req.params.customerNumber;

  if (!customerNumber) {
    return res.status(400).json({ success: false, message: "Field required" });
  }

  try {
    const customerDetails = await pool.query(`SELECT * FROM customers WHERE mobile_no = $1`, [customerNumber]);
    if (customerDetails.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Customer not available" });
    }
    res.json(customerDetails.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error for customer" });
  }
};