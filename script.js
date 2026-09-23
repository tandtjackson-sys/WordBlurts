// --- STARFIELD BACKGROUND ENGINE ---
const canvas = document.getElementById('starfield');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let stars = [];
    const numStars = 450;
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
            
            // --- 30% LARGER STARS (2.8 -> 3.64) ---
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

// --- RULES TOGGLE FUNCTION ---
function toggleRules() {
    const card = document.getElementById('rulesCard');
    if (card) {
        card.style.display = (card.style.display === 'block') ? 'none' : 'block';
    }
}

// --- SCOREBOARD ENGINE & AD INTERSTITIAL TRIGGER ---
function adjustScore(team, delta) {
    const el = document.getElementById(team + "Score");
    if (el) {
        let current = parseInt(el.innerText, 10) || 0;
        el.innerText = Math.max(0, current + delta);
    }
}

function resetScores() {
    const t1 = document.getElementById('team1Score');
    const t2 = document.getElementById('team2Score');
    if (t1) t1.innerText = '0';
    if (t2) t2.innerText = '0';
    triggerInterstitialAd();
}

function triggerInterstitialAd() {
    console.log("Score reset triggered: Showing interstitial ad break.");
    if (window.googletag && googletag.apiReady) {
        googletag.cmd.push(function() {
            googletag.display('interstitial-ad-slot'); 
        });
    }
}

// --- SMART AD REFRESH CONFIGURATION ---
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

// --- AUDIO Engine ---
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

// --- GAME TOPICS & ENGINE ---
const topicsMaster = [
     "A famous actor", "An item in a refrigerator", "An item found in most offices",
            "A fast food chain", "A superhero", "Something you find in a bathroom",
            "A reason to call in sick", "Something that makes noise", "A title of a TV show",
            "A movie title", "A breakfast food", "Something in a hardware store",
            "A musical instrument", "A sport or game", "A state in the U.S.A.",
            "An animal found at a zoo", "A pizza topping", "A brand of car",
            "Something you pack for a vacation", "A Halloween costume", "Something found in a garage",
            "A board game", "A profession or job", "A country",
            "A flavor of ice cream", "Something found in a classroom", "A candy brand",
            "A part of the human body", "Something in the night sky", "A vegetable",
            "A fruit", "Something you find at a beach", "A restaurant chain",
            "Something found in a purse or wallet", "A household chore", "A liquid you drink",
            "A word with double letters", "Something that uses electricity", "A piece of clothing",
            "A holiday or celebration", "Something cold", "Something hot",
            "Something hairy", "Something sharp", "An item in a bakery",
            "A famous landmark", "Something found in an attic", "A hobby",
            "Something you throw away", "A nickname", "Something sticky",
            "A type of flower or plant", "Something you see at an amusement park", "A reason to celebrate",
            "Something you take on a camping trip", "A cartoon character", "Something red, yellow or blue",
            "Something round", "An item in a grocery store", "Something you find in nature",
            "A snack food", "A bird", "Something made of wood",
            "Something made of metal", "A dog breed", "Something you buy at a gas station",
            "A song title", "A famous musician", "Something you plug in",
            "An ocean creature", "Something you do in winter", "Something you do in summer",
            "A villain or bad guy", "Something that smells good", "Something that smells bad",
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
            
            // --- TRIPLE RED FLASH ---
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
                    if (flashCount >= 6) { // 3 flashes on/off = 6 toggles
                        clearInterval(flashInterval);
                        mainCard.style.boxShadow = '';
                        mainCard.style.borderColor = '';
                    }
                }, 150); // Speed of each pulse (150ms)
            }
            
            gameAudio.playSting();
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
    // --- CLEAR FLASH EFFECT ---
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
    
    const nextCard = drawNextCombo();
    
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

// --- SCOREBOARD ENGINE & SOUND EFFECTS ---
function adjustScore(team, delta) {
    const el = document.getElementById(team + "Score");
    if (el) {
        let current = parseInt(el.innerText, 10) || 0;
        const newScore = Math.max(0, current + delta);
        el.innerText = newScore;
        
        // Trigger whistle sound based on score direction
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

function triggerInterstitialAd() {
    console.log("Score reset triggered: Showing interstitial ad break.");
    if (window.googletag && googletag.apiReady) {
        googletag.cmd.push(function() {
            googletag.display('interstitial-ad-slot'); 
        });
    }
}

// --- SLIDE WHISTLE SOUND SYNTHESIZERS ---
function playSlideUp() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
}

function playSlideDown() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
}
