const dialogueText = document.getElementById("dialogueText");
const characterName = document.getElementById("characterName");
const nextArrow = document.getElementById("nextArrow");
const doctorSprite = document.getElementById("doctorSprite");

let dialogueIndex = 0;
let currentPose = ""; // track current pose so we do not reload the same image

/* Stats */
const villagePlagueLevel = parseFloat(localStorage.getItem("villagePlagueLevel")) || 0;
const doctorInfection = parseFloat(localStorage.getItem("doctorInfection")) || 0;

/* Image mapping */
const poseImages = {
  normal: "assets/plagueDoctor_normal.png",
  loss: "assets/plagueDoctor_loss.png",
  unbalanced: "assets/plagueDoctor_unbalanced.png",
  falling: "assets/plagueDoctor_falling.png",
  dead: "assets/plagueDoctor_dead.png"
};

/* Dialogue + poses */
const dialogueLines = [
  {
    speaker: "Narrator",
    text: "You stand... but something feels wrong.",
    pose: "normal"
  },
  {
    speaker: "Narrator",
    text: "The plague spreads through your body.",
    pose: "loss"
  },
  {
    speaker: "Narrator",
    text: "Your balance falters... your strength fades.",
    pose: "unbalanced"
  },
  {
    speaker: "Narrator",
    text: "Your body begins to give out.",
    pose: "falling"
  },
  {
    speaker: "Narrator",
    text: "You collapse to the ground, unable to rise again.",
    pose: "dead"
  },
  {
    speaker: "Narrator",
    text:
      "Doctor Dies, Village Survives\n\n" +
      "Conditions:\n" +
      `• Village Plague Level: ${villagePlagueLevel}% (< 20%)\n` +
      `• Doctor Infection: ${doctorInfection}% (≥ 100%)`,
    pose: "dead"
  },
  {
    speaker: "Narrator",
    text: "The village lives on... but you do not.",
    pose: "dead"
  }
];

/* Smooth image swap */
function setPose(poseName) {
  if (!poseImages[poseName]) return;

  // If the pose is already showing, do nothing
  // This prevents the dead sprite from fading out/in on the last 3 lines
  if (poseName === currentPose) return;

  doctorSprite.style.opacity = 0;

  setTimeout(() => {
    doctorSprite.src = poseImages[poseName];
    doctorSprite.className = "";
    doctorSprite.classList.add(poseName);
    doctorSprite.style.opacity = 1;
    currentPose = poseName;
  }, 200);
}

/* Show dialogue */
function showDialogue() {
  const line = dialogueLines[dialogueIndex];

  characterName.innerText = line.speaker;
  dialogueText.innerText = line.text;

  setPose(line.pose);

  if (dialogueIndex < dialogueLines.length - 1) {
    nextArrow.style.opacity = 1;
  } else {
    nextArrow.style.opacity = 0;

    setTimeout(() => {
      window.location.href = "credits.html";
    }, 2000);
  }
}

/* Click next */
nextArrow.addEventListener("click", () => {
  if (dialogueIndex < dialogueLines.length - 1) {
    dialogueIndex++;
    showDialogue();
  }
});

/* Start */
showDialogue();