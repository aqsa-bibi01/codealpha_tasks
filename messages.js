const router=require('express').Router(),multer=require('multer'),path=require('path'),fs=require('fs');
const{protect}=require('../middleware/auth');
const uploadDir=path.join(__dirname,'uploads');
if(!fs.existsSync(uploadDir))fs.mkdirSync(uploadDir);
const storage=multer.diskStorage({
  destination:(req,file,cb)=>cb(null,uploadDir),
  filename:(req,file,cb)=>cb(null,Date.now()+'-'+file.originalname)
});
const upload=multer({storage,limits:{fileSize:10*1024*1024}});
router.post('/upload',protect,upload.single('file'),(req,res)=>{
  if(!req.file)return res.status(400).json({message:'No file'});
  res.json({url:'http://localhost:5003/uploads/'+req.file.filename,name:req.file.originalname,size:req.file.size});
});
module.exports=router;
