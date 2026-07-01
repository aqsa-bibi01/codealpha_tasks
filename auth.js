const router=require('express').Router(),jwt=require('jsonwebtoken'),User=require('../models/User');
const sign=id=>jwt.sign({id},process.env.JWT_SECRET,{expiresIn:'7d'});
router.post('/register',async(req,res)=>{
  try{
    const{name,email,password}=req.body;
    if(await User.findOne({email}))return res.status(400).json({message:'Email exists'});
    const u=await User.create({name,email,password});
    res.status(201).json({token:sign(u._id),user:{id:u._id,name,email}});
  }catch(e){res.status(500).json({message:e.message});}
});
router.post('/login',async(req,res)=>{
  try{
    const{email,password}=req.body;
    const u=await User.findOne({email});
    if(!u||!(await u.matchPassword(password)))return res.status(401).json({message:'Invalid credentials'});
    res.json({token:sign(u._id),user:{id:u._id,name:u.name,email}});
  }catch(e){res.status(500).json({message:e.message});}
});
module.exports=router;
