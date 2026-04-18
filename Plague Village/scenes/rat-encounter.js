// Grabs the scene element from our main HTML document
const ratScene = document.getElementById("ratScene");

// ADD YOUR SCENE'S HTML CODE INSIDE THE INNERHTML TEMPLATE LITERAL BELOW
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
`

// ADD SCENE SPECIFIC JS HERE -- Do not redeclare global variables/functions that are already in script.js
// If needed, rename your local variables to avoid conflicts with script.js
let activeRatKey = null;
tempAttackBtn = document.getElementById("temporaryAttackBtn");

function setActiveRat(ratKey) {
    activeRatKey = ratKey;
    renderRatScene();
    renderRatHp();
}

function getActiveRat() {
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
    if (!activeRatKey) return;

    const ratData = ratsDatabase[activeRatKey];
    const ratState = gameState.rats[activeRatKey];
    const portrait = document.getElementById("ratImage");

    if (!ratData || !ratState || !portrait) return;

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
        renderRatSelectList();
        updateObjectivePanel();
        alert("Rat defeated!");
    }

    spendActionToken(1);
    renderRatHp();
}

tempAttackBtn.addEventListener("click", () => {
    attackActiveRat();
})