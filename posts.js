const router=require('express').Router(),Post=require('../models/Post'),{protect}=require('../middleware/auth');
router.get('/',async(req,res)=>{
  res.json(await Post.find().populate('user','name username').populate('comments.user','name username').sort({createdAt:-1}));
});
router.get('/user/:id',async(req,res)=>{
  res.json(await Post.find({user:req.params.id}).populate('user','name username').sort({createdAt:-1}));
});
router.post('/',protect,async(req,res)=>{
  const p=await Post.create({user:req.user._id,content:req.body.content});
  res.status(201).json(await p.populate('user','name username'));
});
router.put('/:id/like',protect,async(req,res)=>{
  const p=await Post.findById(req.params.id);
  const i=p.likes.indexOf(req.user._id);
  if(i>-1)p.likes.splice(i,1);else p.likes.push(req.user._id);
  await p.save();res.json(p);
});
router.post('/:id/comment',protect,async(req,res)=>{
  const p=await Post.findById(req.params.id);
  p.comments.push({user:req.user._id,text:req.body.text});
  await p.save();
  res.json(await p.populate('comments.user','name username'));
});
router.delete('/:id',protect,async(req,res)=>{
  const p=await Post.findById(req.params.id);
  if(p.user.toString()!==req.user._id.toString())return res.status(403).json({message:'Not authorized'});
  await p.deleteOne();res.json({message:'Deleted'});
});
module.exports=router;
