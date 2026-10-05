// ==========================================
// 1. STARFIELD BACKGROUND ENGINE
// ==========================================
const canvas = document.getElementById('starfield');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let stars = [];
    const numStars = 1000;
    let speed = 2.5;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Star {
        constructor() { this.reset(); }
        reset() {
            this.x = (Math.random() - 0.5) * canvas.width * 2;
            this.y = (Math.random() - 0.5) * canvas.height * 2;
            this.z = Math.random() * canvas.width;
            this.pz = this.z;
        }
        update() {
            this.z -= speed;
            if (this.z <= 0) {
                this.reset();
                this.z = canvas.width;
                this.pz = this.z;
            }
        }
        draw() {
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const sx = (this.x / this.z) * canvas.width + cx;
            const sy = (this.y / this.z) * canvas.height + cy;
            
            const r = (1 - this.z / canvas.width) * 8;
            
            const px = (this.x / this.pz) * canvas.width + cx;
            const py = (this.y / this.pz) * canvas.height + cy;
            this.pz = this.z;
            if (sx >= 0 && sx <= canvas.width && sy >= 0 && sy <= canvas.height) {
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(sx, sy);
                ctx.strokeStyle = "rgba(255, 255, 255, " + (1 - this.z / canvas.width) + ")";
                ctx.lineWidth = r;
                ctx.stroke();
            }
        }
    }
    for (let i = 0; i < numStars; i++) { stars.push(new Star()); }
    function animateStars() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let star of stars) {
            star.update();
            star.draw();
        }
        requestAnimationFrame(animateStars);
    }
    animateStars();
}

// ==========================================
// 2. UI TOGGLES & SCOREBOARD ENGINE
// ==========================================
function toggleRules() {
    const card = document.getElementById('rulesCard');
    if (card) {
        card.style.display = (card.style.display === 'block') ? 'none' : 'block';
    }
}

function adjustScore(team, delta) {
    const el = document.getElementById(team + "Score");
    if (el) {
        let current = parseInt(el.innerText, 10) || 0;
        const newScore = Math.max(0, current + delta);
        el.innerText = newScore;
        
        if (delta > 0) {
            playSlideUp();
        } else if (delta < 0 && current > 0) {
            playSlideDown();
        }
    }
}

function resetScores() {
    const t1 = document.getElementById('team1Score');
    const t2 = document.getElementById('team2Score');
    if (t1) t1.innerText = '0';
    if (t2) t2.innerText = '0';
    triggerInterstitialAd();
}

// ==========================================
// 3. AD MANAGEMENT ENGINE
// ==========================================
function triggerInterstitialAd() {
    console.log("Score reset triggered: Showing interstitial ad break.");
    if (window.googletag && googletag.apiReady) {
        googletag.cmd.push(function() {
            googletag.display('interstitial-ad-slot'); 
        });
    }
}

let lastAdRefreshTime = 0;
const AD_REFRESH_INTERVAL = 35000;

function refreshAds() {
    const now = Date.now();
    if (now - lastAdRefreshTime >= AD_REFRESH_INTERVAL) {
        if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
                lastAdRefreshTime = now;
                console.log("35s elapsed: Fresh banners loaded.");
            } catch (e) {
                console.log("AdSense refresh error:", e);
            }
        }
    } else {
        const secondsLeft = Math.ceil((AD_REFRESH_INTERVAL - (now - lastAdRefreshTime)) / 1000);
        console.log(`Skipped refresh to protect viewability. (${secondsLeft}s remaining)`);
    }
}

// ==========================================
// 4. SYNTHESIZED AUDIO ENGINE & GAME LOOP LOGIC
// ==========================================
const D1 = 36.71, D2 = 73.42, A2 = 110, D3 = 146.83, F3 = 174.61, GS3 = 207.65, A3 = 220, C4 = 261.63, D4 = 293.66, F4 = 349.23, A4 = 440, D5 = 587.33;

function clampGain(v) { return Math.max(0.0001, v); }

function makeNoise(audioCtx, seconds) {
    const length = Math.max(1, Math.floor(audioCtx.sampleRate * seconds));
    const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
}

class GameAudioEngine {
    constructor() {
        this.ctx = null;
        this.master = null;
        this.music = null;
        this.sfx = null;
        this.compressor = null;
        this.voices = [];
        this.noise = null;
        this.muted = false;
    }
    unlock() {
        if (!this.ctx) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new Ctx({ latencyHint: "interactive" });
            this.master = this.ctx.createGain();
            this.master.gain.value = this.muted ? 0.0001 : 0.9;
            this.compressor = this.ctx.createDynamicsCompressor();
            this.compressor.threshold.value = -16;
            this.compressor.knee.value = 10;
            this.compressor.ratio.value = 3.5;
            this.compressor.attack.value = 0.004;
            this.compressor.release.value = 0.22;
            this.music = this.ctx.createGain();
            this.sfx = this.ctx.createGain();
            this.music.gain.value = 0.85;
            this.sfx.gain.value = 0.9;
            this.music.connect(this.compressor);
            this.sfx.connect(this.compressor);
            this.compressor.connect(this.master);
            this.master.connect(this.ctx.destination);
            this.noise = makeNoise(this.ctx, 2);
        }
        if (this.ctx.state === "suspended") {
            this.ctx.resume();
        }
    }
    stopAll() {
        const when = this.ctx ? this.ctx.currentTime : 0;
        for (const voice of this.voices) {
            try { voice.stop(when); } catch (e) {}
        }
        this.voices = [];
    }
    playGo() {
        const ctx = this.ctx;
        const dest = this.sfx;
        if (!ctx || !dest || !this.noise) return;
        const t = ctx.currentTime;
        const click = ctx.createOscillator();
        click.type = "square";
        click.frequency.setValueAtTime(420, t);
        click.frequency.exponentialRampToValueAtTime(140, t + 0.09);
        const clickGain = ctx.createGain();
        clickGain.gain.setValueAtTime(clampGain(0.18), t);
        clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
        click.connect(clickGain).connect(dest);
        click.start(t);
        click.stop(t + 0.14);
        const whoosh = ctx.createBufferSource();
        whoosh.buffer = this.noise;
        whoosh.playbackRate.value = 0.7;
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(400, t);
        filter.frequency.exponentialRampToValueAtTime(2400, t + 0.28);
        filter.Q.value = 2.4;
        const g = ctx.createGain();
        g.gain.setValueAtTime(clampGain(0.22), t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
        whoosh.connect(filter).connect(g).connect(dest);
        whoosh.start(t);
        whoosh.stop(t + 0.34);
    }
    playCountdown(duration = 10) {
        const ctx = this.ctx;
        const dest = this.music;
        if (!ctx || !dest || !this.noise) return;
        this.stopAll();
        const t0 = ctx.currentTime;
        const end = t0 + duration;
        const track = (voice) => { this.voices.push(voice); };
        const bus = ctx.createGain();
        bus.gain.setValueAtTime(0.0001, t0);
        bus.gain.exponentialRampToValueAtTime(0.28, t0 + 0.18);
        bus.gain.linearRampToValueAtTime(0.55, t0 + duration * 0.62);
        bus.gain.linearRampToValueAtTime(0.95, end - 0.08);
        bus.connect(dest);
        this.layerDrone(ctx, t0, end, bus, track);
        this.layerHeartbeat(ctx, t0, end, bus, track);
        this.layerTicks(ctx, t0, end, bus, track);
        this.layerOstinato(ctx, t0, end, bus, track);
        this.layerRiser(ctx, t0, end, bus, track);
        this.layerDissonance(ctx, t0, end, bus, track);
        track({
            stop: (when = ctx.currentTime) => {
                try {
                    bus.gain.cancelScheduledValues(when);
                    bus.gain.setTargetAtTime(0.0001, when, 0.04);
                } catch (e) {}
            },
        });
    }
    playSting() {
        const ctx = this.ctx;
        const dest = this.sfx;
        if (!ctx || !dest) return;
        const t = ctx.currentTime + 0.01;
        const freqs = [2093.00, 4186.01, 5600.00, 8372.00];
        const gains = [0.45, 0.25, 0.12, 0.06];
        freqs.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, t);
            const g = ctx.createGain();
            g.gain.setValueAtTime(clampGain(gains[i]), t);
            const decay = i === 0 ? 1.8 : 0.6 / (i + 1);
            g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
            osc.connect(g).connect(dest);
            osc.start(t);
            osc.stop(t + decay + 0.05);
        });
    }
    layerDrone(ctx, t0, end, dest, track) {
        const make = (freq0, freq1, type, gain, detune) => {
            const osc = ctx.createOscillator();
            osc.type = type;
            osc.frequency.setValueAtTime(freq0, t0);
            osc.frequency.exponentialRampToValueAtTime(freq1, end);
            osc.detune.value = detune;
            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.Q.value = 6;
            filter.frequency.setValueAtTime(180, t0);
            filter.frequency.exponentialRampToValueAtTime(2200, end);
            const g = ctx.createGain();
            g.gain.value = gain;
            osc.connect(filter).connect(g).connect(dest);
            osc.start(t0);
            osc.stop(end + 0.05);
            track({ stop: (when = ctx.currentTime) => { try { osc.stop(when); } catch (e) {} } });
        };
        make(D1, D2, "sine", 0.55, 0);
        make(D2, A2, "sawtooth", 0.16, -7);
        make(D2, A2, "sawtooth", 0.16, 9);
        make(A2, D3, "triangle", 0.12, 0);
    }
    layerHeartbeat(ctx, t0, end, dest, track) {
        let t = 0.12;
        let interval = 0.78;
        const duration = end - t0;
        while (t0 + t < end - 0.04) {
            const when = t0 + t;
            const progress = t / duration;
            const osc = ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.setValueAtTime(70 + progress * 40, when);
            osc.frequency.exponentialRampToValueAtTime(28, when + 0.14);
            const g = ctx.createGain();
            const amp = 0.28 + progress * 0.45;
            g.gain.setValueAtTime(clampGain(amp), when);
            g.gain.exponentialRampToValueAtTime(0.0001, when + 0.16);
            osc.connect(g).connect(dest);
            osc.start(when);
            osc.stop(when + 0.18);
            track({ stop: (stopAt = ctx.currentTime) => { try { osc.stop(stopAt); } catch (e) {} } });
            t += interval;
            interval = Math.max(0.11, interval * 0.9);
        }
    }
    layerTicks(ctx, t0, end, dest, track) {
        const duration = end - t0;
        for (let s = 1; s <= 10; s++) {
            const when = t0 + s;
            if (when >= end) break;
            this.scheduleTick(ctx, when, dest, 0.35 + s * 0.05, 1900 + s * 90, track);
        }
        let t = 0.5;
        let interval = 0.5;
        while (t0 + t < end - 0.03) {
            const progress = t / duration;
            const brightness = 1400 + progress * 1600;
            const amp = 0.05 + progress * 0.16;
            this.scheduleTick(ctx, t0 + t, dest, amp, brightness, track);
            t += interval;
            interval = Math.max(0.055, interval * 0.93);
        }
    }
    scheduleTick(ctx, when, dest, amp, freq, track) {
        const osc = ctx.createOscillator();
        osc.type = "square";
        osc.frequency.value = freq;
        const filter = ctx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.value = Math.max(900, freq - 400);
        const g = ctx.createGain();
        g.gain.setValueAtTime(clampGain(amp * 0.22), when);
        g.gain.exponentialRampToValueAtTime(0.0001, when + 0.045);
        osc.connect(filter).connect(g).connect(dest);
        osc.start(when);
        osc.stop(when + 0.05);
        track({ stop: (stopAt = ctx.currentTime) => { try { osc.stop(stopAt); } catch (e) {} } });
    }
    layerOstinato(ctx, t0, end, dest, track) {
        const scale = [D3, F3, A3, C4, D4, F4, A4, D5];
        const pattern = [0, 2, 1, 2, 0, 3, 2, 4];
        let t = 0.35;
        let step = 0.38;
        let i = 0;
        const duration = end - t0;
        while (t0 + t < end - 0.05) {
            const progress = t / duration;
            const octaveShift = progress > 0.55 ? 1 : 0;
            const idx = Math.min(scale.length - 1, pattern[i % pattern.length] + octaveShift * 2);
            const freq = scale[idx] * (progress > 0.78 ? 1.335 : 1);
            const osc = ctx.createOscillator();
            osc.type = "triangle";
            osc.frequency.value = freq;
            const g = ctx.createGain();
            const amp = 0.05 + progress * 0.14;
            g.gain.setValueAtTime(0.0001, t0 + t);
            g.gain.exponentialRampToValueAtTime(amp, t0 + t + 0.012);
            g.gain.exponentialRampToValueAtTime(0.0001, t0 + t + step * 0.72);
            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(900 + progress * 2400, t0 + t);
            osc.connect(filter).connect(g).connect(dest);
            osc.start(t0 + t);
            osc.stop(t0 + t + step);
            track({ stop: (stopAt = ctx.currentTime) => { try { osc.stop(stopAt); } catch (e) {} } });
            i += 1;
            t += step;
            step = Math.max(0.07, step * 0.94);
        }
    }
    layerRiser(ctx, t0, end, dest, track) {
        if (!this.noise) return;
        const start = t0 + 3.2;
        const src = ctx.createBufferSource();
        src.buffer = this.noise;
        src.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.Q.value = 4;
        filter.frequency.setValueAtTime(220, start);
        filter.frequency.exponentialRampToValueAtTime(3800, end);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, start);
        g.gain.exponentialRampToValueAtTime(0.22, start + 1.2);
        g.gain.linearRampToValueAtTime(0.48, end - 0.05);
        src.connect(filter).connect(g).connect(dest);
        src.start(start);
        src.stop(end + 0.02);
        track({ stop: (when = ctx.currentTime) => { try { src.stop(when); } catch (e) {} } });
    }
    layerDissonance(ctx, t0, end, dest, track) {
        const start = t0 + 6.8;
        const oscA = ctx.createOscillator();
        const oscB = ctx.createOscillator();
        oscA.type = "sawtooth";
        oscB.type = "sawtooth";
        oscA.frequency.setValueAtTime(D4, start);
        oscB.frequency.setValueAtTime(GS3, start);
        oscA.frequency.linearRampToValueAtTime(D4 * 1.03, end);
        oscB.frequency.linearRampToValueAtTime(GS3 * 1.06, end);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, start);
        g.gain.exponentialRampToValueAtTime(0.08, start + 0.4);
        g.gain.linearRampToValueAtTime(0.18, end - 0.05);
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(700, start);
        filter.frequency.exponentialRampToValueAtTime(2400, end);
        oscA.connect(filter);
        oscB.connect(filter);
        filter.connect(g).connect(dest);
        oscA.start(start);
        oscB.start(start);
        oscA.stop(end + 0.02);
        oscB.stop(end + 0.02);
        track({ stop: (when = ctx.currentTime) => { try { oscA.stop(when); oscB.stop(when); } catch (e) {} } });
    }
}

const gameAudio = new GameAudioEngine();

// --- SLIDE WHISTLE SOUND SYNTHESIZERS (REUSING MAIN AUDIO CONTEXT) ---
function playSlideUp() {
    gameAudio.unlock();
    const ctx = gameAudio.ctx;
    const dest = gameAudio.sfx || ctx.destination;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(dest);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
}

function playSlideDown() {
    gameAudio.unlock();
    const ctx = gameAudio.ctx;
    const dest = gameAudio.sfx || ctx.destination;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(dest);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
}

// --- GAME LOOP & ROUND LOGIC ---
function playRound() {
    // 1. Reset or clear existing timer if active
    if (typeof resetTimer === 'function') resetTimer();

    // 2. Load prompt & letter based on active mode
    if (typeof isDailyMode !== 'undefined' && isDailyMode) {
        // Load the deterministic prompt deck for today's Daily Blurt
        loadDailyBlurtPrompt(); 
    } else {
        // Pick a completely random prompt from master prompt array
        loadRandomPrompt(); 
    }

    // 3. Start the round countdown
    if (typeof startTimer === 'function') startTimer();
}

// Generates a random prompt for Classic Mode
function loadRandomPrompt() {
    const promptDisplay = document.getElementById('promptDisplay');
    const letterDisplay = document.getElementById('letterDisplay');

    if (typeof ALL_PROMPTS !== 'undefined' && ALL_PROMPTS.length > 0) {
        const randomPrompt = ALL_PROMPTS[Math.floor(Math.random() * ALL_PROMPTS.length)];
        if (promptDisplay) promptDisplay.textContent = randomPrompt;
    }

    if (typeof getRandomLetter === 'function' && letterDisplay) {
        letterDisplay.textContent = getRandomLetter();
    }
}

// Loads the daily prompt from your seeded daily array
function loadDailyBlurtPrompt() {
    const promptDisplay = document.getElementById('promptDisplay');
    const letterDisplay = document.getElementById('letterDisplay');

    if (typeof dailyDeckPrompts !== 'undefined' && dailyDeckPrompts.length > 0) {
        const roundIdx = typeof currentRoundIndex !== 'undefined' ? currentRoundIndex : 0;
        const currentDaily = dailyDeckPrompts[roundIdx];
        if (currentDaily) {
            if (promptDisplay) promptDisplay.textContent = currentDaily.prompt || currentDaily;
            if (letterDisplay) letterDisplay.textContent = currentDaily.letter || '-';
        }
    }
}

// ==========================================
// 5. PARTY GAME CORE ENGINE
// ==========================================
const topicsMaster = [
    "A famous actor", "An item in a refrigerator", "An item found in most offices",
    "A fast food chain", "A superhero", "Something you find in a bathroom",
    "A part of a car", "Something that makes noise", "A title of a TV show",
    "A movie title", "A breakfast food", "Something in a hardware store",
    "A musical instrument", "A sport or game", "A state in the U.S.A.",
    "An animal found at a zoo", "A pizza topping", "A brand of car",
    "Something you pack for a vacation", "A Halloween costume", "Something found in a garage",
    "A board game", "A profession or job", "A country",
    "A flavor of ice cream", "Something found in a classroom", "A candy",
    "A part of the human body", "Something in the night sky", "A vegetable",
    "A fruit", "Something you find at a beach", "A restaurant chain",
    "Something found in a purse or wallet", "A household chore", "A liquid you drink",
    "A word with double letters", "Something that uses electricity", "A piece of clothing",
    "A holiday or celebration", "Something cold", "Something hot",
    "Something hairy", "Something sharp", "An item in a bakery",
    "A famous landmark", "Something found in an attic", "A daily activity",
    "Something found in a kitchen", "A nickname", "Something sticky",
    "A type of flower or plant", "Something you see at an amusement park", "A reason to celebrate",
    "Something you take on a camping trip", "A cartoon character", "Something red, yellow or blue",
    "Something round", "An item in a grocery store", "Something you find in nature",
    "A snack food", "A land animal", "Something made of wood",
    "Something made of metal", "A dog breed", "Something you buy at a gas station",
    "A song title", "A famous musician", "Something you plug in",
    "Something in an ocean", "Something you do in winter", "Something you do in summer",
    "A villain, bad guy or monster", "Something that smells good", "Something that smells bad",
    "A place you go on a date", "Something with wheels", "Something a mechanic uses",
    "Something soft", "Something heavy"
];

const lettersMaster = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","R","S","T","U","V","W"];

function generateDeck() {
    const deck = [];
    for (let t of topicsMaster) {
        for (let l of lettersMaster) {
            deck.push({ topic: t, letter: l });
        }
    }
    return deck;
}

let comboDeck = generateDeck();
let countdownInterval = null;

function stopEverything() {
    if (countdownInterval !== null) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    gameAudio.stopAll();
    speed = 2.5;
}

function startCountdown() {
    stopEverything();
    gameAudio.playCountdown(10);
    speed = 8.0;
    let timeLeft = 10;
    const timerEl = document.getElementById('timerDisplay');
    if (timerEl) timerEl.innerText = timeLeft;
    
    countdownInterval = setInterval(() => {
        timeLeft--;
        if (timerEl) timerEl.innerText = timeLeft;
        
        if (timeLeft <= 0) {
            stopEverything();
            const timerEl = document.getElementById('timerDisplay') || document.getElementById('timer');
            if (timerEl) timerEl.innerText = "TIME'S UP!";
            
            const mainCard = document.querySelector('.card') || document.querySelector('.game-card') || document.querySelector('section') || document.querySelector('main');
            if (mainCard) {
                mainCard.style.transition = 'all 0.1s ease';
                let flashCount = 0;
                
                const flashInterval = setInterval(() => {
                    if (flashCount % 2 === 0) {
                        mainCard.style.boxShadow = '0 0 50px 20px #ff2d55';
                        mainCard.style.borderColor = '#ff2d55';
                    } else {
                        mainCard.style.boxShadow = '';
                        mainCard.style.borderColor = '';
                    }
                    
                    flashCount++;
                    if (flashCount >= 6) {
                        clearInterval(flashInterval);
                        mainCard.style.boxShadow = '';
                        mainCard.style.borderColor = '';
                    }
                }, 150);
            }
            
            gameAudio.playSting();
            
            if (isDailyMode) {
                recordDailyResult('red');
            }
        }
    }, 1000);
}

function speakPrompt(topicText, letterText) {
    if ('speechSynthesis' in window) {
        const fullText = `${topicText}, that starts with the letter... ${letterText}... Blurt it out!`;
        const utterance = new SpeechSynthesisUtterance(fullText);
        utterance.rate = 1.0;
        utterance.pitch = 1.05;
        utterance.onend = function() {
            startCountdown();
        };
        window.speechSynthesis.speak(utterance);
    } else {
        startCountdown();
    }
}

function drawNextCombo() {
    if (comboDeck.length === 0) {
        comboDeck = generateDeck();
    }
    const index = Math.floor(Math.random() * comboDeck.length);
    return comboDeck.splice(index, 1)[0];
}

function playRound() {
    if (isDailyMode) {
        const status = getDailyStatus();
        if (status.isCompletedToday) {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_DATA) || '{}');
            showDailyResults(data.score || 0, 10, data.timeSeconds || 0, status.streak, data.resultsArray || Array(10).fill('red'));
            return;
        }
    }

    const mainCard = document.querySelector('.card') || document.querySelector('.game-card') || document.querySelector('section') || document.querySelector('main');
    if (mainCard) {
        mainCard.style.boxShadow = '';
        mainCard.style.borderColor = '';
    }
    
    gameAudio.unlock();
    stopEverything();
    gameAudio.playGo();
    
    const btn = document.getElementById('playBtn');
    if (btn) btn.innerText = "NEXT";
    
    let nextCard;
    if (isDailyMode) {
        if (dailyCurrentIndex >= dailyDeckPrompts.length) {
            finishDailyGame();
            return;
        }
        nextCard = {
            topic: dailyDeckPrompts[dailyCurrentIndex].category,
            letter: dailyDeckPrompts[dailyCurrentIndex].letter
        };
    } else {
        nextCard = drawNextCombo();
    }
    
    const promptEl = document.getElementById('promptDisplay');
    const letterEl = document.getElementById('letterDisplay');
    const timerEl = document.getElementById('timerDisplay') || document.getElementById('timer');
    
    if (promptEl) promptEl.innerText = nextCard.topic;
    if (letterEl) letterEl.innerText = nextCard.letter;
    if (timerEl) timerEl.innerText = 10;
    
    speakPrompt(nextCard.topic, nextCard.letter);
    refreshAds();
}

document.addEventListener('keydown', function(event) {
    if ((event.code === 'Space' || event.code === 'Enter') && !event.repeat) {
        event.preventDefault();
        playRound();
    }
});

// ==========================================
// 6. DAILY BLURT MODE & SEED GENERATOR
// ==========================================
const CATEGORIES = [
  "Things in Space", "Car Models", "Types of Cheese", "Movie Titles",
  "Capital Cities", "Things in a Kitchen", "Dog Breeds", "Superheroes",
  "Pizza Toppings", "Occupations", "Breakfast Foods", "Olympic Sports",
  "Things at the Beach", "Fictional Characters", "Brands/Logos"
];

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "M", "P", "R", "S", "T"];

const STORAGE_KEYS = {
  STREAK: "wb_daily_streak",
  LAST_DATE: "wb_daily_last_date",
  COMPLETED_DATA: "wb_daily_last_score"
};

let isDailyMode = false;
let dailyDeckPrompts = [];
let dailyCurrentIndex = 0;
let dailyResultsArray = [];
let dailyStartTime = 0;

// ==========================================
// SEEDED GAME & CHALLENGE PARAMETERS
// ==========================================

// 1. Read 'seed' from URL search parameters (e.g., wordblurts.com/?seed=8492)
function getURLSeed() {
    const params = new URLSearchParams(window.location.search);
    const seedParam = params.get('seed');
    return seedParam ? parseInt(seedParam, 10) : null;
}

// 2. Generate prompts based on a specific seed number
function getSeededPrompts(customSeed) {
    const prompts = [];
    let currentSeed = customSeed;

    function nextRandom() {
        currentSeed = (currentSeed * 9301 + 49297) % 233280;
        return currentSeed / 233280;
    }

    for (let i = 0; i < 10; i++) {
        const catIndex = Math.floor(nextRandom() * CATEGORIES.length);
        const letterIndex = Math.floor(nextRandom() * LETTERS.length);
        prompts.push({
            round: i + 1,
            category: CATEGORIES[catIndex],
            letter: LETTERS[letterIndex]
        });
    }

    return prompts;
}

function getDaySeed() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  return { seed: Math.abs(hash), dateStr };
}

function getDailyPrompts() {
  const { seed, dateStr } = getDaySeed();
  const prompts = [];
  
  let currentSeed = seed;
  function nextRandom() {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  }

  for (let i = 0; i < 10; i++) {
    const catIndex = Math.floor(nextRandom() * CATEGORIES.length);
    const letterIndex = Math.floor(nextRandom() * LETTERS.length);
    prompts.push({
      round: i + 1,
      category: CATEGORIES[catIndex],
      letter: LETTERS[letterIndex]
    });
  }

  return { prompts, dateStr };
}

function initDailyMode() {
    isDailyMode = true;
    
    // Check if the player arrived from a Challenge Link (?seed=XXXX)
    const urlSeed = getURLSeed();
    if (urlSeed) {
        dailyDeckPrompts = getSeededPrompts(urlSeed);
    } else {
        const { prompts } = getDailyPrompts();
        dailyDeckPrompts = prompts;
    }

    dailyCurrentIndex = 0;
    dailyResultsArray = [];
    dailyStartTime = Date.now();
    
    const dailyBtn = document.getElementById('dailyModeBtn');
    if (dailyBtn) dailyBtn.classList.add('active');
}

function recordDailyResult(result) {
    if (!isDailyMode) return;
    
    dailyResultsArray.push(result);
    dailyCurrentIndex++;
    
    if (dailyCurrentIndex >= dailyDeckPrompts.length) {
        finishDailyGame();
    }
}

function finishDailyGame() {
    stopEverything();
    const elapsedSeconds = Math.round((Date.now() - dailyStartTime) / 1000);
    const score = dailyResultsArray.filter(r => r === 'green').length;
    
    const newStreak = saveDailyResults(score, elapsedSeconds, dailyResultsArray);
    showDailyResults(score, 10, elapsedSeconds, newStreak, dailyResultsArray);
}
// ==========================================
// 7. STREAK & LOCKOUT STORAGE SYSTEM
// ==========================================
function getDailyStatus() {
  const { dateStr } = getDaySeed();
  const lastCompletedDate = localStorage.getItem(STORAGE_KEYS.LAST_DATE);
  const currentStreak = parseInt(localStorage.getItem(STORAGE_KEYS.STREAK) || "0", 10);
  
  return {
    isCompletedToday: lastCompletedDate === dateStr,
    streak: currentStreak,
    todayDate: dateStr
  };
}

function saveDailyResults(score, timeSeconds, resultsArray) {
  const { dateStr } = getDaySeed();
  const status = getDailyStatus();

  if (status.isCompletedToday) return status.streak;

  // Calculate local date for yesterday (matches getDaySeed format)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yYear = yesterday.getFullYear();
  const yMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
  const yDay = String(yesterday.getDate()).padStart(2, '0');
  const yesterdayStr = `${yYear}-${yMonth}-${yDay}`;

  let newStreak = 1;
  const lastCompletedDate = localStorage.getItem(STORAGE_KEYS.LAST_DATE);
  if (lastCompletedDate === yesterdayStr) {
    newStreak = status.streak + 1;
  }

  localStorage.setItem(STORAGE_KEYS.STREAK, newStreak.toString());
  localStorage.setItem(STORAGE_KEYS.LAST_DATE, dateStr);
  localStorage.setItem(STORAGE_KEYS.COMPLETED_DATA, JSON.stringify({ score, timeSeconds, resultsArray }));

  return newStreak;
}

// ==========================================
// 8. DAILY RESULTS & SHARING MODAL
// ==========================================
function generateShareText(score, timeSeconds, resultsArray) {
  const { dateStr } = getDaySeed();
  const streak = localStorage.getItem(STORAGE_KEYS.STREAK) || "1";
  
  let blocks = "";
  if (resultsArray && resultsArray.length > 0) {
    blocks = resultsArray.map(res => res === 'green' ? '🟩' : '🟥').join('');
  } else {
    for (let i = 0; i < 10; i++) {
      blocks += i < score ? "🟩" : "🟥";
    }
  }

  return `Word Blurts! Daily (${dateStr})\n` +
         `Score: ${score}/10 | Time: ${timeSeconds}s\n` +
         `Streak: 🔥 ${streak} Days\n` +
         `${blocks}\n` +
         `https://wordblurts.com`;
}

function showDailyResults(score, totalCards, timeInSeconds, streak, resultsArray) {
    const resScore = document.getElementById('res-score');
    const resTime = document.getElementById('res-time');
    const resStreak = document.getElementById('res-streak');
    const emojiGrid = document.getElementById('emoji-grid-display');
// ==========================================

    if (resScore) resScore.textContent = `${score}/${totalCards}`;
    if (resTime) resTime.textContent = `${timeInSeconds}s`;
    if (resStreak) resStreak.textContent = `🔥 ${streak}`;

    const gridString = resultsArray ? resultsArray.map(res => res === 'green' ? '🟩' : '🟥').join('') : '';
    if (emojiGrid) emojiGrid.textContent = gridString;

    const shareText = generateShareText(score, timeInSeconds, resultsArray);
    const shareBtn = document.getElementById('share-results-btn');
    if (shareBtn) {
        shareBtn.dataset.sharePayload = shareText;
    }

    const modal = document.getElementById('results-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// ==========================================
// 9. INITIALIZATION & LISTENERS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

    // ------------------------------------------
    // MODE TOGGLE WIRE-UP (Classic vs. Daily)
    // ------------------------------------------
    const randomModeBtn = document.getElementById('randomModeBtn');
    const dailyModeBtn = document.getElementById('dailyModeBtn');

    if (randomModeBtn && dailyModeBtn) {
        randomModeBtn.addEventListener('click', () => {
            if (!isDailyMode) return; // Already in classic mode

            isDailyMode = false;
            randomModeBtn.classList.add('active');
            dailyModeBtn.classList.remove('active');

            // Reset game board for Classic mode
            const promptDisplay = document.getElementById('promptDisplay');
            const letterDisplay = document.getElementById('letterDisplay');
            const timerDisplay = document.getElementById('timerDisplay');

            if (promptDisplay) promptDisplay.textContent = 'Classic Mode:  Press PLAY or hit Spacebar to start!';
            if (letterDisplay) letterDisplay.textContent = '-';
            if (timerDisplay) timerDisplay.textContent = '10';

            if (typeof resetTimer === 'function') resetTimer();
        });

        dailyModeBtn.addEventListener('click', () => {
            if (isDailyMode) return; // Already in daily mode

            isDailyMode = true;
            dailyModeBtn.classList.add('active');
            randomModeBtn.classList.remove('active');

            // Reset game board for Daily mode
            const promptDisplay = document.getElementById('promptDisplay');
            const letterDisplay = document.getElementById('letterDisplay');
            const timerDisplay = document.getElementById('timerDisplay');

            if (promptDisplay) promptDisplay.textContent = "Today's Daily Blurt is set! Press PLAY when ready.";
            if (letterDisplay) letterDisplay.textContent = '-';
            if (timerDisplay) timerDisplay.textContent = '10';

            if (typeof resetTimer === 'function') resetTimer();
        });
    }

    // 1. Check if player arrived via a friend's challenge link (?seed=XXXX)
    const urlSeed = getURLSeed();
    if (urlSeed) {
        isDailyMode = false;
        dailyDeckPrompts = getSeededPrompts(urlSeed);
        console.log(`Loaded custom challenge seed: ${urlSeed}`);
    }

    // PWA SERVICE WORKER REGISTRATION
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('Service Worker registered successfully.', reg))
                .catch(err => console.log('Service Worker registration failed:', err));
        });
    }

    // 2. Check if daily game was already completed today
    const dailyStatus = getDailyStatus();
    if (dailyStatus.isCompletedToday && !urlSeed) {
        const storedData = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_DATA) || '{}');
        showDailyResults(
            storedData.score || 0,
            10,
            storedData.timeSeconds || 0,
            dailyStatus.streak,
            storedData.resultsArray || Array(10).fill('red')
        );
    }

    // 3. Share Results Button Listener
    const shareBtn = document.getElementById('share-results-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const payload = shareBtn.dataset.sharePayload || '';

            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'Word Blurts! Results',
                        text: payload
                    });
                    return;
                } catch (err) {
                    // Fallback to clipboard if share drawer is canceled
                }
            }

            try {
                await navigator.clipboard.writeText(payload);
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

    // 4. Challenge Friend Button Listener
    const challengeBtn = document.getElementById('challenge-friend-btn');
    if (challengeBtn) {
        challengeBtn.addEventListener('click', async () => {
            const { seed } = getDaySeed();
            const challengeURL = `https://wordblurts.com/?seed=${seed}`;
            const challengeMessage = `Can you beat my Word Blurts! score? Play the exact same letter set here:\n${challengeURL}`;

            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'Word Blurts! Challenge',
                        text: challengeMessage
                    });
                    return;
                } catch (err) {
                    // Fallback to clipboard if share drawer is canceled
                }
            }

            try {
                await navigator.clipboard.writeText(challengeMessage);
                const originalText = challengeBtn.textContent;
                challengeBtn.textContent = '🔗 Link Copied to Clipboard!';
                setTimeout(() => {
                    challengeBtn.textContent = originalText;
                }, 2000);
            } catch (err) {
                console.error('Failed to copy challenge link:', err);
            }
        });
    }

    // 5. Results Modal Overlay Click Listener (Close on outside tap)
    const resultsModal = document.getElementById('results-modal');
    if (resultsModal) {
        resultsModal.addEventListener('click', (e) => {
            if (e.target === resultsModal) {
                resultsModal.style.display = 'none';
            }
        });
    }

    // 6. About Modal Event Listeners
    const openAboutBtn = document.getElementById('open-about-btn');
    const closeAboutBtn = document.getElementById('close-about-btn');
    const aboutModal = document.getElementById('about-modal');

    if (openAboutBtn && aboutModal) {
        openAboutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            aboutModal.style.display = 'flex';
        });
    }

    if (closeAboutBtn && aboutModal) {
        closeAboutBtn.addEventListener('click', () => {
            aboutModal.style.display = 'none';
        });
    }

    if (aboutModal) {
        aboutModal.addEventListener('click', (e) => {
            if (e.target === aboutModal) {
                aboutModal.style.display = 'none';
            }
        });
    }
});
/* ==========================================
   PWA INSTALL PROMPT CONTROLLER
   ========================================== */
let deferredPrompt = null;

const pwaBanner = document.getElementById('pwaInstallBanner');
const pwaInstallBtn = document.getElementById('pwaInstallBtn');
const pwaDismissBtn = document.getElementById('pwaDismissBtn');

// Listen for browser install prompt trigger
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent standard automatic browser banner
    e.preventDefault();
    deferredPrompt = e;

    // Show banner if not previously dismissed
    if (!localStorage.getItem('pwaPromptDismissed')) {
        pwaBanner.classList.remove('hidden');
    }
});

// Handle "Install" button click
if (pwaInstallBtn) {
    pwaInstallBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;

        pwaBanner.classList.add('hidden');
        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);

        deferredPrompt = null;
    });
}

// Handle Close / Dismiss click
if (pwaDismissBtn) {
    pwaDismissBtn.addEventListener('click', () => {
        pwaBanner.classList.add('hidden');
        // Don't show again in this session
        localStorage.setItem('pwaPromptDismissed', Date.now());
    });
}

// Hide banner if successfully installed
window.addEventListener('appinstalled', () => {
    pwaBanner.classList.add('hidden');
    deferredPrompt = null;
    console.log('Word Blurts PWA installed successfully.');
});
