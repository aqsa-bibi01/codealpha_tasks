const express=require('express'),mongoose=require('mongoose'),cors=require('cors');
require('dotenv').config();
const app=express();
app.use(cors());app.use(express.json());
mongoose.connect(process.env.MONGO_URI).then(()=>console.log('MongoDB connected')).catch(console.error);
app.use('/api/auth',require('./routes/auth'));
app.use('/api/posts',require('./routes/posts'));
app.use('/api/users',require('./routes/users'));
app.listen(process.env.PORT,()=>console.log('Social API on port '+process.env.PORT));
