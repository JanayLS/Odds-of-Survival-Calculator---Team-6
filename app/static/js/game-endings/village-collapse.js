// village collapse ending will go here
// conditions: objectives not met (rats not defeated and/or not all villagers healed)

// village collapse ending will go here
// conditions: village infection reaches collapse threshold

const villageCollapseScene = document.getElementById("villageCollapseScene");

villageCollapseScene.innerHTML = `
    <img id="villageCollapseBackground" src="/static/img/backgrounds/village_collapse.png" alt="Village Collapse Background">

    <img id="villageCollapseDoctorSprite" src="/static/img/characters/plagueDoctor1.png" alt="Plague Doctor">

    <div id="villageCollapseEndingOverlay" aria-hidden="true">
        <div id="villageCollapseEndingCard">
            <div id="villageCollapseEndingLabel">Ending C</div>
            <h1 id="villageCollapseEndingTitle">Village Collapses</h1>
            <p id="villageCollapseEndingSummary">The plague outlasts the village, leaving only ruin behind.</p>
        </div>
    </div>

    <div id="villageCollapseDialogueBox">
        <div id="villageCollapseCharacterName">Narrator</div>
        <div id="villageCollapseDialogueText"></div>
        <div id="villageCollapseNextArrow">➤</div>
    </div>
`;

(function initializeVillageCollapseScene() {
    const villageCollapseDialogueText = document.getElementById("villageCollapseDialogueText");
    const villageCollapseCharacterName = document.getElementById("villageCollapseCharacterName");
    const villageCollapseNextArrow = document.getElementById("villageCollapseNextArrow");
    const villageCollapseDoctorSprite = document.getElementById("villageCollapseDoctorSprite");
    const villageCollapseEndingOverlay = document.getElementById("villageCollapseEndingOverlay");
    const villageCollapseDialogueBox = document.getElementById("villageCollapseDialogueBox");

    let villageCollapseDialogueIndex = 0;
    let villageCollapseIsTyping = false;
    let villageCollapseTypewriterTimeout = null;

    const VILLAGE_COLLAPSE_TYPE_SPEED = 25;

    const villageCollapseLines = [
        "The air burns with ash and silence.",
        "The plague spread faster than hope could hold it back.",
        "Homes fell. Families vanished. The village could not endure.",
        "The streets that once held life now carry only ruin.",
        "The village has collapsed."
    ];

    function villageCollapseFinishTyping(line) {
        if (villageCollapseTypewriterTimeout) {
            clearTimeout(villageCollapseTypewriterTimeout);
            villageCollapseTypewriterTimeout = null;
        }

        villageCollapseDialogueText.textContent = line;
        villageCollapseIsTyping = false;
        villageCollapseNextArrow.style.opacity = 1;
    }

    function villageCollapseTypeLine(line, index = 0) {
        if (index === 0) {
            villageCollapseDialogueText.textContent = "";
            villageCollapseNextArrow.style.opacity = 0;
            villageCollapseCharacterName.innerText = "Narrator";
            villageCollapseIsTyping = true;
        }

        if (index < line.length) {
            villageCollapseDialogueText.textContent += line.charAt(index);
            villageCollapseTypewriterTimeout = setTimeout(() => {
                villageCollapseTypeLine(line, index + 1);
            }, VILLAGE_COLLAPSE_TYPE_SPEED);
            return;
        }

        villageCollapseTypewriterTimeout = null;
        villageCollapseIsTyping = false;
        villageCollapseNextArrow.style.opacity = 1;
    }

    function villageCollapseShowDialogue() {
        villageCollapseTypeLine(villageCollapseLines[villageCollapseDialogueIndex]);
    }

    function villageCollapseShowEnding() {
        villageCollapseNextArrow.style.opacity = 0;
        villageCollapseDialogueBox.style.opacity = 0;
        villageCollapseDoctorSprite.style.opacity = 0.5;

        setTimeout(() => {
            villageCollapseEndingOverlay.classList.add("show");
        }, 700);

        setTimeout(() => {
            if (typeof showScene === "function") {
                showScene("mainMenu");
            }
        }, 4200);
    }

    villageCollapseNextArrow.addEventListener("click", () => {
        const currentLine = villageCollapseLines[villageCollapseDialogueIndex];

        if (villageCollapseIsTyping) {
            villageCollapseFinishTyping(currentLine);
            return;
        }

        if (villageCollapseDialogueIndex < villageCollapseLines.length - 1) {
            villageCollapseDialogueIndex++;
            villageCollapseShowDialogue();
            return;
        }

        villageCollapseShowEnding();
    });

    window.startVillageCollapseScene = function () {
        villageCollapseDialogueIndex = 0;
        villageCollapseIsTyping = false;

        if (villageCollapseTypewriterTimeout) {
            clearTimeout(villageCollapseTypewriterTimeout);
            villageCollapseTypewriterTimeout = null;
        }

        villageCollapseEndingOverlay.classList.remove("show");
        villageCollapseDialogueBox.style.opacity = 1;
        villageCollapseDoctorSprite.style.opacity = 0.95;
        villageCollapseDialogueText.textContent = "";
        villageCollapseCharacterName.innerText = "Narrator";
        villageCollapseNextArrow.style.opacity = 0;

        villageCollapseShowDialogue();
    };
})();