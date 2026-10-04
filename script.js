/**
 * Word Blurts! - Main Application Logic
 */

// --- WORD BANK & DATA ---
const WORD_BANK = [
  { word: "ORBIT", category: "Space" },
  { word: "NEBULA", category: "Space" },
  { word: "SUPERNOVA", category: "Space" },
  { word: "GRAVITY", category: "Physics" },
  { word: "ECLIPSE", category: "Astronomy" },
  { word: "COSMOS", category: "Space" },
  { word: "ASTEROID", category: "Space" },
  { word: "LIGHTYEAR", category: "Measurement" },
  { word: "PULSAR", category: "Astronomy" },
  { word: "GALAXY", category: "Space" },
  { word: "QUASAR", category: "Astronomy" },
  { word: "BLACK HOLE", category: "Space" },
  { word: "TITAN", category: "Moons" },
  { word: "METEOR", category: "Space" },
  { word: "VELOCITY", category: "Physics" }
];

// --- GAME STATE ---
let isDailyMode = true;
let currentRound = 0;
const TOTAL_DAILY_ROUNDS = 10;
let dailyScore = 0;
let dailyResults = []; // Array of '🟩' or '🟥'
let currentWordIndex = 0;
let activeWordList = [];

// --- AUDIO SYNTHESIS (FALLBACK SAFE) ---
function playAudioCue(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'fail') {
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {
    // Web Audio blocked or unsupported
  }
}

// --- DETERMINISTIC SEED FOR DAILY MODE ---
function getDailySeed() {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
}

function getDailyWords() {
  const seed = getDailySeed();
  let list = [...WORD_BANK];
  let seededList = [];
  
  // Pseudo-random shuffle based on date seed
  let pseudoRandom = seed;
  for (let i = 0; i < TOTAL_DAILY_ROUNDS; i++) {
    pseudoRandom = (pseudoRandom * 9301 + 49297) % 233280;
    const index = Math.floor((pseudoRandom / 233280) * list.length);
    seededList.push(list.splice(index, 1)[0]);
  }
  return seededList;
}

// --- LOCAL STORAGE & STREAKS ---
function getStreakData() {
  const data = JSON.parse(localStorage.getItem('word_blurts_streak') || '{}');
  return {
    count: data.count || 0,
    lastDate: data.lastDate || null
  };
}

function updateStreak() {
  const streak = getStreakData();
  const todayStr = new Date().toDateString();
  
  if (streak.lastDate !== todayStr) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (streak.lastDate === yesterday.toDateString()) {
      streak.count += 1;
    } else {
      streak.count = 1;
    }
    streak.lastDate = todayStr;
    localStorage.setItem('word_blurts_streak', JSON.stringify(streak));
  }
  return streak.count;
}

// --- GAMEPLAY FLOW ---
function initDailyMode() {
  isDailyMode = true;
  currentRound = 0;
  dailyScore = 0;
  dailyResults = [];
  activeWordList = getDailyWords();

  document.getElementById('dailyModeBtn').classList.add('btn-active');
  document.getElementById('freePlayBtn').classList.remove('btn-active');
  
  updateUI();
}

function initFreePlayMode() {
  isDailyMode = false;
  currentRound = 0;
  dailyScore = 0;
  activeWordList = [...WORD_BANK].sort(() => Math.random() - 0.5);

  document.getElementById('freePlayBtn').classList.add('btn-active');
  document.getElementById('dailyModeBtn').classList.remove('btn-active');

  updateUI();
}

function updateUI() {
  const roundDisp = document.getElementById('roundDisplay');
  const scoreDisp = document.getElementById('scoreDisplay');
  const streakDisp = document.getElementById('streakDisplay');
  const streak = getStreakData();

  roundDisp.textContent = isDailyMode ? `${currentRound}/${TOTAL_DAILY_ROUNDS}` : `${currentRound}`;
  scoreDisp.textContent = `${dailyScore}`;
  streakDisp.textContent = `🔥 ${streak.count}`;

  document.getElementById('startBtn').style.display = 'block';
  document.getElementById('scoringControls').style.display = 'none';
  document.getElementById('wordDisplay').textContent = "READY?";
  document.getElementById('categoryDisplay').textContent = isDailyMode ? "Daily Challenge" : "Free Play";
}

function nextWord() {
  if (isDailyMode && currentRound >= TOTAL_DAILY_ROUNDS) {
    finishDailyGame();
    return;
  }

  const currentItem = activeWordList[currentRound % activeWordList.length];
  document.getElementById('wordDisplay').textContent = currentItem.word;
  document.getElementById('categoryDisplay').textContent = currentItem.category;

  document.getElementById('startBtn').style.display = 'none';
  document.getElementById('scoringControls').style.display = 'flex';
}

function recordResult(success) {
  playAudioCue(success ? 'success' : 'fail');
  
  if (success) {
    dailyScore++;
    dailyResults.push('🟩');
  } else {
    dailyResults.push('🟥');
  }

  currentRound++;
  document.getElementById('scoreDisplay').textContent = dailyScore;
  document.getElementById('roundDisplay').textContent = isDailyMode ? `${currentRound}/${TOTAL_DAILY_ROUNDS}` : `${currentRound}`;

  if (isDailyMode && currentRound >= TOTAL_DAILY_ROUNDS) {
    finishDailyGame();
  } else {
    nextWord();
  }
}

function finishDailyGame() {
  const currentStreak = updateStreak();
  const emojiGrid = dailyResults.join('');
  
  document.getElementById('resScore').textContent = `${dailyScore}/${TOTAL_DAILY_ROUNDS}`;
  document.getElementById('resStreak').textContent = `🔥 ${currentStreak}`;
  document.getElementById('emojiGridDisplay').textContent = emojiGrid;

  const sharePayload = `Word Blurts! Daily 🎯\nScore: ${dailyScore}/${TOTAL_DAILY_ROUNDS}\nStreak: 🔥 ${currentStreak}\n\n${emojiGrid}\n\nPlay at wordblurts.com`;
  
  const shareBtn = document.getElementById('shareResultsBtn');
  shareBtn.dataset.sharePayload = sharePayload;

  document.getElementById('resultsModal').classList.add('active');
}

// --- SHARE HANDLER ---
function attachShareHandler() {
  const shareBtn = document.getElementById('shareResultsBtn');
  if (!shareBtn) return;

  shareBtn.addEventListener('click', async () => {
    const payload = shareBtn.dataset.sharePayload || '';
    if (!payload) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Word Blurts! Daily',
          text: payload
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(payload);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = payload;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      const originalText = shareBtn.textContent;
      shareBtn.textContent = '✅ Copied to Clipboard!';
      setTimeout(() => {
        shareBtn.textContent = originalText;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy results:', err);
    }
  });
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('dailyModeBtn').addEventListener('click', initDailyMode);
  document.getElementById('freePlayBtn').addEventListener('click', initFreePlayMode);
  document.getElementById('startBtn').addEventListener('click', nextWord);
  document.getElementById('passBtn').addEventListener('click', () => recordResult(true));
  document.getElementById('failBtn').addEventListener('click', () => recordResult(false));
  
  document.getElementById('closeModalBtn').addEventListener('click', () => {
    document.getElementById('resultsModal').classList.remove('active');
    initDailyMode();
  });

  attachShareHandler();
  initDailyMode();
});
