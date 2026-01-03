// Stan gry
let gameState = {
    currentDate: new Date(2026, 2, 1), // 1 marca 2026
    budget: 500000,
    walletBalance: 0,
    swimmers: [],
    competitions: [],
    news: [],
    medalTable: {},
    results: []
};

// Inicjalizacja gry
function initGame() {
    // Inicjalizacja zawodników
    gameState.swimmers = SWIMMERS_DATABASE.map(swimmer => ({
        ...swimmer,
        status: "healthy",
        form: 80 + Math.random() * 15, // 80-95
        daysUntilRecovery: 0,
        currentPB: { ...swimmer.pb }
    }));

    // Inicjalizacja tabeli medali
    COUNTRIES.forEach(country => {
        gameState.medalTable[country.code] = {
            name: country.name,
            gold: 0,
            silver: 0,
            bronze: 0,
            points: 0
        };
    });

    // Portfel początkowy
    gameState.walletBalance = 0;

    // Generowanie zawodów
    generateCompetitions();

    // Dodanie początkowych wiadomości
    addNews("Witamy w symulatorze trenera polskiej kadry pływackiej! Powodzenia!");

    updateUI();
}

// Generowanie zawodów
function generateCompetitions() {
    const today = new Date(gameState.currentDate);
    
    // Puchar Świata (co 2-3 miesiące)
    for (let i = 1; i <= 4; i++) {
        const date = new Date(today.getFullYear(), today.getMonth() + i * 2.5, 15);
        const poolType = Math.random() > 0.5 ? 25 : 50;
        gameState.competitions.push({
            id: `wc${i}`,
            type: COMPETITION_TYPES[0],
            date: date,
            poolSize: poolType,
            name: `Puchar Świata ${date.toLocaleDateString('pl-PL')}`,
            status: 'upcoming',
            entries: {},
            results: null
        });
    }

    // Mistrzostwa Europy
    const euroDate = new Date(today.getFullYear(), today.getMonth() + 3, 10);
    gameState.competitions.push({
        id: 'euro2026',
        type: COMPETITION_TYPES[1],
        date: euroDate,
        poolSize: 50,
        name: `Mistrzostwa Europy ${euroDate.getFullYear()}`,
        status: 'upcoming',
        entries: {},
        results: null
    });

    // Mistrzostwa Świata
    const worldDate = new Date(today.getFullYear(), today.getMonth() + 7, 20);
    gameState.competitions.push({
        id: 'world2026',
        type: COMPETITION_TYPES[2],
        date: worldDate,
        poolSize: 25,
        name: `Mistrzostwa Świata ${worldDate.getFullYear()}`,
        status: 'upcoming',
        entries: {},
        results: null
    });

    // Igrzyska Olimpijskie
    const olympicDate = new Date(today.getFullYear(), today.getMonth() + 5, 1);
    gameState.competitions.push({
        id: 'olympic2026',
        type: COMPETITION_TYPES[3],
        date: olympicDate,
        poolSize: 50,
        name: `Igrzyska Olimpijskie ${olympicDate.getFullYear()}`,
        status: 'upcoming',
        entries: {},
        results: null
    });

    gameState.competitions.sort((a, b) => a.date - b.date);
}

// Symulacja dnia
function simulateDay() {
    gameState.currentDate.setDate(gameState.currentDate.getDate() + 1);

    // Losowe zdarzenia (choroby, kontuzje, forma)
    gameState.swimmers.forEach(swimmer => {
        if (swimmer.daysUntilRecovery > 0) {
            swimmer.daysUntilRecovery--;
            if (swimmer.daysUntilRecovery === 0) {
                swimmer.status = "healthy";
                addNews(`${swimmer.name} wrócił do pełni sił!`);
            }
        } else {
            // Szansa na chorobę (1%)
            if (Math.random() < 0.01) {
                swimmer.status = "sick";
                swimmer.daysUntilRecovery = 3 + Math.floor(Math.random() * 5);
                const template = NEWS_TEMPLATES.illness[Math.floor(Math.random() * NEWS_TEMPLATES.illness.length)];
                addNews(template.replace("{swimmer}", swimmer.name));
            }
            // Szansa na kontuzję (0.5%)
            else if (Math.random() < 0.005) {
                swimmer.status = "injured";
                swimmer.daysUntilRecovery = 7 + Math.floor(Math.random() * 14);
                const template = NEWS_TEMPLATES.injury[Math.floor(Math.random() * NEWS_TEMPLATES.injury.length)];
                addNews(template.replace("{swimmer}", swimmer.name));
            }
            // Zmiany formy
            else {
                const formChange = (Math.random() - 0.5) * 3;
                swimmer.form = Math.max(60, Math.min(100, swimmer.form + formChange));
                
                // Informacja o świetnej formie (gdy forma > 95)
                if (swimmer.form > 95 && Math.random() < 0.1) {
                    const template = NEWS_TEMPLATES.greatForm[Math.floor(Math.random() * NEWS_TEMPLATES.greatForm.length)];
                    addNews(template.replace("{swimmer}", swimmer.name));
                }
            }
        }
    });

    // Sprawdzenie czy są zawody dziś
    checkCompetitions();

    updateUI();
}

// Sprawdzenie zawodów
function checkCompetitions() {
    const today = gameState.currentDate.toDateString();
    gameState.competitions.forEach(comp => {
        if (comp.date.toDateString() === today && comp.status === 'upcoming') {
            comp.status = 'ready';
            addNews(`DZIŚ STARTUJĄ: ${comp.name}!`);
        }
    });
}

// Dodawanie wiadomości
function addNews(message) {
    gameState.news.unshift({
        date: new Date(gameState.currentDate),
        message: message,
        id: Date.now() + Math.random()
    });
    
    // Zachowaj tylko ostatnie 50 wiadomości
    if (gameState.news.length > 50) {
        gameState.news = gameState.news.slice(0, 50);
    }
}

// Symulacja konkurencji
function simulateEvent(competition, style, distance, isRelay, gender, polishSwimmers) {
    const poolSize = competition.poolSize;
    const eventKey = `${distance}_${poolSize}`;
    
    let results = [];

    if (isRelay) {
        // Symulacja sztafety
        const relayCount = 8;
        
        // Polska sztafeta
        if (polishSwimmers && polishSwimmers.length === 4) {
            let polishTime = 0;
            polishSwimmers.forEach(swimmerId => {
                const swimmer = gameState.swimmers.find(s => s.id === swimmerId);
                const individualDistance = distance === "4x100m" ? "100m" : "200m";
                const baseTime = timeToSeconds(swimmer.currentPB[`${individualDistance}_${poolSize}`]);
                const variance = (Math.random() - 0.4) * 2; // -0.8 do +1.2
                const formFactor = (swimmer.form - 80) / 100;
                const statusPenalty = swimmer.status !== "healthy" ? 2 : 0;
                polishTime += baseTime + variance - formFactor + statusPenalty;
            });

            results.push({
                country: "POL",
                swimmers: polishSwimmers.map(id => gameState.swimmers.find(s => s.id === id).name).join(", "),
                time: polishTime,
                points: 0
            });
        }

        // Inne kraje
        for (let i = results.length; i < relayCount; i++) {
            const country = COUNTRIES[i % COUNTRIES.length];
            const baseTime = poolSize === 50 ? (distance === "4x100m" ? 215 : 465) : (distance === "4x100m" ? 210 : 455);
            const countryStrength = country.strength / 100;
            const variance = (Math.random() - 0.3) * 5;
            const time = baseTime * (1.1 - countryStrength * 0.25) + variance;
            
            results.push({
                country: country.code,
                countryName: country.name,
                time: time,
                points: 0
            });
        }
    } else {
        // Symulacja indywidualna
        const competitorCount = 8;

        // Polski zawodnik
        if (polishSwimmers && polishSwimmers.length > 0) {
            const swimmer = gameState.swimmers.find(s => s.id === polishSwimmers[0]);
            const baseTime = timeToSeconds(swimmer.currentPB[eventKey]);
            const variance = (Math.random() - 0.4) * 2;
            const formFactor = (swimmer.form - 80) / 50;
            const statusPenalty = swimmer.status !== "healthy" ? 3 : 0;
            const prestigeFactor = competition.type.prestige / 200;
            
            const finalTime = baseTime + variance - formFactor + statusPenalty - prestigeFactor;

            results.push({
                country: "POL",
                swimmer: swimmer.name,
                swimmerId: swimmer.id,
                time: finalTime,
                points: 0
            });

            // Sprawdź życiówkę
            const currentPB = timeToSeconds(swimmer.currentPB[eventKey]);
            if (finalTime < currentPB) {
                swimmer.currentPB[eventKey] = secondsToTime(finalTime);
                const template = NEWS_TEMPLATES.pb[Math.floor(Math.random() * NEWS_TEMPLATES.pb.length)];
                addNews(template.replace("{swimmer}", swimmer.name).replace("{time}", secondsToTime(finalTime)));
            }
        }

        // Inni zawodnicy
        for (let i = results.length; i < competitorCount; i++) {
            const country = COUNTRIES[i % COUNTRIES.length];
            const baseTime = poolSize === 50 ? getBaseTime(style, distance, 50) : getBaseTime(style, distance, 25);
            const countryStrength = country.strength / 100;
            const variance = (Math.random() - 0.3) * 3;
            const time = baseTime * (1.1 - countryStrength * 0.25) + variance;
            
            results.push({
                country: country.code,
                countryName: country.name,
                swimmer: `${country.name} Swimmer ${i}`,
                time: time,
                points: 0
            });
        }
    }

    // Sortowanie wyników
    results.sort((a, b) => a.time - b.time);

    // Przyznanie medali i punktów
    if (results.length > 0) {
        results[0].medal = "gold";
        if (results[0].country === "POL") {
            gameState.medalTable.POL.gold++;
            gameState.medalTable.POL.points += 25;
            gameState.budget += competition.type.prize * 0.5;
            
            if (isRelay) {
                const template = NEWS_TEMPLATES.relayGold[Math.floor(Math.random() * NEWS_TEMPLATES.relayGold.length)];
                addNews(template.replace("{relay}", results[0].swimmers));
            } else {
                const template = NEWS_TEMPLATES.gold[Math.floor(Math.random() * NEWS_TEMPLATES.gold.length)];
                addNews(template.replace("{swimmer}", results[0].swimmer).replace("{competition}", competition.name).replace("{event}", `${style} ${distance}`));
            }
        } else {
            if (!gameState.medalTable[results[0].country]) {
                gameState.medalTable[results[0].country] = { name: results[0].countryName, gold: 0, silver: 0, bronze: 0, points: 0 };
            }
            gameState.medalTable[results[0].country].gold++;
            gameState.medalTable[results[0].country].points += 25;
        }
    }

    if (results.length > 1) {
        results[1].medal = "silver";
        if (results[1].country === "POL") {
            gameState.medalTable.POL.silver++;
            gameState.medalTable.POL.points += 10;
            gameState.budget += competition.type.prize * 0.3;
            
            const template = NEWS_TEMPLATES.silver[Math.floor(Math.random() * NEWS_TEMPLATES.silver.length)];
            addNews(template.replace("{swimmer}", results[1].swimmer).replace("{competition}", competition.name).replace("{event}", `${style} ${distance}`));
        } else {
            if (!gameState.medalTable[results[1].country]) {
                gameState.medalTable[results[1].country] = { name: results[1].countryName, gold: 0, silver: 0, bronze: 0, points: 0 };
            }
            gameState.medalTable[results[1].country].silver++;
            gameState.medalTable[results[1].country].points += 10;
        }
    }

    if (results.length > 2) {
        results[2].medal = "bronze";
        if (results[2].country === "POL") {
            gameState.medalTable.POL.bronze++;
            gameState.medalTable.POL.points += 5;
            gameState.budget += competition.type.prize * 0.2;
            
            const template = NEWS_TEMPLATES.bronze[Math.floor(Math.random() * NEWS_TEMPLATES.bronze.length)];
            addNews(template.replace("{swimmer}", results[2].swimmer).replace("{competition}", competition.name));
        } else {
            if (!gameState.medalTable[results[2].country]) {
                gameState.medalTable[results[2].country] = { name: results[2].countryName, gold: 0, silver: 0, bronze: 0, points: 0 };
            }
            gameState.medalTable[results[2].country].bronze++;
            gameState.medalTable[results[2].country].points += 5;
        }
    }

    return results;
}

// Konwersja czasu
function timeToSeconds(timeString) {
    if (!timeString) return 999;
    const parts = timeString.split(":");
    if (parts.length === 2) {
        return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
    }
    return parseFloat(timeString);
}

function secondsToTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    if (minutes > 0) {
        return `${minutes}:${secs.padStart(5, '0')}`;
    }
    return secs;
}

// Bazowe czasy dla różnych dystansów
function getBaseTime(style, distance, poolSize) {
    const times = {
        freestyle: { "50m": 22, "100m": 48, "200m": 105, "400m": 230, "800m": 480, "1500m": 900 },
        backstroke: { "50m": 25, "100m": 54, "200m": 120 },
        breaststroke: { "50m": 27, "100m": 60, "200m": 135 },
        butterfly: { "50m": 23, "100m": 52, "200m": 118 },
        medley: { "200m": 120, "400m": 260 }
    };

    const baseTime = times[style]?.[distance] || 60;
    return poolSize === 25 ? baseTime * 0.98 : baseTime;
}

// === UI FUNCTIONS ===

function updateUI() {
    updateDate();
    updateBudget();
    updateWallet();
    updateDashboard();
    updateSwimmersList();
    updateCompetitionsList();
    updateMedalsTable();
    updateNewsList();
}

function updateDate() {
    document.getElementById('currentDate').textContent = gameState.currentDate.toLocaleDateString('pl-PL');
}

function updateBudget() {
    document.getElementById('budget').textContent = gameState.budget.toLocaleString('pl-PL');
}

function updateWallet() {
    const val = gameState.walletBalance.toFixed(2);
    const el = document.getElementById('walletBalance');
    const el2 = document.getElementById('walletSmall');
    if (el) el.textContent = parseFloat(val).toLocaleString('pl-PL');
    if (el2) el2.textContent = parseFloat(val).toLocaleString('pl-PL');
}

function updateDashboard() {
    // Następne zawody
    const nextComp = gameState.competitions.find(c => c.status === 'upcoming' || c.status === 'ready');
    const nextCompEl = document.getElementById('nextCompetition');
    
    if (nextComp) {
        const daysUntil = Math.ceil((nextComp.date - gameState.currentDate) / (1000 * 60 * 60 * 24));
        nextCompEl.innerHTML = `
            <strong>${nextComp.name}</strong><br>
            Basen: ${nextComp.poolSize}m<br>
            Za: ${daysUntil} dni (${nextComp.date.toLocaleDateString('pl-PL')})<br>
            ${nextComp.status === 'ready' ? '<strong style="color: #d4af37;">GOTOWE DO STARTU!</strong>' : ''}
        `;
    } else {
        nextCompEl.innerHTML = 'Brak zaplanowanych zawodów';
    }

    // Status kadry
    const healthy = gameState.swimmers.filter(s => s.status === 'healthy').length;
    const injured = gameState.swimmers.filter(s => s.status === 'injured').length;
    const sick = gameState.swimmers.filter(s => s.status === 'sick').length;
    
    document.getElementById('squadStatus').innerHTML = `
        Zdrowi: ${healthy}<br>
        Kontuzjowani: ${injured}<br>
        Chorzy: ${sick}<br>
        Łącznie: ${gameState.swimmers.length}
    `;

    // Ostatnie wyniki
    const recentResults = gameState.results.slice(-3).reverse();
    const resultsHTML = recentResults.length > 0
        ? recentResults.map(r => `<div>${r.competition}: ${r.medal} - ${r.swimmer}</div>`).join('')
        : 'Brak wyników';
    
    document.getElementById('recentResults').innerHTML = resultsHTML;
}

function updateSwimmersList() {
    const styleFilter = document.getElementById('styleFilter').value;
    const genderFilter = document.getElementById('genderFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    let filtered = gameState.swimmers.filter(s => {
        if (styleFilter !== 'all' && s.specialty !== styleFilter) return false;
        if (genderFilter !== 'all' && s.gender !== genderFilter) return false;
        if (statusFilter !== 'all' && s.status !== statusFilter) return false;
        return true;
    });

    // Sortowanie po poziomie
    filtered.sort((a, b) => b.level - a.level);

    const html = filtered.map(s => {
        const statusClass = s.status === 'healthy' ? 'status-healthy' : (s.status === 'injured' ? 'status-injured' : 'status-sick');
        const statusText = s.status === 'healthy' ? 'Zdrowy' : (s.status === 'injured' ? `Kontuzja (${s.daysUntilRecovery} dni)` : `Choroba (${s.daysUntilRecovery} dni)`);
        
        return `
            <div class="swimmer-card ${statusClass}">
                <div class="swimmer-header">
                    <strong>${s.name}</strong>
                    <span class="swimmer-level">Poziom: ${s.level}</span>
                </div>
                <div class="swimmer-info">
                    Płeć: ${s.gender === 'M' ? 'Mężczyzna' : 'Kobieta'} | 
                    Specjalność: ${getStyleName(s.specialty)} | 
                    Forma: ${s.form.toFixed(0)}%
                </div>
                <div class="swimmer-status ${statusClass}">${statusText}</div>
                <div class="swimmer-events">
                    Dystanse: ${s.events.join(', ')}
                </div>
                        <div style="margin-top:8px;display:flex;gap:8px;align-items:center;">
                            <select id="train_${s.id}">
                                <option value="tech">Technika</option>
                                <option value="strength">Siła</option>
                                <option value="turns">Nawroty</option>
                                <option value="start">Reakcja startowa</option>
                                <option value="relay">Reakcja zmiany sztafetowej</option>
                            </select>
                            <button class="btn-secondary" onclick="trainSwimmer(${s.id})">Trenuj</button>
                        </div>
                <details class="swimmer-pb">
                    <summary>Życiówki</summary>
                    <div class="pb-list">
                        ${Object.entries(s.currentPB).map(([key, value]) => `<div>${key}: ${value}</div>`).join('')}
                    </div>
                </details>
            </div>
        `;
    }).join('');

    document.getElementById('swimmersList').innerHTML = html || '<p>Brak zawodników spełniających kryteria</p>';
}

function getStyleName(style) {
    const names = {
        freestyle: 'Kraul',
        backstroke: 'Grzbiet',
        breaststroke: 'Żabka',
        butterfly: 'Delfin',
        medley: 'Zmienne'
    };
    return names[style] || style;
}

function updateCompetitionsList() {
    const upcoming = gameState.competitions.filter(c => c.status === 'upcoming' || c.status === 'ready');
    const past = gameState.competitions.filter(c => c.status === 'completed');

    let html = '<h3>Nadchodzące zawody</h3>';
    
    if (upcoming.length > 0) {
        html += upcoming.map(c => {
            const daysUntil = Math.ceil((c.date - gameState.currentDate) / (1000 * 60 * 60 * 24));
            const isReady = c.status === 'ready';
            
            return `
                <div class="competition-card ${isReady ? 'competition-ready' : ''}">
                    <h4>${c.name}</h4>
                    <p>Prestiż: ${c.type.prestige} | Nagroda: ${c.type.prize.toLocaleString('pl-PL')} PLN</p>
                    <p>Basen: ${c.poolSize}m | Data: ${c.date.toLocaleDateString('pl-PL')}</p>
                    <p>Za ${daysUntil} dni</p>
                    ${isReady ? `<button class="btn-primary" onclick="startCompetition('${c.id}')">ROZPOCZNIJ ZAWODY</button>` : ''}
                </div>
            `;
        }).join('');
    } else {
        html += '<p>Brak nadchodzących zawodów</p>';
    }

    html += '<h3 style="margin-top: 2rem;">Zakończone zawody</h3>';
    
    if (past.length > 0) {
        html += past.map(c => `
            <div class="competition-card competition-past">
                <h4>${c.name}</h4>
                <p>Data: ${c.date.toLocaleDateString('pl-PL')}</p>
                <button class="btn-secondary" onclick="viewCompetitionResults('${c.id}')">Zobacz wyniki</button>
            </div>
        `).join('');
    } else {
        html += '<p>Jeszcze nie uczestniczyłeś w żadnych zawodach</p>';
    }

    document.getElementById('competitionsList').innerHTML = html;
}

function updateMedalsTable() {
    // Pokaż wszystkie kraje, nawet jeśli mają 0 medali
    const list = Object.entries(gameState.medalTable)
        .map(([code, data]) => ({ code, ...data }))
        .sort((a, b) => b.points - a.points);

    const html = `
        <table class="medals-table">
            <thead>
                <tr>
                    <th>Miejsce</th>
                    <th>Kraj</th>
                    <th>🥇</th>
                    <th>🥈</th>
                    <th>🥉</th>
                    <th>Razem</th>
                </tr>
            </thead>
            <tbody>
                ${list.map((c, i) => `
                    <tr class="${c.code === 'POL' ? 'poland-row' : ''}">
                        <td>${i + 1}</td>
                        <td><strong>${c.name}</strong></td>
                        <td>${c.gold}</td>
                        <td>${c.silver}</td>
                        <td>${c.bronze}</td>
                        <td>${c.gold + c.silver + c.bronze}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    document.getElementById('medalsTable').innerHTML = html;
}

function updateNewsList() {
    const html = gameState.news.map(n => `
        <div class="news-item">
            <div class="news-date">${n.date.toLocaleDateString('pl-PL')}</div>
            <div class="news-message">${n.message}</div>
        </div>
    `).join('');

    document.getElementById('newsList').innerHTML = html || '<p>Brak wiadomości</p>';
}

// Rozpoczęcie zawodów
function startCompetition(compId) {
    const comp = gameState.competitions.find(c => c.id === compId);
    if (!comp) return;

    document.getElementById('competitionsList').style.display = 'none';
    document.getElementById('competitionDetail').classList.remove('hidden');
    document.getElementById('competitionTitle').textContent = comp.name;
    
    document.getElementById('competitionInfo').innerHTML = `
        <p><strong>Prestiż:</strong> ${comp.type.prestige}</p>
        <p><strong>Nagroda:</strong> ${comp.type.prize.toLocaleString('pl-PL')} PLN</p>
        <p><strong>Basen:</strong> ${comp.poolSize}m</p>
    `;

    showEventSelection(comp);
}

// Wybór konkurencji
function showEventSelection(comp) {
    let html = '<h4>Wybierz konkurencje i zawodników</h4>';
    html += '<div class="event-selection-container">';

    // Dla każdego stylu
    Object.entries(EVENTS).forEach(([style, events]) => {
        html += `<div class="style-section">`;
        html += `<h5>${getStyleName(style)}</h5>`;

        events.forEach(event => {
            // Filtruj po płci jeśli wymagane
            if (event.gender && event.gender !== 'both') {
                const genders = event.gender === 'M' ? ['M'] : ['K'];
                
                genders.forEach(gender => {
                    html += createEventSelector(comp, style, event.distance, event.relay, gender);
                });
            } else {
                // Dla każdej płci oddzielnie
                ['M', 'K'].forEach(gender => {
                    html += createEventSelector(comp, style, event.distance, event.relay, gender);
                });
            }
        });

        html += `</div>`;
    });

    html += '</div>';
    html += `<button class="btn-primary" style="margin-top: 2rem;" onclick="simulateCompetition('${comp.id}')">SYMULUJ ZAWODY</button>`;

    document.getElementById('eventSelection').innerHTML = html;
}

function createEventSelector(comp, style, distance, isRelay, gender) {
    const eventId = `${style}_${distance}_${gender}`;
    const poolSize = comp.poolSize;
    
    // Filtruj zawodników
    const available = gameState.swimmers.filter(s => {
        if (s.gender !== gender) return false;
        if (s.specialty !== style && s.specialty !== 'medley') return false;
        
        const dist = distance.replace('4x', '');
        if (!s.events.includes(dist)) return false;
        
        const eventKey = `${dist}_${poolSize}`;
        if (!s.currentPB[eventKey]) return false;
        
        return true;
    }).sort((a, b) => {
        const distKey = distance.replace('4x', '');
        const keyA = `${distKey}_${poolSize}`;
        const keyB = `${distKey}_${poolSize}`;
        return timeToSeconds(a.currentPB[keyA]) - timeToSeconds(b.currentPB[keyB]);
    });

    if (available.length === 0) return '';

    let html = `<div class="event-selector">`;
    html += `<strong>${getStyleName(style)} ${distance} (${gender === 'M' ? 'Mężczyźni' : 'Kobiety'})</strong><br>`;

    if (isRelay) {
        html += `<div class="relay-selector">`;
        for (let i = 0; i < 4; i++) {
            html += `<select id="${eventId}_${i}" class="swimmer-select">`;
            html += `<option value="">Pozycja ${i + 1}</option>`;
            available.forEach(s => {
                const dist = distance.replace('4x', '');
                const pb = s.currentPB[`${dist}_${poolSize}`];
                const statusIcon = s.status !== 'healthy' ? ' ⚠️' : '';
                html += `<option value="${s.id}">${s.name} (${pb})${statusIcon}</option>`;
            });
            html += `</select>`;
        }
        html += `</div>`;
        // Auto-dobór sztafety (płatne) - przycisk nie pokazuje ceny
        html += `<div style="margin-top:8px;"><button class="btn-primary" onclick="autoSelectRelay('${comp.id}','${eventId}','${gender}','${distance}',${poolSize})">Auto-dobierz skład</button></div>`;
    } else {
        html += `<select id="${eventId}" class="swimmer-select">`;
        html += `<option value="">Nie startuj</option>`;
        available.forEach(s => {
            const pb = s.currentPB[`${distance}_${poolSize}`];
            const statusIcon = s.status !== 'healthy' ? ' ⚠️' : '';
            html += `<option value="${s.id}">${s.name} (${pb})${statusIcon}</option>`;
        });
        html += `</select>`;
    }

    html += `</div>`;
    return html;
}

// Płatności i portfel
function deductFromWallet(cost) {
    cost = parseFloat(cost);
    if (gameState.walletBalance >= cost) {
        gameState.walletBalance = parseFloat((gameState.walletBalance - cost).toFixed(2));
        updateWallet();
        return true;
    }
    alert('Niewystarczające środki w portfelu.');
    return false;
}

async function redeemPromoCode(code) {
    if (!code) return false;

    // Zabezpieczony salt (trzymany jawnie, ale kod promocyjny nie jest)
    const salt = 's@1t!';

    // Oblicz SHA-256 skrótu kodu+salt
    const input = code.trim().toLowerCase();
    const encoder = new TextEncoder();
    const data = encoder.encode(input + salt);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(digest));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Podzielony, zakodowany hash (nie ma jawnego kodu promocyjnego w źródle)
    const partA = '8cbc18e447f3e5af';
    const partB = 'c266893a72cdd5cf';
    const partC = 'b49023ff03fce704';
    const partD = '7a0956c079aee40a';
    const storedHash = partA + partB + partC + partD;

    if (hashHex === storedHash) {
        gameState.walletBalance = parseFloat((gameState.walletBalance + 10).toFixed(2));
        addNews('Kod promocyjny użyty — +10 PLN do portfela');
        updateWallet();
        return true;
    }

    alert('Nieznany kod promocyjny');
    return false;
}

function buyDays(days) {
    const costMap = { 15: 2.5, 30: 7.5 };
    const cost = costMap[days];
    if (!cost) return;
    if (!deductFromWallet(cost)) return;
    for (let i = 0; i < days; i++) simulateDay();
    addNews(`Dodano ${days} dni (opłacone z portfela)`);
}

// Automatyczny dobór sztafety (kolejność ma znaczenie: grzbiet, żabka, delfin, kraul)
function autoSelectRelay(compId, eventId, gender, distance, poolSize) {
    const cost = 5.0;
    if (!deductFromWallet(cost)) return;
    const individualDistance = distance.includes('4x100') ? '100m' : '200m';
    const legs = ['backstroke', 'breaststroke', 'butterfly', 'freestyle'];

    for (let i = 0; i < 4; i++) {
        const leg = legs[i];
        const candidates = gameState.swimmers.filter(s => s.gender === gender && (s.specialty === leg || s.specialty === 'medley'))
            .filter(s => s.currentPB && s.currentPB[`${individualDistance}_${poolSize}`])
            .sort((a, b) => timeToSeconds(a.currentPB[`${individualDistance}_${poolSize}`]) - timeToSeconds(b.currentPB[`${individualDistance}_${poolSize}`]));

        // Prefer zdrowych
        const healthy = candidates.filter(c => c.status === 'healthy');
        const pick = (healthy.length > 0 ? healthy[0] : candidates[0]) || null;
        const selectEl = document.getElementById(`${eventId}_${i}`);
        if (pick && selectEl) {
            selectEl.value = pick.id;
        }
    }
    addNews('Automatyczny dobór składu sztafety zakończony');
}

// Symulacja całych zawodów
function simulateCompetition(compId) {
    const comp = gameState.competitions.find(c => c.id === compId);
    if (!comp) return;

    comp.results = {};
    let allResults = [];

    // Zbierz wszystkie wpisy
    Object.entries(EVENTS).forEach(([style, events]) => {
        events.forEach(event => {
            ['M', 'K'].forEach(gender => {
                if (event.gender && event.gender !== gender) return;

                const eventId = `${style}_${event.distance}_${gender}`;
                
                if (event.relay) {
                    const swimmers = [];
                    for (let i = 0; i < 4; i++) {
                        const select = document.getElementById(`${eventId}_${i}`);
                        if (select && select.value) {
                            swimmers.push(parseInt(select.value));
                        }
                    }
                    
                    if (swimmers.length === 4) {
                        const results = simulateEvent(comp, style, event.distance, true, gender, swimmers);
                        comp.results[eventId] = results;
                        allResults.push({ style, distance: event.distance, gender, relay: true, results });
                        
                        // Zapisz wynik dla Polski
                        const polishResult = results.find(r => r.country === 'POL');
                        if (polishResult && polishResult.medal) {
                            gameState.results.push({
                                competition: comp.name,
                                event: `${getStyleName(style)} ${event.distance} ${gender === 'M' ? 'M' : 'K'}`,
                                swimmer: polishResult.swimmers,
                                medal: polishResult.medal,
                                time: secondsToTime(polishResult.time)
                            });
                        }
                    }
                } else {
                    const select = document.getElementById(eventId);
                    if (select && select.value) {
                        const swimmerId = parseInt(select.value);
                        const results = simulateEvent(comp, style, event.distance, false, gender, [swimmerId]);
                        comp.results[eventId] = results;
                        allResults.push({ style, distance: event.distance, gender, relay: false, results });
                        
                        // Zapisz wynik dla Polski
                        const polishResult = results.find(r => r.country === 'POL');
                        if (polishResult && polishResult.medal) {
                            gameState.results.push({
                                competition: comp.name,
                                event: `${getStyleName(style)} ${event.distance} ${gender === 'M' ? 'M' : 'K'}`,
                                swimmer: polishResult.swimmer,
                                medal: polishResult.medal,
                                time: secondsToTime(polishResult.time)
                            });
                        }
                    }
                }
            });
        });
    });

    comp.status = 'completed';
    
    // Podsumowanie
    const medals = {
        gold: gameState.results.filter(r => r.competition === comp.name && r.medal === 'gold').length,
        silver: gameState.results.filter(r => r.competition === comp.name && r.medal === 'silver').length,
        bronze: gameState.results.filter(r => r.competition === comp.name && r.medal === 'bronze').length
    };

    addNews(`${comp.name} zakończone! Polska zdobyła: 🥇${medals.gold} 🥈${medals.silver} 🥉${medals.bronze}`);
    
    viewCompetitionResults(compId);
    updateUI();
}

// Wyświetlanie wyników zawodów
function viewCompetitionResults(compId) {
    const comp = gameState.competitions.find(c => c.id === compId);
    if (!comp || !comp.results) return;

    document.getElementById('competitionsList').style.display = 'none';
    document.getElementById('competitionDetail').classList.remove('hidden');
    document.getElementById('competitionTitle').textContent = comp.name + ' - Wyniki';
    
    document.getElementById('competitionInfo').innerHTML = `
        <p><strong>Data:</strong> ${comp.date.toLocaleDateString('pl-PL')}</p>
        <p><strong>Basen:</strong> ${comp.poolSize}m</p>
    `;

    document.getElementById('eventSelection').innerHTML = '';

    let html = '<div class="results-container">';

    Object.entries(comp.results).forEach(([eventId, results]) => {
        const [style, distance, gender] = eventId.split('_');
        
        html += `<div class="event-results">`;
        html += `<h4>${getStyleName(style)} ${distance} (${gender === 'M' ? 'Mężczyźni' : 'Kobiety'})</h4>`;
        html += `<table class="results-table">`;
        html += `<thead><tr><th>Miejsce</th><th>Kraj</th><th>${distance.includes('x') ? 'Skład' : 'Zawodnik'}</th><th>Czas</th><th>Medal</th></tr></thead>`;
        html += `<tbody>`;
        
        results.forEach((r, i) => {
            const medalIcon = r.medal === 'gold' ? '🥇' : (r.medal === 'silver' ? '🥈' : (r.medal === 'bronze' ? '🥉' : ''));
            const polishRow = r.country === 'POL' ? 'poland-row' : '';
            html += `<tr class="${polishRow}">
                <td>${i + 1}</td>
                <td>${r.country}</td>
                <td>${r.swimmers || r.swimmer}</td>
                <td>${secondsToTime(r.time)}</td>
                <td>${medalIcon}</td>
            </tr>`;
        });
        
        html += `</tbody></table></div>`;
    });

    html += '</div>';

    document.getElementById('competitionResults').innerHTML = html;

    // Dodaj prostą animację basenu (pierwsze wydarzenie jeśli istnieje)
    const firstEvent = Object.entries(comp.results)[0];
    if (firstEvent) {
        const canvasHtml = `<canvas id="poolCanvas"></canvas>`;
        document.getElementById('competitionResults').insertAdjacentHTML('afterbegin', canvasHtml);
        const results = firstEvent[1];
        // Uruchom animację asynchronicznie
        setTimeout(() => animateRace(results, comp.poolSize), 300);
    }
}

// Prosta animacja wyścigu: poruszające się inicjały po torach
function animateRace(results, poolSize) {
    const canvas = document.getElementById('poolCanvas');
    if (!canvas) return;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const ctx = canvas.getContext('2d');

    const lanes = Math.min(results.length, 8);
    const laneHeight = canvas.height / lanes;

    // Przygotuj zawodników: weź inicjały
    const racers = results.slice(0, lanes).map((r, i) => {
        const name = r.swimmers || r.swimmer || r.country;
        const parts = name.split(' ');
        const initials = parts.map(p => p[0]).slice(0,2).join('.') + '.';
        const timeSec = r.time || 30 + i * 5;
        return { initials, timeSec, pos: 0, lane: i };
    });

    const maxTime = Math.max(...racers.map(r => r.timeSec));
    const duration = Math.max(5000, (maxTime * 1000));
    const start = performance.now();

    function draw(now) {
        const t = Math.min(1, (now - start) / duration);
        ctx.clearRect(0,0,canvas.width,canvas.height);

        // t -> progress 0..1; move each racer proportionally to their relative speed
        racers.forEach((r, idx) => {
            const ease = t;
            const relative = maxTime / r.timeSec; // faster -> larger
            const x = 20 + ease * (canvas.width - 60) * relative / (maxTime / Math.min(...racers.map(rr=>rr.timeSec)));
            const y = laneHeight * idx + laneHeight/2;

            // draw lane line
            ctx.fillStyle = idx % 2 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
            ctx.fillRect(0, laneHeight*idx, canvas.width, laneHeight-2);

            // swimmer box
            ctx.fillStyle = '#1e3c72';
            ctx.fillRect(x, y-12, 50, 24);
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.fillText(r.initials, x+6, y+5);
        });

        if (t < 1) requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
}

// Trening zawodnika
function trainSwimmer(swimmerId) {
    const sel = document.getElementById(`train_${swimmerId}`);
    if (!sel) return;
    const type = sel.value;
    const s = gameState.swimmers.find(x => x.id === swimmerId);
    if (!s) return;

    let gain = 0;
    switch (type) {
        case 'tech': gain = 2 + Math.random() * 3; break;
        case 'strength': gain = 1 + Math.random() * 4; break;
        case 'turns': gain = 1 + Math.random() * 3; break;
        case 'start': gain = 1 + Math.random() * 2; break;
        case 'relay': gain = 1 + Math.random() * 2; break;
    }

    s.form = Math.min(100, s.form + gain);
    addNews(`${s.name} przeszedł trening (${sel.options[sel.selectedIndex].text}) — forma +${gain.toFixed(1)}%`);
    updateUI();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Nawigacja
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            document.getElementById(section).classList.add('active');
        });
    });

    // Symulacja czasu
    document.getElementById('nextDay').addEventListener('click', () => {
        simulateDay();
    });

    document.getElementById('next7Days').addEventListener('click', () => {
        for (let i = 0; i < 7; i++) {
            simulateDay();
        }
    });

    document.getElementById('next30Days').addEventListener('click', () => {
        for (let i = 0; i < 30; i++) {
            simulateDay();
        }
    });

    // Płatne dodawanie dni
    const redeemBtn = document.getElementById('redeemPromo');
    if (redeemBtn) {
        redeemBtn.addEventListener('click', async () => {
            const code = document.getElementById('promoCode').value;
            await redeemPromoCode(code);
            updateUI();
        });
    }

    const buy15 = document.getElementById('buy15Days');
    if (buy15) buy15.addEventListener('click', () => buyDays(15));
    const buy30 = document.getElementById('buy30Days');
    if (buy30) buy30.addEventListener('click', () => buyDays(30));

    // Filtry zawodników
    document.getElementById('styleFilter').addEventListener('change', updateSwimmersList);
    document.getElementById('genderFilter').addEventListener('change', updateSwimmersList);
    document.getElementById('statusFilter').addEventListener('change', updateSwimmersList);

    // Powrót z zawodów
    document.getElementById('backToCompetitions').addEventListener('click', () => {
        document.getElementById('competitionDetail').classList.add('hidden');
        document.getElementById('competitionsList').style.display = 'block';
        updateCompetitionsList();
    });

    // Inicjalizacja
    initGame();
});
