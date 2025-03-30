const pool=require("../config/db");

exports.createquotation=async(req , res)=>{
    const {
        quotationdate,
        customerNumber,
        billing_address,
        shipping_address,
        references,
        subTotal,
        totalAmount,
        quotationNotes,
        signature_box,
        productdetail
      } = req.body;
     
       const userid=req.userId;
      const tax_amount = totalAmount - subTotal;
      try {
        const newquotation = await pool.query(`
          INSERT INTO quotation (
            quotation_date, customer_id, mob_number, billing_address, shipping_address, reference, sub_total, total_amount, tax_amount, quotationnotes, signature_box ,userid
          ) VALUES (
            $1, (SELECT customer_id FROM customers WHERE mobile_no =$2), $2, $3, $4, $5, $6, $7, $8, $9, $10,$11
          ) RETURNING quotation_id`,
          [quotationdate, customerNumber, billing_address, shipping_address, references, subTotal, totalAmount, tax_amount, quotationNotes , signature_box,userid]
        );
    
        const quotation_id = newquotation.rows[0].quotation_id;
    
        for (const item of productdetail) {
          const { productName, hsnCode, gstRate, unitPrice, quantity, total } = item;
    
          await pool.query(`
            INSERT INTO quotation_item (quotation_id, product_id, product_name, product_hsn_code, unit_price, tax_rate, quantity, total_price ,userid)
            VALUES (
              $1, (SELECT product_id FROM products WHERE product_hsn_code =$2 LIMIT 1), $3, $2, $4, $5, $6, $7,$8
            )`,
            [quotation_id, hsnCode, productName, unitPrice, gstRate, quantity, total , userid]
          );
        }
    
        res.status(201).json({ success: true, message: "Quotation added successfully" });
      } catch (error) {
        console.error("Error creating Quotation:", error);
        res.status(500).json({ success: false, message: "Server error" });
      }
    };

    exports.getallquotation=async(req,res)=>{
        const userid=req.userId;
        try {
          const result = await pool.query("SELECT * FROM quotation where userid=$1",[userid]);
          res.json(result.rows);
        } catch (error) {
          console.error("Error fetching challans:", error);
          res.status(500).json({ success: false, message: "Failed to fetch challans" });
        }
      };
    