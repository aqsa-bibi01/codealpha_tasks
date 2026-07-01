const mongoose=require('mongoose');
const s=new mongoose.Schema({
  name:{type:String,required:true},
  description:{type:String,default:''},
  owner:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
  members:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
  color:{type:String,default:'#4f46e5'}
},{timestamps:true});
module.exports=mongoose.model('Project',s);
