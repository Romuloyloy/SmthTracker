const trackerDiv = document.getElementById('tracker');

// Load the data
async function loadLog() {
    const response = await fetch('/api/log');
    const logData = await response.json();
    renderTracker(logData);
}

// Render the tracker
function renderTracker(logData) {
    trackerDiv.innerHTML = '';
    Object.entries(logData).forEach(([name, count]) => {
        const friendDiv = document.createElement('div');
        friendDiv.className = 'friend';

        friendDiv.innerHTML = `
            <h2>${name}</h2>
            <button onclick="updateCount('${name}', -1)">-</button>
            <span class="count">${count}</span>
            <button onclick="updateCount('${name}', 1)">+</button>
        `;

        trackerDiv.appendChild(friendDiv);
    });
}

// Update the coffee count
async function updateCount(name, delta) {
    await fetch('/api/log', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, delta }),
    });
    loadLog();
}

// Initialize
document.addEventListener('DOMContentLoaded', loadLog);
