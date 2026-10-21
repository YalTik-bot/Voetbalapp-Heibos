
let players = JSON.parse(localStorage.getItem('heibos-players'));

if (!players) {
    players = [
        { id: 1, name: 'Keeper 1', type: 'keeper', minutes: 0, goals: 0 },
        { id: 2, name: 'Keeper 2', type: 'keeper', minutes: 0, goals: 0 }
    ];
    for (let i = 1; i <= 12; i++) {
        players.push({ id: i + 2, name: 'Speler ' + i, type: 'player', minutes: 0, goals: 0 });
    }
}

let timerInterval;
let timeLeft = 80 * 60; // 80 minutes starting at 80:00 and counting down
let totalElapsedSeconds = 0;
let isRunning = false;

// Store who is on which field/position
// structure: { fieldId: { positionDataPos: playerId } }
let lineups = JSON.parse(localStorage.getItem('heibos-lineups')) || {
    1: {}, 2: {}, 3: {}, 4: {}
};

const bankElement = document.getElementById('reserve-bank');
const statsBody = document.getElementById('stats-body');
const goalList = document.getElementById('goal-list');

function saveAll() {
    localStorage.setItem('heibos-players', JSON.stringify(players));
    localStorage.setItem('heibos-lineups', JSON.stringify(lineups));
}

function renderBank() {
    bankElement.innerHTML = '';
    players.forEach(p => {
        const token = document.createElement('div');
        token.className = `player-token ${p.type === 'keeper' ? 'keeper' : ''}`;
        token.draggable = true;
        token.dataset.id = p.id;
        
        token.innerHTML = `
            <div class="jersey"></div>
            <div class="shorts"></div>
            <input class="player-name-input" value="${p.name}" data-id="${p.id}">
        `;
        
        token.querySelector('input').addEventListener('change', (e) => {
            const player = players.find(pl => pl.id == e.target.dataset.id);
            player.name = e.target.value;
            saveAll();
            renderStats();
            renderLineups();
        });

        token.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', p.id);
        });

        bankElement.appendChild(token);
    });
}

function renderStats() {
    statsBody.innerHTML = '';
    players.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${p.name}</td>
            <td>${p.minutes}</td>
            <td><button class="goal-btn" onclick="addGoal(${p.id})">Scoor!</button></td>
        `;
        statsBody.appendChild(row);
    });
}

window.addGoal = function(id) {
    const player = players.find(p => p.id == id);
    player.goals++;
    const li = document.createElement('li');
    li.textContent = `${player.name} heeft gescoord! (Totaal: ${player.goals})`;
    goalList.appendChild(li);
    saveAll();
};

function renderLineups() {
    for (let fId = 1; fId <= 4; fId++) {
        const fieldEl = document.getElementById(`field-${fId}`);
        fieldEl.querySelectorAll('.position').forEach(pos => {
            const posKey = pos.dataset.pos;
            const pId = lineups[fId][posKey];
            pos.innerHTML = '';
            if (pId) {
                const player = players.find(p => p.id == pId);
                if (player) {
                    const clone = document.createElement('div');
                    clone.className = `player-token ${player.type === 'keeper' ? 'keeper' : ''}`;
                    clone.innerHTML = `
                        <div class="jersey"></div>
                        <div class="shorts"></div>
                        <div style="font-size: 8px; color: black; font-weight: bold; background: rgba(255,255,255,0.7); border-radius: 3px; padding: 1px;">${player.name}</div>
                    `;
                    pos.appendChild(clone);
                }
            }
        });
    }
}

// Drag and Drop for fields
document.querySelectorAll('.position').forEach(pos => {
    pos.addEventListener('dragover', e => e.preventDefault());
    pos.addEventListener('drop', e => {
        e.preventDefault();
        const pId = e.dataTransfer.getData('text/plain');
        const fieldId = pos.closest('.field-container').dataset.segment;
        const posKey = pos.dataset.pos;
        
        // Update lineups
        lineups[fieldId][posKey] = parseInt(pId);
        saveAll();
        renderLineups();
    });
    
    // Clear position on double click
    pos.addEventListener('dblclick', () => {
        const fieldId = pos.closest('.field-container').dataset.segment;
        const posKey = pos.dataset.pos;
        delete lineups[fieldId][posKey];
        saveAll();
        renderLineups();
    });
});

// Timer logic
function updateTimerDisplay() {
    // 80:00 counting down
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    document.getElementById('display-time').textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

document.getElementById('start-btn').addEventListener('click', () => {
    if (isRunning) return;
    isRunning = true;
    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            totalElapsedSeconds++;
            updateTimerDisplay();
            
            // Every 60 seconds (1 minute), increment minutes for active players
            if (totalElapsedSeconds % 60 === 0) {
                // Determine current segment:
                // 0-20 min (80-60 left) -> Field 1
                // 20-40 min (60-40 left) -> Field 2
                // 40-60 min (40-20 left) -> Field 3
                // 60-80 min (20-0 left) -> Field 4
                
                let currentField;
                const elapsedMins = totalElapsedSeconds / 60;
                if (elapsedMins <= 20) currentField = 1;
                else if (elapsedMins <= 40) currentField = 2;
                else if (elapsedMins <= 60) currentField = 3;
                else if (elapsedMins <= 80) currentField = 4;
                
                if (currentField) {
                    const activePIds = Object.values(lineups[currentField]);
                    activePIds.forEach(pId => {
                        const player = players.find(p => p.id == pId);
                        if (player) player.minutes++;
                    });
                    saveAll();
                    renderStats();
                }
            }
        } else {
            clearInterval(timerInterval);
            isRunning = false;
        }
    }, 1000);
});

document.getElementById('pause-btn').addEventListener('click', () => {
    clearInterval(timerInterval);
    isRunning = false;
});

document.getElementById('reset-btn').addEventListener('click', () => {
    if(confirm("Weet je zeker dat je de tijd en minuten wilt resetten?")) {
        clearInterval(timerInterval);
        isRunning = false;
        timeLeft = 80 * 60;
        totalElapsedSeconds = 0;
        players.forEach(p => p.minutes = 0);
        updateTimerDisplay();
        renderStats();
        saveAll();
    }
});

document.getElementById('print-btn').addEventListener('click', () => {
    window.print();
});

renderBank();
renderStats();
renderLineups();
updateTimerDisplay();
