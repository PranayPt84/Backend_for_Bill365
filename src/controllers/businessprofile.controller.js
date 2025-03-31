const pool=require("../config/db");
exports.getbusinessprofile=async(req,res)=>{
    const userid=req.userId;
    try{
        const result=await pool.query(`select * from business_profile where userid=$1`,[userid]);
        res.json(result.rowCount);
       }
       catch(error){
         console.error("error fetching on business_profile get :",error)
         res.status(503).json({success:false,message:"fail to get business_profile"});
       }
       
};
exports.createbusinessprofile=async(req,res)=>{
    const{
        name,phone,email,pan,gst,businesType,businessCategory,openingValue,billingAddress,shippingAddress,city,state,zipCode,notes,birthdate,anniversary,personalNotes
        }=req.body;
        const userid=req.userId;
          try{
              if(!name||!phone||!email||!pan||!gst||!businesType||!businessCategory||!openingValue||!billingAddress||!shippingAddress||!city||!state||!zipCode||!notes||!birthdate||!anniversary||!personalNotes||!userid){
                return res.status(201).json({success:false,message:"require all feilds"});
              }
        const result= await pool.query(`insert into business_profile (name ,mobile_no ,email ,pan_no ,gst ,businesstype ,businesscategory, opening_value, billingaddress, shippingaddress, city, state, zipcode ,notes ,birthdate ,anniversary ,personalnotes ,userid ) values ($1 , $2 , $3 , $4 , $5 , $6 , $7 , $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,$18)`,
            [name,phone,email,pan,gst,businesType,businessCategory,openingValue,billingAddress,shippingAddress,city,state,zipCode,notes,birthdate,anniversary,personalNotes,userid]);
         res.status(202).json({success:true,message:"successfully business_profile added"});
        }
        catch(error){
          console.error("Error fatching business_profile :",error);
          res.status(500).json({ success: false, message: "Failed to business_profile" });
        }
        
};