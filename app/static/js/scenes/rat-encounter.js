document.addEventListener("DOMContentLoaded", () => {
    const ratScene = document.getElementById("ratScene");

    if (!ratScene) {
        console.error("ratScene element not found");
        return;
    }

    ratScene.innerHTML = `
        <img id="ratImage" src="" alt="Rat image">

        <div id="ratHpUI">
            <div id="ratHpLabel">Rat HP</div>
            <div id="ratHpContainer">
                <div id="ratHpBar"></div>
            </div>
            <button id="temporaryAttackBtn">Attack</button>
            <div id="ratHpValue">100 / 100</div>
        </div>
    `;

    let activeRatKey = null;

    function setActiveRat(ratKey) {
        activeRatKey = ratKey;
        gameState.currentRatKey = ratKey;
        renderRatScene();
        renderRatHp();
    }

    function getActiveRat() {
        if (!activeRatKey && gameState.currentRatKey) {
            activeRatKey = gameState.currentRatKey;
        }

        return gameState.rats[activeRatKey];
    }

    function renderRatHp() {
        const rat = getActiveRat();
        const bar = document.getElementById("ratHpBar");
        const value = document.getElementById("ratHpValue");

        if (!rat || !bar || !value) return;

        const maxHp = 100;
        bar.style.width = `${rat.hp}%`;
        value.textContent = `${rat.hp} / ${maxHp}`;
    }

    function renderRatScene() {
        if (!activeRatKey && gameState.currentRatKey) {
            activeRatKey = gameState.currentRatKey;
        }

        const portrait = document.getElementById("ratImage");
        const ratData = ratsDatabase?.[activeRatKey];
        const ratState = gameState.rats?.[activeRatKey];

        if (!activeRatKey || !ratData || !ratState || !portrait) return;

        ratScene.style.backgroundImage = `url('${ratData.bg}')`;
        portrait.src = ratData.img;
    }

    function attackActiveRat() {
        const rat = getActiveRat();
        if (!rat || rat.dead) return;
        if (!canSpendActionToken(1)) return;

        const damage = Math.floor(Math.random() * 21) + 10;
        rat.hp -= damage;

        if (rat.hp <= 0) {
            rat.hp = 0;
            rat.dead = true;
            gameState.ratsKilled += 1;
            updateObjectivePanel();
            renderRatSelectList();
            alert("Rat defeated!");
        }

        spendActionToken(1);
        renderRatHp();

        const gotInfected = Math.random() < 0.55;

        if (gotInfected) {
            const infectionAmount = Math.floor(Math.random() * 11) + 15;
            gameState.doctorInfection = Math.min(100, gameState.doctorInfection + infectionAmount);
            renderDoctorInfection();
            alert(`The rat bit you. Doctor Infection +${infectionAmount}`);
        }
    }

    document.addEventListener("click", (event) => {
        if (event.target?.id === "temporaryAttackBtn") {
            attackActiveRat();
        }
    });

    window.setActiveRat = setActiveRat;
    window.getActiveRat = getActiveRat;
    window.renderRatScene = renderRatScene;
    window.renderRatHp = renderRatHp;
});