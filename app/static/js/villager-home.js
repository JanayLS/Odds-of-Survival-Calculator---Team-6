// VILLAGER HOME HEALING SCENE

// Grabs the scene element from our main HTML document
const villagerHealingScene = document.getElementById("villagerHealingScene");

// 1. ADD YOUR SCENE'S HTML CODE INSIDE THE INNERHTML TEMPLATE LITERAL BELOW
villagerHealingScene.innerHTML = `
    <!-- Villager Treatment UI -->
    <div id="villagerTreatmentUI">
        <div id="villagerTreatmentLabel">Villager Infection</div>

        <div id="villagerInfectionContainer">
            <div id="villagerInfectionBar"></div>
        </div>

        <div id="villagerInfectionValue">100%</div>
    </div>
`

// 2. ADD SCENE SPECIFIC JS HERE -- Do not redeclare global variables/functions that are already in script.js
// If needed, rename your local variables to avoid conflicts with script.js

// Tracks which villager is being treated
let activeVillagerKey = "villager1";

function getActiveVillager() {
    return gameState.villagers[activeVillagerKey];
}

// Shows villager infection level based on which villager is active
function renderVillagerInfection() {
    const villager = getActiveVillager();
    const bar = document.getElementById("villagerInfectionBar");
    const value = document.getElementById("villagerInfectionValue");

    if (!villager || !bar || !value) return;

    bar.style.width = `${villager.infectionLevel}%`;
    value.textContent = `${villager.infectionLevel}%`;
}

renderVillagerInfection();

// 3. Go to index.html, scroll to the bottom and add a <script> element linking to this scene's js file
// (Keep the JS script element underneath the data/items.js and script.js elements so they load first)
// NOTE: For this scene I have already attached the <script> element so that I could implement the Villager Infection Bar functionality,
// so this step can be skipped.