const jwt=require('jsonwebtoken'),User=require('../models/User');
exports.protect=async(req,res,next)=>{
  const h=req.headers.authorization;
  if(!h)return res.status(401).json({message:'Not authorized'});
  try{const d=jwt.verify(h.split(' ')[1],process.env.JWT_SECRET);req.user=await User.findById(d.id).select('-password');next();}
  catch{res.status(401).json({message:'Invalid token'});}
};
