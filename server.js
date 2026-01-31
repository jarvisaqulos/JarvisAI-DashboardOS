const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));
app.use(express.json());

// API endpoint for data persistence (optional - uses localStorage by default)
app.get('/api/data', (req, res) => {
    const dataPath = path.join(__dirname, 'data', 'dashboard-data.json');
    if (fs.existsSync(dataPath)) {
        res.json(JSON.parse(fs.readFileSync(dataPath, 'utf8')));
    } else {
        res.json({ tasks: [], projects: [], resources: [], workLog: [] });
    }
});

app.post('/api/data', (req, res) => {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    const dataPath = path.join(dataDir, 'dashboard-data.json');
    fs.writeFileSync(dataPath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
});

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║     🤖 JARVIS AQULOS DASHBOARD v2.0.0                 ║
║                                                        ║
║     Dark Mode Operating System                         ║
║     Status: ONLINE                                     ║
║                                                        ║
║     http://localhost:${PORT}                              ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
    `);
});
