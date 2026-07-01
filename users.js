const router=require('express').Router(),User=require('../models/User'),{protect}=require('../middleware/auth');
router.get('/',protect,async(req,res)=>res.json(await User.find().select('-password')));
router.get('/me',protect,async(req,res)=>res.json(await User.findById(req.user._id).select('-password')));
router.put('/:id/follow',protect,async(req,res)=>{
  const target=await User.findById(req.params.id);
  const me=await User.findById(req.user._id);
  const i=me.following.indexOf(req.params.id);
  if(i>-1){me.following.splice(i,1);target.followers.pull(req.user._id);}
  else{me.following.push(req.params.id);target.followers.push(req.user._id);}
  await me.save();await target.save();res.json({message:'Done'});
});
module.exports=router;
