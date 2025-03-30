const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const axios = require("axios");
const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const invoiceRoutes = require("./routes/invoice.routes");
const challanRouter =require("./routes/challan.routes");
const quotationRouter=require("./routes/quotation.routes");

const app = express();

app.use(bodyParser.json());
app.use(session({
  secret: 'mySecrateKey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));
app.use(cors({
  origin: ["http://localhost:5173","https://adityapatidar704.github.io"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.get("/api/pincode/:code", async (req, res) => {
  try {
    const response = await axios.get(`https://api.postalpincode.in/pincode/${req.params.code}`);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching pincode data:", error);
    res.status(500).json({ message: "Error fetching data", error: error.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/challan",challanRouter);
app.use("/api/quotation",quotationRouter);
module.exports = app;