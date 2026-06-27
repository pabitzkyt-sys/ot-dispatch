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
  document.getElementById("mechanicName").innerText = data.mechanics[0] || "None";
  document.getElementById("helperName").innerText = data.helpers[0] || "None";
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

  console.log("MENU OPENED");

  let old = document.getElementById("menuOverlay");
  if (old) old.remove();

  const overlay = document.createElement("div");
  overlay.id = "menuOverlay";

  overlay.innerHTML = `
    <div style="
      position:fixed;
      top:0;left:0;
      width:100%;height:100%;
      background:black;
      color:white;
      display:flex;
      flex-direction:column;
      justify-content:center;
      align-items:center;
      gap:20px;
      z-index:99999;
    ">

      <h2>MENU TEST</h2>

      <button onclick="alert('mechanic')">Edit Mechanics</button>
      <button onclick="alert('helper')">Edit Helpers</button>
      <button onclick="alert('history')">History</button>
      <button onclick="closeMenu()">Close</button>

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
function showHistory(){

  if(data.log.length===0){
      alert("No history yet.");
      return;
  }

  const text=data.log
      .map(x=>`${x.time}\n${x.type}: ${x.name} (${x.action})`)
      .join("\n\n");

  alert(text);

}

init();
console.log("version 2 loaded");
