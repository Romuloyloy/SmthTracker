const express = require('express');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule'); // For scheduling daily tasks

const app = express();
const PORT = 3000;

// Middleware to serve static files and parse JSON
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Data files
const todayFile = path.join(__dirname, 'data', 'log.json'); // Tracks today's counts
const historyFile = path.join(__dirname, 'data', 'daily_log.json'); // Stores daily records

// Initialize files
if (!fs.existsSync(todayFile)) {
    fs.writeFileSync(todayFile, JSON.stringify({ Friend1: 0, Friend2: 0, Friend3: 0, Friend4: 0 }));
}
if (!fs.existsSync(historyFile)) {
    fs.writeFileSync(historyFile, JSON.stringify([])); // Historical data as an array
}

// Helper functions
function readTodayLog() {
    return JSON.parse(fs.readFileSync(todayFile));
}

function writeTodayLog(data) {
    fs.writeFileSync(todayFile, JSON.stringify(data, null, 2));
}

function readHistoryLog() {
    return JSON.parse(fs.readFileSync(historyFile));
}

function writeHistoryLog(data) {
    fs.writeFileSync(historyFile, JSON.stringify(data, null, 2));
}

// API Endpoints
app.get('/api/log', (req, res) => {
    res.json(readTodayLog());
});

app.post('/api/log', (req, res) => {
    const { name, delta } = req.body;
    if (!name || typeof delta !== 'number') {
        return res.status(400).json({ error: 'Invalid data' });
    }

    const logData = readTodayLog();
    if (!(name in logData)) {
        return res.status(400).json({ error: 'Invalid friend name' });
    }

    logData[name] += delta;
    logData[name] = Math.max(0, logData[name]); // Ensure count is not negative
    writeTodayLog(logData);

    res.json(logData);
});

app.get('/api/history', (req, res) => {
    const historyLog = readHistoryLog();
    res.json(historyLog);
});

// Manual "end of the day" trigger for debugging
app.post('/api/debug/endofday', (req, res) => {
    const todayLog = readTodayLog();
    const timestamp = new Date().toISOString().split('T')[0];

    // Archive the current day
    const historyLog = readHistoryLog();
    historyLog.push({ date: timestamp, ...todayLog });
    writeHistoryLog(historyLog);

    // Reset today's log
    writeTodayLog({ Friend1: 0, Friend2: 0, Friend3: 0, Friend4: 0 });

    console.log(`[DEBUG] End-of-day process triggered for ${timestamp}.`);
    res.json({ message: `End-of-day triggered for ${timestamp}`, todayLog, historyLog });
});

// Scheduler to archive daily totals at midnight EET (Eastern European Time)
schedule.scheduleJob({ hour: 0, minute: 0, tz: 'EET' }, () => {
    const todayLog = readTodayLog();
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const historyLog = readHistoryLog();
    historyLog.push({ date: timestamp, ...todayLog });
    writeHistoryLog(historyLog);

    // Reset today's log
    writeTodayLog({ Friend1: 0, Friend2: 0, Friend3: 0, Friend4: 0 });

    console.log(`[${timestamp}] Daily log archived and reset.`);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
