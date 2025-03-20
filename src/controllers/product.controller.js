const pool = require("../config/db");

// Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
};

// Add a Product
exports.addProduct = async (req, res) => {
  const {
    product_name,
    product_code,
    hsn_sac_code,
    product_description,
    product_type,
    unit_price,
    tax_rate,
    currency
  } = req.body;

  if (!product_name || !product_code || !unit_price) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO products (product_name, product_code, product_hsn_code, product_description, product_type, unit_price, tax_rate, currency) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [product_name, product_code, hsn_sac_code, product_description, product_type, unit_price, tax_rate, currency]
    );

    res.status(201).json({ success: true, message: "Product added successfully", product: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to add product" });
  }
};

// // Update a Product
// exports.updateProduct = async (req, res) => {
//   const { id } = req.params;
//   const {
//     product_name,
//     product_code,
//     hsn_sac_code,
//     product_description,
//     product_type,
//     unit_price,
//     tax_rate,
//     currency
//   } = req.body;

//   try {
//     const result = await pool.query(
//       `UPDATE products SET 
//        product_name = $1, product_code = $2, hsn_sac_code = $3, product_description = $4, 
//        product_type = $5, unit_price = $6, tax_rate = $7, currency = $8 
//        WHERE product_id = $9 RETURNING *`,
//       [product_name, product_code, hsn_sac_code, product_description, product_type, unit_price, tax_rate, currency, id]
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({ success: false, message: "Product not found" });
//     }

//     res.json({ success: true, message: "Product updated successfully", product: result.rows[0] });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Failed to update product" });
//   }
// };

// // Delete a Product
// exports.deleteProduct = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const result = await pool.query("DELETE FROM products WHERE product_id = $1", [id]);
//     if (result.rowCount === 0) {
//       return res.status(404).json({ success: false, message: "Product not found" });
//     }

//     res.json({ success: true, message: "Product deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Failed to delete product" });
//   }
// };

// Get Product Details by Name
exports.getProductDetailsByName = async (req, res) => {
  const { productName } = req.params;

  if (!productName) {
    return res.status(400).json({ success: false, message: "Field required" });
  }

  try {
    const productDetails = await pool.query("SELECT * FROM products WHERE product_name = $1", [productName]);
    if (productDetails.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Product not available" });
    }
    res.json(productDetails.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error for product" });
  }
};