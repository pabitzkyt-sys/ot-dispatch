let data = {
  mechanics: ["John Smith", "Dave Brown", "Alex Carter"],
  helpers: ["Mike Jones", "Chris Lee", "Sam White"]
};

// ---------- LOAD ----------
function init() {
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

// ---------- ACTION ----------
function vote(type, action) {

  if (type === "mechanic") {
    rotate(data.mechanics);
  } else {
    rotate(data.helpers);
  }

  updateUI();
}

init();
