// saveLoad.js
// Replace the entire file with this.

console.log("saveLoad.js loaded");

function getCurrentVisibleSceneId() {
    const visibleScene = Array.from(document.querySelectorAll(".scene")).find(
        scene => scene.style.display === "block"
    );

    return visibleScene?.id || gameState.currentScene || "mainMenu";
}

function syncGameStateFromRuntime() {
    if (!window.gameState) return;

    gameState.currentScene = getCurrentVisibleSceneId();

    if (!Array.isArray(gameState.inventory)) {
        gameState.inventory = [];
    }

    const moneyValue = document.getElementById("moneyValue");
    if (moneyValue) {
        const parsedMoney = Number.parseInt(moneyValue.textContent, 10);
        if (!Number.isNaN(parsedMoney)) {
            gameState.money = parsedMoney;
        }
    }
}

function applyGameStateToRuntime() {
    if (!window.gameState) return;

    if (typeof renderMoney === "function") {
        renderMoney();
    }

    if (typeof renderInventory === "function") {
        renderInventory();
    }

    if (typeof renderDoctorInfection === "function") {
        renderDoctorInfection();
    }

    if (typeof renderVillageInfection === "function") {
        renderVillageInfection();
    }

    if (typeof updateVillageBackground === "function") {
        updateVillageBackground();
    }

    if (typeof updateObjectivePanel === "function") {
        updateObjectivePanel();
    }

    if (typeof renderActionTokens === "function") {
        renderActionTokens();
    }

    if (typeof renderDay === "function") {
        renderDay();
    }

    if (typeof showScene === "function") {
        showScene(gameState.currentScene || "arrivalScene");
    }
}

async function saveGame() {
    syncGameStateFromRuntime();

    const response = await fetch("/api/save-game", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify(gameState)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || "Failed to save game");
    }

    console.log("Game saved:", data);
    return data;
}

async function loadGame() {
    const response = await fetch("/api/load-game", {
        method: "GET",
        headers: {
            "Accept": "application/json"
        },
        credentials: "same-origin"
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || "Failed to load game");
    }

    if (!data || typeof data !== "object") {
        throw new Error("Invalid save data");
    }

    Object.assign(gameState, data);
    applyGameStateToRuntime();

    console.log("Game loaded:", gameState);
    return gameState;
}

window.saveGame = saveGame;
window.loadGame = loadGame;

const saveLoadBtnEl = document.getElementById("saveLoadBtn");
const saveLoadOverlayEl = document.getElementById("saveLoadOverlay");
const saveGameBtnEl = document.getElementById("saveGameBtn");
const loadGameBtnEl = document.getElementById("loadGameBtn");
const closeSaveLoadBtnEl = document.getElementById("closeSaveLoadBtn");

saveLoadBtnEl?.addEventListener("click", () => {
    saveLoadOverlayEl?.classList.remove("hidden");
});

closeSaveLoadBtnEl?.addEventListener("click", () => {
    saveLoadOverlayEl?.classList.add("hidden");
});

saveGameBtnEl?.addEventListener("click", async () => {
    try {
        await saveGame();
        saveLoadOverlayEl?.classList.add("hidden");
        alert("Game saved.");
    } catch (error) {
        console.error("Save failed:", error);
        alert(error.message || "Failed to save game");
    }
});

loadGameBtnEl?.addEventListener("click", async () => {
    try {
        await loadGame();
        saveLoadOverlayEl?.classList.add("hidden");
        alert("Game loaded.");
    } catch (error) {
        console.error("Load failed:", error);
        alert(error.message || "Failed to load game");
    }
});