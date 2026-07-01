const API='http://localhost:5002/api';
let token=localStorage.getItem('t3_token');
let user=JSON.parse(localStorage.getItem('t3_user')||'null');
let currentProject=null;
let socket=null;

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
  if(res.ok){setAuth(d);initApp();}else document.getElementById('regMsg').textContent=d.message;
}
async function login(){
  const email=document.getElementById('loginEmail').value,password=document.getElementById('loginPass').value;
  const res=await fetch(API+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
  const d=await res.json();
  if(res.ok){setAuth(d);initApp();}else document.getElementById('loginMsg').textContent=d.message;
}
function setAuth(d){token=d.token;user=d.user;localStorage.setItem('t3_token',token);localStorage.setItem('t3_user',JSON.stringify(user));}
function logout(){token=null;user=null;localStorage.removeItem('t3_token');localStorage.removeItem('t3_user');location.reload();}

function initApp(){
  document.getElementById('page-auth').classList.remove('active');
  document.getElementById('page-dashboard').classList.add('active');
  document.getElementById('navUser').innerHTML=`<span style="color:white;margin-right:15px">${user.name}</span><button onclick="logout()">Logout</button>`;
  socket=io('http://localhost:5002');
  socket.on('task-updated',()=>{if(currentProject)loadBoard(currentProject);});
  socket.on('comment-added',()=>{if(currentProject)loadBoard(currentProject);});
  loadProjects();
}

async function loadProjects(){
  const res=await fetch(API+'/projects',{headers:{'Authorization':'Bearer '+token}});
  const projects=await res.json();
  document.getElementById('projectList').innerHTML=projects.map(p=>`
    <div class="project-item ${currentProject===p._id?'active':''}" onclick="selectProject('${p._id}','${p.name}')">
      <div class="project-dot" style="background:${p.color||'#4f46e5'}"></div>
      <span>${p.name}</span>
    </div>`).join('');
}

function selectProject(id,name){
  currentProject=id;
  if(socket)socket.emit('join-project',id);
  loadBoard(id,name);
  loadProjects();
}

async function loadBoard(projectId){
  const [projRes,tasksRes]=await Promise.all([
    fetch(API+'/projects/'+projectId,{headers:{'Authorization':'Bearer '+token}}),
    fetch(API+'/tasks/project/'+projectId,{headers:{'Authorization':'Bearer '+token}})
  ]);
  const project=await projRes.json();
  const tasks=await tasksRes.json();
  const statuses=[{key:'todo',label:'To Do'},{key:'in-progress',label:'In Progress'},{key:'review',label:'Review'},{key:'done',label:'Done'}];
  document.getElementById('boardArea').innerHTML=`
    <div class="board-header">
      <h2>${project.name}</h2>
      <div>
        <span style="color:#94a3b8;margin-right:15px">${project.members?.length||0} members</span>
        <button onclick="showAddMemberModal('${projectId}')" style="padding:7px 14px;background:#4f46e5;color:white;border:none;border-radius:6px;cursor:pointer">+ Member</button>
      </div>
    </div>
    <div class="kanban">
      ${statuses.map(s=>`
        <div class="column">
          <div class="column-title">${s.label} <span style="color:#94a3b8">(${tasks.filter(t=>t.status===s.key).length})</span></div>
          ${tasks.filter(t=>t.status===s.key).map(t=>`
            <div class="task-card ${t.priority}" onclick="showTaskDetail('${t._id}')">
              <div class="task-title">${t.title}</div>
              <div class="task-meta">
                <span>${t.assignee?.name||'Unassigned'}</span>
                <span class="priority-badge priority-${t.priority}">${t.priority}</span>
              </div>
              ${t.dueDate?`<div style="font-size:.75rem;color:#94a3b8;margin-top:5px">Due: ${new Date(t.dueDate).toLocaleDateString()}</div>`:''}
            </div>`).join('')}
          <button class="add-task-btn" onclick="showNewTaskModal('${projectId}','${s.key}')">+ Add Task</button>
        </div>`).join('')}
    </div>`;
}

function showNewProjectModal(){
  document.getElementById('modalTitle').textContent='New Project';
  document.getElementById('modalBody').innerHTML=`
    <input id="projName" placeholder="Project name"/>
    <input id="projDesc" placeholder="Description (optional)"/>
    <input id="projColor" type="color" value="#4f46e5" style="height:40px"/>
    <button onclick="createProject()">Create Project</button>`;
  document.getElementById('modal').style.display='flex';
}

async function createProject(){
  const name=document.getElementById('projName').value;
  const description=document.getElementById('projDesc').value;
  const color=document.getElementById('projColor').value;
  await fetch(API+'/projects',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({name,description,color})});
  closeModal();loadProjects();
}

function showNewTaskModal(projectId,status){
  document.getElementById('modalTitle').textContent='New Task';
  document.getElementById('modalBody').innerHTML=`
    <input id="taskTitle" placeholder="Task title"/>
    <textarea id="taskDesc" placeholder="Description" rows="3"></textarea>
    <select id="taskPriority"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option></select>
    <input id="taskDue" type="date" placeholder="Due date"/>
    <button onclick="createTask('${projectId}','${status}')">Create Task</button>`;
  document.getElementById('modal').style.display='flex';
}

async function createTask(projectId,status){
  const title=document.getElementById('taskTitle').value;
  const description=document.getElementById('taskDesc').value;
  const priority=document.getElementById('taskPriority').value;
  const dueDate=document.getElementById('taskDue').value;
  await fetch(API+'/tasks',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({title,description,priority,status,project:projectId,dueDate:dueDate||undefined})});
  closeModal();
  if(socket)socket.emit('task-update',{projectId});
  loadBoard(projectId);
}

async function showTaskDetail(taskId){
  const res=await fetch(API+'/tasks/project/'+currentProject,{headers:{'Authorization':'Bearer '+token}});
  const tasks=await res.json();
  const t=tasks.find(x=>x._id===taskId);
  if(!t)return;
  document.getElementById('modalTitle').textContent='Task Details';
  document.getElementById('modalBody').innerHTML=`
    <div class="task-detail">
      <strong>${t.title}</strong>
      <p style="color:#64748b;margin:8px 0">${t.description||'No description'}</p>
      <select onchange="updateTaskStatus('${t._id}',this.value)">
        <option value="todo" ${t.status==='todo'?'selected':''}>To Do</option>
        <option value="in-progress" ${t.status==='in-progress'?'selected':''}>In Progress</option>
        <option value="review" ${t.status==='review'?'selected':''}>Review</option>
        <option value="done" ${t.status==='done'?'selected':''}>Done</option>
      </select>
      <div class="comments-pm">
        ${t.comments.map(c=>`<div class="comment-pm"><strong>${c.user?.name||'?'}</strong>: ${c.text}</div>`).join('')}
      </div>
      <input id="newComment" placeholder="Add a comment..."/>
      <button onclick="addComment('${t._id}')">Add Comment</button>
    </div>`;
  document.getElementById('modal').style.display='flex';
}

async function updateTaskStatus(taskId,status){
  await fetch(API+'/tasks/'+taskId,{method:'PUT',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({status})});
  if(socket)socket.emit('task-update',{projectId:currentProject});
  closeModal();loadBoard(currentProject);
}

async function addComment(taskId){
  const text=document.getElementById('newComment').value;
  if(!text)return;
  await fetch(API+'/tasks/'+taskId+'/comment',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({text})});
  if(socket)socket.emit('new-comment',{projectId:currentProject});
  showTaskDetail(taskId);
}

function showAddMemberModal(projectId){
  document.getElementById('modalTitle').textContent='Add Member';
  document.getElementById('modalBody').innerHTML=`
    <input id="memberEmail" type="email" placeholder="Member's email"/>
    <button onclick="addMember('${projectId}')">Add Member</button>`;
  document.getElementById('modal').style.display='flex';
}

async function addMember(projectId){
  const email=document.getElementById('memberEmail').value;
  await fetch(API+'/projects/'+projectId+'/members',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({email})});
  closeModal();
}

function closeModal(){document.getElementById('modal').style.display='none';}

if(token&&user)initApp();
