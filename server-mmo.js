const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

const PLAYERS_FILE = path.join(__dirname, 'players.json');

// Функция для загрузки данных игроков
function loadPlayers() {
    try {
        if (fs.existsSync(PLAYERS_FILE)) {
            const data = fs.readFileSync(PLAYERS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Ошибка загрузки players.json:', e);
    }
    return { players: {}, battles: [] };
}

// Функция для сохранения данных игроков
function savePlayers(data) {
    try {
        data.lastUpdated = new Date().toISOString();
        fs.writeFileSync(PLAYERS_FILE, JSON.stringify(data, null, 2), 'utf8');
        console.log(`✅ Данные сохранены в ${PLAYERS_FILE}`);
        return true;
    } catch (e) {
        console.error('Ошибка сохранения:', e);
        return false;
    }
}

// ============ API ENDPOINTS ============

// GET все игроки
app.get('/api/players', (req, res) => {
    const data = loadPlayers();
    res.json(data);
});

// GET конкретного игрока
app.get('/api/players/:username', (req, res) => {
    const data = loadPlayers();
    const player = data.players[req.params.username];
    if (player) {
        res.json(player);
    } else {
        res.status(404).json({ error: 'Player not found' });
    }
});

// POST создать/обновить игрока
app.post('/api/players/:username', (req, res) => {
    const data = loadPlayers();
    const username = req.params.username;
    const playerData = req.body;

    data.players[username] = {
        ...data.players[username],
        ...playerData,
        username: username
    };

    if (savePlayers(data)) {
        res.json({ success: true, player: data.players[username] });
    } else {
        res.status(500).json({ error: 'Save failed' });
    }
});

// PUT обновить всех игроков
app.put('/api/players', (req, res) => {
    const newData = req.body;
    if (savePlayers(newData)) {
        res.json({ success: true, data: newData });
    } else {
        res.status(500).json({ error: 'Save failed' });
    }
});

// POST добавить золото
app.post('/api/players/:username/gold', (req, res) => {
    const data = loadPlayers();
    const username = req.params.username;
    const amount = req.body.amount || 0;

    if (!data.players[username]) {
        return res.status(404).json({ error: 'Player not found' });
    }

    data.players[username].gold = (data.players[username].gold || 0) + amount;

    if (savePlayers(data)) {
        res.json({ success: true, gold: data.players[username].gold });
    } else {
        res.status(500).json({ error: 'Save failed' });
    }
});

// POST добавить железо
app.post('/api/players/:username/iron', (req, res) => {
    const data = loadPlayers();
    const username = req.params.username;
    const amount = req.body.amount || 0;

    if (!data.players[username]) {
        return res.status(404).json({ error: 'Player not found' });
    }

    data.players[username].iron = (data.players[username].iron || 0) + amount;

    if (savePlayers(data)) {
        res.json({ success: true, iron: data.players[username].iron });
    } else {
        res.status(500).json({ error: 'Save failed' });
    }
});

// POST добавить солдат
app.post('/api/players/:username/soldiers', (req, res) => {
    const data = loadPlayers();
    const username = req.params.username;
    const amount = req.body.amount || 0;

    if (!data.players[username]) {
        return res.status(404).json({ error: 'Player not found' });
    }

    data.players[username].soldiers = (data.players[username].soldiers || 0) + amount;

    if (savePlayers(data)) {
        res.json({ success: true, soldiers: data.players[username].soldiers });
    } else {
        res.status(500).json({ error: 'Save failed' });
    }
});

// POST запись боя
app.post('/api/battles', (req, res) => {
    const data = loadPlayers();
    const battle = req.body;

    if (!data.battles) data.battles = [];
    data.battles.push({
        ...battle,
        timestamp: new Date().toISOString()
    });

    if (savePlayers(data)) {
        res.json({ success: true, battle });
    } else {
        res.status(500).json({ error: 'Save failed' });
    }
});

// GET все боевые отчёты
app.get('/api/battles', (req, res) => {
    const data = loadPlayers();
    res.json(data.battles || []);
});

// DELETE игрок
app.delete('/api/players/:username', (req, res) => {
    const data = loadPlayers();
    const username = req.params.username;

    if (data.players[username]) {
        delete data.players[username];
        if (savePlayers(data)) {
            res.json({ success: true });
        } else {
            res.status(500).json({ error: 'Save failed' });
        }
    } else {
        res.status(404).json({ error: 'Player not found' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve index.html на главной
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Castle MMO Server запущен!`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`📁 Players file: ${PLAYERS_FILE}`);
    console.log(`\n✅ API endpoints:`);
    console.log(`  GET  /api/players - все игроки`);
    console.log(`  GET  /api/players/:username - конкретный игрок`);
    console.log(`  POST /api/players/:username - обновить игрока`);
    console.log(`  PUT  /api/players - обновить всех`);
    console.log(`  POST /api/battles - записать бой`);
    console.log(`  GET  /api/battles - все боевые отчёты`);
    console.log(`  DELETE /api/players/:username - удалить игрока\n`);
});

module.exports = app;
