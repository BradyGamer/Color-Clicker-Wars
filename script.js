// Colors to vote for
const colors = ['white', 'red', 'green', 'blue', 'grey', 'black', 'purple', 'pink'];

// Store votes and chart history
const voteData = colors.reduce((acc, color) => ({
  ...acc,
  [color]: { counts: 0, timestamps: [], voteHistory: [] }
}), {});

const charts = {};
const colorGrid = document.getElementById('color-grid');
let lastUpdateTime = Math.floor(Date.now() / 1000);

// Create each color section
function createColorSection(color) {
  const section = document.createElement('div');
  section.className = 'color-section';
  section.dataset.color = color;

  // Button
  const button = document.createElement('button');
  button.className = 'color-box';
  button.style.backgroundColor = color;
  button.innerHTML = `${color.charAt(0).toUpperCase() + color.slice(1)} (<span id="${color}-count">0</span>)`;
  button.addEventListener('click', () => vote(color));

  // Chart
  const canvas = document.createElement('canvas');
  canvas.id = `chart-${color}`;
  
  section.append(button, canvas);
  colorGrid.appendChild(section);

  // Initialize chart
  const ctx = canvas.getContext('2d');
  charts[color] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: `${color} Votes`,
        data: [],
        backgroundColor: color,
        borderColor: color,
        borderWidth: 2,
        fill: true,
        tension: 0.3 // smooth curves
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: true, text: 'Time (s)', font: { size: 14 } } },
        y: { beginAtZero: true, ticks: { stepSize: 1 }, title: { display: true, text: 'Votes', font: { size: 14 } } }
      }
    }
  });
}

// Update UI and charts
function updateUI() {
  colors.forEach(color => {
    document.getElementById(`${color}-count`).textContent = voteData[color].counts;
    const chart = charts[color];
    chart.data.labels = voteData[color].timestamps;
    chart.data.datasets[0].data = voteData[color].voteHistory;
    chart.update();
  });
}

// Handle votes
function vote(color) {
  voteData[color].counts++;
  const currentTime = Math.floor(Date.now() / 1000);

  if (!voteData[color].timestamps.length || voteData[color].timestamps.slice(-1)[0] !== currentTime) {
    voteData[color].timestamps.push(currentTime);
    voteData[color].voteHistory.push(voteData[color].counts);
  } else {
    voteData[color].voteHistory[voteData[color].voteHistory.length - 1] = voteData[color].counts;
  }

  updateUI();
}

// Real-time chart updates
function tick() {
  const currentTime = Math.floor(Date.now() / 1000);
  if (currentTime !== lastUpdateTime) {
    lastUpdateTime = currentTime;
    colors.forEach(color => {
      if (!voteData[color].timestamps.length || voteData[color].timestamps.slice(-1)[0] !== currentTime) {
        voteData[color].timestamps.push(currentTime);
        voteData[color].voteHistory.push(voteData[color].counts);
      }
      const chart = charts[color];
      chart.data.labels = voteData[color].timestamps;
      chart.data.datasets[0].data = voteData[color].voteHistory;
      chart.update();
    });
  }
}

// Initialize
colors.forEach(createColorSection);
updateUI();
setInterval(tick, 1000);
