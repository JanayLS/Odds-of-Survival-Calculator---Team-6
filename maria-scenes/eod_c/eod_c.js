const dialogueText = document.getElementById("dialogueText");
const characterName = document.getElementById("characterName");
const nextArrow = document.getElementById("nextArrow");
const doctorSprite = document.getElementById("doctorSprite");
const statsBox = document.getElementById("statsBox");

let dialogueIndex = 0;
let isTyping = false;
let typingSpeed = 25;

/* Stats */
const villagersSavedToday = parseInt(localStorage.getItem("villagersSavedToday")) || 0;
const villagersAlive = parseInt(localStorage.getItem("villagersAlive")) || 0;
const villagePlagueLevel = parseFloat(localStorage.getItem("villagePlagueLevel")) || 0;
const doctorInfection = parseFloat(localStorage.getItem("doctorInfection")) || 0;

/* Dialogue lines */
const dialogueLines = [
  "The air burns with ash and silence.",
  "The plague spread faster than hope could hold it back.",
  "Homes fell. Families vanished. The village could not endure.",
  "The streets that once held life now carry only ruin.",
  "The village has collapsed."
];

/* Typewriter effect */
function typeLine(line) {
  dialogueText.textContent = "";
  nextArrow.style.opacity = 0;
  characterName.innerText = "Narrator:";

  let i = 0;
  isTyping = true;

  const interval = setInterval(() => {
    dialogueText.textContent += line.charAt(i);
    i++;

    if (i >= line.length) {
      clearInterval(interval);
      isTyping = false;
      nextArrow.style.opacity = 1;
    }
  }, typingSpeed);
}

/* Show current dialogue */
function showDialogue() {
  typeLine(dialogueLines[dialogueIndex]);
}

/* Click to continue */
nextArrow.addEventListener("click", () => {
  if (isTyping) return;

  dialogueIndex++;

  if (dialogueIndex < dialogueLines.length) {
    showDialogue();
  } else {
    showStats();
  }
});

/* Show stats */
function showStats() {
  document.querySelector(".dialogue-box").classList.add("hidden");
  statsBox.classList.remove("hidden");

  doctorSprite.style.opacity = "0.4";

  document.getElementById("savedToday").innerText =
    `Villagers Saved Today: ${villagersSavedToday}`;
  document.getElementById("totalAlive").innerText =
    `Total Alive: ${villagersAlive}`;
  document.getElementById("plagueLevel").innerText =
    `Village Plague Level: ${villagePlagueLevel}%`;
  document.getElementById("doctorInfection").innerText =
    `Doctor Infection: ${doctorInfection}%`;
}

/* Start scene */
showDialogue();

/* Continue */
function goToCredits() {
  window.location.href = "credits.html";
}