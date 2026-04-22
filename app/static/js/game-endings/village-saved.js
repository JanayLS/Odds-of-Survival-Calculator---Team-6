// village saved ending will go here
// conditions: all objectives met (all rats defeated, all villagers healed), doctor alive

// =============================
// VILLAGE SAVED ENDING
// =============================

const villageSavedScene = document.getElementById("villageSavedScene");

villageSavedScene.innerHTML = `
    <img id="villageSavedBackground" src="/static/img/backgrounds/village_saved.png" alt="Village Saved Background">

    <img id="villageSavedDoctorSprite" src="/static/img/characters/plagueDoctorSaved.png" alt="Plague Doctor">

    <div id="villageSavedEndingOverlay" aria-hidden="true">
        <div id="villageSavedEndingCard">
            <div id="villageSavedEndingLabel">Ending C</div>
            <h1 id="villageSavedEndingTitle">Village Saved</h1>
            <p id="villageSavedEndingSummary">Through resilience and doctor's healing, the village lives another day.</p>
        </div>
    </div>

    <div id="villageSavedDialogueBox">
        <div id="villageSavedCharacterName">Narrator</div>
        <div id="villageSavedDialogueText"></div>
        <div id="villageSavedNextArrow">➤</div>
    </div>
`;

(function () {

    const textEl = document.getElementById("villageSavedDialogueText");
    const nameEl = document.getElementById("villageSavedCharacterName");
    const arrowEl = document.getElementById("villageSavedNextArrow");
    const doctorEl = document.getElementById("villageSavedDoctorSprite");
    const overlayEl = document.getElementById("villageSavedEndingOverlay");
    const boxEl = document.getElementById("villageSavedDialogueBox");

    const lines = [
        "The air feels lighter now.",
        "The plague has been driven back through courage and care.",
        "Homes stand. Families embrace. Hope returns.",
        "The village breathes once more, alive and whole.",
    ];

    const TYPE_SPEED = 25;

    let index = 0;
    let charIndex = 0;
    let typing = false;
    let started = false;
    let ended = false;
    let timeout = null;

    // -----------------------------
    // SAFE AUDIO HOOK (optional)
    // -----------------------------
    function playLineAudio(line) {
        // plug your sound system here if needed
        // audioManager.play("dialogue_tick");
    }

    // -----------------------------
    // CORE TYPEWRITER
    // -----------------------------
    function stopTyping() {
        if (timeout) clearTimeout(timeout);
        timeout = null;
        typing = false;
    }

    function typeChar() {
        if (!typing) return;

        const line = lines[index];

        if (charIndex === 0) {
            playLineAudio(line);
        }

        if (charIndex < line.length) {
            textEl.textContent += line.charAt(charIndex);
            charIndex++;

            timeout = setTimeout(typeChar, TYPE_SPEED);
        } else {
            typing = false;
            arrowEl.style.opacity = 1;
        }
    }

    function startLine() {
        stopTyping();

        textEl.textContent = "";
        charIndex = 0;
        typing = true;

        arrowEl.style.opacity = 0;
        nameEl.textContent = "Narrator";

        typeChar();
    }

    function finishLine() {
        stopTyping();

        textEl.textContent = lines[index];
        typing = false;
        arrowEl.style.opacity = 1;

        // ensures DOM fully updates before input continues
        requestAnimationFrame(() => { });
    }

    // -----------------------------
    // NEXT / INPUT HANDLER
    // -----------------------------
    function next() {
        if (ended) return;

        if (typing) {
            finishLine();
            return;
        }

        if (index < lines.length - 1) {
            index++;
            startLine();
        } else {
            arrowEl.style.opacity = 0;
            endScene();
        }
    }

    // -----------------------------
    // ENDING
    // -----------------------------
    function endScene() {
        if (ended) return;
        ended = true;

        stopTyping();

        arrowEl.style.opacity = 0;
        boxEl.style.opacity = 0;
        doctorEl.style.opacity = 0.5;

        setTimeout(() => {
            overlayEl.classList.add("show");
        }, 600);

        setTimeout(() => {
            if (typeof showScene === "function") {
                showScene("mainMenu");
            }
        }, 4200);
    }

    // -----------------------------
    // INPUT BINDING
    // -----------------------------
    arrowEl.addEventListener("click", next);

    window.addEventListener("keydown", (e) => {
        if (!started) return;

        if (e.code === "Space" || e.code === "Enter") {
            e.preventDefault();
            next();
        }
    });

    // -----------------------------
    // PUBLIC START (SAFE GUARD)
    // -----------------------------
    window.startVillageSavedScene = function () {

        index = 0;
        charIndex = 0;
        typing = false;
        ended = false;

        stopTyping();

        overlayEl.classList.remove("show");
        boxEl.style.opacity = 1;
        doctorEl.style.opacity = 0.95;

        textEl.textContent = "";
        nameEl.textContent = "Narrator";
        arrowEl.style.opacity = 0;

        startLine();
    };

})();
