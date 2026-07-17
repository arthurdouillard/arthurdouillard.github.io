const words = [
    { level: 1, bg: "да", bgLatin: "da", fr: "oui", en: "yes" },
    { level: 1, bg: "не", bgLatin: "ne", fr: "non", en: "no" },
    { level: 1, bg: "здравей", bgLatin: "zdravey", fr: "bonjour", en: "hello" },
    { level: 1, bg: "довиждане", bgLatin: "dovizhdane", fr: "au revoir", en: "goodbye" },
    { level: 1, bg: "благодаря", bgLatin: "blagodarya", fr: "merci", en: "thank you" },
    { level: 1, bg: "моля", bgLatin: "molya", fr: "s'il vous plaît", en: "please" },
    { level: 1, bg: "вода", bgLatin: "voda", fr: "eau", en: "water" },
    { level: 1, bg: "хляб", bgLatin: "hlyab", fr: "pain", en: "bread" },
    { level: 1, bg: "котка", bgLatin: "kotka", fr: "chat", en: "cat" },
    { level: 1, bg: "куче", bgLatin: "kuche", fr: "chien", en: "dog" },
    { level: 1, bg: "къща", bgLatin: "kashta", fr: "maison", en: "house" },
    { level: 1, bg: "приятел", bgLatin: "priyatel", fr: "ami", en: "friend" },
    { level: 1, bg: "семейство", bgLatin: "semeystvo", fr: "famille", en: "family" },
    { level: 1, bg: "слънце", bgLatin: "slantse", fr: "soleil", en: "sun" },
    { level: 1, bg: "море", bgLatin: "more", fr: "mer", en: "sea" },
    { level: 1, bg: "книга", bgLatin: "kniga", fr: "livre", en: "book" },
    { level: 2, bg: "закуска", bgLatin: "zakuska", fr: "petit-déjeuner", en: "breakfast" },
    { level: 2, bg: "пътуване", bgLatin: "patuvane", fr: "voyage", en: "journey" },
    { level: 2, bg: "работа", bgLatin: "rabota", fr: "travail", en: "work" },
    { level: 2, bg: "училище", bgLatin: "uchilishte", fr: "école", en: "school" },
    { level: 2, bg: "летище", bgLatin: "letishte", fr: "aéroport", en: "airport" },
    { level: 2, bg: "влак", bgLatin: "vlak", fr: "train", en: "train" },
    { level: 2, bg: "планина", bgLatin: "planina", fr: "montagne", en: "mountain" },
    { level: 2, bg: "времето", bgLatin: "vremeto", fr: "météo", en: "weather" },
    { level: 2, bg: "усмивка", bgLatin: "usmivka", fr: "sourire", en: "smile" },
    { level: 2, bg: "свобода", bgLatin: "svoboda", fr: "liberté", en: "freedom" },
    { level: 2, bg: "подарък", bgLatin: "podarak", fr: "cadeau", en: "gift" },
    { level: 2, bg: "здраве", bgLatin: "zdrave", fr: "santé", en: "health" },
    { level: 2, bg: "съсед", bgLatin: "sased", fr: "voisin", en: "neighbour" },
    { level: 2, bg: "въпрос", bgLatin: "vapros", fr: "question", en: "question" },
    { level: 2, bg: "отговор", bgLatin: "otgovor", fr: "réponse", en: "answer" },
    { level: 2, bg: "вкусен", bgLatin: "vkusen", fr: "délicieux", en: "delicious" },
    { level: 3, bg: "предизвикателство", bgLatin: "predizvikatelstvo", fr: "défi", en: "challenge" },
    { level: 3, bg: "гостоприемство", bgLatin: "gostopriemstvo", fr: "hospitalité", en: "hospitality" },
    { level: 3, bg: "самочувствие", bgLatin: "samochuvstvie", fr: "confiance en soi", en: "self-confidence" },
    { level: 3, bg: "приключение", bgLatin: "priklyuchenie", fr: "aventure", en: "adventure" },
    { level: 3, bg: "въображение", bgLatin: "vaobrazhenie", fr: "imagination", en: "imagination" },
    { level: 3, bg: "любопитство", bgLatin: "lyubopitstvo", fr: "curiosité", en: "curiosity" },
    { level: 3, bg: "невероятен", bgLatin: "neveroyaten", fr: "incroyable", en: "incredible" },
    { level: 3, bg: "благополучие", bgLatin: "blagopoluchie", fr: "bien-être", en: "well-being" },
    { level: 3, bg: "постижение", bgLatin: "postizhenie", fr: "accomplissement", en: "achievement" },
    { level: 3, bg: "независимост", bgLatin: "nezavisimost", fr: "indépendance", en: "independence" },
    { level: 3, bg: "околна среда", bgLatin: "okolna sreda", fr: "environnement", en: "environment" },
    { level: 3, bg: "разбирателство", bgLatin: "razbiratelstvo", fr: "compréhension mutuelle", en: "mutual understanding" },
    { level: 3, bg: "усъвършенстване", bgLatin: "usavarshenstvane", fr: "amélioration", en: "improvement" },
    { level: 3, bg: "възможност", bgLatin: "vazmozhnost", fr: "opportunité", en: "opportunity" },
    { level: 3, bg: "отговорност", bgLatin: "otgovornost", fr: "responsabilité", en: "responsibility" },
    { level: 3, bg: "сътрудничество", bgLatin: "satrudnichestvo", fr: "collaboration", en: "collaboration" }
];

const routes = {
    "bg-fr": { from: "bg", to: "fr", label: "Bulgarian → French" },
    "bg-en": { from: "bg", to: "en", label: "Bulgarian → English" },
    "fr-bg": { from: "fr", to: "bg", label: "French → Bulgarian" },
    "fr-en": { from: "fr", to: "en", label: "French → English" }
};

const difficultyNames = { 1: "Warm-up", 2: "Getting tricky", 3: "Expert mode" };
const circumference = 2 * Math.PI * 52;

const elements = {
    setup: document.querySelector("#setup"),
    playArea: document.querySelector("#play-area"),
    results: document.querySelector("#results"),
    timerRange: document.querySelector("#timer-range"),
    timerOutput: document.querySelector("#timer-output"),
    roundSelect: document.querySelector("#round-select"),
    roundCurrent: document.querySelector("#round-current"),
    roundTotal: document.querySelector("#round-total"),
    setupError: document.querySelector("#setup-error"),
    startButton: document.querySelector("#start-button"),
    rematchButton: document.querySelector("#rematch-button"),
    settingsButton: document.querySelector("#settings-button"),
    revealButton: document.querySelector("#reveal-button"),
    correctButton: document.querySelector("#correct-button"),
    missedButton: document.querySelector("#missed-button"),
    judgeActions: document.querySelector("#judge-actions"),
    scoreBulgaria: document.querySelector("#score-bulgaria"),
    scoreFrance: document.querySelector("#score-france"),
    teamBulgaria: document.querySelector("#team-bulgaria"),
    teamFrance: document.querySelector("#team-france"),
    turnLabel: document.querySelector("#turn-label"),
    activeFlag: document.querySelector("#active-flag"),
    activeTeam: document.querySelector("#active-team"),
    difficulty: document.querySelector("#difficulty"),
    matchProgress: document.querySelector("#match-progress"),
    timer: document.querySelector("#timer"),
    timerProgress: document.querySelector("#timer-progress"),
    timeLeft: document.querySelector("#time-left"),
    routeLabel: document.querySelector("#route-label"),
    promptWord: document.querySelector("#prompt-word"),
    pronunciation: document.querySelector("#pronunciation"),
    answer: document.querySelector("#answer"),
    answerWord: document.querySelector("#answer-word"),
    winnerTitle: document.querySelector("#winner-title"),
    winnerSummary: document.querySelector("#winner-summary"),
    finalBulgaria: document.querySelector("#final-bulgaria"),
    finalFrance: document.querySelector("#final-france"),
    soundToggle: document.querySelector("#sound-toggle")
};

let state = {
    timerSeconds: 15,
    totalRounds: 20,
    round: 0,
    scores: { bulgaria: 0, france: 0 },
    activeTeam: "bulgaria",
    selectedRoutes: Object.keys(routes),
    usedWords: new Set(),
    currentWord: null,
    currentRoute: null,
    timerId: null,
    deadline: 0,
    revealed: false,
    judged: false,
    inTime: true,
    muted: false
};

elements.timerProgress.style.strokeDasharray = circumference;
elements.timerProgress.style.strokeDashoffset = 0;

function readStoredSettings() {
    try {
        const stored = JSON.parse(localStorage.getItem("languageDerbySettings"));
        if (!stored) return;
        if ([5, 10, 15, 20, 25, 30, 35, 40, 45].includes(stored.timerSeconds)) {
            elements.timerRange.value = stored.timerSeconds;
        }
        if ([10, 20, 30].includes(stored.totalRounds)) {
            elements.roundSelect.value = stored.totalRounds;
        }
        if (Array.isArray(stored.selectedRoutes) && stored.selectedRoutes.length) {
            document.querySelectorAll('input[name="route"]').forEach((input) => {
                input.checked = stored.selectedRoutes.includes(input.value);
            });
        }
    } catch {
        localStorage.removeItem("languageDerbySettings");
    }
    updateSetupLabels();
}

function updateSetupLabels() {
    elements.timerOutput.value = `${elements.timerRange.value}s`;
    elements.roundTotal.textContent = elements.roundSelect.value;
}

function saveSettings() {
    localStorage.setItem("languageDerbySettings", JSON.stringify({
        timerSeconds: state.timerSeconds,
        totalRounds: state.totalRounds,
        selectedRoutes: state.selectedRoutes
    }));
}

function startMatch() {
    const selectedRoutes = [...document.querySelectorAll('input[name="route"]:checked')].map((input) => input.value);
    if (!selectedRoutes.length) {
        elements.setupError.textContent = "Choose at least one translation route.";
        return;
    }

    state.timerSeconds = Number(elements.timerRange.value);
    state.totalRounds = Number(elements.roundSelect.value);
    state.selectedRoutes = selectedRoutes;
    state.round = 0;
    state.scores = { bulgaria: 0, france: 0 };
    state.usedWords = new Set();
    state.activeTeam = Math.random() < 0.5 ? "bulgaria" : "france";
    elements.setupError.textContent = "";
    saveSettings();
    updateScores();
    showPanel("play");
    nextRound();
}

function showPanel(panel) {
    elements.setup.classList.toggle("hidden", panel !== "setup");
    elements.playArea.classList.toggle("hidden", panel !== "play");
    elements.results.classList.toggle("hidden", panel !== "results");
}

function levelForRound() {
    const progress = state.round / state.totalRounds;
    if (progress <= 0.35) return 1;
    if (progress <= 0.7) return 2;
    return 3;
}

function chooseWord(level) {
    let candidates = words
        .map((word, index) => ({ word, index }))
        .filter(({ word, index }) => word.level === level && !state.usedWords.has(index));

    if (!candidates.length) {
        candidates = words
            .map((word, index) => ({ word, index }))
            .filter(({ word }) => word.level === level);
    }

    const choice = candidates[Math.floor(Math.random() * candidates.length)];
    state.usedWords.add(choice.index);
    return choice.word;
}

function nextRound() {
    if (state.round >= state.totalRounds) {
        endMatch();
        return;
    }

    state.round += 1;
    const level = levelForRound();
    state.currentWord = chooseWord(level);
    state.currentRoute = routes[state.selectedRoutes[Math.floor(Math.random() * state.selectedRoutes.length)]];
    state.revealed = false;
    state.judged = false;
    state.inTime = true;

    elements.roundCurrent.textContent = state.round;
    elements.roundTotal.textContent = state.totalRounds;
    elements.turnLabel.textContent = `${state.activeTeam === "bulgaria" ? "Bulgaria" : "France"}’s turn`;
    elements.matchProgress.style.width = `${((state.round - 1) / state.totalRounds) * 100}%`;
    elements.difficulty.textContent = difficultyNames[level];
    elements.activeFlag.textContent = state.activeTeam === "bulgaria" ? "🇧🇬" : "🇫🇷";
    elements.activeTeam.textContent = `Team ${state.activeTeam === "bulgaria" ? "Bulgaria" : "France"}`;
    elements.teamBulgaria.classList.toggle("active", state.activeTeam === "bulgaria");
    elements.teamFrance.classList.toggle("active", state.activeTeam === "france");
    elements.routeLabel.textContent = state.currentRoute.label;
    elements.promptWord.textContent = state.currentWord[state.currentRoute.from];
    elements.pronunciation.textContent = state.currentRoute.from === "bg" ? state.currentWord.bgLatin : "";
    elements.answerWord.textContent = state.currentWord[state.currentRoute.to];
    elements.answer.classList.add("hidden");
    elements.revealButton.classList.remove("hidden");
    elements.judgeActions.classList.add("hidden");
    elements.correctButton.disabled = false;
    elements.missedButton.disabled = false;
    elements.correctButton.innerHTML = "<span>✓</span> Got it in time";

    startTimer();
}

function startTimer() {
    clearInterval(state.timerId);
    state.deadline = Date.now() + state.timerSeconds * 1000;
    updateTimer(state.timerSeconds);
    state.timerId = setInterval(() => {
        const remaining = Math.max(0, (state.deadline - Date.now()) / 1000);
        updateTimer(remaining);
        if (remaining <= 0) {
            clearInterval(state.timerId);
            state.inTime = false;
            playTone("timeout");
            revealAnswer(true);
        }
    }, 100);
}

function updateTimer(remaining) {
    const rounded = Math.ceil(remaining);
    elements.timeLeft.textContent = rounded;
    const ratio = remaining / state.timerSeconds;
    elements.timerProgress.style.strokeDashoffset = circumference * (1 - ratio);
    elements.timer.classList.toggle("urgent", remaining <= Math.min(5, state.timerSeconds / 3));
}

function revealAnswer(timedOut = false) {
    if (state.revealed) return;
    state.revealed = true;
    clearInterval(state.timerId);
    elements.answer.classList.remove("hidden");
    elements.revealButton.classList.add("hidden");
    elements.judgeActions.classList.remove("hidden");

    if (timedOut) {
        elements.correctButton.disabled = true;
        elements.correctButton.innerHTML = "<span>⌛</span> Time’s up";
    } else {
        playTone("reveal");
    }
}

function judgeRound(correct) {
    if (!state.revealed || state.judged) return;
    if (correct && !state.inTime) return;
    state.judged = true;
    elements.correctButton.disabled = true;
    elements.missedButton.disabled = true;
    if (correct) {
        state.scores[state.activeTeam] += 1;
        playTone("correct");
    } else {
        playTone("missed");
    }

    updateScores();
    state.activeTeam = state.activeTeam === "bulgaria" ? "france" : "bulgaria";
    window.setTimeout(nextRound, 260);
}

function updateScores() {
    elements.scoreBulgaria.textContent = state.scores.bulgaria;
    elements.scoreFrance.textContent = state.scores.france;
}

function endMatch() {
    clearInterval(state.timerId);
    elements.teamBulgaria.classList.remove("active");
    elements.teamFrance.classList.remove("active");
    elements.matchProgress.style.width = "100%";
    elements.finalBulgaria.textContent = state.scores.bulgaria;
    elements.finalFrance.textContent = state.scores.france;

    if (state.scores.bulgaria > state.scores.france) {
        elements.winnerTitle.textContent = "Bulgaria wins!";
        elements.winnerSummary.textContent = "Team Bulgaria conquered the language derby.";
    } else if (state.scores.france > state.scores.bulgaria) {
        elements.winnerTitle.textContent = "France wins!";
        elements.winnerSummary.textContent = "Team France takes home the language crown.";
    } else {
        elements.winnerTitle.textContent = "It’s a draw!";
        elements.winnerSummary.textContent = "Perfectly matched — the rematch decides everything.";
    }

    elements.turnLabel.textContent = "Full time";
    showPanel("results");
    playTone("finish");
}

function playTone(kind) {
    if (state.muted) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const settings = {
        reveal: [440, 0.06],
        correct: [660, 0.12],
        missed: [190, 0.1],
        timeout: [150, 0.18],
        finish: [520, 0.25]
    }[kind];

    oscillator.frequency.value = settings[0];
    oscillator.type = kind === "missed" || kind === "timeout" ? "sawtooth" : "sine";
    gain.gain.setValueAtTime(0.07, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + settings[1]);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + settings[1]);
    oscillator.addEventListener("ended", () => context.close());
}

elements.timerRange.addEventListener("input", updateSetupLabels);
elements.roundSelect.addEventListener("change", updateSetupLabels);
elements.startButton.addEventListener("click", startMatch);
elements.revealButton.addEventListener("click", () => revealAnswer(false));
elements.correctButton.addEventListener("click", () => judgeRound(true));
elements.missedButton.addEventListener("click", () => judgeRound(false));
elements.rematchButton.addEventListener("click", startMatch);
elements.settingsButton.addEventListener("click", () => {
    elements.roundCurrent.textContent = "0";
    elements.turnLabel.textContent = "First kick-off";
    showPanel("setup");
});
elements.soundToggle.addEventListener("click", () => {
    state.muted = !state.muted;
    elements.soundToggle.setAttribute("aria-pressed", state.muted);
    elements.soundToggle.setAttribute("aria-label", state.muted ? "Enable sounds" : "Mute sounds");
});

document.addEventListener("keydown", (event) => {
    if (elements.playArea.classList.contains("hidden")) return;
    if (event.code === "Space" && !state.revealed) {
        event.preventDefault();
        revealAnswer(false);
    } else if (event.key === "ArrowLeft" && state.revealed) {
        judgeRound(false);
    } else if (event.key === "ArrowRight" && state.revealed && state.inTime) {
        judgeRound(true);
    }
});

readStoredSettings();
