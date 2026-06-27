let data = {
  mechanics: ["John Smith", "Dave Brown", "Alex Carter"],
  helpers: ["Mike Jones", "Chris Lee", "Sam White"],
  log: []
};

// ---------- LOAD ----------
function load() {
  const saved = localStorage.getItem("otDispatch");
  if (saved) data = JSON.parse(saved);
}

// ---------- SAVE ----------
function save() {
  localStorage.setItem("otDispatch", JSON.stringify(data));
}

// ---------- INIT ----------
function init() {
  load();
  updateUI();
}

// ---------- COUNT ----------
function count(name, action) {
  return data.log.filter(x => x.name === name && x.action === action).length;
}

// ---------- UPDATE UI ----------
function updateUI() {

  const mech = data.mechanics[0] || "None";
  const help = data.helpers[0] || "None";

  document.getElementById("mechanicName").innerText = mech;
  document.getElementById("helperName").innerText = help;

  document.getElementById("mechanicStats").innerText =
    `❌ ${count(mech,"decline")}   ❓ ${count(mech,"na")}   ✅ ${count(mech,"accept")}`;

  document.getElementById("helperStats").innerText =
    `❌ ${count(help,"decline")}   ❓ ${count(help,"na")}   ✅ ${count(help,"accept")}`;
}

// ---------- ROTATE ----------
function rotate(list) {
  if (list.length > 1) {
    list.push(list.shift());
  }
}

// ---------- LOG ----------
function addLog(type, name, action) {
  data.log.unshift({
    type,
    name,
    action,
    time: new Date().toLocaleString()
  });

  if (data.log.length > 500) {
    data.log.pop();
  }
}

// ---------- VOTE ----------
function vote(type, action) {

  const list = type === "mechanic"
    ? data.mechanics
    : data.helpers;

  const name = list[0];

  addLog(type, name, action);

  rotate(list);

  save();
  updateUI();
}

// ---------- MENU ----------
function openMenu() {

  const old = document.getElementById("menuOverlay");
  if (old) old.remove();

  const overlay = document.createElement("div");
  overlay.id = "menuOverlay";

  overlay.innerHTML = `
    <div class="menuPanel">

      <div class="menuTitle">⚙️ Settings</div>

      <button onclick="openRosterEditor('mechanic')">👷 Mechanics</button>
      <button onclick="openRosterEditor('helper')">🧰 Helpers</button>
      <button onclick="showHistory()">📋 History</button>

      <button onclick="closeMenu()" class="closeBtn">Close</button>

    </div>
  `;

  document.body.appendChild(overlay);
}

// ---------- CLOSE MENU ----------
function closeMenu() {
  const menu = document.getElementById("menuOverlay");
  if (menu) menu.remove();
}

// ---------- ROSTER EDITOR ----------
function openRosterEditor(type) {

  closeMenu();

  const overlay = document.createElement("div");
  overlay.id = "menuOverlay";

  overlay.innerHTML = `
    <div class="menuPanel">

      <div class="menuTitle">
        ${type === "mechanic" ? "👷 Mechanics" : "🧰 Helpers"}
      </div>

      <button onclick="addPerson('${type}')">➕ Add Person</button>

      <div id="rosterList"></div>

      <button onclick="closeMenu()" class="closeBtn">Done</button>

    </div>
  `;

  document.body.appendChild(overlay);

  renderRoster(type);
}

// ---------- ROSTER RENDER ----------
function renderRoster(type) {

  const list = type === "mechanic"
    ? data.mechanics
    : data.helpers;

  const container = document.getElementById("rosterList");

  container.innerHTML = list.map((name, index) => `
    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      padding:10px;
      background:#222;
      border-radius:10px;
      margin-top:8px;
    ">

      <span onclick="editPerson('${type}', ${index})" style="flex:1; text-align:left;">
        ${name}
      </span>

      <button onclick="deletePerson('${type}', ${index})"
        style="background:red; color:white; border:none; padding:6px 10px; border-radius:8px;">
        🗑️
      </button>

    </div>
  `).join("");
}

// ---------- ADD PERSON ----------
function addPerson(type) {

  const name = prompt("Enter name:");
  if (!name) return;

  const list = type === "mechanic"
    ? data.mechanics
    : data.helpers;

  list.push(name.trim());

  save();
  renderRoster(type);
}

// ---------- EDIT PERSON ----------
function editPerson(type, index) {

  const list = type === "mechanic"
    ? data.mechanics
    : data.helpers;

  const newName = prompt("Edit name:", list[index]);
  if (!newName) return;

  list[index] = newName.trim();

  save();
  renderRoster(type);
}

// ---------- DELETE PERSON ----------
function deletePerson(type, index) {

  const list = type === "mechanic"
    ? data.mechanics
    : data.helpers;

  list.splice(index, 1);

  save();
  renderRoster(type);
}

// ---------- HISTORY ----------
function showHistory() {

  const old = document.getElementById("menuOverlay");
  if (old) old.remove();

  const overlay = document.createElement("div");
  overlay.id = "menuOverlay";

  const grouped = {};

  data.log.forEach(entry => {
    if (!grouped[entry.name]) grouped[entry.name] = [];
    grouped[entry.name].push(entry);
  });

  overlay.innerHTML = `
    <div class="menuPanel" style="max-height:80vh; overflow:auto;">

      <div class="menuTitle">📋 History</div>

      ${Object.keys(grouped).map(name => {

        const entries = grouped[name];

        return `
          <div style="background:#222; padding:10px; border-radius:10px; margin-top:10px;">
            <div style="font-weight:bold;">
              ${name}
            </div>

            <div style="font-size:12px; opacity:0.8;">
              ✅ ${entries.filter(e=>e.action==="accept").length} |
              ❌ ${entries.filter(e=>e.action==="decline").length} |
              ❓ ${entries.filter(e=>e.action==="na").length}
            </div>
          </div>
        `;
      }).join("")}

      <button onclick="closeMenu()" class="closeBtn" style="margin-top:15px;">
        Close
      </button>

    </div>
  `;

  document.body.appendChild(overlay);
}

init();
console.log("OT Dispatch loaded");
