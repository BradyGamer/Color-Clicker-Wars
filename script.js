// --------------------
// Firebase Modular SDK
// --------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

// --------------------
// Firebase config - REPLACE with your project info
// --------------------
const firebaseConfig = {
  apiKey: "AIzaSyAQBoU3wj7txtOI0DnRbzRNfPz1q9pbOL4",
  authDomain: "color-clicker-3eb6d.firebaseapp.com",
  databaseURL: "https://color-clicker-3eb6d-default-rtdb.firebaseio.com",
  projectId: "color-clicker-3eb6d",
  storageBucket: "color-clicker-3eb6d.appspot.com",
  messagingSenderId: "910886222869",
  appId: "1:910886222869:web:791229bb8b33abb738e21c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --------------------
// Poll setup
// --------------------
const colors = ['white', 'red', 'green', 'blue', 'grey', 'purple', 'pink'];
const voteData = colors.reduce((acc, color) => ({
  ...acc,
  [color]: { counts: 0, timestamps: [], voteHistory: [] }
}), {});

const charts = {};
let colorGrid;
let lastUpdateTime = Math.floor(Date.now() / 1000);

// --------------------
// Create buttons & charts
// --------------------
function createColorSection(color) {
  const section = document.createElement('div');
  section.className = 'color-section';
  section.dataset.color = color;

  const button = document.createElement('button');
  button.className = 'color-box';
  button.style.backgroundColor = color;
  button.innerHTML = `${color.charAt(0).toUpperCase() + color.slice(1)} (<span id="${color}-count">0</span>)`;
  button.addEventListener('click', () => vote(color));

  const canvas = document.createElement('canvas');
  canvas.id = `chart-${color}`;

  section.append(button, canvas);
  colorGrid.appendChild(section);

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
        tension: 0.3
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

// --------------------
// Update UI & charts
// --------------------
function updateUI() {
  colors.forEach(color => {
    document.getElementById(`${color}-count`).textContent = voteData[color].counts;
    const chart = charts[color];
    chart.data.labels = voteData[color].timestamps;
    chart.data.datasets[0].data = voteData[color].voteHistory;
    chart.update();
  });
}

// --------------------
// Vote function
// --------------------
function vote(color) {
  const voteRef = ref(db, `votes/${color}`);
  runTransaction(voteRef, current => (current || 0) + 1);
}

// --------------------
// Listen for Firebase updates
// --------------------
function listenVotes() {
  colors.forEach(color => {
    const voteRef = ref(db, `votes/${color}`);
    onValue(voteRef, snapshot => {
      const count = snapshot.val() || 0;
      const currentTime = Math.floor(Date.now() / 1000);

      voteData[color].counts = count;

      if (!voteData[color].timestamps.length || voteData[color].timestamps.slice(-1)[0] !== currentTime) {
        voteData[color].timestamps.push(currentTime);
        voteData[color].voteHistory.push(count);
      } else {
        voteData[color].voteHistory[voteData[color].voteHistory.length - 1] = count;
      }

      updateUI();
    });
  });
}

// --------------------
// Tick for chart updates
// --------------------
function tick() {
  const currentTime = Math.floor(Date.now() / 1000);
  if (currentTime !== lastUpdateTime) {
    lastUpdateTime = currentTime;
    colors.forEach(color => {
      const chart = charts[color];
      chart.data.labels = voteData[color].timestamps;
      chart.data.datasets[0].data = voteData[color].voteHistory;
      chart.update();
    });
  }
}

// --------------------
// Initialize after DOM loads
// --------------------
document.addEventListener('DOMContentLoaded', () => {
  colorGrid = document.getElementById('color-grid');
  colors.forEach(createColorSection);
  listenVotes();
  setInterval(tick, 1000);
});
