// ==============================
// file: app/static/js/gameState.js
// ==============================

const gameState = {
    day: 1,
    actionTokens: 7,
    inventory: [],
    money: 5,
    ratsKilled: 0,
    ratsToKill: 0,
    villagersHealed: 0,
    villagersToHeal: 0,
    currentScene: "mainMenu",
    doctorInfection: 50,
    doctorPoison: 0,
    sceneState: "intro",
    startItemsGiven: false,

    villagers: {
        villager1: {
            name: "Villager Name 1",
            infectionLevel: 70,
            dead: false,
            healed: false,
            bg: "/static/img/backgrounds/villager-home-1.png",
            portrait: "/static/img/characters/villager1.png"
        },
        villager2: {
            name: "Villager Name 2",
            infectionLevel: 90,
            dead: false,
            healed: false,
            bg: "/static/img/backgrounds/villager-home-2.png",
            portrait: "/static/img/characters/villager2.png"
        },
        villager3: {
            name: "Villager Name 3",
            infectionLevel: 60,
            dead: false,
            healed: false,
            bg: "/static/img/backgrounds/villager-home-3.png",
            portrait: "/static/img/characters/villager3.png"
        },
        villager4: {
            name: "Villager Name 4",
            infectionLevel: 60,
            dead: false,
            healed: false,
            bg: "/static/img/backgrounds/villager-home-3.png",
            portrait: "/static/img/characters/villager3.png"
        },
        villager5: {
            name: "Villager Name 5",
            infectionLevel: 60,
            dead: false,
            healed: false,
            bg: "/static/img/backgrounds/villager-home-3.png",
            portrait: "/static/img/characters/villager3.png"
        }
    },

    rats: {
        rat1: { hp: 100, dead: false },
        rat2: { hp: 100, dead: false },
        rat3: { hp: 0, dead: true },
        rat4: { hp: 10, dead: false },
        rat5: { hp: 80, dead: false },
        rat6: { hp: 75, dead: false },
        rat7: { hp: 60, dead: false },
        rat8: { hp: 0, dead: true },
        rat9: { hp: 50, dead: false }
    }
};

window.gameState = gameState;
