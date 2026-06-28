const state = {
  title: "OT Dispatch",
  mechanics: ["John Smith", "Dave Brown", "Alex Carter"],
  helpers: ["Mike Jones", "Chris Lee", "Sam White"],
  history: [],
  currentScreen: "dispatch"
};

// =========================
// LOAD / SAVE
// =========================

function save() {
  localStorage.setItem("otDispatch_v3", JSON.stringify(state));
}

function load() {
  const saved = localStorage.getItem("otDispatch_v3");
  if (saved) {
    const parsed = JSON.parse(saved);

    Object.assign(state, parsed);
  }
}

// =========================
// INIT
// =========================

window.onload = function () {
  load();

  document.getElementById("appTitle").innerText = state.title;

  updateUI();
  updateCounts();
};

// =========================
// SCREEN NAVIGATION
// =========================

function showScreen(screen) {
  state.currentScreen = screen;

  document.querySelectorAll(".screen").forEach(s => {
    s.classList.remove("activeScreen");
  });

  if (screen === "dispatch") {
    document.getElementById("dispatchScreen").classList.add("activeScreen");
  }

  if (screen === "settings") {
    document.getElementById("settingsScreen").classList.add("activeScreen");
  }

  if (screen === "history") {
    document.getElementById("historyScreen").classList.add("activeScreen");
    renderHistory();
  }

  save();
}

// =========================
// TITLE
// =========================

function editTitle() {
  const name = prompt("Edit title:", state.title);
  if (!name) return;

  state.title = name;
  document.getElementById("appTitle").innerText = name;

  save();
}

// =========================
// CORE DISPLAY
// =========================

function updateUI() {
  document.getElementById("mechanicName").innerText =
    state.mechanics[0] || "None";

  document.getElementById("helperName").innerText =
    state.helpers[0] || "None";
}

// =========================
// ROTATION LOGIC
// =========================

function rotate(list) {
  if (list.length > 1) {
    list.push(list.shift());
  }
}

// =========================
// VOTE SYSTEM
// =========================

function vote(type, action) {
  const list = type === "mechanic"
    ? state.mechanics
    : state.helpers;

  const name = list[0];

  state.history.unshift({
    type,
    name,
    action,
    time: new Date().toLocaleString()
  });

  if (state.history.length > 500) {
    state.history.pop();
  }

  rotate(list);

  save();
  updateUI();
  updateCounts();
}

// =========================
// COUNT SYSTEM (UNDER BUTTONS)
// =========================

function count(name, action) {
  return state.history.filter(
    x => x.name === name && x.action === action
  ).length;
}

function updateCounts() {

  const mech = state.mechanics[0] || "";
  const help = state.helpers[0] || "";

  // Mechanics counts
  document.getElementById("mechAcceptCount").innerText = count(mech, "accept");
  document.getElementById("mechDeclineCount").innerText = count(mech, "decline");
  document.getElementById("mechNACount").innerText = count(mech, "na");

  // Helpers counts
  document.getElementById("helpAcceptCount").innerText = count(help, "accept");
  document.getElementById("helpDeclineCount").innerText = count(help, "decline");
  document.getElementById("helpNACount").innerText = count(help, "na");
}

// =========================
// HISTORY SCREEN
// =========================

function renderHistory() {

  const container = document.getElementById("historyList");
  container.innerHTML = "";

  const grouped = groupHistory();

  Object.keys(grouped).forEach(name => {

    const entries = grouped[name];

    const card = document.createElement("div");
    card.className = "historyCard";

    card.innerHTML = `
      <div class="historyName">${name}</div>
      <div class="historyTotals">
        ✔ ${entries.filter(e => e.action === "accept").length} |
        ✖ ${entries.filter(e => e.action === "decline").length} |
        ? ${entries.filter(e => e.action === "na").length}
      </div>
    `;

    card.onclick = () => openPersonHistory(name);

    container.appendChild(card);
  });
}

// =========================
// PERSON HISTORY
// =========================

function openPersonHistory(name) {

  showScreen("person");

  document.getElementById("historyPersonName").innerText = name;

  const container = document.getElementById("personHistoryList");
  container.innerHTML = "";

  state.history
    .filter(h => h.name === name)
    .forEach(entry => {

      const div = document.createElement("div");
      div.className = "historyEntry";

      let icon = "❓";
      if (entry.action === "accept") icon = "✔️";
      if (entry.action === "decline") icon = "✖️";

      div.innerHTML = `
        <div class="historyDate">${entry.time}</div>
        <div class="historyAction">${icon} ${entry.action.toUpperCase()}</div>
      `;

      container.appendChild(div);
    });
}

// =========================
// CLEAR HISTORY
// =========================

function clearHistory() {
  if (!confirm("Clear ALL history?")) return;

  state.history = [];
  save();
  updateCounts();

  alert("History cleared");
}

// =========================
// GROUP HISTORY
// =========================

function groupHistory() {

  const grouped = {};

  state.history.forEach(entry => {
    if (!grouped[entry.name]) {
      grouped[entry.name] = [];
    }
    grouped[entry.name].push(entry);
  });

  return grouped;
}

// =========================
// SCREEN FIX HOOK
// =========================

// small safety fallback so navigation doesn't break
function showHistoryScreen() {
  showScreen("history");
}

// =========================
// ROSTER EDITOR (MECHANICS / HELPERS)
// =========================

function openRoster(type) {

  const list = type === "mechanic"
    ? state.mechanics
    : state.helpers;

  const name = prompt(
`Edit ${type}s

Current:
${list.join("\n")}

Enter new list (one per line):`
  );

  if (name === null) return;

  const newList = name
    .split("\n")
    .map(x => x.trim())
    .filter(x => x.length > 0);

  if (type === "mechanic") {
    state.mechanics = newList;
  } else {
    state.helpers = newList;
  }

  save();
  updateUI();
  updateCounts();
}

// =========================
// DELETE PERSON (AND CLEAN HISTORY)
// =========================

function deletePerson(name) {

  if (!confirm(`Delete ${name}? This will remove their history too.`)) return;

  state.history = state.history.filter(h => h.name !== name);

  state.mechanics = state.mechanics.filter(m => m !== name);
  state.helpers = state.helpers.filter(h => h !== name);

  save();
  updateUI();
  updateCounts();

  if (state.currentScreen === "history") {
    renderHistory();
  }
}

// =========================
// ADD PERSON
// =========================

function addPerson(type) {

  const name = prompt(`Add ${type}:`);
  if (!name) return;

  const clean = name.trim();

  if (type === "mechanic") {
    state.mechanics.push(clean);
  } else {
    state.helpers.push(clean);
  }

  save();
  updateUI();
}

// =========================
// SAFETY: AUTO REFRESH COUNTS AFTER ANY LOAD
// =========================

setInterval(() => {
  updateCounts();
}, 1000);

// =========================
// INITIAL SYNC FIX (IMPORTANT)
// =========================

updateUI();
updateCounts();

console.log("OT Dispatch v3 loaded successfully");
