const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to serve static files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve the homepage on `/`
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Data file path
const dataFile = path.join(__dirname, 'data', 'log.json');

// Initialize log file
if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify({ Friend1: 0, Friend2: 0, Friend3: 0, Friend4: 0 }));
}

// Load and save functions
function readLog() {
    return JSON.parse(fs.readFileSync(dataFile));
}

function writeLog(logData) {
    fs.writeFileSync(dataFile, JSON.stringify(logData, null, 2));
}

// API Endpoints
app.get('/api/log', (req, res) => {
    res.json(readLog());
});

app.post('/api/log', (req, res) => {
    const { name, delta } = req.body;
    if (!name || typeof delta !== 'number') {
        return res.status(400).json({ error: 'Invalid data' });
    }

    const logData = readLog();
    if (!(name in logData)) {
        return res.status(400).json({ error: 'Invalid friend name' });
    }

    logData[name] += delta;
    logData[name] = Math.max(0, logData[name]); // Ensure count is not negative
    writeLog(logData);

    res.json(logData);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
