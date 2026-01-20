// Simple frontend-only P2E mining demo (stores everything in localStorage)
// Data model (stored under 'minedash_users'):
// users = { username: { characterName, inventory: {gold,iron,coal}, season_points, mining_job: {start, duration, claimed, id}, last_mine_at } }

const STORAGE_KEY = 'minedash_users_v1';
const DEFAULT_MINING_SECONDS = 3 * 3600; // 3 hours
const DEMO_SECONDS = 10; // demo/test mode

// DOM
const usernameInput = document.getElementById('username');
const charInput = document.getElementById('charname');
const btnRegister = document.getElementById('btn-register');
const mainSection = document.getElementById('main');
const authSection = document.getElementById('auth');
const displayCharacter = document.getElementById('display-character');
const displaySeasonPoints = document.getElementById('display-season-points');
const btnStartMine = document.getElementById('btn-start-mine');
const btnClaim = document.getElementById('btn-claim');
const miningStatus = document.getElementById('mining-status');
const miningDurationText = document.getElementById('mining-duration-text');
const demoModeCheckbox = document.getElementById('demo-mode');
const inventoryList = document.getElementById('inventory-list');
const logDiv = document.getElementById('log');
const leaderboardOl = document.getElementById('leaderboard');
const btnResetAccount = document.getElementById('btn-reset-account');
const btnResetAll = document.getElementById('btn-reset-all');

let currentUser = null;
let users = loadUsers();

function loadUsers(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  }catch(e){
    return {};
  }
}
function saveUsers(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function ensureUserExists(username, charname){
  if(!users[username]){
    users[username] = {
      characterName: charname || username,
      inventory: {gold:0,iron:0,coal:0},
      season_points: 0,
      mining_job: null,
      last_mine_at: null
    };
    saveUsers();
  }
}

btnRegister.addEventListener('click', () => {
  const username = (usernameInput.value || '').trim();
  const charname = (charInput.value || '').trim();
  if(!username){
    alert('Please enter a username');
    return;
  }
  ensureUserExists(username, charname);
  currentUser = username;
  usernameInput.value = '';
  charInput.value = '';
  showMain();
  log(`${currentUser} logged in`);
  updateUI();
});

function showMain(){
  authSection.classList.add('hidden');
  mainSection.classList.remove('hidden');
}

function showAuth(){
  authSection.classList.remove('hidden');
  mainSection.classList.add('hidden');
}

btnStartMine.addEventListener('click', () => {
  if(!currentUser) return alert('No user');
  let user = users[currentUser];
  if(user.mining_job && !user.mining_job.claimed){
    alert('You are already mining!');
    return;
  }
  const isDemo = demoModeCheckbox.checked;
  const duration = isDemo ? DEMO_SECONDS : DEFAULT_MINING_SECONDS;
  const job = {
    id: 'job_' + Date.now(),
    start: Date.now(),
    duration: duration * 1000,
    claimed: false
  };
  user.mining_job = job;
  saveUsers();
  log(`Started mining for ${formatDuration(duration)}.`);
  updateUI();
});

btnClaim.addEventListener('click', () => {
  if(!currentUser) return;
  let user = users[currentUser];
  if(!user.mining_job){
    alert('No active mining job.');
    return;
  }
  if(user.mining_job.claimed){
    alert('Already claimed.');
    return;
  }
  const now = Date.now();
  const end = user.mining_job.start + user.mining_job.duration;
  if(now < end){
    const remaining = Math.ceil((end - now)/1000);
    alert(`Mining not finished. Time left: ${formatDuration(remaining)}`);
    return;
  }
  // Calculate rewards (server-side normally!)
  const rewards = calculateRewards();
  user.inventory.gold += rewards.gold;
  user.inventory.iron += rewards.iron;
  user.inventory.coal += rewards.coal;
  const basePoints = 5;
  const points = basePoints + (rewards.rare ? 20 : 0);
  user.season_points += points;
  user.mining_job.claimed = true;
  user.last_mine_at = Date.now();
  saveUsers();
  log(`Claimed mining result: +${rewards.gold} gold, +${rewards.iron} iron, +${rewards.coal} coal. Points +${points}${rewards.rare ? ' (rare drop!)' : ''}`);
  updateUI();
});

btnResetAccount.addEventListener('click', () => {
  if(!currentUser) return;
  if(!confirm('Reset this account data locally?')) return;
  delete users[currentUser];
  saveUsers();
  currentUser = null;
  showAuth();
});

btnResetAll.addEventListener('click', () => {
  if(!confirm('Reset ALL local demo data?')) return;
  users = {};
  saveUsers();
  currentUser = null;
  showAuth();
  log('All data reset');
});

function calculateRewards(){
  // Base and multipliers (simple example)
  const baseGold = 10;
  const baseIron = 5;
  const baseCoal = 8;
  const gold = Math.round(baseGold * rand(0.8,1.5));
  const iron = Math.round(baseIron * rand(0.8,1.4));
  const coal = Math.round(baseCoal * rand(0.9,1.3));
  const rare = Math.random() < 0.05; // 5% rare
  return {
    gold: rare ? gold + 50 : gold,
    iron,
    coal,
    rare
  };
}

function rand(a,b){ return a + Math.random()*(b-a); }

function updateUI(){
  if(!currentUser) return;
  users = loadUsers(); // refresh
  const user = users[currentUser];
  displayCharacter.textContent = `${currentUser} — ${user.characterName}`;
  displaySeasonPoints.textContent = `Season points: ${user.season_points}`;
  miningDurationText.textContent = demoModeCheckbox.checked ? '10 sec (demo)' : '3 hours';
  // inventory
  inventoryList.innerHTML = `
    <li>Gold: ${user.inventory.gold}</li>
    <li>Iron: ${user.inventory.iron}</li>
    <li>Coal: ${user.inventory.coal}</li>
  `;
  // mining status
  if(user.mining_job && !user.mining_job.claimed){
    const now = Date.now();
    const end = user.mining_job.start + user.mining_job.duration;
    const remainingSec = Math.max(0, Math.ceil((end - now)/1000));
    miningStatus.textContent = `Mining... time left: ${formatDuration(remainingSec)}`;
    btnStartMine.disabled = true;
    btnClaim.disabled = false;
  } else {
    miningStatus.textContent = 'Not mining';
    btnStartMine.disabled = false;
    btnClaim.disabled = true;
  }
  renderLeaderboard();
}

function renderLeaderboard(){
  // local leaderboard based on season_points
  const arr = Object.keys(users).map(u => ({username:u, points: users[u].season_points}));
  arr.sort((a,b) => b.points - a.points);
  leaderboardOl.innerHTML = '';
  if(arr.length === 0){
    leaderboardOl.innerHTML = '<li>No players yet</li>';
    return;
  }
  arr.forEach(p=>{
    const li = document.createElement('li');
    li.textContent = `${p.username} — ${p.points} pts`;
    leaderboardOl.appendChild(li);
  });
}

function log(text){
  const p = document.createElement('div');
  p.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
  logDiv.prepend(p);
}

// helper
function formatDuration(sec){
  if(sec >= 3600){
    const h = Math.floor(sec/3600);
    const m = Math.floor((sec%3600)/60);
    return `${h}h ${m}m`;
  }else if(sec >= 60){
    const m = Math.floor(sec/60);
    const s = sec%60;
    return `${m}m ${s}s`;
  }else{
    return `${sec}s`;
  }
}

// ticker
setInterval(() => {
  if(currentUser){
    updateUI();
  }
}, 1000);

// init: if only one user stored, auto-login (nice UX)
(function init(){
  users = loadUsers();
  const keys = Object.keys(users);
  if(keys.length === 1){
    currentUser = keys[0];
    showMain();
    log(`${currentUser} auto-logged (local)`);
    updateUI();
  }
})();
