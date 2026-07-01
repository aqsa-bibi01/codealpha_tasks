const express=require('express'),mongoose=require('mongoose'),cors=require('cors'),http=require('http');
const{Server}=require('socket.io');
require('dotenv').config();
const app=express(),server=http.createServer(app);
const io=new Server(server,{cors:{origin:'*'}});
app.use(cors());app.use(express.json());
mongoose.connect(process.env.MONGO_URI).then(()=>console.log('MongoDB connected')).catch(console.error);
app.use('/api/auth',require('./routes/auth'));
app.use('/api/projects',require('./routes/projects'));
app.use('/api/tasks',require('./routes/tasks'));

io.on('connection',socket=>{
  console.log('User connected:',socket.id);
  socket.on('join-project',projectId=>socket.join(projectId));
  socket.on('task-update',data=>io.to(data.projectId).emit('task-updated',data));
  socket.on('new-comment',data=>io.to(data.projectId).emit('comment-added',data));
  socket.on('disconnect',()=>console.log('User disconnected'));
});

server.listen(process.env.PORT,()=>console.log('PM API on port '+process.env.PORT));
module.exports={io};
