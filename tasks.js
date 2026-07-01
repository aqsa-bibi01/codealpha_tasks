const router=require('express').Router(),Task=require('../models/Task'),{protect}=require('../middleware/auth');
router.get('/project/:projectId',protect,async(req,res)=>{
  res.json(await Task.find({project:req.params.projectId}).populate('assignee','name email').populate('comments.user','name').sort({createdAt:-1}));
});
router.post('/',protect,async(req,res)=>{
  const t=await Task.create({...req.body});
  res.status(201).json(await t.populate('assignee','name email'));
});
router.put('/:id',protect,async(req,res)=>{
  res.json(await Task.findByIdAndUpdate(req.params.id,req.body,{new:true}).populate('assignee','name email'));
});
router.post('/:id/comment',protect,async(req,res)=>{
  const t=await Task.findById(req.params.id);
  t.comments.push({user:req.user._id,text:req.body.text});
  await t.save();
  res.json(await t.populate('comments.user','name'));
});
router.delete('/:id',protect,async(req,res)=>{
  await Task.findByIdAndDelete(req.params.id);res.json({message:'Deleted'});
});
module.exports=router;
