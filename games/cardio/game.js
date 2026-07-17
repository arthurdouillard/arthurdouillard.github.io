import {
    FilesetResolver,
    PoseLandmarker
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm";

const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";

const LANDMARK = {
    nose: 0,
    leftShoulder: 11,
    rightShoulder: 12,
    leftHip: 23,
    rightHip: 24,
    leftKnee: 25,
    rightKnee: 26,
    leftAnkle: 27,
    rightAnkle: 28
};

const POSE_CONNECTIONS = [
    [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
    [11, 23], [12, 24], [23, 24], [23, 25], [25, 27],
    [24, 26], [26, 28], [27, 31], [28, 32]
];

const dom = {
    gameCanvas: document.querySelector("#gameCanvas"),
    webcam: document.querySelector("#webcam"),
    poseCanvas: document.querySelector("#poseCanvas"),
    calibrationCanvas: document.querySelector("#calibrationCanvas"),
    introOverlay: document.querySelector("#introOverlay"),
    calibrationOverlay: document.querySelector("#calibrationOverlay"),
    gameOverOverlay: document.querySelector("#gameOverOverlay"),
    errorOverlay: document.querySelector("#errorOverlay"),
    startButton: document.querySelector("#startButton"),
    restartButton: document.querySelector("#restartButton"),
    recalibrateButton: document.querySelector("#recalibrateButton"),
    retryButton: document.querySelector("#retryButton"),
    modelStatus: document.querySelector("#modelStatus"),
    cameraStatus: document.querySelector("#cameraStatus"),
    poseStatus: document.querySelector("#poseStatus"),
    poseStatusDot: document.querySelector("#poseStatusDot"),
    calibrationCount: document.querySelector("#calibrationCount"),
    calibrationBar: document.querySelector("#calibrationBar"),
    calibrationHint: document.querySelector("#calibrationHint"),
    distanceValue: document.querySelector("#distanceValue"),
    paceValue: document.querySelector("#paceValue"),
    speedValue: document.querySelector("#speedValue"),
    speedNeedle: document.querySelector("#speedNeedle"),
    speedHint: document.querySelector("#speedHint"),
    laneIndicators: document.querySelectorAll(".lane-indicator [data-lane]"),
    squatIndicator: document.querySelector("#squatIndicator"),
    bestValue: document.querySelector("#bestValue"),
    staminaBar: document.querySelector("#staminaBar"),
    staminaMessage: document.querySelector("#staminaMessage"),
    movementCue: document.querySelector("#movementCue"),
    finalDistance: document.querySelector("#finalDistance"),
    gameOverTitle: document.querySelector("#gameOverTitle"),
    gameOverMessage: document.querySelector("#gameOverMessage"),
    errorMessage: document.querySelector("#errorMessage")
};

const ctx = dom.gameCanvas.getContext("2d");
const poseCtx = dom.poseCanvas.getContext("2d");
const calibrationCtx = dom.calibrationCanvas.getContext("2d");

let poseLandmarker = null;
let mediaStream = null;
let lastVideoTime = -1;
let lastFrameTime = performance.now();
let latestLandmarks = null;
let cueTimer = null;

const input = {
    calibrated: false,
    centerX: 0.5,
    smoothedCenterX: 0.5,
    standingShoulderY: 0.3,
    standingHipY: 0.55,
    shoulderWidth: 0.16,
    bodyHeight: 0.55,
    lane: 0,
    squat: false,
    squatConfidence: 0,
    visible: false,
    missingSince: 0,
    lastStepSide: null,
    lastStepAt: 0,
    cadenceEstimate: 0,
    stepTimes: [],
    calibrationSamples: []
};

const game = {
    state: "intro",
    distance: 0,
    stamina: 100,
    cadence: 0,
    elapsed: 0,
    playerLane: 0,
    targetLane: 0,
    obstacles: [],
    spawnTimer: 1.9,
    nextObstacleId: 1,
    worldTime: 0,
    roadTravel: 0,
    speedKmh: 0,
    flash: 0,
    best: loadBest()
};

dom.bestValue.textContent = game.best;

function loadBest() {
    try {
        return Number(localStorage.getItem("cardioRunnerBest")) || 0;
    } catch {
        return 0;
    }
}

function saveBest(value) {
    try {
        localStorage.setItem("cardioRunnerBest", String(value));
    } catch {
        // The game still works when storage is blocked.
    }
}

function showOverlay(element) {
    [dom.introOverlay, dom.calibrationOverlay, dom.gameOverOverlay, dom.errorOverlay]
        .forEach((overlay) => overlay.classList.toggle("visible", overlay === element));
}

function hideOverlays() {
    [dom.introOverlay, dom.calibrationOverlay, dom.gameOverOverlay, dom.errorOverlay]
        .forEach((overlay) => overlay.classList.remove("visible"));
}

function setPoseStatus(message, level = "") {
    dom.poseStatus.textContent = message;
    dom.poseStatusDot.className = `status-dot${level ? ` ${level}` : ""}`;
}

function showCue(message, duration = 700) {
    dom.movementCue.textContent = message;
    dom.movementCue.classList.add("visible");
    clearTimeout(cueTimer);
    cueTimer = setTimeout(() => dom.movementCue.classList.remove("visible"), duration);
}

async function loadPoseModel() {
    dom.startButton.disabled = true;
    dom.modelStatus.className = "model-status";
    dom.modelStatus.innerHTML = '<span class="spinner" aria-hidden="true"></span>Loading the movement model…';

    try {
        const vision = await FilesetResolver.forVisionTasks(WASM_URL);

        try {
            poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: MODEL_URL,
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numPoses: 1,
                minPoseDetectionConfidence: 0.55,
                minPosePresenceConfidence: 0.55,
                minTrackingConfidence: 0.5
            });
        } catch {
            poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
                baseOptions: { modelAssetPath: MODEL_URL },
                runningMode: "VIDEO",
                numPoses: 1,
                minPoseDetectionConfidence: 0.55,
                minPosePresenceConfidence: 0.55,
                minTrackingConfidence: 0.5
            });
        }

        dom.modelStatus.className = "model-status ready";
        dom.modelStatus.textContent = "Movement model ready";
        dom.startButton.disabled = false;
    } catch (error) {
        console.error("Could not load pose model", error);
        dom.modelStatus.className = "model-status error";
        dom.modelStatus.textContent = "The movement model could not load. Check your connection.";
    }
}

async function enableCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
        showCameraError("This browser does not support webcam access. Try a current version of Chrome, Safari, or Firefox.");
        return;
    }

    dom.startButton.disabled = true;
    dom.startButton.textContent = "Starting camera…";

    try {
        if (mediaStream) {
            mediaStream.getTracks().forEach((track) => track.stop());
        }

        mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user",
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });

        dom.webcam.srcObject = mediaStream;
        await dom.webcam.play();
        dom.cameraStatus.classList.add("hidden");
        lastVideoTime = -1;
        input.missingSince = performance.now();
        startCalibration();
    } catch (error) {
        console.error("Could not start camera", error);
        const denied = error?.name === "NotAllowedError" || error?.name === "SecurityError";
        showCameraError(denied
            ? "Camera permission was denied. Allow access in your browser settings, then try again."
            : "The camera could not be started. Make sure another app is not using it, then try again.");
    } finally {
        dom.startButton.textContent = "Enable camera";
        dom.startButton.disabled = !poseLandmarker;
    }
}

function showCameraError(message) {
    game.state = "error";
    dom.errorMessage.textContent = message;
    showOverlay(dom.errorOverlay);
}

function startCalibration() {
    game.state = "calibrating";
    input.calibrated = false;
    input.calibrationSamples = [];
    input.lastStepSide = null;
    input.stepTimes = [];
    game.calibrationStartedAt = performance.now();
    showOverlay(dom.calibrationOverlay);
}

function updateCalibration(now) {
    const duration = 2500;
    const requiredSamples = 8;
    const elapsed = now - game.calibrationStartedAt;
    const remaining = Math.max(1, Math.ceil((duration - elapsed) / 1000));
    dom.calibrationCount.textContent = remaining;
    const timeProgress = Math.min(1, elapsed / duration);
    const trackingProgress = Math.min(1, input.calibrationSamples.length / requiredSamples);
    dom.calibrationBar.style.width = `${Math.min(timeProgress, trackingProgress) * 100}%`;

    if (elapsed < duration) return;

    if (input.calibrationSamples.length < requiredSamples) {
        dom.calibrationCount.textContent = "👀";
        setPoseStatus("Show your shoulders, hips, and knees", "warning");
        return;
    }

    const samples = input.calibrationSamples;
    input.centerX = median(samples.map((sample) => sample.centerX));
    input.smoothedCenterX = input.centerX;
    input.standingShoulderY = median(samples.map((sample) => sample.shoulderY));
    input.standingHipY = median(samples.map((sample) => sample.hipY));
    input.shoulderWidth = Math.max(0.08, median(samples.map((sample) => sample.shoulderWidth)));
    input.bodyHeight = Math.max(0.28, median(samples.map((sample) => sample.bodyHeight)));
    input.calibrated = true;
    startGame();
}

function startGame() {
    hideOverlays();
    game.state = "playing";
    game.distance = 0;
    game.stamina = 88;
    game.cadence = 0;
    game.elapsed = 0;
    game.playerLane = 0;
    game.targetLane = 0;
    game.speedKmh = 0;
    game.obstacles = [];
    game.spawnTimer = 2.5;
    game.flash = 0;
    input.lane = 0;
    input.smoothedCenterX = input.centerX;
    input.squat = false;
    input.squatConfidence = 0;
    input.lastStepSide = null;
    input.lastStepAt = 0;
    input.cadenceEstimate = 0;
    input.stepTimes = [];
    dom.distanceValue.textContent = "0";
    dom.paceValue.textContent = "0";
    updateSpeedometer();
    updateLaneIndicator(0);
    dom.squatIndicator.classList.remove("active");
    dom.squatIndicator.textContent = "Head below orange line to squat";
    updateStaminaDisplay();
    showCue("Run in place!", 1200);
}

function median(values) {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
}

function averagePoint(a, b) {
    return {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
        visibility: Math.min(a.visibility ?? 1, b.visibility ?? 1)
    };
}

function distanceBetween(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function hasVisibleBody(landmarks) {
    const required = [
        LANDMARK.leftShoulder, LANDMARK.rightShoulder,
        LANDMARK.leftHip, LANDMARK.rightHip,
        LANDMARK.leftKnee, LANDMARK.rightKnee
    ];
    return required.every((index) => (landmarks[index].visibility ?? 1) > 0.3);
}

function getCalibrationHint(landmarks) {
    const groups = [
        ["shoulders", [LANDMARK.leftShoulder, LANDMARK.rightShoulder]],
        ["hips", [LANDMARK.leftHip, LANDMARK.rightHip]],
        ["knees", [LANDMARK.leftKnee, LANDMARK.rightKnee]]
    ];
    const missing = groups
        .filter(([, indices]) => indices.some((index) => (landmarks[index].visibility ?? 1) <= 0.3))
        .map(([label]) => label);

    if (!missing.length) return "Good position — hold still.";
    if (missing.includes("knees")) return "Step farther back so both knees are visible.";
    return `Adjust the camera so your ${missing.join(" and ")} are visible.`;
}

function processPose(landmarks, now) {
    latestLandmarks = landmarks;
    input.visible = hasVisibleBody(landmarks);

    if (!input.visible) {
        if (!input.missingSince) input.missingSince = now;
        setPoseStatus("Show your full body", "warning");
        if (game.state === "calibrating") {
            dom.calibrationHint.textContent = getCalibrationHint(landmarks);
        }
        return;
    }

    input.missingSince = 0;
    setPoseStatus(input.squat ? "Squat detected" : "Body tracking", "active");
    if (game.state === "calibrating") {
        dom.calibrationHint.textContent = "Good position — hold still.";
    }

    const nose = landmarks[LANDMARK.nose];
    const leftShoulder = landmarks[LANDMARK.leftShoulder];
    const rightShoulder = landmarks[LANDMARK.rightShoulder];
    const leftHip = landmarks[LANDMARK.leftHip];
    const rightHip = landmarks[LANDMARK.rightHip];
    const leftKnee = landmarks[LANDMARK.leftKnee];
    const rightKnee = landmarks[LANDMARK.rightKnee];
    const leftAnkle = landmarks[LANDMARK.leftAnkle];
    const rightAnkle = landmarks[LANDMARK.rightAnkle];

    const shoulder = averagePoint(leftShoulder, rightShoulder);
    const hip = averagePoint(leftHip, rightHip);
    const knee = averagePoint(leftKnee, rightKnee);
    const ankle = averagePoint(leftAnkle, rightAnkle);
    const shoulderWidth = distanceBetween(leftShoulder, rightShoulder);
    const anklesVisible = (leftAnkle.visibility ?? 1) > 0.3 &&
        (rightAnkle.visibility ?? 1) > 0.3;
    const bodyHeight = anklesVisible
        ? distanceBetween(shoulder, ankle)
        : distanceBetween(shoulder, knee) * 1.55;
    const torsoCenterX = (shoulder.x + hip.x) / 2;
    const mirroredCenterX = 1 - torsoCenterX;

    if (game.state === "calibrating") {
        const torsoIsVertical = Math.abs(shoulder.y - hip.y) > Math.abs(shoulder.x - hip.x);
        if (torsoIsVertical && bodyHeight > 0.18) {
            input.calibrationSamples.push({
                centerX: mirroredCenterX,
                shoulderY: shoulder.y,
                hipY: hip.y,
                shoulderWidth,
                bodyHeight
            });
            if (input.calibrationSamples.length > 90) input.calibrationSamples.shift();
        } else {
            dom.calibrationHint.textContent = "Stand upright and face the camera.";
        }
        return;
    }

    if (!input.calibrated) return;

    const noseVisible = (nose.visibility ?? 1) > 0.25;
    const headBelowStandingShoulders = nose.y > input.standingShoulderY - input.bodyHeight * 0.01;
    const shouldersClearlyDropped = shoulder.y > input.standingShoulderY + input.bodyHeight * 0.045;
    const squatCandidate = noseVisible &&
        (headBelowStandingShoulders || shouldersClearlyDropped);
    input.squatConfidence += (squatCandidate ? 1 : -1) * 0.24;
    input.squatConfidence = Math.max(0, Math.min(1, input.squatConfidence));

    const wasSquatting = input.squat;
    if (!input.squat && input.squatConfidence > 0.48) input.squat = true;
    if (input.squat && input.squatConfidence < 0.24) input.squat = false;
    dom.squatIndicator.classList.toggle("active", input.squat);
    dom.squatIndicator.textContent = input.squat
        ? "Squat detected ✓"
        : "Head below orange line to squat";
    if (!wasSquatting && input.squat) showCue("Squat!", 550);

    if (!input.squat) {
        input.smoothedCenterX += (mirroredCenterX - input.smoothedCenterX) * 0.3;
        const lateralOffset = (input.smoothedCenterX - input.centerX) / input.shoulderWidth;
        let nextLane = input.lane;

        if (input.lane === 0) {
            if (lateralOffset < -0.3) nextLane = -1;
            if (lateralOffset > 0.3) nextLane = 1;
        } else if (input.lane === -1) {
            if (lateralOffset > 0.3) nextLane = 1;
            else if (lateralOffset > -0.14) nextLane = 0;
        } else {
            if (lateralOffset < -0.3) nextLane = -1;
            else if (lateralOffset < 0.14) nextLane = 0;
        }

        if (nextLane !== input.lane) {
            input.lane = nextLane;
            updateLaneIndicator(nextLane);
            showCue(nextLane === 0 ? "Centre lane" : nextLane < 0 ? "Left lane" : "Right lane", 420);
        }
        game.targetLane = input.lane;
        const laneName = input.lane === 0 ? "centre" : input.lane < 0 ? "left" : "right";
        setPoseStatus(`Tracking · ${laneName} lane`, "active");
    }

    if (game.state === "playing" && !input.squat) {
        detectStep(leftKnee, rightKnee, now);
    }
}

function detectStep(leftKnee, rightKnee, now) {
    const kneeDifference = (leftKnee.y - rightKnee.y) / input.bodyHeight;
    const threshold = 0.02;
    let raisedSide = null;

    if (kneeDifference < -threshold) raisedSide = "left";
    if (kneeDifference > threshold) raisedSide = "right";

    if (
        raisedSide &&
        raisedSide !== input.lastStepSide &&
        now - input.lastStepAt > 150
    ) {
        const interval = now - input.lastStepAt;
        if (input.lastStepAt && interval < 1200) {
            const instantCadence = Math.max(55, Math.min(220, 60000 / interval));
            input.cadenceEstimate = input.cadenceEstimate
                ? input.cadenceEstimate * 0.68 + instantCadence * 0.32
                : instantCadence;
        }
        input.lastStepSide = raisedSide;
        input.lastStepAt = now;
        input.stepTimes.push(now);
        input.stepTimes = input.stepTimes.filter((time) => now - time < 6000).slice(-12);
        game.stamina = Math.min(100, game.stamina + 5.6);
    }
}

function calculateCadence(now) {
    if (!input.cadenceEstimate || !input.lastStepAt) return 0;
    const silence = now - input.lastStepAt;
    const decay = silence > 900
        ? Math.max(0, 1 - (silence - 900) / 1700)
        : 1;
    return Math.round(input.cadenceEstimate * decay);
}

function runPoseDetection(now) {
    if (
        !poseLandmarker ||
        dom.webcam.readyState < 2 ||
        dom.webcam.currentTime === lastVideoTime
    ) return;

    lastVideoTime = dom.webcam.currentTime;

    try {
        const result = poseLandmarker.detectForVideo(dom.webcam, now);
        if (result.landmarks?.length) {
            processPose(result.landmarks[0], now);
        } else {
            latestLandmarks = null;
            input.visible = false;
            if (!input.missingSince) input.missingSince = now;
            setPoseStatus("No body detected", "warning");
            if (game.state === "calibrating") {
                dom.calibrationHint.textContent = "No body detected — step into the orange guide.";
            }
        }
        drawPosePreview(result.landmarks?.[0] ?? null);
    } catch (error) {
        console.warn("Pose frame skipped", error);
    }
}

function drawPosePreview(landmarks) {
    const width = dom.poseCanvas.clientWidth;
    const height = dom.poseCanvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (dom.poseCanvas.width !== Math.round(width * dpr) ||
        dom.poseCanvas.height !== Math.round(height * dpr)) {
        dom.poseCanvas.width = Math.round(width * dpr);
        dom.poseCanvas.height = Math.round(height * dpr);
    }

    poseCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    poseCtx.clearRect(0, 0, width, height);
    if (!landmarks) return;

    poseCtx.lineWidth = 2;
    poseCtx.strokeStyle = input.squat ? "#fb923c" : "#34d399";
    poseCtx.fillStyle = "#ffffff";

    POSE_CONNECTIONS.forEach(([from, to]) => {
        const a = landmarks[from];
        const b = landmarks[to];
        if ((a.visibility ?? 1) < 0.4 || (b.visibility ?? 1) < 0.4) return;
        poseCtx.beginPath();
        poseCtx.moveTo(a.x * width, a.y * height);
        poseCtx.lineTo(b.x * width, b.y * height);
        poseCtx.stroke();
    });

    Object.values(LANDMARK).forEach((index) => {
        const point = landmarks[index];
        if ((point.visibility ?? 1) < 0.4) return;
        poseCtx.beginPath();
        poseCtx.arc(point.x * width, point.y * height, 2.5, 0, Math.PI * 2);
        poseCtx.fill();
    });

    if (input.calibrated) {
        poseCtx.save();
        poseCtx.setLineDash([5, 4]);
        poseCtx.lineWidth = 2;
        poseCtx.strokeStyle = input.squat ? "#34d399" : "#fb923c";
        poseCtx.beginPath();
        poseCtx.moveTo(0, input.standingShoulderY * height);
        poseCtx.lineTo(width, input.standingShoulderY * height);
        poseCtx.stroke();
        poseCtx.restore();
    }
}

function drawCalibrationPreview() {
    if (game.state !== "calibrating" || dom.webcam.readyState < 2) return;

    const width = dom.calibrationCanvas.clientWidth;
    const height = dom.calibrationCanvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (dom.calibrationCanvas.width !== Math.round(width * dpr) ||
        dom.calibrationCanvas.height !== Math.round(height * dpr)) {
        dom.calibrationCanvas.width = Math.round(width * dpr);
        dom.calibrationCanvas.height = Math.round(height * dpr);
    }

    calibrationCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    calibrationCtx.clearRect(0, 0, width, height);
    calibrationCtx.save();
    calibrationCtx.translate(width, 0);
    calibrationCtx.scale(-1, 1);
    calibrationCtx.drawImage(dom.webcam, 0, 0, width, height);
    calibrationCtx.restore();

    calibrationCtx.fillStyle = "rgba(2, 6, 23, 0.12)";
    calibrationCtx.fillRect(0, 0, width, height);
    if (!latestLandmarks) return;

    calibrationCtx.strokeStyle = input.visible ? "#34d399" : "#fbbf24";
    calibrationCtx.fillStyle = "#ffffff";
    calibrationCtx.lineWidth = 3;

    POSE_CONNECTIONS.forEach(([from, to]) => {
        const a = latestLandmarks[from];
        const b = latestLandmarks[to];
        if ((a.visibility ?? 1) < 0.2 || (b.visibility ?? 1) < 0.2) return;
        calibrationCtx.beginPath();
        calibrationCtx.moveTo((1 - a.x) * width, a.y * height);
        calibrationCtx.lineTo((1 - b.x) * width, b.y * height);
        calibrationCtx.stroke();
    });

    Object.values(LANDMARK).forEach((index) => {
        const point = latestLandmarks[index];
        if ((point.visibility ?? 1) < 0.2) return;
        calibrationCtx.beginPath();
        calibrationCtx.arc((1 - point.x) * width, point.y * height, 4, 0, Math.PI * 2);
        calibrationCtx.fill();
    });
}

function updateGame(dt, now) {
    game.worldTime += dt;
    game.flash = Math.max(0, game.flash - dt * 2.5);
    game.playerLane += (game.targetLane - game.playerLane) * Math.min(1, dt * 10);

    if (game.state !== "playing") {
        game.speedKmh += (0 - game.speedKmh) * Math.min(1, dt * 3);
        game.roadTravel += dt * 0.025;
        updateSpeedometer();
        return;
    }

    game.elapsed += dt;
    game.cadence = calculateCadence(now);

    if (game.elapsed > 3.5) {
        game.stamina -= dt * 7.6;
        if (!input.visible) game.stamina -= dt * 5;
    }

    game.stamina = Math.max(0, Math.min(100, game.stamina));
    const targetSpeed = game.cadence < 45
        ? 0
        : Math.min(18, 4 + (game.cadence - 45) * 14 / 135);
    const speedResponse = targetSpeed > game.speedKmh ? 2 : 0.75;
    game.speedKmh += (targetSpeed - game.speedKmh) * Math.min(1, dt * speedResponse);
    game.roadTravel += dt * (0.08 + game.speedKmh * 0.032);
    const worldSpeed = 0.07 + game.speedKmh * 0.0065 + Math.min(0.025, game.distance / 8000);
    game.distance += dt * game.speedKmh / 3.6;

    game.spawnTimer -= dt;
    if (game.spawnTimer <= 0) {
        spawnObstacle();
        const difficulty = Math.min(0.65, game.distance / 1000);
        game.spawnTimer = 2.15 - difficulty + Math.random() * 0.85;
    }

    game.obstacles.forEach((obstacle) => {
        obstacle.progress += dt * worldSpeed;
        if (!obstacle.checked && obstacle.progress >= 0.84) {
            obstacle.checked = true;
            checkCollision(obstacle);
        }
    });
    game.obstacles = game.obstacles.filter((obstacle) => obstacle.progress < 1.18);

    if (game.stamina <= 0) {
        endGame("momentum");
        return;
    }

    dom.distanceValue.textContent = Math.floor(game.distance);
    dom.paceValue.textContent = game.cadence;
    updateSpeedometer();
    updateStaminaDisplay();
}

function spawnObstacle() {
    const makeOverhead = game.distance > 45 && Math.random() < 0.32;
    game.obstacles.push({
        id: game.nextObstacleId++,
        type: makeOverhead ? "beam" : "barrier",
        lane: makeOverhead ? 0 : Math.floor(Math.random() * 3) - 1,
        progress: 0,
        checked: false
    });
}

function checkCollision(obstacle) {
    const hitBarrier = obstacle.type === "barrier" &&
        Math.abs(game.playerLane - obstacle.lane) < 0.48;
    const hitBeam = obstacle.type === "beam" && !input.squat;

    if (hitBarrier || hitBeam) {
        game.flash = 1;
        endGame("obstacle");
    } else {
        showCue(obstacle.type === "beam" ? "Nice squat!" : "Clear!", 450);
    }
}

function updateSpeedometer() {
    const displaySpeed = Math.max(0, game.speedKmh);
    const gaugeFraction = Math.min(1, displaySpeed / 18);
    dom.speedValue.textContent = displaySpeed.toFixed(1);
    dom.speedNeedle.style.transform = `rotate(${-90 + gaugeFraction * 180}deg)`;

    if (game.state !== "playing" || game.cadence < 55) {
        dom.speedHint.textContent = "Lift alternating knees";
    } else if (game.cadence < 120) {
        dom.speedHint.textContent = `${game.cadence} spm · go quicker`;
    } else if (game.cadence < 160) {
        dom.speedHint.textContent = `${game.cadence} spm · good pace`;
    } else {
        dom.speedHint.textContent = `${game.cadence} spm · top speed!`;
    }
}

function updateLaneIndicator(lane) {
    dom.laneIndicators.forEach((indicator) => {
        indicator.classList.toggle("active", Number(indicator.dataset.lane) === lane);
    });
}

function updateStaminaDisplay() {
    const value = Math.max(0, game.stamina);
    dom.staminaBar.style.width = `${value}%`;
    dom.staminaBar.classList.toggle("warning", value <= 50 && value > 24);
    dom.staminaBar.classList.toggle("danger", value <= 24);

    if (game.elapsed < 3.5 && game.state === "playing") {
        dom.staminaMessage.textContent = "Build your pace";
    } else if (value <= 24) {
        dom.staminaMessage.textContent = "Run faster!";
    } else if (value <= 50) {
        dom.staminaMessage.textContent = "Keep alternating";
    } else {
        dom.staminaMessage.textContent = game.cadence >= 115 ? "Strong pace" : "Keep moving";
    }
}

function endGame(reason) {
    if (game.state !== "playing") return;
    game.state = "over";

    const final = Math.floor(game.distance);
    if (final > game.best) {
        game.best = final;
        saveBest(final);
        dom.bestValue.textContent = final;
    }

    dom.finalDistance.textContent = final;
    if (reason === "obstacle") {
        dom.gameOverTitle.textContent = "Obstacle hit";
        dom.gameOverMessage.textContent = "Shift fully into another lane, or squat until your head drops below your calibrated shoulder level.";
    } else {
        dom.gameOverTitle.textContent = "Out of momentum";
        dom.gameOverMessage.textContent = "Alternate your knees more clearly and keep a steady running rhythm.";
    }
    showOverlay(dom.gameOverOverlay);
}

function resizeGameCanvas() {
    const width = dom.gameCanvas.clientWidth;
    const height = dom.gameCanvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(width * dpr);
    const pixelHeight = Math.round(height * dpr);

    if (dom.gameCanvas.width !== pixelWidth || dom.gameCanvas.height !== pixelHeight) {
        dom.gameCanvas.width = pixelWidth;
        dom.gameCanvas.height = pixelHeight;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { width, height };
}

function perspective(progress) {
    return Math.pow(Math.max(0, progress), 1.55);
}

function roadMetrics(width, height, progress) {
    const p = perspective(progress);
    const horizon = height * 0.25;
    const bottom = height * 1.04;
    const roadWidth = width * (0.12 + p * 0.86);
    const y = horizon + (bottom - horizon) * p;
    return { p, y, roadWidth, center: width / 2 };
}

function drawGame() {
    const { width, height } = resizeGameCanvas();
    ctx.clearRect(0, 0, width, height);
    drawSky(width, height);
    drawCity(width, height);
    drawRoad(width, height);
    drawSpeedLines(width, height);

    [...game.obstacles]
        .sort((a, b) => a.progress - b.progress)
        .forEach((obstacle) => drawObstacle(obstacle, width, height));

    drawPlayer(width, height);

    if (game.flash > 0) {
        ctx.fillStyle = `rgba(251, 113, 133, ${game.flash * 0.28})`;
        ctx.fillRect(0, 0, width, height);
    }
}

function drawSky(width, height) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#07101f");
    gradient.addColorStop(0.5, "#10233c");
    gradient.addColorStop(1, "#172033");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(width * 0.5, height * 0.22, 0, width * 0.5, height * 0.22, width * 0.38);
    glow.addColorStop(0, "rgba(249, 115, 22, 0.18)");
    glow.addColorStop(1, "rgba(249, 115, 22, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height * 0.7);
}

function drawCity(width, height) {
    const horizon = height * 0.255;
    ctx.fillStyle = "#08111f";

    for (let side = 0; side < 2; side++) {
        const direction = side === 0 ? -1 : 1;
        for (let i = 0; i < 12; i++) {
            const buildingWidth = width * (0.035 + ((i * 17) % 5) * 0.009);
            const x = width / 2 + direction * (width * 0.09 + i * width * 0.047);
            const buildingHeight = height * (0.05 + ((i * 23) % 7) * 0.014);
            ctx.fillRect(
                side === 0 ? x - buildingWidth : x,
                horizon - buildingHeight,
                buildingWidth,
                buildingHeight
            );
        }
    }

    ctx.fillStyle = "rgba(251, 146, 60, 0.5)";
    for (let i = 0; i < 18; i++) {
        const x = ((i * 97) % 1000) / 1000 * width;
        const y = horizon - height * (0.025 + ((i * 31) % 75) / 1000);
        ctx.fillRect(x, y, 1.5, 1.5);
    }
}

function drawRoad(width, height) {
    const horizonY = height * 0.25;
    ctx.beginPath();
    ctx.moveTo(width * 0.44, horizonY);
    ctx.lineTo(width * 0.03, height);
    ctx.lineTo(width * 0.97, height);
    ctx.lineTo(width * 0.56, horizonY);
    ctx.closePath();

    const roadGradient = ctx.createLinearGradient(0, horizonY, 0, height);
    roadGradient.addColorStop(0, "#17243a");
    roadGradient.addColorStop(1, "#111827");
    ctx.fillStyle = roadGradient;
    ctx.fill();

    ctx.strokeStyle = "rgba(251, 146, 60, 0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width * 0.44, horizonY);
    ctx.lineTo(width * 0.03, height);
    ctx.moveTo(width * 0.56, horizonY);
    ctx.lineTo(width * 0.97, height);
    ctx.stroke();

    const offset = game.roadTravel % 0.16;
    for (let laneDivider = -0.5; laneDivider <= 0.5; laneDivider += 1) {
        for (let p = offset; p < 1; p += 0.16) {
            const start = roadMetrics(width, height, p);
            const end = roadMetrics(width, height, Math.min(1, p + 0.075));
            const startX = start.center + laneDivider * start.roadWidth / 1.5;
            const endX = end.center + laneDivider * end.roadWidth / 1.5;
            ctx.strokeStyle = `rgba(226, 232, 240, ${0.12 + end.p * 0.38})`;
            ctx.lineWidth = 1 + end.p * 3;
            ctx.beginPath();
            ctx.moveTo(startX, start.y);
            ctx.lineTo(endX, end.y);
            ctx.stroke();
        }
    }

    for (let p = game.roadTravel % 0.12; p < 1; p += 0.12) {
        const m = roadMetrics(width, height, p);
        ctx.strokeStyle = `rgba(148, 163, 184, ${m.p * 0.08})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(m.center - m.roadWidth / 2, m.y);
        ctx.lineTo(m.center + m.roadWidth / 2, m.y);
        ctx.stroke();
    }
}

function drawSpeedLines(width, height) {
    const intensity = Math.max(0, (game.speedKmh - 5) / 13);
    if (intensity <= 0) return;

    const horizonX = width / 2;
    const horizonY = height * 0.25;
    ctx.save();
    ctx.strokeStyle = `rgba(226, 232, 240, ${0.08 + intensity * 0.18})`;
    ctx.lineCap = "round";

    for (let i = 0; i < 24; i++) {
        const seed = ((i * 47) % 101) / 101;
        const side = i % 2 === 0 ? -1 : 1;
        const travel = (game.roadTravel * (0.7 + seed) + seed) % 1;
        const startP = 0.12 + travel * 0.78;
        const endP = Math.min(1, startP + 0.025 + intensity * 0.075);
        const startY = horizonY + Math.pow(startP, 1.55) * height * 0.78;
        const endY = horizonY + Math.pow(endP, 1.55) * height * 0.78;
        const spread = width * (0.1 + seed * 0.42);
        const startX = horizonX + side * spread * Math.pow(startP, 0.8);
        const endX = horizonX + side * spread * Math.pow(endP, 0.8);

        ctx.lineWidth = 1 + intensity * 2.5 * startP;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
    ctx.restore();
}

function drawObstacle(obstacle, width, height) {
    const m = roadMetrics(width, height, obstacle.progress);
    if (obstacle.progress < 0 || m.y > height * 1.08) return;

    const laneX = m.center + obstacle.lane * m.roadWidth / 3;
    const scale = 0.08 + m.p * 0.92;

    ctx.save();
    ctx.translate(laneX, m.y);

    if (obstacle.type === "barrier") {
        const obstacleWidth = width * 0.115 * scale;
        const obstacleHeight = height * 0.16 * scale;

        ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
        ctx.beginPath();
        ctx.ellipse(0, 3, obstacleWidth * 0.65, obstacleHeight * 0.14, 0, 0, Math.PI * 2);
        ctx.fill();

        const gradient = ctx.createLinearGradient(0, -obstacleHeight, 0, 0);
        gradient.addColorStop(0, "#fb923c");
        gradient.addColorStop(1, "#c2410c");
        ctx.fillStyle = gradient;
        roundedRect(ctx, -obstacleWidth / 2, -obstacleHeight, obstacleWidth, obstacleHeight, 5 * scale);
        ctx.fill();

        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.save();
        ctx.beginPath();
        ctx.rect(-obstacleWidth / 2, -obstacleHeight, obstacleWidth, obstacleHeight);
        ctx.clip();
        ctx.rotate(-0.42);
        for (let x = -obstacleWidth; x < obstacleWidth * 1.5; x += obstacleWidth * 0.42) {
            ctx.fillRect(x, -obstacleHeight * 1.4, obstacleWidth * 0.16, obstacleHeight * 2.2);
        }
        ctx.restore();
    } else {
        const beamWidth = m.roadWidth * 0.92;
        const postHeight = height * 0.25 * scale;
        const postWidth = Math.max(3, width * 0.015 * scale);
        const beamHeight = Math.max(5, height * 0.032 * scale);

        ctx.fillStyle = "#7c2d12";
        ctx.fillRect(-beamWidth / 2, -postHeight, postWidth, postHeight);
        ctx.fillRect(beamWidth / 2 - postWidth, -postHeight, postWidth, postHeight);

        const beamGradient = ctx.createLinearGradient(0, -postHeight, 0, -postHeight + beamHeight);
        beamGradient.addColorStop(0, "#fdba74");
        beamGradient.addColorStop(1, "#ea580c");
        ctx.fillStyle = beamGradient;
        roundedRect(ctx, -beamWidth / 2, -postHeight, beamWidth, beamHeight, 4 * scale);
        ctx.fill();

        ctx.fillStyle = "#431407";
        ctx.font = `${Math.max(5, 15 * scale)}px system-ui`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("SQUAT", 0, -postHeight + beamHeight / 2);
    }

    ctx.restore();
}

function roundedRect(context, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.roundRect(x, y, width, height, r);
}

function drawPlayer(width, height) {
    const road = roadMetrics(width, height, 0.91);
    const x = road.center + game.playerLane * road.roadWidth / 3;
    const groundY = Math.min(height * 0.88, road.y);
    const runIntensity = Math.min(1, game.speedKmh / 18);
    const runPhase = game.worldTime * Math.max(7, game.cadence / 8);
    const bob = game.state === "playing" && game.cadence > 0
        ? Math.abs(Math.sin(runPhase)) * -5 * runIntensity
        : 0;
    const scale = Math.max(0.7, Math.min(1.12, height / 720));

    ctx.save();
    ctx.translate(x, groundY + bob);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(249, 115, 22, 0.5)";
    ctx.shadowBlur = 18;

    if (input.squat && game.state === "playing") {
        ctx.strokeStyle = "#fb923c";
        ctx.lineWidth = 9 * scale;
        ctx.beginPath();
        ctx.moveTo(0, -42 * scale);
        ctx.lineTo(0, -20 * scale);
        ctx.stroke();
        ctx.fillStyle = "#fed7aa";
        ctx.beginPath();
        ctx.arc(0, -52 * scale, 10 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fdba74";
        ctx.lineWidth = 6 * scale;
        ctx.beginPath();
        ctx.moveTo(0, -34 * scale);
        ctx.lineTo(-20 * scale, -18 * scale);
        ctx.lineTo(-24 * scale, -2 * scale);
        ctx.moveTo(0, -34 * scale);
        ctx.lineTo(20 * scale, -18 * scale);
        ctx.lineTo(24 * scale, -2 * scale);
        ctx.moveTo(0, -20 * scale);
        ctx.lineTo(-17 * scale, -10 * scale);
        ctx.lineTo(-28 * scale, 0);
        ctx.moveTo(0, -20 * scale);
        ctx.lineTo(17 * scale, -10 * scale);
        ctx.lineTo(28 * scale, 0);
        ctx.stroke();
    } else {
        const stride = game.state === "playing"
            ? Math.sin(runPhase) * (8 + 11 * runIntensity)
            : 0;

        ctx.save();
        ctx.rotate(runIntensity * 0.06);
        ctx.strokeStyle = "#fb923c";
        ctx.lineWidth = 10 * scale;
        ctx.beginPath();
        ctx.moveTo(0, -63 * scale);
        ctx.lineTo(0, -30 * scale);
        ctx.stroke();

        ctx.strokeStyle = "#fdba74";
        ctx.lineWidth = 7 * scale;
        ctx.beginPath();
        ctx.moveTo(0, -51 * scale);
        ctx.lineTo(-18 * scale - stride * 0.45, -34 * scale);
        ctx.moveTo(0, -51 * scale);
        ctx.lineTo(18 * scale + stride * 0.45, -35 * scale);
        ctx.moveTo(0, -30 * scale);
        ctx.lineTo(-10 * scale + stride, 0);
        ctx.moveTo(0, -30 * scale);
        ctx.lineTo(10 * scale - stride, 0);
        ctx.stroke();

        ctx.fillStyle = "#fed7aa";
        ctx.beginPath();
        ctx.arc(0, -76 * scale, 11 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.beginPath();
    ctx.ellipse(0, 4 * scale, 30 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function animationLoop(now) {
    const dt = Math.min(0.05, (now - lastFrameTime) / 1000);
    lastFrameTime = now;

    runPoseDetection(now);
    drawCalibrationPreview();
    if (game.state === "calibrating") updateCalibration(now);
    updateGame(dt, now);
    drawGame();
    requestAnimationFrame(animationLoop);
}

dom.startButton.addEventListener("click", enableCamera);
dom.retryButton.addEventListener("click", () => {
    showOverlay(dom.introOverlay);
    enableCamera();
});
dom.restartButton.addEventListener("click", startGame);
dom.recalibrateButton.addEventListener("click", startCalibration);

window.addEventListener("beforeunload", () => {
    mediaStream?.getTracks().forEach((track) => track.stop());
    poseLandmarker?.close();
});

document.addEventListener("visibilitychange", () => {
    if (document.hidden && game.state === "playing") {
        endGame("momentum");
    }
});

requestAnimationFrame(animationLoop);
loadPoseModel();
