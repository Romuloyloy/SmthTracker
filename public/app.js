const trackerDiv = document.getElementById('tracker');
let currentMonth = new Date().getMonth(); // Start with the current month
let currentYear = new Date().getFullYear(); // Current year

// Fetch logs
async function fetchLogs() {
    const [todayResponse, historyResponse] = await Promise.all([
        fetch('/api/log'),
        fetch('/api/history'),
    ]);
    const todayLog = await todayResponse.json();
    const historyLog = await historyResponse.json();
    return { todayLog, historyLog };
}

// Render tracker
async function renderTracker() {
    const { todayLog, historyLog } = await fetchLogs();
    trackerDiv.innerHTML = '';

    Object.keys(todayLog).forEach((name) => {
        const friendDiv = document.createElement('div');
        friendDiv.className = 'friend';

        // Render name and coffee count
        friendDiv.innerHTML = `
            <h2>${name}</h2>
            <button onclick="updateCount('${name}', -1)">-</button>
            <span class="count">${todayLog[name]}</span>
            <button onclick="updateCount('${name}', 1)">+</button>
        `;

        // Render calendar navigation and heatmap
        const calendarContainer = document.createElement('div');
        calendarContainer.className = 'calendar-container';

        const calendarHeader = document.createElement('div');
        calendarHeader.className = 'calendar-header';
        calendarHeader.innerHTML = `
            <button onclick="changeMonth(${currentYear}, ${currentMonth - 1})">&lt;</button>
            <span>${new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            <button onclick="changeMonth(${currentYear}, ${currentMonth + 1})">&gt;</button>
        `;

        const calendar = document.createElement('div');
        calendar.className = 'calendar';

        // Populate calendar for the selected month
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const startDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 (Sun) to 6 (Sat)
        const dateLog = historyLog.filter(entry => new Date(entry.date).getMonth() === currentMonth && new Date(entry.date).getFullYear() === currentYear);

        // Fill with empty days until the first day of the month
        for (let i = 0; i < startDay; i++) {
            calendar.appendChild(document.createElement('div'));
        }

        // Fill the days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
            const density = (dateLog.find(entry => entry.date === dateStr)?.[name] || 0);

            const dayCell = document.createElement('div');
            dayCell.setAttribute('data-density', Math.min(density, 5)); // Cap density at 5
            dayCell.setAttribute('title', `Cups: ${density}`); // Tooltip on hover
            dayCell.className = 'calendar-day';
            dayCell.textContent = day; // Display the day number
            calendar.appendChild(dayCell);
        }

        calendarContainer.appendChild(calendarHeader);
        calendarContainer.appendChild(calendar);
        friendDiv.appendChild(calendarContainer);
        trackerDiv.appendChild(friendDiv);
    });
}

// Update coffee count
async function updateCount(name, delta) {
    await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, delta }),
    });
    renderTracker();
}

// Change month
function changeMonth(year, month) {
    if (month < 0) {
        currentYear -= 1;
        currentMonth = 11;
    } else if (month > 11) {
        currentYear += 1;
        currentMonth = 0;
    } else {
        currentMonth = month;
    }
    renderTracker();
}

// Initialize
document.addEventListener('DOMContentLoaded', renderTracker);
