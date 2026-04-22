/* static/js/core/gameState.js */
const gameState = {
    day: 1,
    maxDays: 20,

    actionTokens: 10,
    maxActionTokens: 10,

    inventory: [],
    money: 0,

    shopItems: [],

    ratsKilled: 0,
    ratsToKill: 0,

    villagersHealed: 0,
    villagersToHeal: 0,

    currentScene: "arrivalScene",
    currentVillagerKey: null,
    currentRatKey: null,

    askedVillagers: false,
    askedRats: false,
    askedSupplies: false,

    doctorInfection: 0,

    sceneState: "intro",
    currentLine: 0,
    startItemsGiven: false,

    villagers: {
        villager1: { active: false, healed: false, infectionLevel: 85, feverSuppressed: false, amuletProtected: false, dead: false },
        villager2: { active: false, healed: false, infectionLevel: 85, feverSuppressed: false, amuletProtected: false, dead: false },
        villager3: { active: false, healed: false, infectionLevel: 85, feverSuppressed: false, amuletProtected: false, dead: false },
        villager4: { active: false, healed: false, infectionLevel: 85, feverSuppressed: false, amuletProtected: false, dead: false },
        villager5: { active: false, healed: false, infectionLevel: 85, feverSuppressed: false, amuletProtected: false, dead: false },
        villager6: { active: false, healed: false, infectionLevel: 85, feverSuppressed: false, amuletProtected: false, dead: false },
        villager7: { active: false, healed: false, infectionLevel: 85, feverSuppressed: false, amuletProtected: false, dead: false },
        villager8: { active: false, healed: false, infectionLevel: 85, feverSuppressed: false, amuletProtected: false, dead: false },
        villager9: { active: false, healed: false, infectionLevel: 85, feverSuppressed: false, amuletProtected: false, dead: false },
        villager10:{ active: false, healed: false, infectionLevel: 85, feverSuppressed: false, amuletProtected: false, dead: false }
    },

    rats: {
        rat1: { hp: 100, dead: false, weakened: false },
        rat2: { hp: 100, dead: false, weakened: false },
        rat3: { hp: 100, dead: false, weakened: false },
        rat4: { hp: 100, dead: false, weakened: false },
        rat5: { hp: 100, dead: false, weakened: false }
    }
};

window.gameState = gameState;

/* static/js/core/saveLoad.js */
async function saveGame() {
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

    return data;
}

function restoreLoadedGameState() {
    if (typeof renderMoney === "function") renderMoney();
    if (typeof renderActionTokens === "function") renderActionTokens();
    if (typeof renderDay === "function") renderDay();
    if (typeof renderDoctorInfection === "function") renderDoctorInfection();
    if (typeof renderInventory === "function") renderInventory();
    if (typeof updateObjectivePanel === "function") updateObjectivePanel();
    if (typeof updateVillageVisual === "function") updateVillageVisual();

    if (typeof sceneState !== "undefined") {
        sceneState = gameState.sceneState || "intro";
    }

    if (typeof currentLine !== "undefined") {
        currentLine = Number.isInteger(gameState.currentLine) ? gameState.currentLine : 0;
    }

    if (typeof startItemsGiven !== "undefined") {
        startItemsGiven = !!gameState.startItemsGiven;
    }

    if (typeof showScene === "function") {
        showScene(gameState.currentScene || "arrivalScene");
    }

    if (gameState.currentVillagerKey && typeof setActiveVillager === "function") {
        setActiveVillager(gameState.currentVillagerKey);
    }

    if (gameState.currentRatKey && typeof setActiveRat === "function") {
        setActiveRat(gameState.currentRatKey);
    }

    const onArrivalScene = gameState.currentScene === "arrivalScene";
    if (onArrivalScene && typeof handleArrivalSceneReturn === "function") {
        handleArrivalSceneReturn();
    }

    if (
        onArrivalScene &&
        !gameState.askedVillagers &&
        !gameState.askedRats &&
        !gameState.askedSupplies &&
        typeof dialogueText !== "undefined" &&
        typeof typeLine === "function"
    ) {
        dialogueText.innerHTML = "";
        typeLine(dialogueLines[gameState.currentLine || 0] || dialogueLines[0]);
    }
}

async function loadGame(options = {}) {
    const { silent = false } = options;

    const response = await fetch("/api/load-game", {
        method: "GET",
        headers: {
            "Accept": "application/json"
        },
        credentials: "same-origin"
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 404) {
        throw new Error(data.error || "No saved game found");
    }

    if (!response.ok) {
        throw new Error(data.error || "Failed to load game");
    }

    Object.assign(gameState, data);
    restoreLoadedGameState();

    if (!silent) {
        alert("Game loaded.");
    }

    return data;
}

window.saveGame = saveGame;
window.loadGame = loadGame;
window.restoreLoadedGameState = restoreLoadedGameState;

/* static/js/core/main.js */
/* replace your save/load button listeners + login success path with this */

saveLoadBtn.addEventListener("click", () => {
    saveLoadOverlay.classList.remove("hidden");
});

closeSaveLoadBtn.addEventListener("click", () => {
    saveLoadOverlay.classList.add("hidden");
});

saveLoadOverlay.addEventListener("click", (e) => {
    if (e.target === saveLoadOverlay) {
        saveLoadOverlay.classList.add("hidden");
    }
});

saveGameBtn.addEventListener("click", async () => {
    try {
        gameState.currentScene = gameState.currentScene || "arrivalScene";
        gameState.sceneState = sceneState;
        gameState.currentLine = currentLine;
        gameState.startItemsGiven = startItemsGiven;

        await saveGame();
        saveLoadOverlay.classList.add("hidden");
        alert("Game saved.");
    } catch (error) {
        console.error("Save failed:", error);
        alert(error.message || "Failed to save game.");
    }
});

loadGameBtn.addEventListener("click", async () => {
    try {
        await loadGame();
        saveLoadOverlay.classList.add("hidden");
    } catch (error) {
        console.error("Load failed:", error);
        alert(error.message || "Failed to load game.");
    }
});

/* keep your existing startGame, but make it sync the saveable fields */
async function startGame() {
    initializeNewGameMoney();
    sceneState = "intro";
    currentLine = 0;
    startItemsGiven = false;

    gameState.sceneState = sceneState;
    gameState.currentLine = currentLine;
    gameState.startItemsGiven = startItemsGiven;
    gameState.currentScene = "arrivalScene";

    showScene("arrivalScene");
    dialogueText.innerHTML = "";
    typeLine(dialogueLines[currentLine]);
}

/* replace only the SUCCESS branch inside loginForm submit */
loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = (loginUsername?.value || "").trim();
    const password = (loginPassword?.value || "").trim();
    const create = createAccount?.checked === true;

    if (!username || !password) {
        if (loginError) {
            loginError.textContent = "Enter username and password.";
            loginError.style.display = "block";
        }
        return;
    }

    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify({ username, password, create })
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            throw new Error(data.error || `Login failed (${res.status})`);
        }

        hideLogin();

        try {
            await loadGame({ silent: true });
        } catch (loadError) {
            const noSave =
                String(loadError.message || "").toLowerCase().includes("no saved game") ||
                String(loadError.message || "").toLowerCase().includes("404");

            if (noSave) {
                await startGame();
            } else {
                throw loadError;
            }
        }
    } catch (err) {
        console.error("Login failed:", err);

        if (loginError) {
            loginError.textContent = err?.message || "Login failed";
            loginError.style.display = "block";
        } else {
            alert(err?.message || "Login failed");
        }
    }
});

/* optional small helpers if you do not already have them elsewhere */
function renderActionTokens() {
    const el = document.getElementById("actionTokensValue");
    if (!el) return;
    el.textContent = `${gameState.actionTokens} / ${gameState.maxActionTokens}`;
}

function renderDay() {
    const el = document.getElementById("dayValue");
    if (!el) return;
    el.textContent = `${gameState.day} / ${gameState.maxDays}`;
}