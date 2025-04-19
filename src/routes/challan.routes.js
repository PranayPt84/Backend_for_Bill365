const express = require("express");
const router = express.Router();
const challanController = require("../controllers/challan.controller");
const authenticateToken = require("../middlewares/auth.middleware"); 

router.post("/", authenticateToken, challanController.createChallan);
router.get("/", authenticateToken, challanController.getAllChallans);
router.get("/provide/:customerNumber/:challan_ids" , authenticateToken , challanController.getChallanbyCustomerNumberandChallanids);
router.get("/:id", authenticateToken, challanController.getChallanDetails);
router.put("/", authenticateToken, challanController.updateChallan);
router.delete("/:id", authenticateToken, challanController.deleteChallan);

module.exports = router;