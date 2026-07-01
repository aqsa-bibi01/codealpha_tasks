const mongoose=require('mongoose'),bcrypt=require('bcryptjs');
const s=new mongoose.Schema({
  name:{type:String,required:true},
  username:{type:String,required:true,unique:true},
  email:{type:String,required:true,unique:true},
  password:{type:String,required:true},
  bio:{type:String,default:''},
  avatar:{type:String,default:''},
  followers:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
  following:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}]
},{timestamps:true});
s.pre('save',async function(n){if(!this.isModified('password'))return n();this.password=await bcrypt.hash(this.password,10);n();});
s.methods.matchPassword=function(p){return bcrypt.compare(p,this.password);};
module.exports=mongoose.model('User',s);
