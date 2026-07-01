const router=require('express').Router(),jwt=require('jsonwebtoken'),User=require('../models/User');
const sign=id=>jwt.sign({id},process.env.JWT_SECRET,{expiresIn:'7d'});
router.post('/register',async(req,res)=>{
  try{
    const{name,username,email,password}=req.body;
    if(await User.findOne({email}))return res.status(400).json({message:'Email exists'});
    if(await User.findOne({username}))return res.status(400).json({message:'Username taken'});
    const u=await User.create({name,username,email,password});
    res.status(201).json({token:sign(u._id),user:{id:u._id,name,username,email}});
  }catch(e){res.status(500).json({message:e.message});}
});
router.post('/login',async(req,res)=>{
  try{
    const{email,password}=req.body;
    const u=await User.findOne({email});
    if(!u||!(await u.matchPassword(password)))return res.status(401).json({message:'Invalid credentials'});
    res.json({token:sign(u._id),user:{id:u._id,name:u.name,username:u.username,email}});
  }catch(e){res.status(500).json({message:e.message});}
});
module.exports=router;
