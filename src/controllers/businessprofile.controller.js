const pool=require("../config/db");
exports.getbusinessprofile=async(req,res)=>{
    const userid=req.userId;
    try{
        const result=await pool.query(`select * from business_profile where userid=$1`,[userid]);
        res.status(200).json(result.rowCount);
       }
       catch(error){
         console.error("error fetching on business_profile get :",error)
         res.status(500).json({success:false,message:"fail to get business_profile"});
       }
       
};
exports.createbusinessprofile=async(req,res)=>{
    const{
        name,businessName,phone,email,pan,gst,businessType,businessCategory,openingValue,address,notes,birthdate,anniversary,personalNotes,logo,signature
        }=req.body;
        const userid=req.userId;
          try{
        const result= await pool.query(`insert into business_profile (name ,business_name ,mobile_no ,business_profile_email ,pan_no ,gst ,businesstype ,businesscategory, opening_value,address,notes ,birthdate ,anniversary ,personalnotes, logo,signature_box,userid )
                                       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
            [name,businessName,phone,email,pan,gst,businessType,businessCategory,openingValue,address,notes,birthdate,anniversary,personalNotes,logo,signature,userid]);
         res.status(201).json({success:true,message:"successfully business_profile added"});
        }
        catch(error){
          console.error("Error fatching business_profile :",error);
          res.status(500).json({ success: false, message: "Failed to business_profile" });
        }
        
};
