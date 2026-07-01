const mongoose=require('mongoose'),bcrypt=require('bcryptjs');
const s=new mongoose.Schema({
  name:{type:String,required:true},
  email:{type:String,required:true,unique:true},
  password:{type:String,required:true}
},{timestamps:true});
s.pre('save',async function(n){if(!this.isModified('password'))return n();this.password=await bcrypt.hash(this.password,10);n();});
s.methods.matchPassword=function(p){return bcrypt.compare(p,this.password);};
module.exports=mongoose.model('User',s);
