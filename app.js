
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
  if (saved) Object.assign(state, JSON.parse(saved));
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

  state.currentScreen = screen;
  save();
}

// =========================
// TITLE EDIT
// =========================

function editTitle() {
  const newTitle = prompt("Edit title:", state.title);
  if (!newTitle) return;

  state.title = newTitle.trim();
  document.getElementById("appTitle").innerText = state.title;

  save();
}

// =========================
// MAIN DISPLAY
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
// VOTING
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

  if (state.history.length > 500) state.history.pop();

  rotate(list);

  save();
  updateUI();
  updateCounts();
}

// =========================
// COUNTS
// =========================

function count(name, action) {
  return state.history.filter(
    h => h.name === name && h.action === action
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

    // INLINE EDIT
    nameEl.onclick = () => startEdit(type, index, nameEl);

    const delBtn = document.createElement("button");
    delBtn.className = "smallButton deleteButton";
    delBtn.innerText = "🗑";

    delBtn.onclick = () => deletePerson(name);

    row.appendChild(nameEl);
    row.appendChild(delBtn);

    container.appendChild(row);
  });

  // ADD BUTTON
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
// DELETE PERSON + CLEAN HISTORY
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

// =========================
// BOOT SAFETY
// =========================

console.log("OT Dispatch v3 loaded");
