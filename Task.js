const mongoose=require('mongoose');
const s=new mongoose.Schema({
  title:{type:String,required:true},
  description:{type:String,default:''},
  project:{type:mongoose.Schema.Types.ObjectId,ref:'Project',required:true},
  assignee:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  status:{type:String,enum:['todo','in-progress','review','done'],default:'todo'},
  priority:{type:String,enum:['low','medium','high'],default:'medium'},
  dueDate:{type:Date},
  comments:[{user:{type:mongoose.Schema.Types.ObjectId,ref:'User'},text:String,createdAt:{type:Date,default:Date.now}}]
},{timestamps:true});
module.exports=mongoose.model('Task',s);
