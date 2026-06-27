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
//----- DELETE PERSON-------
function deletePerson(type, index) {

  const list = type === "mechanic"
    ? data.mechanics
    : data.helpers;

  const name = list[index];

  if (!confirm(`Delete ${name} AND all their history?`)) return;

  // remove from roster
  list.splice(index, 1);

  // remove all log entries for that person
  data.log = data.log.filter(entry => entry.name !== name);

  save();

  renderRoster(type);
  updateUI();
}

// ---------- INIT ----------
function init() {
  load();
  updateUI();
}
//----CLEAR HISTORY---
function clearHistory() {
  if (!confirm("Clear ALL history?")) return;

  data.log = [];
  save();

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

  document.getElementById("mechDecline").innerText = count(mech,"decline");
  document.getElementById("mechNA").innerText = count(mech,"na");
  document.getElementById("mechAccept").innerText = count(mech,"accept");

  document.getElementById("helpDecline").innerText = count(help,"decline");
  document.getElementById("helpNA").innerText = count(help,"na");
  document.getElementById("helpAccept").innerText = count(help,"accept");
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

  if (data.log.length > 500) data.log.pop();
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
      <button onclick="clearHistory()">🧹 Clear History</button>

      <button onclick="closeMenu()" class="closeBtn">Close</button>

    </div>
  `;

  document.body.appendChild(overlay);
}
// ---------- CLOSE ----------
function closeMenu() {
  const el = document.getElementById("menuOverlay");
  if (el) el.remove();
}

// ---------- ROSTER EDITOR ----------
function openRosterEditor(type) {

  closeMenu();

  const list = type === "mechanic"
    ? data.mechanics
    : data.helpers;

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

  if (!container) return;

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

      <span onclick="editPerson('${type}', ${index})" style="flex:1;">
        ${name}
      </span>

      <button onclick="deletePerson('${type}', ${index})"
        style="background:red; color:white; border:none; padding:6px 10px; border-radius:8px;">
        🗑️
      </button>

    </div>
  `).join("");
}

// ---------- HISTORY ----------
function showHistory() {

  closeMenu();

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
            <div style="font-weight:bold;">${name}</div>

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

// ---------- INIT ----------
init();
