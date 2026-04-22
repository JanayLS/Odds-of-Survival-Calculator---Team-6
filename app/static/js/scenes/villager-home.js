// VILLAGER HOME HEALING SCENE

// Grabs the scene element from our main HTML document
const villagerHealingScene = document.getElementById("villagerHealingScene");

// 1. ADD YOUR SCENE'S HTML CODE INSIDE THE INNERHTML TEMPLATE LITERAL BELOW
villagerHealingScene.innerHTML = `
    <img id="villagerPortrait" src="" alt="Villager portrait">

    <div id="villagerTreatmentUI">
        <div id="villagerTreatmentLabel">Villager Infection</div>

        <div id="villagerInfectionContainer">
            <div id="villagerInfectionBar"></div>
        </div>

        <div id="villagerInfectionValue">100%</div>
    </div>

    <img id="feverShieldIcon" src="/static/img/misc-images/shield.png" alt="Protected"> 
`

// 2. ADD SCENE SPECIFIC JS HERE -- Do not redeclare global variables/functions that are already in script.js
// If needed, rename your local variables to avoid conflicts with script.js

// Tracks which villager is being treated
let activeVillagerKey = null;

function setActiveVillager(villagerKey) {
    activeVillagerKey = villagerKey;
    gameState.currentVillagerKey = villagerKey;
    renderVillagerScene();
    renderVillagerInfection();
}

function getActiveVillager() {
    if (!activeVillagerKey && gameState.currentVillagerKey) {
        activeVillagerKey = gameState.currentVillagerKey;
    }

    return gameState.villagers[activeVillagerKey];
}

// Shows villager infection level based on which villager is active
function renderVillagerInfection() {
    const villager = getActiveVillager();
    const bar = document.getElementById("villagerInfectionBar");
    const value = document.getElementById("villagerInfectionValue");

    if (!villager || !bar || !value) return;

    bar.style.width = `${villager.infectionLevel}%`;

    if (villager.dead) {
        value.textContent = "Deceased";
    } else if (villager.healed) {
        value.textContent = "Healed";
    } else {
        value.textContent = `${villager.infectionLevel}%`;
    }
}

function renderVillagerScene() {

    if (!activeVillagerKey && gameState.currentVillagerKey) {
        activeVillagerKey = gameState.currentVillagerKey;
    }

    if (!activeVillagerKey) return;

    const villagerData = villagerDatabase[activeVillagerKey];
    const villagerState = gameState.villagers[activeVillagerKey];

    const portrait = document.getElementById("villagerPortrait");

    if (!villagerData || !villagerState || !portrait) return;

    villagerHealingScene.style.backgroundImage = `url('${villagerData.bg}')`;

    if (villagerState.dead) {
        portrait.src = villagerData.portrait_sick;
        portrait.style.opacity = "0.45";
        portrait.style.filter = "grayscale(100%)";
    } else if (villagerState.healed) {
        portrait.src = villagerData.portrait_healthy;
        portrait.style.opacity = "1";
        portrait.style.filter = "none";
    } else {
        portrait.src = villagerData.portrait_sick;
        portrait.style.opacity = "1";
        portrait.style.filter = "none";
    }

    const shield = document.getElementById("feverShieldIcon");

    // If villager is fever suppressed for the day, or has ruby amulet protection, show shield icon
    if (villagerState.amuletProtected) {
        shield.style.display = "block";
        shield.src = "/static/img/misc-images/ruby-shield.png";
    } else if (villagerState.feverSuppressed) {
        shield.style.display = "block";
        shield.src = "/static/img/misc-images/shield.png";
    } else {
        shield.style.display = "none";
    }

}

renderVillagerInfection();

// 3. Go to index.html, scroll to the bottom and add a <script> element linking to this scene's js file
// (Keep the JS script element underneath the data/items.js and script.js elements so they load first)
// NOTE: For this scene I have already attached the <script> element so that I could implement the Villager Infection Bar functionality,
// so this step can be skipped.