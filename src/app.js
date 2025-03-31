const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const invoiceRoutes = require("./routes/invoice.routes");
const challanRouter =require("./routes/challan.routes");
const quotationRouter=require("./routes/quotation.routes");
const businessprofile=require("./routes/businessprofile.routes");

const app = express();

app.use(bodyParser.json());
app.use(session({
  secret: 'mySecrateKey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));
app.use(cors({
  origin: ["http://localhost:5003"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/challan",challanRouter);
app.use("/api/quotation",quotationRouter);
app.use("/api/businessprofile",businessprofile);
module.exports = app;