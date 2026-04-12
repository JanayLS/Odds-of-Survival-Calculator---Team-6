// file: app/static/js/saveLoad.js

console.log("saveLoad.js loaded");

function getCurrentVisibleSceneId() {
    const visibleScene = Array.from(document.querySelectorAll(".scene")).find(
        (scene) => scene.style.display === "block"
    );

    return visibleScene?.id || "mainMenu";
}

function syncGameStateFromRuntime() {
    console.log("syncGameStateFromRuntime called");

    if (!window.gameState) {
        console.error("window.gameState is missing");
        return;
    }

    gameState.money = typeof window.money === "number" ? window.money : gameState.money;

    gameState.inventory = Array.isArray(window.inventory)
        ? JSON.parse(JSON.stringify(window.inventory))
        : gameState.inventory;

    gameState.doctorInfection =
        typeof window.doctorInfection === "number"
            ? window.doctorInfection
            : gameState.doctorInfection;

    gameState.ratsKilled =
        typeof window.ratsDefeated === "number"
            ? window.ratsDefeated
            : gameState.ratsKilled;

    gameState.ratsToKill =
        typeof window.ratObjective === "number"
            ? window.ratObjective
            : gameState.ratsToKill;

    gameState.villagersHealed =
        typeof window.villagersHealed === "number"
            ? window.villagersHealed
            : gameState.villagersHealed;

    gameState.villagersToHeal =
        typeof window.villagersObjective === "number"
            ? window.villagersObjective
            : gameState.villagersToHeal;

    gameState.sceneState =
        typeof window.sceneState === "string"
            ? window.sceneState
            : gameState.sceneState;

    gameState.startItemsGiven =
        typeof window.startItemsGiven === "boolean"
            ? window.startItemsGiven
            : gameState.startItemsGiven;

    gameState.currentScene = getCurrentVisibleSceneId();

    console.log("gameState ready to save:", gameState);
}

function applyGameStateToRuntime() {
    console.log("applyGameStateToRuntime called");

    if (!window.gameState) {
        console.error("window.gameState is missing");
        return;
    }

    if (typeof gameState.money === "number") {
        window.money = gameState.money;
    }

    if (Array.isArray(gameState.inventory)) {
        window.inventory = JSON.parse(JSON.stringify(gameState.inventory));
    }

    if (typeof gameState.doctorInfection === "number") {
        window.doctorInfection = gameState.doctorInfection;
    }

    if (typeof gameState.ratsKilled === "number") {
        window.ratsDefeated = gameState.ratsKilled;
    }

    if (typeof gameState.ratsToKill === "number") {
        window.ratObjective = gameState.ratsToKill;
    }

    if (typeof gameState.villagersHealed === "number") {
        window.villagersHealed = gameState.villagersHealed;
    }

    if (typeof gameState.villagersToHeal === "number") {
        window.villagersObjective = gameState.villagersToHeal;
    }

    if (typeof gameState.sceneState === "string") {
        window.sceneState = gameState.sceneState;
    }

    if (typeof gameState.startItemsGiven === "boolean") {
        window.startItemsGiven = gameState.startItemsGiven;
    }

    if (typeof window.renderMoney === "function") {
        window.renderMoney();
    }

    if (typeof window.renderInventory === "function") {
        window.renderInventory();
    }

    if (typeof window.renderDoctorInfection === "function") {
        window.renderDoctorInfection();
    }

    if (typeof window.updateObjectivePanel === "function") {
        window.updateObjectivePanel();
    }

    if (typeof window.showScene === "function" && gameState.currentScene) {
        window.showScene(gameState.currentScene);
    }

    console.log("runtime updated from loaded gameState");
}

async function saveGame() {
    console.log("saveGame called");

    if (!window.gameState) {
        throw new Error("gameState is not loaded");
    }

    syncGameStateFromRuntime();

    console.log("sending POST /api/save-game");

    const response = await fetch("/api/save-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(gameState)
    });

    console.log("save response status:", response.status);

    const data = await response.json().catch(() => ({}));
    console.log("save response data:", data);

    if (!response.ok) {
        throw new Error(data.error || "Failed to save game");
    }

    alert("Game saved.");
    return data;
}

async function loadGame() {
    console.log("loadGame called");
    console.log("sending GET /api/load-game");

    const response = await fetch("/api/load-game", {
        method: "GET",
        credentials: "same-origin"
    });

    console.log("load response status:", response.status);

    const data = await response.json().catch(() => ({}));
    console.log("load response data:", data);

    if (!response.ok) {
        throw new Error(data.error || "Failed to load game");
    }

    if (!window.gameState) {
        throw new Error("gameState is not loaded");
    }

    Object.assign(gameState, data);
    applyGameStateToRuntime();

    alert("Game loaded.");
    return gameState;
}

window.saveGame = saveGame;
window.loadGame = loadGame;

const saveGameBtn = document.getElementById("saveGameBtn");
const loadGameBtn = document.getElementById("loadGameBtn");

console.log("buttons found:", { saveGameBtn, loadGameBtn });
console.log("window.gameState:", window.gameState);

saveGameBtn?.addEventListener("click", async () => {
    console.log("SAVE CLICKED");

    try {
        await saveGame();
    } catch (error) {
        console.error("Save failed:", error);
        alert(error.message || "Failed to save game");
    }
});

loadGameBtn?.addEventListener("click", async () => {
    console.log("LOAD CLICKED");

    try {
        await loadGame();
    } catch (error) {
        console.error("Load failed:", error);
        alert(error.message || "Failed to load game");
    }
});