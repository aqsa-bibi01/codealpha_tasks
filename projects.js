const router=require('express').Router(),Project=require('../models/Project'),User=require('../models/User'),{protect}=require('../middleware/auth');
router.get('/',protect,async(req,res)=>{
  res.json(await Project.find({$or:[{owner:req.user._id},{members:req.user._id}]}).populate('owner','name email').populate('members','name email'));
});
router.post('/',protect,async(req,res)=>{
  const p=await Project.create({...req.body,owner:req.user._id,members:[req.user._id]});
  res.status(201).json(p);
});
router.get('/:id',protect,async(req,res)=>{
  res.json(await Project.findById(req.params.id).populate('owner','name email').populate('members','name email'));
});
router.put('/:id',protect,async(req,res)=>{
  res.json(await Project.findByIdAndUpdate(req.params.id,req.body,{new:true}));
});
router.post('/:id/members',protect,async(req,res)=>{
  const{email}=req.body;
  const user=await User.findOne({email});
  if(!user)return res.status(404).json({message:'User not found'});
  await Project.findByIdAndUpdate(req.params.id,{$addToSet:{members:user._id}});
  res.json({message:'Member added'});
});
router.delete('/:id',protect,async(req,res)=>{
  await Project.findByIdAndDelete(req.params.id);res.json({message:'Deleted'});
});
module.exports=router;
