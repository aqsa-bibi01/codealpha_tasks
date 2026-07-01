const API='http://localhost:5001/api';
let token=localStorage.getItem('t2_token');
let user=JSON.parse(localStorage.getItem('t2_user')||'null');

function showPage(p){
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
  document.getElementById('page-'+p).classList.add('active');
  const auth=document.getElementById('navAuth');
  const guest=document.getElementById('navGuest');
  if(token){auth.style.display='flex';guest.style.display='none';document.getElementById('composeBox').style.display='block';}
  else{auth.style.display='none';guest.style.display='flex';}
  if(p==='feed')loadFeed();
  if(p==='profile')loadProfile();
  if(p==='feed')loadSuggested();
}

async function register(){
  const name=document.getElementById('regName').value;
  const username=document.getElementById('regUsername').value;
  const email=document.getElementById('regEmail').value;
  const password=document.getElementById('regPass').value;
  const res=await fetch(API+'/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,username,email,password})});
  const d=await res.json();
  if(res.ok){token=d.token;user=d.user;localStorage.setItem('t2_token',token);localStorage.setItem('t2_user',JSON.stringify(user));showPage('feed');}
  else document.getElementById('regMsg').textContent=d.message;
}

async function login(){
  const email=document.getElementById('loginEmail').value;
  const password=document.getElementById('loginPass').value;
  const res=await fetch(API+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
  const d=await res.json();
  if(res.ok){token=d.token;user=d.user;localStorage.setItem('t2_token',token);localStorage.setItem('t2_user',JSON.stringify(user));showPage('feed');}
  else document.getElementById('loginMsg').textContent=d.message;
}

function logout(){token=null;user=null;localStorage.removeItem('t2_token');localStorage.removeItem('t2_user');showPage('login');}

function hd(name){return name?name[0].toUpperCase():'?';}

async function loadFeed(){
  const res=await fetch(API+'/posts',{headers:token?{'Authorization':'Bearer '+token}:{}});
  const posts=await res.json();
  document.getElementById('feedPosts').innerHTML=posts.map(p=>`
    <div class="post-card">
      <div class="post-header">
        <div class="avatar">${hd(p.user?.name)}</div>
        <div><strong>${p.user?.name||'Unknown'}</strong><br><small style="color:#888">@${p.user?.username||''} · ${new Date(p.createdAt).toLocaleDateString()}</small></div>
      </div>
      <p>${p.content}</p>
      <div class="post-actions">
        <button onclick="likePost('${p._id}',this)" class="${user&&p.likes.includes(user.id)?'liked':''}">
          👍 ${p.likes.length} Like${p.likes.length!==1?'s':''}
        </button>
        <button onclick="toggleComments('${p._id}')">💬 ${p.comments.length} Comment${p.comments.length!==1?'s':''}</button>
      </div>
      <div class="comments-section" id="comments-${p._id}" style="display:none">
        <div id="commentList-${p._id}">${p.comments.map(c=>`
          <div class="comment"><div class="avatar" style="width:30px;height:30px;font-size:.8rem">${hd(c.user?.name)}</div>
          <div class="comment-bubble"><strong>${c.user?.name||'?'}</strong>: ${c.text}</div></div>`).join('')}
        </div>
        ${token?`<div class="add-comment"><input id="ci-${p._id}" placeholder="Write a comment..."/>
          <button onclick="addComment('${p._id}')">Post</button></div>`:''}
      </div>
    </div>`).join('');
}

function toggleComments(id){const el=document.getElementById('comments-'+id);el.style.display=el.style.display==='none'?'block':'none';}

async function likePost(id,btn){
  if(!token){alert('Login first');return;}
  const res=await fetch(API+'/posts/'+id+'/like',{method:'PUT',headers:{'Authorization':'Bearer '+token}});
  const p=await res.json();
  btn.textContent='👍 '+p.likes.length+' Like'+(p.likes.length!==1?'s':'');
  btn.classList.toggle('liked',p.likes.includes(user.id));
}

async function addComment(postId){
  const input=document.getElementById('ci-'+postId);
  const text=input.value.trim();
  if(!text)return;
  const res=await fetch(API+'/posts/'+postId+'/comment',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({text})});
  const p=await res.json();
  const list=document.getElementById('commentList-'+postId);
  const c=p.comments[p.comments.length-1];
  list.innerHTML+=`<div class="comment"><div class="avatar" style="width:30px;height:30px;font-size:.8rem">${hd(user.name)}</div><div class="comment-bubble"><strong>${user.name}</strong>: ${c.text}</div></div>`;
  input.value='';
}

async function createPost(){
  const content=document.getElementById('postContent').value.trim();
  if(!content)return;
  await fetch(API+'/posts',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({content})});
  document.getElementById('postContent').value='';
  loadFeed();
}

async function loadSuggested(){
  if(!token)return;
  const res=await fetch(API+'/users',{headers:{'Authorization':'Bearer '+token}});
  const users=await res.json();
  document.getElementById('suggestedUsers').innerHTML=users.filter(u=>u._id!==user?.id).slice(0,5).map(u=>`
    <div class="user-suggest">
      <span>${u.name} <small style="color:#888">@${u.username}</small></span>
      <button class="follow-btn" onclick="follow('${u._id}',this)">Follow</button>
    </div>`).join('');
}

async function follow(targetId,btn){
  await fetch(API+'/users/'+targetId+'/follow',{method:'PUT',headers:{'Authorization':'Bearer '+token}});
  btn.textContent=btn.textContent==='Follow'?'Unfollow':'Follow';
}

async function loadProfile(){
  if(!token||!user)return;
  const res=await fetch(API+'/users/me',{headers:{'Authorization':'Bearer '+token}});
  const u=await res.json();
  const postsRes=await fetch(API+'/posts/user/'+user.id);
  const posts=await postsRes.json();
  document.getElementById('profileContent').innerHTML=`
    <div class="profile-header">
      <div class="profile-avatar">${hd(u.name)}</div>
      <h2>${u.name}</h2><p style="color:#888">@${u.username}</p>
      <p style="color:#888">${u.bio||'No bio yet'}</p>
      <div style="display:flex;gap:20px;justify-content:center;margin-top:15px">
        <div><strong>${u.followers?.length||0}</strong><br><small>Followers</small></div>
        <div><strong>${u.following?.length||0}</strong><br><small>Following</small></div>
        <div><strong>${posts.length}</strong><br><small>Posts</small></div>
      </div>
    </div>
    <div>${posts.map(p=>`<div class="post-card"><p>${p.content}</p><small style="color:#888">${new Date(p.createdAt).toLocaleDateString()}</small></div>`).join('')}</div>`;
}

showPage(token?'feed':'login');
