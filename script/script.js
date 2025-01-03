let xp = parseInt(localStorage.getItem("xp")) || 0;
let health = parseInt(localStorage.getItem("health")) || 100;
let gold = parseInt(localStorage.getItem("gold")) || 50;
let currentWeaponIndex = parseInt(localStorage.getItem("currentWeaponIndex")) || 0;
let fighting;
let monsterHealth;
let inventory = JSON.parse(localStorage.getItem("inventory")) || ["stick"];

const button1 = document.querySelector('#button1');
const button2 = document.querySelector("#button2");
const button3 = document.querySelector("#button3");
const text = document.querySelector("#text");
const xpText = document.querySelector("#xpText");
const healthText = document.querySelector("#healthText");
const goldText = document.querySelector("#goldText");
const monsterStats = document.querySelector("#monsterStats");
const monsterName = document.querySelector("#monsterName");
const monsterHealthText = document.querySelector("#monsterHealth");
const weapons = [
  { name: 'stick', power: 5 },
  { name: 'dagger', power: 30 },
  { name: 'claw hammer', power: 50 },
  { name: 'sword', power: 100 }
];
const monsters = [
    { name: "slime", level: 2, health: 15 },
    { name: "fanged beast", level: 8, health: 60 },
    { name: "dragon", level: 20, health: 300 }
];
const locations = [
  {
    name: "town square",
    "button text": ["Go to store", "Go to cave", "Fight dragon"],
    "button functions": [goStore, goCave, fightDragon],
    text: "You are in the town square. You see a sign that says \"Store\"."
  },
  {
    name: "store",
    "button text": ["Buy 10 health (10 gold)", "Buy weapon (30 gold)", "Go to town square"],
    "button functions": [buyHealth, buyWeapon, goTown],
    text: "You enter the store."
  },
  {
    name: "cave",
    "button text": ["Fight slime", "Fight fanged beast", "Go to town square"],
    "button functions": [fightSlime, fightBeast, goTown],
    text: "You enter the cave. You see some monsters."
  },
  {
    name: "fight",
    "button text": ["Attack", "Dodge", "Run"],
    "button functions": [attack, dodge, goTown],
    text: "You are fighting a monster."
  },
  {
    name: "kill monster",
    "button text": ["Go to town square", "Go to town square", "Go to town square"],
    "button functions": [goTown, goTown, easterEgg],
    text: 'The monster screams "Arg!" as it dies. You gain experience points and find gold.'
  },
  {
    name: "lose",
    "button text": ["REPLAY?", "REPLAY?", "REPLAY?"],
    "button functions": [restart, restart, restart],
    text: "You die. &#x2620;"
  },
  {
    name: "win",
    "button text": ["REPLAY?", "REPLAY?", "REPLAY?"],
    "button functions": [restart, restart, restart],
    text: "You defeat the dragon! YOU WIN THE GAME! &#x2620;"
  },
  {
    name: "easter egg",
    "button text": ["2", "8", "Go to town square?"],
    "button functions": [pickTwo, pickEight, goTown],
    text: "You find a secret game. Pick a number above. Ten numbers will be randomly chosen between 0 and 10. If the number you choose matches one of the random numbers, you win!"
  }
];

button1.onclick = goStore;
button2.onclick = goCave;
button3.onclick = fightDragon;
xpText.innerText = xp;
healthText.innerText = health;
goldText.innerText = gold;

function saveGameState() {
  localStorage.setItem("xp", xp);
  localStorage.setItem("health", health);
  localStorage.setItem("gold", gold);
  localStorage.setItem("currentWeaponIndex", currentWeaponIndex);
  localStorage.setItem("inventory", JSON.stringify(inventory));
}

function update(location) {
  monsterStats.style.display = "none";
  button1.innerText = location["button text"][0];
  button2.innerText = location["button text"][1];
  button3.innerText = location["button text"][2];
  button1.onclick = location["button functions"][0];
  button2.onclick = location["button functions"][1];
  button3.onclick = location["button functions"][2];
  text.innerText = location.text;
}

function goTown() { update(locations[0]); }
function goStore() { update(locations[1]); }
function goCave() { update(locations[2]); }

function buyHealth() {
  if (gold >= 10) {
    gold -= 10;
    health += 10;
    goldText.innerText = gold;
    healthText.innerText = health;
    saveGameState();
  } else {
    text.innerText = "You do not have enough gold to buy health.";
  }
}

function buyWeapon() {
  if (currentWeaponIndex < weapons.length - 1) {
    if (gold >= 30) {
      gold -= 30;
      currentWeaponIndex++;
      goldText.innerText = gold;
      let newWeapon = weapons[currentWeaponIndex].name;
      text.innerText = "You now have a " + newWeapon + ".";
      inventory.push(newWeapon);
      text.innerText += " In your inventory you have: " + inventory;
      saveGameState();
    } else {
      text.innerText = "You do not have enough gold to buy a weapon.";
    }
  } else {
    text.innerText = "You already have the most powerful weapon!";
    button2.innerText = "Sell weapon for 15 gold";
    button2.onclick = sellWeapon;
  }
}

function sellWeapon() {
  if (inventory.length > 1) {
    gold += 15;
    goldText.innerText = gold;
    let currentWeapon = inventory.shift();
    text.innerText = "You sold a " + currentWeapon + ".";
    text.innerText += " In your inventory you have: " + inventory;
    saveGameState();
  } else {
    text.innerText = "Don't sell your only weapon!";
  }
}

function fightSlime() { fighting = 0; goFight(); }
function fightBeast() { fighting = 1; goFight(); }
function fightDragon() { fighting = 2; goFight(); }

function goFight() {
  update(locations[3]);
  monsterHealth = monsters[fighting].health;
  monsterStats.style.display = "block";
  monsterName.innerText = monsters[fighting].name;
  monsterHealthText.innerText = monsterHealth;
}

function attack() {
  text.innerText = "The " + monsters[fighting].name + " attacks.";
  text.innerText += " You attack it with your " + weapons[currentWeaponIndex].name + ".";
  health -= getMonsterAttackValue(monsters[fighting].level);
  if (isMonsterHit()) {
    monsterHealth -= weapons[currentWeaponIndex].power + Math.floor(Math.random() * xp) + 1;
  } else {
    text.innerText += " You miss.";
  }
  healthText.innerText = health;
  monsterHealthText.innerText = monsterHealth;
  if (health <= 0) {
    lose();
  } else if (monsterHealth <= 0) {
    fighting === 2 ? winGame() : defeatMonster();
  }
  if (Math.random() <= 0.1 && inventory.length !== 1) {
    text.innerText += " Your " + inventory.pop() + " breaks.";
    currentWeaponIndex--;
  }
  saveGameState();
}

function getMonsterAttackValue(level) { return level * 5 - Math.floor(Math.random() * xp); }
function isMonsterHit() { return Math.random() > 0.2 || health < 20; }
function dodge() { text.innerText = "You dodge the attack from the " + monsters[fighting].name + "."; }
function defeatMonster() { gold += Math.floor(monsters[fighting].level * 6.7); xp += monsters[fighting].level; goldText.innerText = gold; xpText.innerText = xp; update(locations[4]); saveGameState(); }
function lose() { update(locations[5]); localStorage.clear(); }
function restart() { xp = 0; health = 100; gold = 50; currentWeaponIndex = 0; inventory = ["stick"]; goldText.innerText = gold; healthText.innerText = health; xpText.innerText = xp; saveGameState(); goTown(); }
function winGame() { update(locations[6]); }

function easterEgg() { update(locations[7]); }
function pickTwo() { pick(2); }
function pickEight() { pick(8); }

function pick(guess) {
  let numbers = [];
  while (numbers.length < 10) { numbers.push(Math.floor(Math.random() * 11)); }
  text.innerText = "You picked " + guess + ". Here are the random numbers:\n";
  text.innerText += numbers.join("\n");
  text.innerText += numbers.includes(guess) ? "\nRight! You win 20 gold!" : "\nWrong! You lose 10 health!";
  numbers.includes(guess) ? gold += 20 : health -= 10;
  goldText.innerText = gold;
  healthText.innerText = health;
  saveGameState();
}

function fetchData() {
  fetch("https://jsonplaceholder.typicode.com/posts/1")
    .then(response => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then(data => {
      text.innerText += `\nFetched Data: ${data.title}`;
    })
    .catch(error => {
      text.innerText += `\nError fetching data: ${error.message}`;
    });
}

function ajaxRequest() {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "https://jsonplaceholder.typicode.com/posts/2", true);
  xhr.onload = function () {
    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      text.innerText += `\nAJAX Data: ${data.title}`;
    } else {
      text.innerText += `\nError with AJAX: ${xhr.status}`;
    }
  };
  xhr.onerror = function () {
    text.innerText += "\nError with AJAX request";
  };
  xhr.send();
}

async function fetchAsync() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts/3");
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    text.innerText += `\nAsync/Await Data: ${data.title}`;
  } catch (error) {
    text.innerText += `\nAsync/Await Error: ${error.message}`;
  }
}

function usePromises() {
  new Promise((resolve, reject) => {
    const success = Math.random() > 0.5;
    setTimeout(() => (success ? resolve("Promise Resolved") : reject("Promise Rejected")), 1000);
  })
    .then(message => {
      text.innerText += `\n${message}`;
    })
    .catch(error => {
      text.innerText += `\n${error}`;
    });
}

button1.onclick = function () {
  goStore();
  fetchData();
};
button2.onclick = function () {
  goCave();
  ajaxRequest();
};
button3.onclick = function () {
  fightDragon();
  fetchAsync();
  usePromises();
};

