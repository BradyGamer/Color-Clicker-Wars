script.js
// Initialize vote data and charts
const colors = ['white', 'red', 'green', 'blue', 'grey', 'black', 'purple', 'pink'];
const voteData = colors.reduce((acc, color) => ({
  ...acc,
  [color]: { counts: 0, timestamps: [], voteHistory: [] },
}), {});

const charts = {};
const colorGrid = document.getElementById('color-grid');
let lastUpdateTime = Math.floor(Date.now() / 1000);

// Create color section with button and chart
function createColorSection(color) {
  const section = document.createElement('div');
  section.className = 'color-section';
  section.dataset.color = color;

  // Button
  const button = document.createElement('button');
  button.className = 'color-box';
  button.style.backgroundColor = color;
  button.innerHTML = `${color.charAt(0).toUpperCase() + color.slice(1)} (<span id="${color}-count">0</span>)`;
  button.onclick = () => vote(color);

  // Chart
  const canvas = document.createElement('canvas');
  canvas.id = `chart-${color}`;
  section.appendChild(button);
  section.appendChild(canvas);

  // Add section to grid
  colorGrid.appendChild(section);

  // Create chart instance
  const ctx = canvas.getContext('2d');
  charts[color] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [], // Timestamps in seconds
      datasets: [
        {
          label: `${color.charAt(0).toUpperCase() + color.slice(1)} Votes`,
          data: [],
          backgroundColor: color,
          borderColor: color,
          borderWidth: 2,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          title: { display: true, text: 'Time (s)', font: { size: 14 } },
        },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
          title: { display: true, text: 'Votes', font: { size: 14 } },
        },
      },
    },
  });
}

// Update UI and charts without moving elements
function updateUI() {
  // Sort colors by vote counts
  const sortedColors = [...colors].sort((a, b) => voteData[b].counts - voteData[a].counts);

  // Update the chart data and redraw without moving the position
  sortedColors.forEach((color) => {
    document.getElementById(`${color}-count`).textContent = voteData[color].counts;

    // Update the chart with new data
    const chart = charts[color];
    chart.data.labels = voteData[color].timestamps;
    chart.data.datasets[0].data = voteData[color].voteHistory;
    chart.update();
  });
}

// Function to handle voting
function vote(color) {
  // Increment vote count
  voteData[color].counts++;

  // Record the current timestamp in seconds
  const currentTime = Math.floor(Date.now() / 1000);
  if (voteData[color].timestamps.length === 0 || voteData[color].timestamps[voteData[color].timestamps.length - 1] !== currentTime) {
    voteData[color].timestamps.push(currentTime);
    voteData[color].voteHistory.push(voteData[color].counts);
  } else {
    // Update the last recorded point in the current second
    voteData[color].voteHistory[voteData[color].voteHistory.length - 1] = voteData[color].counts;
  }

  updateUI();
}

// Function to update the charts in real-time without scrolling
function tick() {
  const currentTime = Math.floor(Date.now() / 1000);

  // Only update if a new second has passed
  if (currentTime !== lastUpdateTime) {
    lastUpdateTime = currentTime;
    
    // Update the data for each color without resetting the charts
    colors.forEach((color) => {
      if (voteData[color].timestamps.length === 0 || voteData[color].timestamps[voteData[color].timestamps.length - 1] !== currentTime) {
        voteData[color].timestamps.push(currentTime);
        voteData[color].voteHistory.push(voteData[color].counts);
      }
    });

    // Update the charts without causing a shift or redraw
    colors.forEach((color) => {
      const chart = charts[color];
      chart.data.labels = voteData[color].timestamps;
      chart.data.datasets[0].data = voteData[color].voteHistory;
      chart.update();
    });
  }
}

// Initialize the grid
colors.forEach(createColorSection);
updateUI();

// Start the timer for real-time updates
setInterval(tick, 1000);
