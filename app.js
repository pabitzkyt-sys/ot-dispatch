let data = {
  mechanics: ["John Smith", "Dave Brown", "Alex Carter"],
  helpers: ["Mike Jones", "Chris Lee", "Sam White"],
  log: []
};

// ---------- LOAD ----------
function load() {
  let saved = localStorage.getItem("otDispatch");
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

// ---------- UPDATE UI ----------
function updateUI() {
  document.getElementById("mechanicName").innerText = data.mechanics[0];
  document.getElementById("helperName").innerText = data.helpers[0];
}

// ---------- ROTATE ----------
function rotate(list) {
  list.push(list.shift());
}

// ---------- LOG ----------
function addLog(type, name, action) {
  data.log.unshift({
    type,
    name,
    action,
    time: new Date().toLocaleTimeString()
  });

  if (data.log.length > 200) data.log.pop();
}

// ---------- ACTION ----------
function vote(type, action) {

  let list = type === "mechanic" ? data.mechanics : data.helpers;
  let name = list[0];

  addLog(type, name, action);

  rotate(list);
  save();
  updateUI();
}

init();
