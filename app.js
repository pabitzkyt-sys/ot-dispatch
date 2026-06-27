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
//-------COUNT-------
function count(name, action) {
  return data.log.filter(x => x.name === name && x.action === action).length;
}

//-----DELETE PERSON-------
function deletePerson(type, index) {

  const list = type === "mechanic"
    ? data.mechanics
    : data.helpers;

  list.splice(index, 1);

  save();
  renderRoster(type);
}

//------EDIT PERSON-----
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

//-----ADD PERSON-------
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

//---------RENDER ROSTER-----
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

      <button onclick="deletePerson('${type}', ${index})" style="background:red; color:white; border:none; padding:6px 10px; border-radius:8px;">
        🗑️
      </button>

    </div>
  `).join("");
}
//----------OPEN ROSTER---------
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
//---------CLOSE MENU---------
function closeMenu() {
  const menu = document.getElementById("menuOverlay");
  if (menu) menu.remove();
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

// ---------- UPDATE UI ----------
function updateUI() {

  const mech = data.mechanics[0] || "None";
  const help = data.helpers[0] || "None";

  document.getElementById("mechanicName").innerText = mech;
  document.getElementById("helperName").innerText = help;

  const debug = document.getElementById("debug");

  if (!debug) return;

  debug.innerHTML = `
    <div style="padding:10px;">
      <div style="margin-bottom:10px;">
        <b>${mech}</b><br>
        ✅ ${count(mech,"accept")} |
        ❌ ${count(mech,"decline")} |
        ❓ ${count(mech,"na")}
      </div>

      <div>
        <b>${help}</b><br>
        ✅ ${count(help,"accept")} |
        ❌ ${count(help,"decline")} |
        ❓ ${count(help,"na")}
      </div>
    </div>
  `;
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

// ---------- BUTTONS ----------
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

// ---------- SETTINGS ----------
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

// ---------- EDIT ----------
function editNames(type){

  const list = type==="mechanic"
      ? data.mechanics
      : data.helpers;

  const names = prompt(
`Edit ${type}s

Current names:

${list.join("\n")}

Enter the ENTIRE new list.
One name per line.`);

  if(names===null) return;

  const newList =
      names
      .split("\n")
      .map(x=>x.trim())
      .filter(x=>x.length);

  if(newList.length){

      if(type==="mechanic")
          data.mechanics=newList;
      else
          data.helpers=newList;

      save();
      updateUI();
  }

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
            <div style="font-weight:bold; font-size:16px;">
              ${name}
            </div>

            <div style="font-size:12px; opacity:0.8; margin-top:5px;">
              Accepts: ${entries.filter(e=>e.action==="accept").length} |
              Declines: ${entries.filter(e=>e.action==="decline").length} |
              Unavailable: ${entries.filter(e=>e.action==="na").length}
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
console.log("version 2 loaded");
