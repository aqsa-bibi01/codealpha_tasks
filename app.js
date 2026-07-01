const API='http://localhost:5003/api';
let token=localStorage.getItem('t4_token');
let user=JSON.parse(localStorage.getItem('t4_user')||'null');
let socket,localStream,roomId,peers={};
const peerConfig={iceServers:[{urls:'stun:stun.l.google.com:19302'}]};

function switchAuth(tab){
  document.getElementById('loginForm').style.display=tab==='login'?'block':'none';
  document.getElementById('registerForm').style.display=tab==='register'?'block':'none';
  document.getElementById('loginTab').className=tab==='login'?'active':'';
  document.getElementById('registerTab').className=tab==='register'?'active':'';
}
async function register(){
  const name=document.getElementById('regName').value,email=document.getElementById('regEmail').value,password=document.getElementById('regPass').value;
  const res=await fetch(API+'/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,password})});
  const d=await res.json();
  if(res.ok){setAuth(d);goLobby();}else document.getElementById('regMsg').textContent=d.message;
}
async function login(){
  const email=document.getElementById('loginEmail').value,password=document.getElementById('loginPass').value;
  const res=await fetch(API+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
  const d=await res.json();
  if(res.ok){setAuth(d);goLobby();}else document.getElementById('loginMsg').textContent=d.message;
}
function setAuth(d){token=d.token;user=d.user;localStorage.setItem('t4_token',token);localStorage.setItem('t4_user',JSON.stringify(user));}
function goLobby(){document.getElementById('page-auth').classList.remove('active');document.getElementById('page-lobby').classList.add('active');}

async function createRoom(){
  const res=await fetch(API+'/rooms',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({name:user.name+"'s Meeting"})});
  const room=await res.json();
  enterMeeting(room.roomCode);
}
async function joinRoom(){
  const code=document.getElementById('joinCode').value.trim().toUpperCase();
  if(!code)return;
  const res=await fetch(API+'/rooms/'+code);
  if(!res.ok){alert('Room not found');return;}
  enterMeeting(code);
}

async function enterMeeting(code){
  roomId=code;
  document.getElementById('page-lobby').classList.remove('active');
  document.getElementById('page-meeting').classList.add('active');
  document.getElementById('roomCodeDisplay').textContent=code;

  try{
    localStream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
  }catch(e){
    console.warn('No camera/mic access, joining audio/video-off');
    localStream=new MediaStream();
  }
  addVideoTile('local',user.name+' (You)',localStream);

  socket=io('http://localhost:5003');
  socket.emit('join-room',{roomId,userId:user.id,userName:user.name});

  socket.on('user-joined',async({userId,userName,socketId})=>{
    const pc=createPeerConnection(socketId,userName);
    localStream.getTracks().forEach(t=>pc.addTrack(t,localStream));
    const offer=await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('offer',{to:socketId,offer});
  });

  socket.on('offer',async({from,offer})=>{
    const pc=createPeerConnection(from,'Participant');
    localStream.getTracks().forEach(t=>pc.addTrack(t,localStream));
    await pc.setRemoteDescription(offer);
    const answer=await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit('answer',{to:from,answer});
  });
  socket.on('answer',async({from,answer})=>{
    if(peers[from])await peers[from].pc.setRemoteDescription(answer);
  });
  socket.on('ice-candidate',async({from,candidate})=>{
    if(peers[from])try{await peers[from].pc.addIceCandidate(candidate);}catch(e){}
  });
  socket.on('user-left',({socketId})=>{
    removeVideoTile(socketId);
    if(peers[socketId]){peers[socketId].pc.close();delete peers[socketId];}
  });
  socket.on('room-users',users=>{
    document.getElementById('peopleList').innerHTML=users.map(u=>`<div class="person-item">👤 ${u.userName}</div>`).join('')||'<div class="person-item">Just you</div>';
  });
  socket.on('chat-message',({userName,message,time})=>{
    const div=document.getElementById('chatMessages');
    div.innerHTML+=`<div class="chat-msg"><span class="sender">${userName}</span><br>${message}</div>`;
    div.scrollTop=div.scrollHeight;
  });
  socket.on('draw',data=>drawOnBoard(data,false));
  socket.on('clear-board',()=>{const c=document.getElementById('whiteboard');c.getContext('2d').clearRect(0,0,c.width,c.height);});
}

function createPeerConnection(socketId,userName){
  const pc=new RTCPeerConnection(peerConfig);
  pc.onicecandidate=e=>{if(e.candidate)socket.emit('ice-candidate',{to:socketId,candidate:e.candidate});};
  pc.ontrack=e=>addVideoTile(socketId,userName,e.streams[0]);
  peers[socketId]={pc,userName};
  return pc;
}

function addVideoTile(id,name,stream){
  let tile=document.getElementById('tile-'+id);
  if(!tile){
    tile=document.createElement('div');
    tile.className='video-tile';
    tile.id='tile-'+id;
    document.getElementById('videoGrid').appendChild(tile);
  }
  tile.innerHTML=`<video autoplay playsinline ${id==='local'?'muted':''}></video><div class="name-tag">${name}</div>`;
  tile.querySelector('video').srcObject=stream;
}
function removeVideoTile(id){const t=document.getElementById('tile-'+id);if(t)t.remove();}

function toggleMic(){
  const track=localStream.getAudioTracks()[0];
  if(track){track.enabled=!track.enabled;document.getElementById('micBtn').classList.toggle('muted',!track.enabled);}
}
function toggleCam(){
  const track=localStream.getVideoTracks()[0];
  if(track){track.enabled=!track.enabled;document.getElementById('camBtn').classList.toggle('muted',!track.enabled);}
}

async function toggleScreenShare(){
  try{
    const screenStream=await navigator.mediaDevices.getDisplayMedia({video:true});
    const screenTrack=screenStream.getVideoTracks()[0];
    Object.values(peers).forEach(({pc})=>{
      const sender=pc.getSenders().find(s=>s.track && s.track.kind==='video');
      if(sender)sender.replaceTrack(screenTrack);
    });
    socket.emit('screen-share-started',{roomId});
    document.getElementById('screenBtn').classList.add('active');
    screenTrack.onended=()=>{
      const camTrack=localStream.getVideoTracks()[0];
      Object.values(peers).forEach(({pc})=>{
        const sender=pc.getSenders().find(s=>s.track && s.track.kind==='video');
        if(sender&&camTrack)sender.replaceTrack(camTrack);
      });
      socket.emit('screen-share-stopped',{roomId});
      document.getElementById('screenBtn').classList.remove('active');
    };
  }catch(e){console.log('Screen share cancelled');}
}

function toggleWhiteboard(){
  const wb=document.getElementById('whiteboardContainer');
  const showing=wb.style.display!=='none';
  wb.style.display=showing?'none':'block';
  document.getElementById('wbBtn').classList.toggle('active',!showing);
  if(!showing)setupWhiteboard();
}
function setupWhiteboard(){
  const canvas=document.getElementById('whiteboard');
  canvas.width=canvas.offsetWidth;canvas.height=canvas.offsetHeight;
  const ctx=canvas.getContext('2d');
  let drawing=false,last={x:0,y:0};
  canvas.onmousedown=e=>{drawing=true;last={x:e.offsetX,y:e.offsetY};};
  canvas.onmousemove=e=>{
    if(!drawing)return;
    const data={x1:last.x,y1:last.y,x2:e.offsetX,y2:e.offsetY};
    drawOnBoard(data,true);
    last={x:e.offsetX,y:e.offsetY};
  };
  canvas.onmouseup=()=>drawing=false;
  canvas.onmouseleave=()=>drawing=false;
}
function drawOnBoard(data,emit){
  const ctx=document.getElementById('whiteboard').getContext('2d');
  ctx.strokeStyle='#1e293b';ctx.lineWidth=2;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(data.x1,data.y1);ctx.lineTo(data.x2,data.y2);ctx.stroke();
  if(emit)socket.emit('draw',{roomId,data});
}
function clearBoard(){
  const c=document.getElementById('whiteboard');
  c.getContext('2d').clearRect(0,0,c.width,c.height);
  socket.emit('clear-board',{roomId});
}

function togglePanel(){
  const p=document.getElementById('sidePanel');
  p.style.display=p.style.display==='none'?'flex':'none';
}
function switchPanel(name){
  ['chat','files','people'].forEach(p=>{
    document.getElementById('panel-'+p).style.display=p===name?'block':'none';
    document.getElementById(p+'Tab').className=p===name?'active':'';
  });
}
function sendChat(){
  const input=document.getElementById('chatInput');
  const message=input.value.trim();
  if(!message)return;
  socket.emit('chat-message',{roomId,message,userName:user.name});
  input.value='';
}
async function uploadFile(){
  const file=document.getElementById('fileInput').files[0];
  if(!file)return;
  const fd=new FormData();fd.append('file',file);
  const res=await fetch(API+'/messages/upload',{method:'POST',headers:{'Authorization':'Bearer '+token},body:fd});
  const d=await res.json();
  document.getElementById('filesList').innerHTML+=`<div class="file-item"><span>${d.name}</span><a href="${d.url}" target="_blank">Download</a></div>`;
}

function leaveMeeting(){
  if(localStream)localStream.getTracks().forEach(t=>t.stop());
  Object.values(peers).forEach(({pc})=>pc.close());
  peers={};
  if(socket)socket.disconnect();
  document.getElementById('videoGrid').innerHTML='';
  document.getElementById('chatMessages').innerHTML='';
  document.getElementById('page-meeting').classList.remove('active');
  document.getElementById('page-lobby').classList.add('active');
}

if(token&&user)goLobby();
