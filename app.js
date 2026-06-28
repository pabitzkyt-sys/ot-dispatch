
// =========================
// STATE
// =========================

const state = {
  title: "OT Dispatch",
  mechanics: ["John Smith", "Dave Brown", "Alex Carter"],
  helpers: ["Mike Jones", "Chris Lee", "Sam White"],
  history: [],
  currentScreen: "dispatch"
};

// =========================
// STORAGE
// =========================

function save() {
  localStorage.setItem("otDispatch_v3", JSON.stringify(state));
}

function load() {
  const saved = localStorage.getItem("otDispatch_v3");
  if (saved) {
    Object.assign(state, JSON.parse(saved));
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
  renderRoster("mechanic");
  renderRoster("helper");
};

// =========================
// SCREEN SWITCHING
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
    renderRoster("mechanic");
    renderRoster("helper");
  }

  if (screen === "history") {
    document.getElementById("historyScreen").classList.add("activeScreen");
    renderHistory();
  }

  if (screen === "personHistory") {
    document.getElementById("personHistoryScreen").classList.add("activeScreen");
  }

  save();
}

// =========================
// TITLE EDIT
// =========================

function editTitle() {
  const name = prompt("Edit title:", state.title);
  if (!name) return;

  state.title = name.trim();
  document.getElementById("appTitle").innerText = state.title;

  save();
}

// =========================
// MAIN UI
// =========================

function updateUI() {

  document.getElementById("mechanicName").innerText =
    state.mechanics[0] || "None";

  document.getElementById("helperName").innerText =
    state.helpers[0] || "None";
}

// =========================
// ROTATION
// =========================

function rotate(list) {
  if (list.length > 1) {
    list.push(list.shift());
  }
}

// =========================
// VOTING + HISTORY LOG
// =========================

function vote(type, action) {

  const list = type === "mechanic"
    ? state.mechanics
    : state.helpers;

  const name = list[0];

  state.history.unshift({
    name,
    type,
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
// COUNTS UNDER BUTTONS
// =========================

function count(name, action) {
  return state.history.filter(h =>
    h.name === name && h.action === action
  ).length;
}

function updateCounts() {

  const mech = state.mechanics[0] || "";
  const help = state.helpers[0] || "";

  document.getElementById("mechAcceptCount").innerText = count(mech, "accept");
  document.getElementById("mechDeclineCount").innerText = count(mech, "decline");
  document.getElementById("mechNACount").innerText = count(mech, "na");

  document.getElementById("helpAcceptCount").innerText = count(help, "accept");
  document.getElementById("helpDeclineCount").innerText = count(help, "decline");
  document.getElementById("helpNACount").innerText = count(help, "na");
}

// =========================
// HISTORY RENDER (FIXED)
// =========================

function renderHistory() {

  const container = document.getElementById("historyList");
  container.innerHTML = "";

  if (!state.history.length) {
    container.innerHTML = "<p style='opacity:0.6'>No history yet</p>";
    return;
  }

  const grouped = {};

  state.history.forEach(entry => {
    if (!grouped[entry.name]) grouped[entry.name] = [];
    grouped[entry.name].push(entry);
  });

  Object.keys(grouped).forEach(name => {

    const entries = grouped[name];

    const accept = entries.filter(e => e.action === "accept").length;
    const decline = entries.filter(e => e.action === "decline").length;
    const na = entries.filter(e => e.action === "na").length;

    const card = document.createElement("div");
    card.className = "historyCard";

    card.innerHTML = `
      <div class="historyName">${name}</div>
      <div class="historyTotals">
        ✔ ${accept} | ✖ ${decline} | ? ${na}
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

  showScreen("personHistory");

  document.getElementById("historyPersonName").innerText = name;

  const container = document.getElementById("personHistoryList");
  container.innerHTML = "";

  const entries = state.history
    .filter(h => h.name === name)
    .sort((a, b) => new Date(b.time) - new Date(a.time));

  entries.forEach(entry => {

    let icon = "❓";
    if (entry.action === "accept") icon = "✔️";
    if (entry.action === "decline") icon = "✖️";

    const div = document.createElement("div");
    div.className = "historyEntry";

    div.innerHTML = `
      <div class="historyDate">${entry.time}</div>
      <div class="historyAction">${icon} ${entry.action}</div>
    `;

    container.appendChild(div);
  });
}

// =========================
// ROSTER RENDER (INLINE EDIT)
// =========================

function renderRoster(type) {

  const list = type === "mechanic"
    ? state.mechanics
    : state.helpers;

  const container = document.getElementById(type + "Roster");
  container.innerHTML = "";

  list.forEach((name, index) => {

    const row = document.createElement("div");
    row.className = "rosterRow";

    const nameEl = document.createElement("div");
    nameEl.className = "rosterName";
    nameEl.innerText = name;

    nameEl.onclick = () => startEdit(type, index, nameEl);

    const del = document.createElement("button");
    del.className = "smallButton deleteButton";
    del.innerText = "🗑";

    del.onclick = () => deletePerson(name);

    row.appendChild(nameEl);
    row.appendChild(del);

    container.appendChild(row);
  });

  const addBtn = document.createElement("button");
  addBtn.className = "menuButton";
  addBtn.innerText = "+ Add " + (type === "mechanic" ? "Mechanic" : "Helper");

  addBtn.onclick = () => addPerson(type);

  container.appendChild(addBtn);
}

// =========================
// INLINE EDIT
// =========================

function startEdit(type, index, element) {

  const input = document.createElement("input");
  input.className = "textInput";
  input.value = element.innerText;

  element.replaceWith(input);
  input.focus();

  function saveEdit() {

    const value = input.value.trim();

    if (value) {
      if (type === "mechanic") {
        state.mechanics[index] = value;
      } else {
        state.helpers[index] = value;
      }
    }

    save();
    updateUI();
    renderRoster(type);
  }

  input.addEventListener("blur", saveEdit);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") input.blur();
  });
}

// =========================
// ADD PERSON
// =========================

function addPerson(type) {

  const name = prompt("Enter name:");
  if (!name) return;

  const clean = name.trim();
  if (!clean) return;

  if (type === "mechanic") {
    state.mechanics.push(clean);
  } else {
    state.helpers.push(clean);
  }

  save();
  renderRoster(type);
}

// =========================
// DELETE PERSON (CLEAN HISTORY)
// =========================

function deletePerson(name) {

  if (!confirm("Delete " + name + "?")) return;

  state.mechanics = state.mechanics.filter(m => m !== name);
  state.helpers = state.helpers.filter(h => h !== name);
  state.history = state.history.filter(h => h.name !== name);

  save();

  updateUI();
  updateCounts();

  renderRoster("mechanic");
  renderRoster("helper");
}

function clearHistory() {
  if (!confirm("Clear ALL history?")) return;

  state.history = [];

  save();
  updateCounts();

  // If history screen is open, refresh it
  if (state.currentScreen === "history") {
    renderHistory();
  }

  if (state.currentScreen === "personHistory") {
    showScreen("history");
  }
}

// =========================
// STARTUP LOG
// =========================

console.log("OT Dispatch v3 fully loaded");
