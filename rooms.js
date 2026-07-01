const router=require('express').Router(),Room=require('../models/Room'),{protect}=require('../middleware/auth');
const genCode=()=>Math.random().toString(36).substring(2,8).toUpperCase();
router.post('/',protect,async(req,res)=>{
  const roomCode=genCode();
  const room=await Room.create({name:req.body.name||'My Room',roomCode,host:req.user._id});
  res.status(201).json(room);
});
router.get('/:code',async(req,res)=>{
  const room=await Room.findOne({roomCode:req.params.code.toUpperCase()});
  if(!room)return res.status(404).json({message:'Room not found'});
  res.json(room);
});
module.exports=router;
