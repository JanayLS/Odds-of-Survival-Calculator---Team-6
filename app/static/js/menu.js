// file: app/static/js/menu.js

// INITIALIZE HTML ELEMENTS
// --------------------------------------------------------------------------------
// Characters
const villager1 = document.getElementById("villager1");
const worriedVillagerWoman = document.getElementById("worriedVillagerWoman");
const characterName = document.getElementById("characterName");

// Controls current dialogue branch/scene state
let sceneState = "intro";

// Main menu, Arrival Scene, Start Game Button
const mainMenu = document.getElementById("mainMenu");
const arrivalScene = document.getElementById("arrivalScene");
const startGameBtn = document.getElementById("startGameBtn");

// Audio
const menuBgm = document.getElementById("menuBgm"); // <-- your menu.mp3
const bgm = document.getElementById("bgm");         // <-- arrivalMusic.mp3

// Their Music button (we keep ID/style)
const btn = document.getElementById("turn-music-on");

// Choice Box Elements
const choiceBox = document.getElementById("choiceBox");
const choiceButtons = document.querySelectorAll(".choiceBtn");

// Dialogue Box and Text
const dialogueText = document.getElementById("dialogueText");
const arrow = document.getElementById("nextArrow");

// Inventory
const inventoryBtn = document.getElementById("inventoryBtn");
const inventoryPanel = document.getElementById("inventoryPanel");
const inventoryHintArrow = document.getElementById("inventoryHintArrow");

// --------------------------------------------------------------------------------
// AUDIO HELPERS (minimal additions)
// --------------------------------------------------------------------------------
const TARGET_VOL = 0.35;
menuBgm.volume = TARGET_VOL;
bgm.volume = 0.0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const setMuted = (muted) => {
  menuBgm.muted = muted;
  bgm.muted = muted;
  localStorage.setItem("musicMuted", String(muted));
  btn.textContent = muted ? "Music Off" : "Music On";
};

setMuted(localStorage.getItem("musicMuted") === "true");

const tryPlay = async (audioEl) => {
  try {
    await audioEl.play();
    return true;
  } catch (_) {
    return false;
  }
};

const crossfade = async (fromAudio, toAudio, durationMs = 900) => {
  const steps = 18;
  const stepMs = Math.max(16, Math.floor(durationMs / steps));

  const fromStart = fromAudio.volume;
  const toStart = toAudio.volume;

  await tryPlay(toAudio);

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    fromAudio.volume = clamp(fromStart * (1 - t), 0, 1);
    toAudio.volume = clamp(toStart + (TARGET_VOL - toStart) * t, 0, TARGET_VOL);
    await sleep(stepMs);
  }

  fromAudio.pause();
  fromAudio.currentTime = 0;
};

// Start menu music on first user gesture (autoplay-safe)
window.addEventListener("click", () => tryPlay(menuBgm), { once: true });
window.addEventListener("keydown", () => tryPlay(menuBgm), { once: true });

// BUTTONS
// --------------------------------------------------------------------------------
// Music Button Logic (now acts as mute/unmute for both tracks)
btn.addEventListener("click", async () => {
  const nextMuted = !menuBgm.muted;
  setMuted(nextMuted);

  if (!nextMuted) {
    // resume whichever is active
    if (bgm.volume > 0.05) await tryPlay(bgm);
    else await tryPlay(menuBgm);
  }
});

// Inventory Button Logic (frontend kept)
inventoryBtn.addEventListener("click", () => {
  if (inventoryPanel.style.display === "none") {
    inventoryPanel.style.display = "block";
  } else {
    inventoryPanel.style.display = "none";
  }
});

// TRANSITION FROM MENU SCENE TO ARRIVAL/INTRO SCENE
// ----------------------------------------------------------------------------------
// Start the first line after start game button is clicked
startGameBtn.addEventListener("click", async () => {
  // Hide main menu and show Arrival scene
  mainMenu.style.display = "none";
  arrivalScene.style.display = "block";

  // Start audio swap (menu -> arrival)
  await tryPlay(menuBgm);
  await crossfade(menuBgm, bgm);

  // Start villager NPC dialogue
  currentLine = 0;
  dialogueText.innerHTML = "";
  typeLine(dialogueLines[currentLine]);
});

// DIALOGUE SYSTEM AND CHOICES
// ------------------------------------------------------------------------------------
// Navigation Arrow behavior
arrow.addEventListener("click", nextDialogue);

// Intro Scene Dialogue Lines (Villager 1 Opening Sequence)
const dialogueLines = [
  "Doctor...thank the Heavens you've arrived.",
  "Our people are sick. Some are dying.",
  "Rats roam our streets at night.",
  "If you cannot save us...no one will.",
];

// Dialogue Typing Behavior
let currentLine = 0;
let isTyping = false;
let typingSpeed = 30;

// Typing Animation for Dialogue Text
function typeLine(line) {
  dialogueText.textContent = "";
  arrow.style.opacity = 0;
  let i = 0;
  isTyping = true;

  const interval = setInterval(() => {
    dialogueText.textContent += line.charAt(i);
    i++;

    if (i >= line.length) {
      clearInterval(interval);
      isTyping = false;
      arrow.style.opacity = 1;
    }
  }, typingSpeed);
}

// Advances dialogue based on choice selection/current scene state
function nextDialogue() {
  if (isTyping) return;

  // Intro
  if (sceneState === "intro") {
    currentLine++;

    if (currentLine < dialogueLines.length) {
      typeLine(dialogueLines[currentLine]);
    } else {
      arrow.style.opacity = 0;
      choiceBox.style.display = "flex";
    }
  } else if (sceneState === "villagers") {
    arrow.style.opacity = 0;

    choiceBox.innerHTML = `
      <button class="choiceBtn">Heal Villager in Home</button>
      <button class="choiceBtn">Pray at Chapel</button>`;

    choiceBox.style.display = "flex";
  } else if (sceneState === "rats") {
    arrow.style.opacity = 0;

    choiceBox.innerHTML = `
      <button class="choiceBtn">Fight Rats</button>
      <button class="choiceBtn">Shop for Weapons/Rat Poison</button>`;

    choiceBox.style.display = "flex";
  } else if (sceneState === "supplies") {
    arrow.style.opacity = 0;

    choiceBox.innerHTML = `
      <button class="choiceBtn">Search Forest for Ingredients</button>
      <button class="choiceBtn">Brew Potions</button>`;

    choiceBox.style.display = "flex";
  }
}

// Choice Navigation
choiceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const choice = button.dataset.choice;
    choiceBox.style.display = "none";

    if (choice === "villagers") {
      sceneState = "villagers";
      currentLine = 0;

      characterName.textContent = "Worried Wife:";

      villager1.style.opacity = 0;
      worriedVillagerWoman.style.opacity = 1;

      setTimeout(() => {
        typeLine("Doctor...my husband hasn't woken in two days...");
      }, 600);
    } else if (choice === "rats") {
      sceneState = "rats";
      currentLine = 0;

      typeLine(
        "The rats are the plague itself. They scurry through our village, infecting our people. One bite can mean death..."
      );
    } else if (choice === "supplies") {
      sceneState = "supplies";
      currentLine = 0;

      characterName.textContent = "";

      inventoryBtn.style.display = "block";
      inventoryHintArrow.style.opacity = "1";

      setTimeout(() => {
        inventoryHintArrow.style.opacity = "0";
      }, 4000);

      typeLine(`You check your satchel. Your supplies are limited. To create cures, you must gather ingredients from the forest.
Each potion requires careful preparation. Mistakes may cost lives -- including your own.`);
    }
  });
});