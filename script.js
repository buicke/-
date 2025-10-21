const WORK_DURATION = 25 * 60; // seconds
const BREAK_DURATION = 5 * 60; // seconds

const timeDisplay = document.getElementById("time-display");
const phaseLabel = document.getElementById("phase");
const workCountEl = document.getElementById("work-count");
const startStopBtn = document.getElementById("start-stop");
const resetBtn = document.getElementById("reset");

let currentPhase = "work";
let remainingSeconds = WORK_DURATION;
let timerId = null;
let isRunning = false;
let completedWorkSessions = 0;
let audioContext;
let hasStarted = false;

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function updateDisplay() {
  timeDisplay.textContent = formatTime(remainingSeconds);
  phaseLabel.textContent = currentPhase === "work" ? "作業" : "休憩";
  phaseLabel.classList.toggle("break", currentPhase === "break");
  startStopBtn.textContent = isRunning ? "一時停止" : hasStarted ? "再開" : "スタート";
}

function updateWorkCount() {
  workCountEl.textContent = completedWorkSessions.toString();
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  hasStarted = true;
  timerId = setInterval(() => {
    if (remainingSeconds > 0) {
      remainingSeconds -= 1;
      updateDisplay();
    } else {
      handlePhaseCompletion();
    }
  }, 1000);
  updateDisplay();
}

function pauseTimer() {
  if (!isRunning) return;
  isRunning = false;
  clearInterval(timerId);
  timerId = null;
  updateDisplay();
}

function resetTimer() {
  pauseTimer();
  currentPhase = "work";
  remainingSeconds = WORK_DURATION;
  completedWorkSessions = 0;
  hasStarted = false;
  updateDisplay();
  updateWorkCount();
}

function handlePhaseCompletion() {
  playBeep();

  if (currentPhase === "work") {
    completedWorkSessions += 1;
    updateWorkCount();
    switchToBreak();
  } else {
    switchToWork();
  }
}

function switchToBreak() {
  currentPhase = "break";
  remainingSeconds = BREAK_DURATION;
  updateDisplay();
}

function switchToWork() {
  currentPhase = "work";
  remainingSeconds = WORK_DURATION;
  updateDisplay();
}

function playBeep() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  const duration = 0.6;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
  gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.1, audioContext.currentTime + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

startStopBtn.addEventListener("click", () => {
  if (isRunning) {
    pauseTimer();
  } else {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
    startTimer();
  }
});

resetBtn.addEventListener("click", resetTimer);

updateDisplay();
updateWorkCount();
