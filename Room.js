const mongoose=require('mongoose');
const s=new mongoose.Schema({
  name:{type:String,required:true},
  roomCode:{type:String,required:true,unique:true},
  host:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
  isEncrypted:{type:Boolean,default:true}
},{timestamps:true});
module.exports=mongoose.model('Room',s);
