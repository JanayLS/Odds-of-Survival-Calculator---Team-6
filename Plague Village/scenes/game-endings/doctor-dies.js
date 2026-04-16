// doctor dies ending will go here
// conditions: Doctor infection reaches 100.

// Grabs the scene element from our main HTML document
const doctorDiesScene = document.getElementById("doctorDiesScene");

doctorDiesScene.innerHTML = `
    <img id="doctorDiesBackground" src="images/backgrounds/toxicVillage.png" alt="Toxic Village Background">

    <img id="doctorDiesSprite" src="images/characters/plagueDoctor1.png" alt="Plague Doctor">

    <div id="doctorDiesOverlay" aria-hidden="true">
        <div id="doctorDiesCard">
            <div id="doctorDiesLabel">Ending</div>
            <h1 id="doctorDiesTitle">Doctor Dies, Village Survives</h1>
            <p id="doctorDiesSummary">The plague claims the doctor, but the village endures.</p>
        </div>
    </div>

    <div id="doctorDiesDialogueBox">
        <div id="doctorDiesCharacterName">Narrator</div>
        <div id="doctorDiesDialogueText"></div>
        <div id="doctorDiesNextArrow">➤</div>
    </div>
`;

// ADD SCENE SPECIFIC JS HERE -- Do not redeclare global variables/functions that are already in script.js
// If needed, rename your local variables to avoid conflicts with script.js

(function initializeDoctorDiesScene() {
    const doctorDiesDialogueText = document.getElementById("doctorDiesDialogueText");
    const doctorDiesCharacterName = document.getElementById("doctorDiesCharacterName");
    const doctorDiesNextArrow = document.getElementById("doctorDiesNextArrow");
    const doctorDiesSprite = document.getElementById("doctorDiesSprite");
    const doctorDiesOverlay = document.getElementById("doctorDiesOverlay");
    const doctorDiesDialogueBox = document.getElementById("doctorDiesDialogueBox");

    let doctorDiesDialogueIndex = 0;
    let doctorDiesCurrentPose = "";
    let doctorDiesTypewriterTimeout = null;
    let doctorDiesIsTyping = false;

    const DOCTOR_DIES_TYPE_SPEED = 50;

    const doctorDiesPoseImages = {
        normal: "images/characters/plagueDoctor1.png",
        loss: "images/characters/plagueDoctor_loss.png",
        unbalanced: "images/characters/plagueDoctor_unbalanced.png",
        falling: "images/characters/plagueDoctor_falling.png",
        dead: "images/characters/plagueDoctor_dead.png"
    };

    const doctorDiesLines = [
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
            text: "The village lives on... but you do not.",
            pose: "dead"
        }
    ];

    function doctorDiesSetPose(poseName) {
        if (!doctorDiesPoseImages[poseName]) return;
        if (poseName === doctorDiesCurrentPose) return;

        doctorDiesSprite.style.opacity = 0;

        setTimeout(() => {
            doctorDiesSprite.src = doctorDiesPoseImages[poseName];
            doctorDiesSprite.className = "";
            doctorDiesSprite.classList.add(poseName);
            doctorDiesSprite.style.opacity = 1;
            doctorDiesCurrentPose = poseName;
        }, 200);
    }

    function doctorDiesFinishTyping(fullText) {
        if (doctorDiesTypewriterTimeout) {
            clearTimeout(doctorDiesTypewriterTimeout);
            doctorDiesTypewriterTimeout = null;
        }

        doctorDiesDialogueText.innerText = fullText;
        doctorDiesIsTyping = false;
        doctorDiesNextArrow.style.opacity = 1;
    }

    function doctorDiesTypeDialogue(fullText, index = 0) {
        if (index === 0) {
            doctorDiesDialogueText.innerText = "";
            doctorDiesIsTyping = true;
            doctorDiesNextArrow.style.opacity = 0;
        }

        if (index < fullText.length) {
            doctorDiesDialogueText.textContent += fullText[index];
            doctorDiesTypewriterTimeout = setTimeout(() => {
                doctorDiesTypeDialogue(fullText, index + 1);
            }, DOCTOR_DIES_TYPE_SPEED);
            return;
        }

        doctorDiesIsTyping = false;
        doctorDiesTypewriterTimeout = null;
        doctorDiesNextArrow.style.opacity = 1;
    }

    function doctorDiesShowDialogue() {
        const currentLine = doctorDiesLines[doctorDiesDialogueIndex];
        doctorDiesCharacterName.innerText = currentLine.speaker;
        doctorDiesSetPose(currentLine.pose);
        doctorDiesTypeDialogue(currentLine.text);
    }

    function doctorDiesShowEnding() {
        doctorDiesNextArrow.style.opacity = 0;
        doctorDiesDialogueBox.style.opacity = 0;

        setTimeout(() => {
            doctorDiesOverlay.classList.add("show");
        }, 700);

        setTimeout(() => {
            if (typeof switchScene === "function") {
                switchScene("mainMenu");
            } else if (typeof showScene === "function") {
                showScene("mainMenu");
            }
        }, 4200);
    }

    doctorDiesNextArrow.addEventListener("click", () => {
        const currentLine = doctorDiesLines[doctorDiesDialogueIndex];

        if (doctorDiesIsTyping) {
            doctorDiesFinishTyping(currentLine.text);
            return;
        }

        if (doctorDiesDialogueIndex < doctorDiesLines.length - 1) {
            doctorDiesDialogueIndex++;
            doctorDiesShowDialogue();
            return;
        }

        doctorDiesShowEnding();
    });

    window.startDoctorDiesScene = function () {
        doctorDiesDialogueIndex = 0;
        doctorDiesCurrentPose = "";
        doctorDiesOverlay.classList.remove("show");
        doctorDiesDialogueBox.style.opacity = 1;
        doctorDiesSprite.className = "";
        doctorDiesSprite.src = doctorDiesPoseImages.normal;
        doctorDiesSprite.style.opacity = 1;
        doctorDiesShowDialogue();
    };
})();



