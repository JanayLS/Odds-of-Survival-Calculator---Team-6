const dialogueText = document.getElementById("dialogueText");
const characterName = document.getElementById("characterName");
const nextArrow = document.getElementById("nextArrow");
const choiceBox = document.getElementById("choiceBox");

const plagueDoctor = document.getElementById("plagueDoctor");

const oldMan = document.getElementById("oldMan");
const woman1 = document.getElementById("woman1");
const woman2 = document.getElementById("woman2");

const effectPopup = document.getElementById("effectPopup");
const effectPopupText = document.getElementById("effectPopupText");
const closeEffectPopupBtn = document.getElementById("closeEffectPopupBtn");
const leaveChapelBtn = document.getElementById("leaveChapelBtn");

const reflectionTimerBox = document.getElementById("reflectionTimerBox");
const reflectionTimerText = document.getElementById("reflectionTimerText");

let dialogueIndex = 0;
let actionCompleted = false;

/* Plague level only */
let plagueLevel = parseInt(localStorage.getItem("plagueLevel")) || 50;

function savePlagueLevel() {
  localStorage.setItem("plagueLevel", plagueLevel);
}

function decreasePlagueLevel(amount) {
  plagueLevel = Math.max(0, plagueLevel - amount);
  savePlagueLevel();
}

function setDoctor(stage) {
  if (stage === "entrance") {
    plagueDoctor.src = "assets/plagueDoctor1.png";
    plagueDoctor.className = "doctorEntrance";
  }

  if (stage === "talking") {
    plagueDoctor.src = "assets/plagueDoctor2.png";
    plagueDoctor.className = "doctorTalking";
  }

  if (stage === "center") {
    plagueDoctor.src = "assets/plagueDoctor3.png";
    plagueDoctor.className = "doctorCenter";
  }
}

function hideVillagers() {
  oldMan.style.display = "none";
  woman1.style.display = "none";
  woman2.style.display = "none";
}

function showSpeaker(id) {
  hideVillagers();

  if (id === "oldMan") oldMan.style.display = "block";
  if (id === "woman1") woman1.style.display = "block";
  if (id === "woman2") woman2.style.display = "block";
}

const villagers = [
  {
    speaker: "Old Villager",
    id: "oldMan",
    lines: [
      "Doctor... thank the heavens you came.",
      "Each night more people fall ill.",
      "The rats grow bolder and people whisper the village is cursed.",
      "Tell me, Doctor... is there still hope for us?"
    ]
  },
  {
    speaker: "Worried Woman",
    id: "woman1",
    lines: [
      "My sister began coughing yesterday.",
      "We listen to every breath she takes.",
      "Another home sealed its doors this morning.",
      "Please tell us there is still something we can do."
    ]
  },
  {
    speaker: "Frightened Villager",
    id: "woman2",
    lines: [
      "The panic grows worse every day.",
      "No one trusts their neighbors anymore.",
      "People are too afraid to help the sick.",
      "If this continues, the village will tear itself apart."
    ]
  }
];

const chosenVillager =
  villagers[Math.floor(Math.random() * villagers.length)];

const dialogueLines = [
  {
    speaker: "Narrator",
    id: null,
    text: "You enter the quiet chapel where villagers have gathered."
  },
  {
    speaker: "Narrator",
    id: null,
    text: "Fear hangs in the air as candlelight flickers across the walls."
  },
  {
    speaker: "Narrator",
    id: null,
    text: "You sit among them as the room grows silent."
  },
  {
    speaker: chosenVillager.speaker,
    id: chosenVillager.id,
    text: chosenVillager.lines[0]
  },
  {
    speaker: chosenVillager.speaker,
    id: chosenVillager.id,
    text: chosenVillager.lines[1]
  },
  {
    speaker: chosenVillager.speaker,
    id: chosenVillager.id,
    text: chosenVillager.lines[2]
  },
  {
    speaker: chosenVillager.speaker,
    id: chosenVillager.id,
    text: chosenVillager.lines[3]
  },
  {
    speaker: "Narrator",
    id: null,
    text: "For a brief moment, the chapel feels calmer than before."
  },
  {
    speaker: "Narrator",
    id: null,
    text: "What will you do?"
  }
];

function showDialogue() {
  const line = dialogueLines[dialogueIndex];

  characterName.innerText = line.speaker;
  dialogueText.innerText = line.text;

  showSpeaker(line.id);

  if (dialogueIndex <= 2) {
    setDoctor("entrance");
  } else {
    setDoctor("talking");
  }

  if (dialogueIndex < dialogueLines.length - 1) {
    nextArrow.style.opacity = 1;
  } else {
    nextArrow.style.opacity = 0;
    if (!actionCompleted) {
      choiceBox.style.display = "flex";
    }
  }
}

nextArrow.addEventListener("click", () => {
  dialogueIndex++;
  showDialogue();
});

function startReflectionTimer(seconds) {
  reflectionTimerBox.style.display = "block";

  let timeLeft = seconds;
  reflectionTimerText.innerText = `Reflecting... ${timeLeft}s`;

  const timer = setInterval(() => {
    timeLeft--;
    reflectionTimerText.innerText = `Reflecting... ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      reflectionTimerBox.style.display = "none";
      applyReflectionBenefits();
    }
  }, 1000);
}

function applyReflectionBenefits() {
  let plagueReducedBy = 0;

  if (Math.random() < 0.7) {
    plagueReducedBy = Math.floor(Math.random() * 3) + 2; // 2 to 4
    decreasePlagueLevel(plagueReducedBy);
  }

  let popupText =
    "You reflect quietly with the villagers.\n\n" +
    "Effect:\n";

  if (plagueReducedBy > 0) {
    popupText += `• Plague Level decreases by ${plagueReducedBy}\n\n`;
  } else {
    popupText += "• Plague Level does not change this time\n\n";
  }

  popupText +=
    `Current Plague Level: ${plagueLevel}\n\n` +
    "The calmer atmosphere in the chapel gives the village a small chance to recover.";

  dialogueText.innerText =
    "The chapel grows quiet as the villagers sit in silence.";

  showEffectPopup(popupText);
}

function showEffectPopup(text) {
  effectPopupText.innerText = text;
  effectPopup.style.display = "block";
  closeEffectPopupBtn.style.display = "inline-block";
  leaveChapelBtn.style.display = "none";
}

closeEffectPopupBtn.onclick = () => {
  closeEffectPopupBtn.style.display = "none";
  leaveChapelBtn.style.display = "inline-block";
};

leaveChapelBtn.onclick = () => {
  window.location.href = "village.html";
};

document.querySelectorAll(".choiceBtn").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (actionCompleted) return;

    const choice = btn.dataset.choice;
    actionCompleted = true;

    choiceBox.style.display = "none";
    hideVillagers();
    nextArrow.style.opacity = 0;
    characterName.innerText = "Narrator";

    if (choice === "reflect") {
      setDoctor("center");
      dialogueText.innerText =
        "You sit among the villagers in quiet reflection.";
      startReflectionTimer(5);
    }

    if (choice === "comfort") {
      setDoctor("center");
      dialogueText.innerText =
        "You speak calmly to the frightened villagers.";

      let popupText =
        "You comfort the frightened villagers.\n\n" +
        "Effect:\n";

      if (Math.random() < 0.5) {
        const plagueReducedBy = 1;
        decreasePlagueLevel(plagueReducedBy);

        popupText +=
          `• Plague Level decreases by ${plagueReducedBy}\n\n` +
          "The villagers cooperate more, and the sickness eases slightly.";
      } else {
        popupText +=
          "• Plague Level does not change this time\n\n" +
          "The chapel feels steadier, even if the sickness has not yet eased.";
      }

      popupText += `\nCurrent Plague Level: ${plagueLevel}`;

      showEffectPopup(popupText);
    }

    if (choice === "leave") {
      window.location.href = "village.html";
    }
  });
});

showDialogue();