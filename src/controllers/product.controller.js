const pool = require("../config/db");

// Get All Products
exports.getAllProducts = async (req, res) => {
  const userid=req.userId;
  try {
    const result = await pool.query("SELECT * FROM products where userid=$1",[userid]);
    if(result.rowCount===0){
     return res.status(401).json({success:false ,message:"Product not available"});
    };
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
    hsn_sac_code,
    product_description,
    product_type,
    product_image,
    product_unit,
    product_category,
    selling_price,
    purchase_price,
    gst_rate,
    generate_barcode,
    custom_field
  
  } = req.body;
  console.log(req.session.userId);
  console.log(req.body);

 const userid=req.userId;

  if (!product_name || !product_category|| !hsn_sac_code || !product_type || !product_description || product_image ||!product_unit || !product_category || !selling_price || !purchase_price || !gst_rate || !generate_barcode || !custom_field ||!userid) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO products (product_name, product_hsn_code, product_description, product_type,product_image,product_unit,category,selling_price,purchase_price,gst_rate,generate_barcode,custom_field,userid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,$10,$11,$12,$13 ) RETURNING product_id",
      [product_name, hsn_sac_code, product_description, product_type,product_image,product_unit,product_category,selling_price,purchase_price,gst_rate,generate_barcode,custom_field ,userid]
    );

    res.status(201).json({ success: true, message: "Product added successfully", product: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to add product" });
  }
};

// Update a Product
exports.updateProduct = async (req, res) => {
  
  const {
    product_name,
    product_hsn_code,
    product_description,
    product_type,
    product_img,
    product_unit,
    product_category,
    selling_price,
    purchase_price,
    gst_rate,
    generate_barcode,
    custom_field,
    product_id,
  } = req.body;
  const userid=req.userId;
  console.log(userid);
  console.log(req.body);
  if (!product_name || !product_hsn_code || !product_type || !product_description ||!product_unit || !product_category || !selling_price || !purchase_price || !gst_rate || !generate_barcode || !custom_field ||!userid) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }
  try {
    const result = await pool.query(
      `UPDATE products
       SET product_name = $1,
           product_hsn_code = $2,
           product_description = $3,
           product_type = $4,
           product_image = $5,
           product_unit = $6,
           category = $7,
           selling_price = $8,
           purchase_price = $9,
           gst_rate = $10,
           generate_barcode = $11,
           custom_field = $12,
           updated_at = CURRENT_TIMESTAMP
       WHERE product_id = $13 AND userid = $14
       RETURNING product_id`,
      [product_name,product_hsn_code,product_description,product_type,product_img, product_unit,product_category, selling_price,  purchase_price,  gst_rate, generate_barcode,  custom_field,  product_id,  userid ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product updated successfully", product: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update product" });
  }
};

// Delete a Product
exports.deleteProduct = async (req, res) => {
  const { product_id } = req.params;
  const userid=req.userId;

  if (!product_id || !userid) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }
  try {
    const result = await pool.query("DELETE FROM products WHERE product_id = $1 and userid=$2" , [product_id ,userid]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete product" });
  }
};

// Get Product Details by Name
exports.getProductNameForinvoice=async(req,res)=>{
  try{
    const userid=req.userId;
    const productName= await pool.query("select product_name from products where userid=$1",[userid]);
    if(productName.rowCount===0){
     console.log('No Products available');
    }
    res.json(productName.rows);
   }
   catch(error){
     console.log(error);
     res.status(502).json({success:false,message:"server error for product"})
   }
};

exports.getProductDetailsByName = async (req, res) => {
  const { productName } = req.params;
 const userid=req.userId;
  if (!productName || !userid) {
    return res.status(400).json({ success: false, message: "Field required" });
  }

  try {
    const productDetails = await pool.query("SELECT * FROM products WHERE product_name = $1 and userid=$2", [productName,userid]);
    if (productDetails.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Product not available" });
    }
    res.json(productDetails.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error for product" });
  }
};