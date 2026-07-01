const express=require('express'),mongoose=require('mongoose'),cors=require('cors'),http=require('http'),path=require('path');
const{Server}=require('socket.io');
const jwt=require('jsonwebtoken');
require('dotenv').config();

const app=express(),server=http.createServer(app);
const io=new Server(server,{cors:{origin:'*',methods:['GET','POST']}});

app.use(cors());app.use(express.json());
app.use('/uploads',express.static(path.join(__dirname,'uploads')));

mongoose.connect(process.env.MONGO_URI).then(()=>console.log('MongoDB connected')).catch(console.error);

app.use('/api/auth',require('./routes/auth'));
app.use('/api/rooms',require('./routes/rooms'));
app.use('/api/messages',require('./routes/messages'));

// Track rooms and users
const rooms={};

io.on('connection',socket=>{
  console.log('Connected:',socket.id);

  socket.on('join-room',({roomId,userId,userName})=>{
    socket.join(roomId);
    if(!rooms[roomId])rooms[roomId]={users:[]};
    rooms[roomId].users.push({socketId:socket.id,userId,userName});
    socket.to(roomId).emit('user-joined',{userId,userName,socketId:socket.id});
    io.to(roomId).emit('room-users',rooms[roomId].users);
    socket.roomId=roomId;socket.userId=userId;
  });

  // WebRTC signaling
  socket.on('offer',({to,offer})=>io.to(to).emit('offer',{from:socket.id,offer}));
  socket.on('answer',({to,answer})=>io.to(to).emit('answer',{from:socket.id,answer}));
  socket.on('ice-candidate',({to,candidate})=>io.to(to).emit('ice-candidate',{from:socket.id,candidate}));

  // Chat
  socket.on('chat-message',({roomId,message,userName})=>{
    io.to(roomId).emit('chat-message',{userName,message,time:new Date().toISOString()});
  });

  // Whiteboard
  socket.on('draw',({roomId,data})=>socket.to(roomId).emit('draw',data));
  socket.on('clear-board',({roomId})=>io.to(roomId).emit('clear-board'));

  // Screen share
  socket.on('screen-share-started',({roomId})=>socket.to(roomId).emit('screen-share-started',{from:socket.id}));
  socket.on('screen-share-stopped',({roomId})=>socket.to(roomId).emit('screen-share-stopped',{from:socket.id}));

  socket.on('disconnect',()=>{
    const rId=socket.roomId;
    if(rId&&rooms[rId]){
      rooms[rId].users=rooms[rId].users.filter(u=>u.socketId!==socket.id);
      socket.to(rId).emit('user-left',{socketId:socket.id});
      io.to(rId).emit('room-users',rooms[rId].users);
    }
  });
});

server.listen(process.env.PORT,()=>console.log('RTC server on port '+process.env.PORT));
