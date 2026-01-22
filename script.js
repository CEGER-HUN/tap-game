let gameState = {
    score: 0,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    clickPower: 1,
    autoClicker: 0,
    boosterActive: false,
    clickCount: 0,
    lastDaily: null,
    tasks: [
        { id: 1, description: "100 Tıklama", target: 100, reward: 50, completed: false },
        { id: 2, description: "1000 Puan", target: 1000, reward: 200, completed: false }
    ]
};

const scoreEl = document.getElementById('score');
const xpFill = document.getElementById('xp-fill');
const xpText = document.getElementById('xp-text');
const levelText = document.getElementById('level-text');
const coin = document.getElementById('main-coin');
const gameMain = document.getElementById('game-main');

window.onload = () => {
    loadGame();
    updateUI();
    setInterval(runAutoClickers, 1000);
};

coin.addEventListener('click', (e) => {
    let gain = gameState.clickPower;
    if (gameState.boosterActive) gain *= 2;
    
    gameState.score += gain;
    gameState.xp += Math.ceil(gain / 2);
    gameState.clickCount++;

    if (gameState.xp >= gameState.xpToNextLevel) {
        gameState.level++;
        gameState.xp = 0;
        gameState.xpToNextLevel *= 2;
        alert("Level Atladın!");
    }

    // Puan efektini tam tıklanan yerde çıkar
    const rect = gameMain.getBoundingClientRect();
    createFloatingText(e.clientX - rect.left, e.clientY - rect.top, `+${gain}`);
    
    checkTasks();
    saveGame();
    updateUI();
});

function runAutoClickers() {
    if (gameState.autoClicker > 0) {
        gameState.score += gameState.autoClicker;
        updateUI();
    }
}

function updateUI() {
    scoreEl.innerText = Math.floor(gameState.score);
    levelText.innerText = `Level ${gameState.level}`;
    xpText.innerText = `${gameState.xp} / ${gameState.xpToNextLevel} XP`;
    xpFill.style.width = `${(gameState.xp / gameState.xpToNextLevel) * 100}%`;
    
    document.getElementById('buy-click').innerText = 50 * gameState.clickPower;
    document.getElementById('buy-auto').innerText = 100 * (gameState.autoClicker + 1);
}

function createFloatingText(x, y, text) {
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.innerText = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    gameMain.appendChild(el);
    setTimeout(() => el.remove(), 600);
}

function showTab(type) {
    document.getElementById(type + '-modal').style.display = 'block';
    if(type === 'tasks') renderTasks();
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

function buyClickPower() {
    let cost = 50 * gameState.clickPower;
    if (gameState.score >= cost) {
        gameState.score -= cost;
        gameState.clickPower++;
        updateUI();
    }
}

function buyAutoClicker() {
    let cost = 100 * (gameState.autoClicker + 1);
    if (gameState.score >= cost) {
        gameState.score -= cost;
        gameState.autoClicker++;
        updateUI();
    }
}

function buyBooster() {
    if (gameState.score >= 500 && !gameState.boosterActive) {
        gameState.score -= 500;
        gameState.boosterActive = true;
        setTimeout(() => { gameState.boosterActive = false; }, 30000);
    }
}

function claimDailyBonus() {
    const today = new Date().toDateString();
    if (gameState.lastDaily !== today) {
        gameState.score += 200;
        gameState.lastDaily = today;
        alert("200 Bonus Coin Alındı!");
        updateUI();
    }
}

function checkTasks() {
    gameState.tasks.forEach(t => {
        if(!t.completed && ((t.id === 1 && gameState.clickCount >= t.target) || (t.id === 2 && gameState.score >= t.target))) {
            t.completed = true;
            gameState.score += t.reward;
            alert("Görev Tamamlandı!");
        }
    });
}

function renderTasks() {
    const list = document.getElementById('task-list');
    list.innerHTML = gameState.tasks.map(t => `
        <div class="item" style="opacity: ${t.completed ? 0.5 : 1}">
            <span>${t.description}</span>
            <b>${t.reward} Coin</b>
        </div>
    `).join('');
}

function saveGame() { localStorage.setItem('tapGameSave', JSON.stringify(gameState)); }
function loadGame() {
    const saved = localStorage.getItem('tapGameSave');
    if (saved) gameState = JSON.parse(saved);
}
