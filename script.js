const translations = {
    en: {
        rulesText: "❓ How to Play",
        aboutText: "📖 About",
        fullscreenText: "🖵 Fullscreen",
        randomModeBtn: "✨ Classic",
        dailyModeBtn: "📅 Daily Blurts",
        toggleRoomBarBtn: "📡 Party / Stream Room Code",
        playBtn: "PLAY!",
        team1Label: "Player / Team 1",
        team2Label: "Player / Team 2",
        resetBtn: "Reset Scores",
        footerCopyright: "© 2026 Word Blurts! All rights reserved.",
        footerAbout: "About",
        footerTeachers: "For Teachers",
        footerPrivacy: "Privacy Policy",
        footerAdSettings: "Ad Settings"
    },
    es: {
        rulesText: "❓ Cómo jugar",
        aboutText: "📖 Acerca de",
        fullscreenText: "🖵 Pantalla completa",
        randomModeBtn: "✨ Clásico",
        dailyModeBtn: "📅 Blurts Diarios",
        toggleRoomBarBtn: "📡 Código de Sala / Stream",
        playBtn: "¡JUGAR!",
        team1Label: "Jugador / Equipo 1",
        team2Label: "Jugador / Equipo 2",
        resetBtn: "Reiniciar marcador",
        footerCopyright: "© 2026 Word Blurts! Todos los derechos reservados.",
        footerAbout: "Acerca de",
        footerTeachers: "Para docentes",
        footerPrivacy: "Política de privacidad",
        footerAdSettings: "Configuración de anuncios"
    }
};

// Keep a global reference so iOS Safari doesn't garbage-collect the voice mid-stream
window.activeUtterance = null;
window.currentLang = localStorage.getItem("wordblurts_lang") === "es" ? "es" : "en";
function speakGameText(text) {
    if (!('speechSynthesis' in window)) {
        console.log("Speech synthesis not supported in this browser.");
        return;
    }

    // 1. Clear any stuck queues or overlapping speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // 2. Dynamically set language (es-MX for Spanish, en-US for English)
    utterance.lang = (currentLang === 'es') ? 'es-MX' : 'en-US';
    utterance.rate = 1.1;  // Snappy pacing for gameplay
    utterance.pitch = 1.0;

    // 3. CRITICAL iOS FIX: Hold a global reference to prevent garbage collection
    window.activeUtterance = utterance;

    // Optional event listeners for debugging on mobile
    utterance.onend = () => {
        window.activeUtterance = null;
    };
    
    utterance.onerror = (e) => {
        console.log("Speech error on iOS:", e);
        window.activeUtterance = null;
    };

    // 4. Fire speech
    window.speechSynthesis.speak(utterance);
}

// 1. File-free iOS audio unlock and initialization (No missing MP3 errors!)
let iosAudioUnlocked = false;

function unlockIOSAudio() {
    if (iosAudioUnlocked) return;

    // Unlock native Web Audio engine
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
        const tempCtx = new AudioContext();
        if (tempCtx.state === 'suspended') {
            tempCtx.resume();
        }
    }

    // Play tiny silent audio data URI (zero 404 file errors)
    const silentAudio = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjM2LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABhQCFAw====");
    silentAudio.play().then(() => {
        iosAudioUnlocked = true;
        console.log("iOS audio pipeline unlocked successfully!");
    }).catch(e => {
        console.log("Unlock deferred:", e);
    });
}

// ==========================================
// 0. GLOBAL STATE & WINDOW ATTACHMENTS
// ==========================================
window.isDailyMode = false;
window.currentLang = localStorage.getItem("wordblurts_lang") || "en";
let lastAdRefreshTime = 0;
const AD_REFRESH_INTERVAL = 35000;

// Update Fullscreen button text based on current language and state
function updateFullscreenBtnText() {
    const fsBtn = document.getElementById('fullscreenToggleBtn');
    if (fsBtn) {
        const isEs = ((window.currentLang || currentLang) === 'es');
        const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
        const label = fsBtn.querySelector('span') || fsBtn;
        if (isFS) {
            label.textContent = isEs ? '🖵 Salir de pantalla completa' : '🖵 Exit fullscreen';
        } else {
            label.textContent = isEs ? '🖵 Pantalla completa' : '🖵 Fullscreen';
        }
    }
}

window.toggleRules = function() {
    const rulesCard = document.getElementById('rulesCard');
    if (rulesCard) {
        const currentStyle = window.getComputedStyle(rulesCard).display;
        rulesCard.style.display = (currentStyle === 'none') ? 'block' : 'none';
    }
};

window.toggleFullScreen = function() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
            console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
};


document.addEventListener('fullscreenchange', updateFullscreenBtnText);
document.addEventListener('webkitfullscreenchange', updateFullscreenBtnText);
// ==========================================
// 1. GAME DATA & LOCALIZATION STORE
// ==========================================
const GAME_DATA = {
    en: {
        code: "en-US",
        lettersMaster: ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","P","R","S","T","W"],
        topicsMaster: [
            "A famous actor!", "An item in a refrigerator!", "An item found in most offices!",
            "A fast food chain!", "A superhero!", "Something you find in a bathroom!",
            "A part of a car!", "Something that makes noise!", "A title of a TV show!",
            "A movie title!", "A breakfast food!", "Something in a hardware store!",
            "A musical instrument!", "A sport or game!", "A state in the U S A!",
            "Any animal!", "A pizza topping!", "A brand or name of a car!",
            "Something you shouldn't touch with your bare hands!", "A Halloween costume!", "Something that makes you tired or exhausted!",
            "A board game or video game!", "A profession or job!", "A country!",
            "A flavor of ice cream!", "Something found in a classroom!", "A candy!",
            "A part of the human body!", "Something in the night sky!", "A vegetable!",
            "A fruit!", "Something you find at a beach!", "A restaurant chain!",
            "Something found in a purse or wallet!", "A household chore!", "Something you drink!",
            "A word with double letters!", "Something that uses electricity!", "Any city in the world!",
            "A holiday or celebration!", "Something cold!", "Something hot!",
            "Something hairy!", "Something sharp!", "An item in a bakery!",
            "A famous landmark!", "Something found in an attic!", "A daily activity!",
            "Something found in a kitchen!", "A nickname!", "Something sticky!",
            "A type of flower or plant!", "Clothing or accessories!", "A dangerous animal!",
            "Something you take on a camping trip!", "A cartoon character!", "Something red, yellow or blue!",
            "Something round!", "An item in a grocery store!", "Something you find in nature!",
            "A snack food!", "A famous company!", "Something made of wood!",
            "Something made of metal!", "A dog breed!", "Something you buy at a gas station!",
            "A song title!", "A famous musician!", "Something you plug in!",
            "Something in an ocean!", "A breakfast cereal!", "Something you do in summer!",
            "A villain, bad guy or monster!", "Something that smells good!", "Something that smells bad!",
            "A place you go on a date!", "Something with wheels!", "Something a mechanic uses!",
            "Something soft!", "Something heavy!"
        ]
    },
    es: {
        code: "es-MX",
        lettersMaster: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "L", "M", "N", "Ñ", "P", "Q", "R", "S", "T", "U", "V", "Z"],
        topicsMaster: [
            "¡Un actor o actriz famoso/a!", "¡Un alimento en el refrigerador!", "¡Un objeto que hay en una oficina!",
            "¡Una cadena de comida rápida!", "¡Un superhéroe!", "¡Algo que encuentras en el baño!",
            "¡Una parte de un automóvil!", "¡Algo que hace ruido!", "¡El título de un programa de TV!",
            "¡El título de una película!", "¡Un alimento para el desayuno!", "¡Algo que venden en una ferretería!",
            "¡Un instrumento musical!", "¡Un deporte o juego!", "¡Un estado de EE. UU.!",
            "¡Cualquier animal!", "¡Un ingrediente para pizza!", "¡Una marca de autos!",
            "¡Algo que no debes tocar con las manos desnudas!", "¡Un disfraz de Halloween!", "¡Algo que te hace sentir cansado o agotado!",
            "¡Un juego de mesa o videojuego!", "¡Un oficio u profesión!", "¡Un país!",
            "¡Un sabor de helado!", "¡Algo que hay en un salón de clases!", "¡Un dulce o caramelo!",
            "¡Una parte del cuerpo humano!", "¡Algo que ves en el cielo nocturno!", "¡Una verdura!",
            "¡Una fruta!", "¡Algo que encuentras en la playa!", "¡Una cadena de restaurantes!",
            "¡Algo que encuentras en una cartera o billetera!", "¡Una tarea del hogar!", "¡Algo que bebes!",
            "¡Una palabra con letras dobles!", "¡Algo que usa electricidad!", "¡Cualquier ciudad del mundo!",
            "¡Un día festivo o celebración!", "¡Algo frío!", "¡Algo caliente!",
            "¡Algo peludo!", "¡Algo afilado!", "¡Un producto de panadería!",
            "¡Un lugar o monumento famoso!", "¡Algo que guardas en el ático!", "¡Una actividad diaria!",
            "¡Algo que encuentras en la cocina!", "¡Un apodo o sobrenombre!", "¡Algo pegajoso!",
            "¡Un tipo de flor o planta!", "¡Ropa o accesorios!", "¡Un animal peligroso!",
            "¡Algo que llevas a un campamento!", "¡Un personaje de dibujos animados!", "¡Algo de color rojo, amarillo o azul!",
            "¡Algo redondo!", "¡Un producto de supermercado!", "¡Algo que encuentras en la naturaleza!",
            "¡Un bocadillo o snack!", "¡Una empresa famosa!", "¡Algo hecho de madera!",
            "¡Algo hecho de metal!", "¡Una raza de perro!", "¡Algo que compras en una gasolinera!",
            "¡El título de una canción!", "¡Un músico famoso!", "¡Algo que se conecta a la corriente!",
            "¡Algo que hay en un océano!", "¡Un cereal para el desayuno!", "¡Algo que haces en verano!",
            "¡Un villano, malo o monstruo!", "¡Algo que huele bien!", "¡Algo que huele mal!",
            "¡Un lugar para ir en una cita!", "¡Algo con ruedas!", "¡Una herramienta que usa un mecánico!",
            "¡Algo suave!", "¡Algo pesado!"
        ]
    }
};

let currentLang = 'en';
let topicsMaster = GAME_DATA[currentLang].topicsMaster;
let lettersMaster = GAME_DATA[currentLang].lettersMaster;

const CATEGORIES = topicsMaster;
const LETTERS = lettersMaster;

const STORAGE_KEYS = {
    STREAK: "wb_daily_streak",
    LAST_DATE: "wb_daily_last_date",
    COMPLETED_DATA: "wb_daily_last_score"
};

let isDailyMode = false;
let isRoundActive = false;
let dailyCurrentIndex = 0;
let dailyDeckPrompts = [];
let dailyResultsArray = [];
let dailyStartTime = null;
let countdownInterval = null;
let comboDeck = [];

// ==========================================
// 2. SYNTHESIZED AUDIO ENGINE
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
        if (this.ctx.state === "suspended" || this.ctx.state === "interrupted") {
            this.ctx.resume();
        }
        try {
            const buffer = this.ctx.createBuffer(1, 1, 22050);
            const source = this.ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(this.ctx.destination);
            source.start(0);
        } catch (e) {}
    }
    stopAll() {

        const when = this.ctx ? this.ctx.currentTime : 0;
        for (const voice of this.voices) {
            try { voice.stop(when); } catch (e) {}
        }
        this.voices = [];
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
}

const gameAudio = new GameAudioEngine();

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

// ==========================================
// 3. STARFIELD BACKGROUND ENGINE
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
// 4. LANGUAGE SWITCHER & UI CONTROLLERS
// ==========================================
function syncLanguageState(langCode) {
    const normalized = (langCode === 'es') ? 'es' : 'en';
    currentLang = normalized;
    window.currentLang = normalized;
    localStorage.setItem("wordblurts_lang", normalized);
    return normalized;
}

function toggleLanguage() {
    const activeLang = (window.currentLang || currentLang) === 'es' ? 'en' : 'es';
    switchLanguage(activeLang);
}

function switchLanguage(langCode) {
    if (!GAME_DATA[langCode]) return;

    const activeLang = syncLanguageState(langCode);

    window.lettersMaster = GAME_DATA[activeLang].lettersMaster;
    window.topicsMaster = GAME_DATA[activeLang].topicsMaster;
    topicsMaster = window.topicsMaster;
    lettersMaster = window.lettersMaster;

    // Reset combo deck so it draws exclusively from the new language
    comboDeck = generateDeck();

    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (typeof stopEverything === 'function') stopEverything();

    // --- INSTANT UI LANGUAGE UPDATE ---
    const promptEl = document.getElementById('promptDisplay') || document.getElementById('topic-display') || document.getElementById('topic');
    if (promptEl && typeof currentActiveTopic !== 'undefined' && currentActiveTopic) {
        if (activeLang === 'es' && GAME_DATA['en'] && GAME_DATA['es']) {
            // Find matching index whether currentActiveTopic is currently English or Spanish
            let idx = GAME_DATA['en'].topicsMaster.indexOf(currentActiveTopic);
            if (idx === -1) idx = GAME_DATA['es'].topicsMaster.indexOf(currentActiveTopic);

            const englishTopic = (idx !== -1 && GAME_DATA['en'].topicsMaster[idx]) ? GAME_DATA['en'].topicsMaster[idx] : currentActiveTopic;
            const spanishTopic = (idx !== -1 && GAME_DATA['es'].topicsMaster[idx]) ? GAME_DATA['es'].topicsMaster[idx] : currentActiveTopic;

            promptEl.innerHTML = `
                <div style="font-size: 2.0rem; font-weight: bold; color: #ffd700; margin-bottom: 6px; text-align: center; width: 100%; text-shadow: 0 2px 4px rgba(0,0,0,0.6);">${spanishTopic}</div>
                <div style="font-size: 1.5rem; color: #cbd5e1; opacity: 0.9; text-align: center; width: 100%;">(${englishTopic})</div>
            `;
        } else {
            // Switching back to English: translate if currentActiveTopic is in Spanish
            let idx = GAME_DATA['es'] ? GAME_DATA['es'].topicsMaster.indexOf(currentActiveTopic) : -1;
            const englishTopic = (idx !== -1 && GAME_DATA['en'].topicsMaster[idx]) ? GAME_DATA['en'].topicsMaster[idx] : currentActiveTopic;

            promptEl.innerHTML = `
                <div style="font-size: 1.8rem; font-weight: bold; color: #ffd700; text-align: center; width: 100%; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">${englishTopic}</div>
   `;
        }
    }
    // ----------------------------------

    updateStaticUI();
    if (typeof applyFooterLanguage === 'function') applyFooterLanguage(activeLang);
    if (typeof applyRoomBarLanguage === 'function') applyRoomBarLanguage(activeLang);
}

function updateStaticUI() {
    const isEs = (currentLang === "es");
    const startBtn = document.getElementById("start-btn") || document.getElementById("playBtn");
    const langToggleBtn = document.getElementById("lang-toggle-btn");

    if (startBtn) {
        startBtn.textContent = isEs ? "¡JUGAR!" : "PLAY";
    }
    if (langToggleBtn) {
        langToggleBtn.innerHTML = isEs ? "<span>🇺🇸 English</span>" : "<span>🇪🇸 Español</span>";
    }

    // Translate Prompt Area if no active round has started yet
    const promptEl = document.getElementById('promptDisplay') || document.getElementById('topic-display') || document.getElementById('topic');
    if (promptEl && (!window.currentActiveTopic)) {
        promptEl.innerHTML = `
            <div style="font-size: 1.5rem; color: #94a3b8; text-align: center;">
                ${isEs ? '¡Presiona Jugar para comenzar!' : 'Press Play to Start!'}
            </div>
        `;
    }

    // Translate Rules Card (with default hidden display fix)
    const rulesCard = document.getElementById('rulesCard');
    if (rulesCard) {
        // Ensure it's hidden by default if style wasn't set in HTML
        if (!rulesCard.style.display) {
            rulesCard.style.display = 'none';
        }
        
        if (isEs) {
            rulesCard.innerHTML = `
                <h3 style="color: #ffd700; margin-top: 0; margin-bottom: 12px; font-size: 1.3rem;">Cómo Jugar</h3>
                <p style="margin-bottom: 10px; line-height: 1.5;"><strong>1. Comenzar:</strong> Presiona <kbd>PLAY</kbd>, <kbd>Enter</kbd> o la barra espaciadora para obtener un tema y una letra. ¡Los jugadores deben acordar cuántos puntos alcanzar antes de declarar un ganador!</p>
                <p style="margin-bottom: 10px; line-height: 1.5;"><strong>2. El Reto:</strong> Después de que el locutor diga "¡Dilo ya!" y la luz verde parpadee, tienes 15 segundos para decir una o más respuestas coincidentes antes de que se acabe el tiempo.</p>
                <p style="margin-bottom: 10px; line-height: 1.5;"><strong>3. Reglas y Puntuación:</strong> El juego no escucha ni realiza un seguimiento de las respuestas. Las palabras deben ser acordadas por los demás jugadores. ¡Se permiten múltiples respuestas, y cada una vale un punto (las palabras "Un", "Una", "El" y "La" no cuentan)!</p>
                <p style="margin-bottom: 0; line-height: 1.5;"><strong>Consejo Útil:</strong> ¡Ser el primero en decir una respuesta correcta no solo te da puntos, sino que evita que tu oponente use esas mismas respuestas para anotar! Después de cada ronda, ajusta manualmente tus puntuaciones a continuación.</p>
            `;
        } else {
            rulesCard.innerHTML = `
                <h3 style="color: #ffd700; margin-top: 0; margin-bottom: 12px; font-size: 1.3rem;">How to Play</h3>
                <p style="margin-bottom: 10px; line-height: 1.5;"><strong>1. Getting Started:</strong> Players must first agree on how many points to play to before a winner is declared.  Press <kbd>PLAY</kbd>, <kbd>Enter</kbd>, or <kbd>Spacebar</kbd> to draw a topic and letter. </p>
                <p style="margin-bottom: 10px; line-height: 1.5;"><strong>2. The Round:</strong> After the announcer says "Blurt it out!" and the green light flashes, you have 15 seconds to Blurt out a matching answer(s) before time runs out!</p>
                <p style="margin-bottom: 10px; line-height: 1.5;"><strong>3. Scoring:</strong> The game does not track correct answers—it's up to the players to agree whether a Blurt is correct. Multiple answers are allowed per round, and every correct answer earns a point (articles like "A", "An", and "The" don't count)</p>
                <p style="margin-bottom: 0; line-height: 1.5;"><strong>Pro Tip:</strong> Being first to Blurt out a correct answer gives you points and keeps your opponent from using those same answers! After each round, manually adjust your scores below.</p>
            `;
        }
    }

    // Translate Footer Copyright & Links
    const footerCopy = document.getElementById('footer-copyright');
    const footerAbout = document.getElementById('open-about-btn');
    const footerTeachers = document.getElementById('footer-teachers-link');
    const footerPrivacy = document.getElementById('footer-privacy-link');
    const footerAds = document.getElementById('footer-ads-link');

    if (footerCopy) footerCopy.innerHTML = isEs ? '&copy; 2026 Word Blurts! Todos los derechos reservados.' : '&copy; 2026 Word Blurts! All rights reserved.';
    if (footerAbout) footerAbout.textContent = isEs ? 'Acerca de' : 'About';
    if (footerTeachers) footerTeachers.textContent = isEs ? 'Para maestros' : 'For Teachers';
    if (footerPrivacy) footerPrivacy.textContent = isEs ? 'Política de privacidad' : 'Privacy Policy';
    if (footerAds) footerAds.textContent = isEs ? 'Configuración de anuncios' : 'Ad Settings';


    // Translate SEO About Section (Bottom of Page)
    const about1 = document.getElementById('about-section-1');
    if (about1) {
        if (isEs) {
            about1.innerHTML = `
                <h2>Acerca de Word Blurts!</h2>
                <p><strong>Word Blurts!</strong> es un juego de palabras de fiesta en línea rápido y gratuito diseñado para poner a prueba tus habilidades de pensamiento rápido, vocabulario y velocidad de reacción. Ya sea que estés organizando una noche de juegos con amigos, jugando con la familia o poniendo a prueba tus propios conocimientos, ¡Word Blurts! ofrece diversión instantánea directamente en tu navegador web.</p>
                
                <h3>Cómo Funciona</h3>
                <p>Cada ronda genera un tema aleatorio y una letra inicial. Una vez que el locutor da la señal, los jugadores compiten contra un cronómetro de 15 segundos para decir una palabra coincidente antes de que se acabe el tiempo. ¡Lleva la puntuación directamente en el marcador de equipo integrado y mira quién reina supremo!</p>

                <h3>Características Principales</h3>
                <ul>
                    <li>⚡ <strong>Juego instantáneo en el navegador:</strong> No se requieren descargas, registros de cuenta ni instalaciones.</li>
                    <li>⏱ <strong>Cuenta regresiva dinámica de 15 segundos:</strong> El temporizador visual y de audio integrado mantiene la presión.</li>
                    <li>👥 <strong>Marcador interactivo:</strong> Lleva las puntuaciones del Jugador 1 y Jugador 2 o de equipos completos sin problemas.</li>
                    <li>📱 <strong>Compatible con dispositivos móviles y de escritorio:</strong> Diseño totalmente receptivo con controles táctiles y de barra espaciadora.</li>
                </ul>

                <h3>Preguntas Frecuentes</h3>
                <div class="faq-item">
                    <strong>P: ¿Word Blurts! es gratis para jugar?</strong>
                    <p>Sí, ¡Word Blurts! es 100% gratuito para jugar en computadoras de escritorio, tabletas y dispositivos móviles.</p>
                </div>
                <div class="faq-item">
                    <strong>P: ¿Cuántos jugadores pueden participar?</strong>
                    <p>¡Word Blurts! funciona muy bien para 1 o 2 jugadores, o hasta grupos grandes divididos en Equipo 1 y Equipo 2. Cuantos más jugadores, más respuestas divertidas escucharás y más hilarante se vuelve.</p>
                </div>
                <div class="faq-item">
                    <strong>P: ¿Puedo jugar en mi teléfono?</strong>
                    <p>¡Absolutamente! El juego está optimizado para todos los tamaños de pantalla y navegadores móviles.</p>
                </div>
                <div class="faq-item">
                    <strong>P: ¿Las reglas son estrictas?</strong>
                    <p>¡Absolutamente no! El juego fue creado para el disfrute máximo de todos. Solo asegúrate de que todos estén de acuerdo con cualquier regla modificada antes de empezar a jugar.</p>
                </div>
            `;
        } else {
            about1.innerHTML = `
                <h2>What is Word Blurts!???</h2>
                <p><strong>Word Blurts!</strong> is a fast-paced, free, online party word game designed to test your quick-thinking skills, vocabulary, and reaction speed. Whether you are hosting a game night with friends, playing with family, or testing your own knowledge, Word Blurts! delivers instant fun right in your web browser.</p>
                
                <h3>How It Works</h3>
                <p>Each round generates a random category prompt and a starter letter. Once the announcer gives the signal, players race against a 15-second timer to Blurt out a matching word before time runs out! Keep score right on the built-in team scoreboard and see who reigns supreme!</p>

                <h3>Key Features</h3>
                <ul>
                    <li>⚡ <strong>Instant Browser Play:</strong> No downloads, account sign-ups, or installations required.</li>
                    <li>⏱ <strong>Dynamic 15-Second Countdown:</strong> Built-in visual and audio timer keeps the pressure on.</li>
                    <li>👥 <strong>Interactive Scoreboard:</strong> Track scores for Player 1 and Player 2 or full teams seamlessly.</li>
                    <li>📱 <strong>Mobile & Desktop Friendly:</strong> Fully responsive design with spacebar and touch controls.</li>
                </ul>

                <h3>Frequently Asked Questions</h3>
                <div class="faq-item">
                    <strong>Q: Is Word Blurts! free to play?</strong>
                    <p>Yes, Word Blurts! is 100% free to play on desktop, tablet, and mobile devices.</p>
                </div>
                <div class="faq-item">
                    <strong>Q: How many players can play?</strong>
                    <p>Word Blurts! works great for 1 or 2 players all the way up to large groups split into Team 1 and Team 2. The more players, the more nutty answers you'll hear, and the more hilarious it gets!</p>
                </div>
                <div class="faq-item">
                    <strong>Q: Can I play on my phone?</strong>
                    <p>Absolutely! The game is optimized for all screen sizes and mobile browsers.</p>
                </div>
                <div class="faq-item">
                    <strong>Q: Are the rules strict?</strong>
                    <p>Absolutely not! The game was created for everyone's maximum enjoyment! Just make sure everyone agrees to any changed rules before beginning to play.</p>
                </div>
            `;
        }
    }

    // Translate About Modal Pop-up (about-section-2)
    const about2 = document.getElementById('about-section-2');
    if (about2) {
        if (isEs) {
            about2.innerHTML = `
                <button id="close-about-btn" onclick="document.getElementById('about-modal').style.display='none';" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: #ffffff; font-size: 1.5rem; cursor: pointer;">&times;</button>
                <h2 style="color: #00f5d4; font-size: 1.8rem; margin-bottom: 16px;">Acerca de Word Blurts!</h2>
                <p style="margin-bottom: 14px; line-height: 1.6;">
                    Bienvenido a <strong>Word Blurts!</strong> — una adaptación digital de un juego de mesa de palabras que creé originalmente cuando era adolescente en 1984, al que llamé <em>Word Wit</em>. Registré las reglas con derechos de autor en el gobierno federal y vendí copias en librerías locales y por pedido por correo. Cuatro años después, Milton Bradley lanzó un juego similar llamado <em>Scattergories</em>, que se convirtió en un éxito increíble.
                </p>
                <p style="margin-bottom: 14px; line-height: 1.6;">
                    La inspiración original vino de mi madre, quien creció jugando a un juego similar de asociación de palabras en Alemania. Ella nos enseñó a jugar y se convirtió en el favorito de la familia a lo largo de los años. El mayor inconveniente siempre fue necesitar papel y lápiz para anotar todo; ¡esta versión digital resuelve ese problema por completo!
                </p>
                <h3 style="color: #7b2cbf; font-size: 1.3rem; margin-top: 20px; margin-bottom: 10px;">Ejercicio para el cerebro: Desarrollo y agilidad</h3>
                <p style="margin-bottom: 14px; line-height: 1.6;">
                    Word Blurts! está diseñado para ser mucho más que solo entretenimiento; es un ejercicio cognitivo ligero y rápido para jugadores de todas las edades. 
                </p>
                <p style="margin-bottom: 14px; line-height: 1.6;">
                    <strong>Para niños y jóvenes estudiantes:</strong> Los juegos rápidos de categorización juegan un papel vital en el desarrollo cerebral infantil. Amplían activamente el vocabulario, mejoran la retención de la ortografía y aumentan la velocidad de procesamiento cognitivo. Al obligar al cerebro a buscar en la memoria semántica bajo presión de tiempo, los jóvenes construyen vías neuronales más fuertes para la fluidez verbal, la memoria de trabajo y el pensamiento lateral.
                </p>
                <p style="margin-bottom: 14px; line-height: 1.6;">
                    <strong>Para adultos mayores y personas de la tercera edad:</strong> Mantener la mente aguda requiere agilidad mental y desafíos lingüísticos regulares. Los juegos de asociación de palabras estimulan la función ejecutiva y fomentan la recuperación léxica, ayudando a los jugadores mayores a mantener la agudeza verbal, la flexibilidad de la memoria y la rapidez mental en un ambiente divertido y sin estrés.
                </p>
                <p style="margin-bottom: 14px; line-height: 1.6;">
                    Es <strong>100% gratis para jugar</strong>, sin registros, descargas ni cuentas requeridas.
                </p>
                <h3 style="color: #7b2cbf; font-size: 1.3rem; margin-top: 20px; margin-bottom: 10px;">Detrás del proyecto y comentarios</h3>
                <p style="margin-bottom: 14px; line-height: 1.6;">
                    Construí esta versión web con la asistencia de Gemini durante aproximadamente dos meses. La reproducción de audio de texto a voz varía según el dispositivo; suena nítido en dispositivos Android y Firefox, aunque el comportamiento en iOS puede variar según la configuración de síntesis de voz del sistema.
                </p>
                <p style="margin-bottom: 14px; line-height: 1.6;">
                    ¡Me encantaría conocer tus opiniones, reportes de errores o ideas de funciones! Por favor, comparte tus comentarios en Reddit:
                </p>
                <p style="text-align: center; margin-top: 18px;">
                    <a href="https://www.reddit.com/r/playmygame/comments/1wu77ad/blurt_it_out/" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #00f5d4; color: #0b0d19; padding: 10px 20px; border-radius: 8px; font-weight: bold; text-decoration: none;">
                        💬 Dejar comentarios en Reddit
                    </a>
                </p>
            `;
        } else {
            about2.innerHTML = `
                <button id="close-about-btn" onclick="document.getElementById('about-modal').style.display='none';" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: #ffffff; font-size: 1.5rem; cursor: pointer;">&times;</button>
                <h2 style="color: #00f5d4; font-size: 1.8rem; margin-bottom: 16px;">About Word Blurts!</h2>
                <p style="margin-bottom: 14px; line-height: 1.6;">
                    Welcome to <strong>Word Blurts!</strong> — a digital adaptation of a tabletop word game I originally created as a teenager back in 1984, which I called <em>Word Wit</em>. I copyrighted the rules with the federal government and sold copies at local bookstores and mail-order. Four years later, Milton Bradley released a similar game called <em>Scattergories</em>, which went on to become an incredible hit.
                </p>
                <p style="margin-bottom: 14px; line-height: 1.6;">
                    The original inspiration came from my Mother, who grew up playing a similar word association game in Germany. She taught us how to play, and it became a beloved family favorite over the years. The biggest drawback was always needing pencil and paper to write everything down — this digital version completely solves that issue!
                </p>
                <h3 style="color: #7b2cbf; font-size: 1.3rem; margin-top: 20px; margin-bottom: 10px;">Exercise for the Brain</h3>
                <p style="margin-bottom: 14px; line-height: 1.6;">
                    Word Blurts! is designed for players of all ages. It offers youngsters a fun way to develop vocabulary and cognitive processing speed, while helping older adults keep their minds sharp and active — think of it as light exercise for your brain!
                </p>
                <p style="margin-bottom: 14px; line-height: 1.6;">
                    It is <strong>100% free to play</strong> with no sign-ups, downloads, or accounts required.
                </p>
                <h3 style="color: #7b2cbf; font-size: 1.3rem; margin-top: 20px; margin-bottom: 10px;">Behind the Project & Feedback</h3>
                <p style="margin-bottom: 14px; line-height: 1.6;">
                    I built this web version with assistance from Gemini over about two months. The text-to-speech audio rendering varies across devices — it sounds crisp on Android devices and Firefox, though iOS behavior may differ depending on system speech synthesis settings.
                </p>
                <p style="margin-bottom: 14px; line-height: 1.6;">
                    I would love to hear your thoughts, bug reports, or feature ideas! Please share your feedback on Reddit:
                </p>
                <p style="text-align: center; margin-top: 18px;">
                    <a href="https://www.reddit.com/r/playmygame/comments/1wu77ad/blurt_it_out/" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #00f5d4; color: #0b0d19; padding: 10px 20px; border-radius: 8px; font-weight: bold; text-decoration: none;">
                        💬 Leave Feedback on Reddit
                    </a>
                </p>
            `;
        }
    }
}

// ==========================================
// HOW TO PLAY / RULES TOGGLE
// ==========================================
function toggleRules() {
    const rulesCard = document.getElementById('rulesCard');
    if (!rulesCard) return;

    // Check its current display state (fallback to computed style if needed)
    const currentDisplay = rulesCard.style.display || window.getComputedStyle(rulesCard).display;

    if (currentDisplay === 'none' || currentDisplay === '') {
        rulesCard.style.display = 'block';
    } else {
        rulesCard.style.display = 'none';
    }
}

function openAboutModal() {
    const modal = document.getElementById('aboutModal') || document.getElementById('aboutCard') || document.getElementById('about-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// ==========================================
// 5. DECK & GAME LOOP HELPERS
// ==========================================
function generateDeck() {
    const tList = GAME_DATA[currentLang].topicsMaster;
    const lList = GAME_DATA[currentLang].lettersMaster;
    const deck = [];
    for (let t of tList) {
        for (let l of lList) {
            deck.push({ topic: t, letter: l });
        }
    }
    return deck;
}

// ==========================================
// ROOM CODE SEEDED MULTIPLAYER ENGINE
// ==========================================
window.activeRoomCode = "";
let roomSeedState = 0;

function hashRoomCode(code) {
    let hash = 2166136261;
    const clean = code.trim().toUpperCase();
    for (let i = 0; i < clean.length; i++) {
        hash ^= clean.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

function nextSeededRandom() {
    // Mulberry32 deterministic PRNG
    roomSeedState |= 0;
    roomSeedState = (roomSeedState + 0x6D2B79F5) | 0;
    let t = Math.imul(roomSeedState ^ (roomSeedState >>> 15), 1 | roomSeedState);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

window.setRoomCode = function(code) {
    const clean = (code || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6);
    window.activeRoomCode = clean;

    if (clean.length > 0) {
        // Set false FIRST so switchToClassicMode() sees the updated state
        window.isDailyMode = false;
        if (typeof switchToClassicMode === 'function') {
            switchToClassicMode();
        }
        const yesterdayBtn = document.getElementById('yesterdayBlurtsBtn');
        if (yesterdayBtn) yesterdayBtn.style.display = 'none';

        roomSeedState = hashRoomCode(clean);
        // Reset deck in identical order for all players
        comboDeck = generateDeck();
    } else {
        // Empty code returns to standard unseeded Classic mode
        comboDeck = generateDeck();
    }

    // Update URL share parameter cleanly without /index.html
    const url = new URL(window.location.origin + "/");
    if (clean) {
        url.searchParams.set('code', clean);
    }
    window.history.replaceState({}, '', url);

    return clean;
};

window.generateRandomRoomCode = function() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // Omitted I and O to prevent confusion
    let result = "";
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Auto-load room code if someone opens a shared link like wordblurts.com/?code=WOLF
window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get('code');
    if (urlCode) {
        const applied = window.setRoomCode(urlCode);
        const inputEl = document.getElementById('roomCodeInput');
        if (inputEl) inputEl.value = applied;
        const statusEl = document.getElementById('roomStatusText');
        if (statusEl && applied) {
            statusEl.innerText = `🟢 Synced to Room: ${applied}`;
        }
    }
});

function drawNextCombo() {
    // Standard Random or Seeded Room Mode logic
    if (comboDeck.length === 0) {
        comboDeck = generateDeck();
    }
    if (comboDeck.length === 0) return { topic: "Ready", letter: "A" };

    // Use deterministic seeded math if a Room Code is active, otherwise normal Math.random()
    const randVal = (window.activeRoomCode && window.activeRoomCode.length > 0)
        ? nextSeededRandom()
        : Math.random();

    const index = Math.floor(randVal * comboDeck.length);
    return comboDeck.splice(index, 1)[0];
}

function stopEverything() {
    if (countdownInterval !== null) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    if (typeof gameAudio !== 'undefined' && gameAudio && typeof gameAudio.stopAll === 'function') {
        gameAudio.stopAll();
    }
    speed = 2.5;
}

if (typeof window.isTransitioning === 'undefined') {
    window.isTransitioning = false;
}

function playRound() {
    // 🔓 Unlock iOS audio synchronously on the exact user click/touch gesture
    unlockIOSAudio();
    startNewRound();
}

function startNewRound() {
    // 1. Check if Daily Mode just finished its 10 rounds
    if (window.isDailyMode && typeof dailyCurrentIndex !== 'undefined' && dailyCurrentIndex >= 10) {
        if (typeof handleDailyCompletion === 'function') handleDailyCompletion();
        return;
    }

    // 2. Guard clauses: block if already active or transitioning
    if (typeof isRoundActive !== 'undefined' && isRoundActive) return;
    if (window.isTransitioning) return;
    window.isTransitioning = true;
    setTimeout(() => { window.isTransitioning = false; }, 300);

    if (typeof stopEverything === 'function') stopEverything();

    // Clear any leftover per-round Blurt input from the previous round
    const oldInputWrapper = document.getElementById('live-round-answer-input-wrapper');
    if (oldInputWrapper) oldInputWrapper.remove();

    const mainContainer = document.querySelector('.game-card') || document.querySelector('.prompt-box') || document.querySelector('main') || document.querySelector('.container');
    if (mainContainer) {
        mainContainer.style.borderColor = "";
        mainContainer.style.boxShadow = "";
    }

    // 3. Disable and fade the PLAY button while the round is running
    const playBtn = document.getElementById('playBtn') || document.getElementById('start-btn');
    if (playBtn) {
        playBtn.disabled = true;
        playBtn.style.opacity = "0.5";
        playBtn.style.cursor = "not-allowed";
    }

    // 4. Reset timer display
    const timerEl = document.getElementById('timerDisplay') || document.getElementById('timer');
    if (timerEl) {
        timerEl.innerText = "15";
        timerEl.style.color = "";
        timerEl.style.fontSize = "";
        timerEl.style.fontWeight = "";
        timerEl.style.textShadow = "";
        timerEl.style.boxShadow = "";
        timerEl.style.animation = "";
        timerEl.classList.remove('flash-red');
    }

    // 5. Determine next prompt card (Daily vs Classic)
    let nextCard;
    if (window.isDailyMode) {
        if (typeof dailyDeckPrompts === 'undefined' || !Array.isArray(dailyDeckPrompts) || dailyDeckPrompts.length === 0) {
            if (typeof getDailyPrompts === 'function') {
                const dailyData = getDailyPrompts();
                dailyDeckPrompts = Array.isArray(dailyData) ? dailyData : (dailyData.prompts || []);
            }
        }
        if (typeof dailyCurrentIndex === 'undefined') dailyCurrentIndex = 0;

        // Reset per-round scoring & Blurts at the very start of a fresh 10-round Daily run
        if (dailyCurrentIndex === 0) {
            window.dailyRoundScored = Array(10).fill(false);
            window.dailyRoundAnswers = {};
        }

        if (dailyDeckPrompts && dailyDeckPrompts.length > 0 && dailyCurrentIndex < dailyDeckPrompts.length) {
            nextCard = dailyDeckPrompts[dailyCurrentIndex];
            dailyCurrentIndex++;
        } else {
            nextCard = drawNextCombo();
        }
    } else {
        nextCard = drawNextCombo();
    }

    if (!nextCard) {
        nextCard = { topic: "Animals", letter: "A" };
    }

    window.currentActiveTopic = nextCard.topic;

    // 6. Update round counter display for Daily Mode
    const counterEl = document.getElementById('roundCounter');
    if (counterEl) {
        if (window.isDailyMode) {
            const displayRoundNum = dailyCurrentIndex;
            counterEl.innerText = (window.currentLang === 'es')
                ? `Ronda ${displayRoundNum} de 10`
                : `Round ${displayRoundNum} of 10`;
            counterEl.style.display = 'block';
        } else {
            counterEl.style.display = 'none';
        }
    }

    // 7. Update UI displays for topic and letter
    const promptEl = document.getElementById('promptDisplay') || document.getElementById('topic-display') || document.getElementById('topic');
    const letterEl = document.getElementById('letterDisplay') || document.getElementById('letter-display') || document.getElementById('letter');

    if (promptEl) {
        promptEl.style.display = 'flex';
        promptEl.style.flexDirection = 'column';
        promptEl.style.alignItems = 'center';
        promptEl.style.justifyContent = 'center';

        if (window.currentLang === 'es' && typeof GAME_DATA !== 'undefined' && GAME_DATA['en'] && GAME_DATA['es']) {
            let idx = GAME_DATA['en'].topicsMaster ? GAME_DATA['en'].topicsMaster.indexOf(nextCard.topic) : -1;
            if (idx === -1 && GAME_DATA['es'].topicsMaster) {
                idx = GAME_DATA['es'].topicsMaster.indexOf(nextCard.topic);
            }

            const spanishTopic = (idx !== -1 && GAME_DATA['es'].topicsMaster[idx])
                ? GAME_DATA['es'].topicsMaster[idx]
                : (nextCard.topicEs || nextCard.topic);

            const englishTopic = (idx !== -1 && GAME_DATA['en'].topicsMaster[idx])
                ? GAME_DATA['en'].topicsMaster[idx]
                : (nextCard.topicEn || nextCard.topic);

            promptEl.innerHTML = `
                <div style="font-size: 2.0rem; font-weight: bold; color: #ffd700; margin-bottom: 6px; text-align: center; width: 100%; text-shadow: 0 2px 4px rgba(0,0,0,0.6);">${spanishTopic}</div>
                <div style="font-size: 1.5rem; color: #cbd5e1; opacity: 0.9; text-align: center; width: 100%;">(${englishTopic})</div>
            `;

            if (typeof speakPrompt === 'function') {
                speakPrompt(spanishTopic, englishTopic, nextCard.letter);
            }
        } else {
            promptEl.innerHTML = `<div style="font-size: 2.0rem; font-weight: bold; color: #ffd700; margin-bottom: 6px; text-align: center; width: 100%;">${nextCard.topic}</div>`;

            if (typeof speakPrompt === 'function') {
                speakPrompt(nextCard.topic, '', nextCard.letter);
            }
        }
    }

    if (letterEl) {
        letterEl.innerText = nextCard.letter;
    }

    if (typeof refreshAds === 'function') {
        refreshAds();
    }

    isRoundActive = true;
}

// Helper function that forces iOS hardware open on tap
function unlockIOSAudio() {
    if (typeof gameAudio !== 'undefined' && typeof gameAudio.unlock === 'function') {
        gameAudio.unlock();
    }

    if (typeof iosUnlocked !== 'undefined' && iosUnlocked) return;

    if (typeof sounds !== 'undefined') {
        Object.values(sounds).forEach(audio => {
            audio.play().then(() => {
                audio.pause();
                audio.currentTime = 0;
            }).catch(() => {});
        });
    }

    // Also wake up iOS SpeechSynthesis on the direct tap gesture
    if ('speechSynthesis' in window) {
        try {
            window.speechSynthesis.cancel();
            const silentUtterance = new SpeechSynthesisUtterance('');
            silentUtterance.volume = 0;
            window.speechSynthesis.speak(silentUtterance);
        } catch (e) {}
    }

    window.iosUnlocked = true;
    console.log("iOS Audio & Speech pipeline forced open!");
}



// ==========================================
// 6. ANNOUNCER & TIMER ENGINE (Bulletproof iOS Fallback)
// ==========================================

window.activeUtterance = null; // Prevents iOS Safari from garbage-collecting speech mid-sentence

function speakPrompt(primaryTopic, secondaryTopic, letter) {
    // 1. Immediately ensure Web Audio is unlocked on tap
    if (typeof gameAudio !== 'undefined' && typeof gameAudio.unlock === 'function') {
        gameAudio.unlock();
    }

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        const isDesktopBrowser = !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        const sec = secondaryTopic ? `, ${secondaryTopic}` : '';

        let fullAnnouncement = "";
        let langCode = (window.currentLang === 'es') ? 'es-MX' : 'en-US';

        if (window.currentLang === 'es') {
            fullAnnouncement = isDesktopBrowser
                ? `${primaryTopic}${sec}. Letra: ${letter}... ¡Dilo ya!`
                : `${primaryTopic}${sec}. Letra: ${letter}... ¡Dilo ya!`;
        } else {
            fullAnnouncement = isDesktopBrowser
                ? `${primaryTopic}${sec}. Starting with the letter: ${letter}... Blurt it out!`
                : `${primaryTopic}${sec}. Starting with the letter: ${letter}... Blurt it out!`;
        }

        const utterance = new SpeechSynthesisUtterance(fullAnnouncement);
        window.activeUtterance = utterance;
        utterance.lang = langCode;

        // --- SPEECH SPEED & VOLUME POLISH ---
        utterance.volume = 0.7; // 30% quieter to prevent speakerphone echo
        utterance.rate = isDesktopBrowser ? 1.08 : 0.98; // Snappy without sounding rushed
        // ------------------------------------

        // Robust voice assignment with desktop fallback
        const assignVoiceAndSpeak = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices && voices.length > 0) {
                const langPrefix = (window.currentLang === 'es') ? 'es' : 'en';
                const matchedVoice = voices.find(v => v.lang.startsWith(langPrefix) && v.localService)
                                  || voices.find(v => v.lang.startsWith(langPrefix));
                if (matchedVoice) utterance.voice = matchedVoice;
            }

            let gameStarted = false;
            const triggerStartOnce = () => {
                if (!gameStarted) {
                    gameStarted = true;
                    clearTimeout(failsafeTimer);
                    triggerGameStart();
                }
            };

            utterance.onend = () => triggerStartOnce();
            utterance.onerror = () => triggerStartOnce();

            const dynamicTimeout = Math.max(3500, fullAnnouncement.length * 80 + 1500);
            const failsafeTimer = setTimeout(() => {
                if (!gameStarted) {
                    window.speechSynthesis.cancel();
                    triggerStartOnce();
                }
            }, dynamicTimeout);

            try {
                window.speechSynthesis.speak(utterance);
            } catch (e) {
                triggerStartOnce();
            }
        };

        // Ensure voices are loaded (Chrome/Edge fire 'voiceschanged' asynchronously)
        if (window.speechSynthesis.getVoices().length > 0) {
            assignVoiceAndSpeak();
        } else {
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.onvoiceschanged = null;
                assignVoiceAndSpeak();
            };
            // Failsafe if voiceschanged never fires
            setTimeout(() => {
                if (!utterance.voice && window.speechSynthesis.speaking === false) {
                    assignVoiceAndSpeak();
                }
            }, 100);
        }

    } else {
        triggerGameStart();
    }
}


// Helper function to handle the green flash and startTimer cleanly
function triggerGameStart() {
    const mainContainer = document.querySelector('.game-card') || document.querySelector('.prompt-box') || document.querySelector('main') || document.querySelector('.container');
    if (mainContainer) {
        mainContainer.style.borderColor = "#10b981"; // Vibrant green
        mainContainer.style.boxShadow = "0 0 40px #10b981, inset 0 0 25px #10b981";
        setTimeout(() => {
            if (mainContainer.style.borderColor === "rgb(16, 185, 129)" || mainContainer.style.borderColor === "#10b981") {
                mainContainer.style.borderColor = "";
                mainContainer.style.boxShadow = "";
            }
        }, 1000);
    }
    startTimer();
}

// ==========================================
// 7a. TIMESTAMP-ACCURATE 15-SECOND TIMER (iOS-Proof)
// ==========================================

window.redFlashTimers = window.redFlashTimers || [];

function startTimer() {
    if (typeof countdownInterval !== 'undefined' && countdownInterval !== null) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }

    // Clear any leftover flash/red timeouts from the previous round
    if (Array.isArray(window.redFlashTimers)) {
        window.redFlashTimers.forEach(id => clearTimeout(id));
        window.redFlashTimers = [];
    }

    const durationSec = 15;
    const endTimeMs = Date.now() + durationSec * 1000;
    const timerEl = document.getElementById('timerDisplay') || document.getElementById('timer');
    const mainContainer = document.querySelector('.game-card') || document.querySelector('.prompt-box') || document.querySelector('main') || document.querySelector('.container');

    const applyGreenSteady = () => {
        if (timerEl) {
            timerEl.style.color = "#4ade80";
            timerEl.style.textShadow = "0 0 14px rgba(74, 222, 128, 0.55)";
            timerEl.style.transform = "scale(1.0)";
        }
        if (mainContainer) {
            mainContainer.style.borderColor = "#22c55e";
            mainContainer.style.boxShadow = "0 0 24px rgba(34, 197, 94, 0.35)";
        }
    };

    const setYellowFlash = (on) => {
        const pulseColor = "#facc15";
        const glowRgba = "rgba(250, 204, 21, 0.85)";
        if (timerEl) {
            timerEl.style.color = on ? pulseColor : "#ffffff";
            timerEl.style.textShadow = on ? `0 0 20px ${pulseColor}, 0 0 40px ${pulseColor}` : "none";
            timerEl.style.transform = on ? "scale(1.18)" : "scale(1.0)";
        }
        if (mainContainer) {
            mainContainer.style.borderColor = on ? pulseColor : "";
            mainContainer.style.boxShadow = on ? `0 0 35px ${glowRgba}` : "";
        }
    };

    // Reset timer text styles and start with steady green light
    if (timerEl) {
        timerEl.innerText = String(durationSec);
        timerEl.style.color = "";
        timerEl.style.textShadow = "";
        timerEl.style.transform = "";
        timerEl.style.transition = "transform 0.15s ease, color 0.15s ease, text-shadow 0.15s ease";
    }
    applyGreenSteady();

    // Start the Web Audio tension track (drone, heartbeat, ostinato, riser)
    if (typeof gameAudio !== 'undefined' && gameAudio && gameAudio.ctx) {
        gameAudio.unlock();
        gameAudio.stopAll();
        const t0 = gameAudio.ctx.currentTime + 0.02;
        const end = t0 + durationSec;
        const track = (v) => gameAudio.voices.push(v);
        try {
            if (typeof gameAudio.layerDrone === 'function') gameAudio.layerDrone(gameAudio.ctx, t0, end, gameAudio.music, track);
            if (typeof gameAudio.layerHeartbeat === 'function') gameAudio.layerHeartbeat(gameAudio.ctx, t0, end, gameAudio.music, track);
            if (typeof gameAudio.layerOstinato === 'function') gameAudio.layerOstinato(gameAudio.ctx, t0, end, gameAudio.music, track);
            if (typeof gameAudio.layerRiser === 'function') gameAudio.layerRiser(gameAudio.ctx, t0, end, gameAudio.music, track);
        } catch (e) {
            console.warn("Audio layer skipped:", e);
        }
    }

    let lastDisplayedSec = durationSec;
    let lastSingleFlashSec = null;

    // Check every 100ms using Date.now() so iOS backgrounding/throttling never slows the clock
    countdownInterval = setInterval(() => {
        const remainingMs = endTimeMs - Date.now();
        const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

        if (remainingSec !== lastDisplayedSec) {
            lastDisplayedSec = remainingSec;
            if (timerEl) {
                timerEl.innerText = String(remainingSec);
            }
        }

        // Steady green until yellow begins flashing at 5 seconds
        if (remainingMs > 0 && remainingSec > 5) {
            applyGreenSteady();
        } else if (remainingMs > 0 && (remainingSec === 5 || remainingSec === 4)) {
            // Yellow flashes once on second 5 and once on second 4
            if (lastSingleFlashSec !== remainingSec) {
                lastSingleFlashSec = remainingSec;
                setYellowFlash(true);
                window.redFlashTimers.push(setTimeout(() => setYellowFlash(false), 350));
            }
        } else if (remainingMs > 0 && remainingSec <= 3 && remainingSec >= 1) {
            // Yellow flashes twice per second (250ms on / 250ms off) starting at 3
            const isPulseOn = Math.floor(remainingMs / 250) % 2 === 0;
            setYellowFlash(isPulseOn);
        }

        // Time's Up (0): Flash Red 4 times at twice per second (250ms on / 250ms off = 2000ms), then stay steady red
        if (remainingMs <= 0) {
            clearInterval(countdownInterval);
            countdownInterval = null;
            isRoundActive = false;

            if (timerEl) {
                timerEl.innerText = "0";
            }

            const setRedFlash = (on) => {
                if (timerEl) {
                    timerEl.style.color = on ? "#ef4444" : "#ffffff";
                    timerEl.style.textShadow = on ? "0 0 25px #ef4444, 0 0 45px #ff2a2a" : "none";
                    timerEl.style.transform = on ? "scale(1.22)" : "scale(1.0)";
                }
                if (mainContainer) {
                    mainContainer.style.borderColor = on ? "#ef4444" : "";
                    mainContainer.style.boxShadow = on ? "0 0 45px #ef4444, inset 0 0 25px #ef4444" : "";
                }
            };

            // 4 flashes at 2 per second (each flash = 250ms ON + 250ms OFF = 500ms; 4 flashes = 2000ms)
            const flashStepMs = 250;
            for (let i = 0; i < 4; i++) {
                const onAt = i * flashStepMs * 2;
                const offAt = onAt + flashStepMs;
                window.redFlashTimers.push(setTimeout(() => setRedFlash(true), onAt));
                window.redFlashTimers.push(setTimeout(() => setRedFlash(false), offAt));
            }

            // Settle into steady red glow right after the 4th flash finishes at 2000ms
            window.redFlashTimers.push(setTimeout(() => {
                if (timerEl) {
                    timerEl.style.color = "#ef4444";
                    timerEl.style.textShadow = "0 0 18px rgba(239, 68, 68, 0.8)";
                    timerEl.style.transform = "scale(1.0)";
                }
                if (mainContainer) {
                    mainContainer.style.borderColor = "#ef4444";
                    mainContainer.style.boxShadow = "0 0 35px rgba(239, 68, 68, 0.85), inset 0 0 18px rgba(239, 68, 68, 0.45)";
                }
            }, 2000));

            // Stop tension layers and play the final sting/buzzer
            if (typeof gameAudio !== 'undefined' && gameAudio) {
                gameAudio.stopAll();
                if (typeof gameAudio.playSting === 'function') {
                    gameAudio.playSting();
                }
            }

            // Re-enable PLAY button for the next round
            const playBtn = document.getElementById('playBtn') || document.getElementById('start-btn');
            if (playBtn) {
                playBtn.disabled = false;
                playBtn.style.opacity = "1";
                playBtn.style.cursor = "pointer";
            }

            // If Daily Mode just finished round 10, automatically trigger completion
            if (window.isDailyMode && typeof dailyCurrentIndex !== 'undefined' && dailyCurrentIndex >= 10) {
                setTimeout(() => {
                    if (typeof handleDailyCompletion === 'function') handleDailyCompletion();
                    if (typeof showDailyResultsModal === 'function') showDailyResultsModal();
                }, 1200);
            }
        }
    }, 100);
}

// ==========================================
// 7b. DAILY & CHALLENGE MODE ENGINE
// ==========================================
function getURLSeed() {
    const params = new URLSearchParams(window.location.search);
    const seedParam = params.get('seed');
    return seedParam ? parseInt(seedParam, 10) : null;
}

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
    const catList = (typeof topicsMaster !== 'undefined' && topicsMaster.length) ? topicsMaster : CATEGORIES;
    const letList = (typeof lettersMaster !== 'undefined' && lettersMaster.length) ? lettersMaster : LETTERS;

    let currentSeed = seed;
    function nextRandom() {
        currentSeed = (currentSeed * 9301 + 49297) % 233280;
        return currentSeed / 233280;
    }

    for (let i = 0; i < 10; i++) {
        const catIndex = Math.floor(nextRandom() * catList.length);
        const letterIndex = Math.floor(nextRandom() * letList.length);
        prompts.push({
            round: i + 1,
            topic: catList[catIndex], // <-- Changed from category to topic
            letter: letList[letterIndex]
        });
    }
    return { prompts, dateStr };
}

// ==========================================
// DAILY MODE & SCOREBOARD LOGIC
// ==========================================

function restoreClassicScoreboxes() {
    const team2Card = document.querySelector('.team-score-card:nth-child(2)');
    if (team2Card) {
        team2Card.style.display = '';
        team2Card.classList.remove('hidden', 'disabled');
    }

    const scoreCards = document.querySelectorAll('.team-score-card, .score-box, .score-card, [data-score-box]');
    scoreCards.forEach((card) => {
        card.style.display = '';
        card.classList.remove('hidden', 'disabled');
    });

    const scoreButtons = document.querySelectorAll('.team-score-card button, .score-btn, .adjust-score-btn');
    scoreButtons.forEach((btn) => {
        btn.disabled = false;
        btn.removeAttribute('aria-disabled');
        btn.classList.remove('disabled');
    });

    if (typeof updateScoreboardUI === 'function') {
        updateScoreboardUI();
    } else if (typeof renderScores === 'function') {
        renderScores();
    }
}

function setGameMode(mode) {
    const team2Card = document.querySelector('.team-score-card:nth-child(2)'); // Target Team 2 scoreboard card

    if (mode === 'daily') {
        isDailyMode = true;

        // Hide Team 2 card in Daily mode for a clean solo layout
        if (team2Card) team2Card.style.display = 'none';

        if (typeof initDailyMode === 'function') {
            const isAvailable = initDailyMode();
            if (!isAvailable) {
                isDailyMode = false;
                restoreClassicScoreboxes();
                syncYesterdayBlurtsButton();
                return;
            }
        }
        const dailyBtn = document.getElementById('dailyModeBtn');
        const randomBtn = document.getElementById('randomModeBtn');
        if (dailyBtn) dailyBtn.classList.add('active');
        if (randomBtn) randomBtn.classList.remove('active');
        syncYesterdayBlurtsButton();
        if (typeof playRound === 'function') playRound();
    } else {
        isDailyMode = false;

        // Restore Team 2 card and scoring boxes for Classic mode
        restoreClassicScoreboxes();

        const randomBtn = document.getElementById('randomModeBtn');
        const dailyBtn = document.getElementById('dailyModeBtn');
        if (randomBtn) randomBtn.classList.add('active');
        if (dailyBtn) dailyBtn.classList.remove('active');
        syncYesterdayBlurtsButton();
    }
}

function syncYesterdayBlurtsButton() {
    const btn = document.getElementById('yesterdayBlurtsBtn');
    if (!btn) return;
    const inDaily = Boolean(window.isDailyMode || (typeof isDailyMode !== 'undefined' && isDailyMode));
    if (!inDaily || window.activeRoomCode) {
        btn.style.display = 'none';
        return;
    }
  

    const activeLang =
        (typeof window !== 'undefined' && window.currentLang) ||
        (typeof currentLang !== 'undefined' ? currentLang : 'en');
    const isEs = activeLang === 'es';

    let prevData = null;
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.COMPLETED_DATA);
        if (raw) {
            const parsed = JSON.parse(raw);
            const todayEastern = getEasternDateStr();
            if (parsed && parsed.dateStr && parsed.dateStr < todayEastern) {
                prevData = parsed;
            }
        }
    } catch (e) {
        prevData = null;
    }

    if (!prevData) {
        btn.style.display = 'none';
        return;
    }

    btn.style.display = '';
    btn.textContent = isEs ? '⏮️ ¡Blurts de ayer!' : "⏮️ Yesterday's Daily Blurts!";

    btn.onclick = () => {
        if (Array.isArray(prevData.scoredRounds)) {
            window.dailyRoundScored = prevData.scoredRounds.slice();
        }
        if (Array.isArray(prevData.resultsArray)) {
            const restoredAnswers = {};
            prevData.resultsArray.forEach((ans, idx) => {
                if (ans) restoredAnswers[idx] = ans;
            });
            window.dailyRoundAnswers = restoredAnswers;
        }
        const streakVal = parseInt(
            localStorage.getItem(STORAGE_KEYS.STREAK) || '1',
            10
        );
        if (typeof showDailyResults === 'function') {
            showDailyResults(prevData.score || 0, streakVal, prevData.resultsArray || []);
        }
    };
}
function initDailyMode() {
    const status = getDailyStatus();
    if (status.isCompletedToday && !getURLSeed()) {
        const savedData = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_DATA) || '{}');
        if (typeof showDailyResults === 'function') {
            showDailyResults(savedData.score || 0, status.streak || 0, savedData.resultsArray || []);
        }
        return false;
    }

    isDailyMode = true;
    window.dailyCurrentIndex = 0; // Starts at index 0 for Round 1

    const urlSeed = getURLSeed();
    if (urlSeed) {
        dailyDeckPrompts = getSeededPrompts(urlSeed);
    } else {
        const dailyData = getDailyPrompts();
        dailyDeckPrompts = dailyData.prompts || [];
    }

    dailyCurrentIndex = 0;
    window.dailyRoundAnswers = {}; // Stores answers per round index: { 0: "toaster", 1: "tennis" }
    dailyResultsArray = [];
    dailyStartTime = null;

    const dailyBtn = document.getElementById('dailyModeBtn');
    if (dailyBtn) dailyBtn.classList.add('active');

    const activeLang =
        (typeof window !== 'undefined' && window.currentLang) ||
        (typeof currentLang !== 'undefined' ? currentLang : 'en');
    const isEs = activeLang === 'es';

    const dailyMessageEl = document.getElementById('dailyMessage') || document.getElementById('promptDisplay');
    if (dailyMessageEl) {
        dailyMessageEl.innerHTML = isEs
            ? `
                <div style="font-size: 1.5rem; font-weight: bold; color: #ffd700; margin-bottom: 8px; text-align: center;">¡Los Blurts Diarios están listos!</div>
                <div style="font-size: 1.1rem; color: #cbd5e1; text-align: center;">Presiona Jugar para comenzar la Ronda 1.</div>
            `
            : `
                <div style="font-size: 1.5rem; font-weight: bold; color: #ffd700; margin-bottom: 8px; text-align: center;">Daily Blurts are ready!</div>
                <div style="font-size: 1.1rem; color: #cbd5e1; text-align: center;">Press Play to start Round 1.</div>
            `;
    }

    return true;
}

function handleDailyCompletion() {
    isRoundActive = false;
    stopEverything();

    const promptEl = document.getElementById('promptDisplay') || document.getElementById('topic-display') || document.getElementById('topic');
    const letterEl = document.getElementById('letterDisplay') || document.getElementById('letter-display') || document.getElementById('letter');

    if (promptEl) {
        promptEl.innerHTML = `
            <div style="font-size: 1.8rem; font-weight: bold; color: #ffd700; margin-bottom: 12px; text-align: center;">Daily Challenge Complete! 🎉</div>
            <div style="font-size: 1.1rem; color: #cbd5e1; margin-bottom: 16px; text-align: center;">Finished adding your points? Click below to save your score!</div>
            <button id="saveDailyScoreBtn" style="background-color: #10b981; color: white; border: none; padding: 12px 24px; font-size: 1.1rem; font-weight: bold; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">Save Daily Score & View Results</button>
        `;
    }

    if (letterEl) {
        letterEl.innerText = "★";
    }

   const saveBtn = document.getElementById('saveDailyScoreBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const scoreEl = document.getElementById('team1Score') || document.getElementById('scoreDisplay');
            const finalScore = parseInt(scoreEl ? scoreEl.innerText : "0", 10) || 0;
            
            // Bundle final round answers into an array aligned with dailyResultsArray
            const finalAnswersArray = [];
            for (let i = 0; i < 10; i++) {
                finalAnswersArray.push(window.dailyRoundAnswers && window.dailyRoundAnswers[i] ? window.dailyRoundAnswers[i] : "");
            }

            const newStreak = saveDailyResults(finalScore, finalAnswersArray, 0);
            showDailyResults(finalScore, newStreak, finalAnswersArray);
        }, { once: true });
    }
}

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

function saveDailyResults(score, resultsArray, timeSpent = 0) {
    const { dateStr } = getDaySeed();
    const status = getDailyStatus();
    if (status.isCompletedToday) return status.streak;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];

    let newStreak = 1;
    if (localStorage.getItem(STORAGE_KEYS.LAST_DATE) === yStr) {
        newStreak = status.streak + 1;
    }

    localStorage.setItem(STORAGE_KEYS.STREAK, newStreak.toString());
    localStorage.setItem(STORAGE_KEYS.LAST_DATE, dateStr);
    localStorage.setItem(STORAGE_KEYS.COMPLETED_DATA, JSON.stringify({ score, resultsArray, timeSpent }));
    return newStreak;
}

function getEasternDateStr() {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(new Date());
    const get = (type) => parts.find(p => p.type === type).value;
    return `${get('year')}-${get('month')}-${get('day')}`;
}

function getCountdownToEasternMidnight() {
    const now = new Date();
    const etNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const etMidnight = new Date(etNow);
    etMidnight.setHours(24, 0, 0, 0);

    const diffMs = Math.max(0, etMidnight - etNow);
    const hrs = String(Math.floor(diffMs / 3600000)).padStart(2, '0');
    const mins = String(Math.floor((diffMs % 3600000) / 60000)).padStart(2, '0');
    const secs = String(Math.floor((diffMs % 60000) / 1000)).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
}

function buildLockedAnswersArray() {
    const arr = [];
    for (let i = 0; i < 10; i++) {
        const val = (window.dailyRoundAnswers && typeof window.dailyRoundAnswers[i] === 'string')
            ? window.dailyRoundAnswers[i]
            : '';
        arr.push(val);
    }
    return arr;
}

function showDailyResults(totalScore, streak, resultsArray) {
    const modal = document.getElementById('results-modal');
    if (!modal) return;

    const activeLang =
        (typeof window !== 'undefined' && window.currentLang) ||
        (typeof currentLang !== 'undefined' ? currentLang : 'en');
    const isEs = activeLang === 'es';

    const numericScore = Math.max(0, Math.min(10, parseInt(totalScore, 10) || 0));
    const streakVal = parseInt(localStorage.getItem(STORAGE_KEYS.STREAK) || streak || '1', 10);

    // Determine the day's date string (Eastern Time, U.S.A.) for spoiler lock tracking
    const todayEasternStr = getEasternDateStr();
    let savedGameDateStr = todayEasternStr;
    try {
        const existingRaw = localStorage.getItem(STORAGE_KEYS.COMPLETED_DATA);
        if (existingRaw) {
            const parsedExisting = JSON.parse(existingRaw);
            if (parsedExisting && parsedExisting.dateStr) {
                savedGameDateStr = parsedExisting.dateStr;
            }
        }
    } catch (e) {
        savedGameDateStr = todayEasternStr;
    }

    // Persist locked round answers + dateStr immediately on open
    const lockedAnswers = Array.isArray(resultsArray) && resultsArray.length === 10
        ? resultsArray.map(v => (typeof v === 'string' ? v : ''))
        : buildLockedAnswersArray();

    // Build Spoiler-Free 10-Square Emoji Matrix from '+' presses per round (0..9)
    let emojiRow = "";
    if (Array.isArray(window.dailyRoundScored) && window.dailyRoundScored.some(Boolean)) {
        emojiRow = Array.from({ length: 10 }, (_, idx) => (window.dailyRoundScored[idx] ? "🟩" : "🟨")).join("");
    } else {
        emojiRow = "🟩".repeat(numericScore) + "🟨".repeat(10 - numericScore);
    }

    const scoreTagline = numericScore === 10
        ? (isEs ? '¡Ronda perfecta!' : 'Clean sweep!')
        : numericScore >= 7
            ? (isEs ? '¡Muy rápido!' : 'Sharp blurting!')
            : numericScore >= 4
                ? (isEs ? '¡Buena partida!' : 'Solid run!')
                : (isEs ? '¡Día difícil!' : 'Tough board today!');

    const richShareText = isEs
        ? `🧩 Word Blurts! Diario Blurts (${savedGameDateStr})\n${emojiRow}\nPuntuación: ${numericScore}/10 • Racha: 🔥 ${streakVal}\n${scoreTagline}\nJuega gratis: https://wordblurts.com`
        : `🧩 Word Blurts! Daily Blurts (${savedGameDateStr})\n${emojiRow}\nScore: ${numericScore}/10 • Streak: 🔥 ${streakVal}\n${scoreTagline}\nPlay free: https://wordblurts.com`;

    const challengeText = isEs
        ? `⚔️ ¡Conseguí ${numericScore}/10 en el Blurts Diario de hoy! ¿Puedes superar mi puntuación?\nJuega gratis en WordBlurts.com`
        : `⚔️ I scored ${numericScore}/10 in today's Daily Blurts! Can you beat my score?\nPlay for free at WordBlurts.com`;

    // Update DOM Stats (Hide the time stat box completely)
    const scoreEl = document.getElementById('res-score');
    if (scoreEl) scoreEl.textContent = `${numericScore}/10`;

    const timeEl = document.getElementById('res-time');
    if (timeEl && timeEl.parentElement) {
        timeEl.parentElement.style.display = 'none';
    }

    const streakEl = document.getElementById('res-streak');
    if (streakEl) streakEl.textContent = `🔥 ${streakVal}`;

    // Keep all 10 emoji squares on a single crisp line
    const emojiEl = document.getElementById('emoji-grid-display');
    if (emojiEl) {
        emojiEl.textContent = emojiRow;
        emojiEl.style.whiteSpace = 'nowrap';
        emojiEl.style.fontSize = '1.15rem';
        emojiEl.style.letterSpacing = '2px';
        emojiEl.style.display = 'block';
        emojiEl.style.textAlign = 'center';
    }

    const modalCard = modal.querySelector('.modal-card');
    const shareResultsBtn = document.getElementById('share-results-btn');

    // Optional topic breakdown and round-locked answer review list inside modal
    let breakdownContainer = document.getElementById('daily-breakdown-container');
    if (!breakdownContainer && modalCard && shareResultsBtn) {
        breakdownContainer = document.createElement('div');
        breakdownContainer.id = 'daily-breakdown-container';
        breakdownContainer.style.cssText = "margin: 15px 0; max-height: 180px; overflow-y: auto; text-align: left; font-size: 0.9rem; color: #cbd5e1; border-top: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 10px 0;";
        modalCard.insertBefore(breakdownContainer, shareResultsBtn);
    }

    if (breakdownContainer && Array.isArray(dailyDeckPrompts) && dailyDeckPrompts.length > 0) {
        const headerText = isEs
            ? '¡Cuéntanos qué dijiste! (Compara con otros jugadores mañana)'
            : 'Tell us what you Blurted! (Compare with other players tomorrow)';
        const inputPlaceholder = isEs
            ? 'Escribe lo que dijiste (Opcional)'
            : 'Tell us what you Blurted! (Optional)';
        const roundPrefix = isEs ? 'R' : 'R';

        let breakdownHTML = `<div style="font-weight: bold; margin-bottom: 8px; color: #ffd700; text-align: center;">${headerText}</div>`;
        dailyDeckPrompts.slice(0, 10).forEach((p, idx) => {
            const topicText = p.topic || p.prompt || (isEs ? `Ronda ${idx + 1}` : `Round ${idx + 1}`);
            const letterText = p.letter || "";
            const savedAns = (window.dailyRoundAnswers && window.dailyRoundAnswers[idx]) ? window.dailyRoundAnswers[idx] : lockedAnswers[idx] || "";
            const escapedAns = String(savedAns).replace(/"/g, '&quot;');
            breakdownHTML += `
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; gap: 8px;">
                    <span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${roundPrefix}${idx + 1}: ${topicText} (${letterText})</span>
                    <input type="text" class="round-answer-input" data-round="${idx}" value="${escapedAns}" placeholder="${inputPlaceholder}" style="width: 170px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;" />
                </div>
            `;
        });
        breakdownContainer.innerHTML = breakdownHTML;

        // Save each input strictly to its own round index (0..9) without shifting
        breakdownContainer.querySelectorAll('.round-answer-input').forEach(input => {
            input.oninput = (e) => {
                const rIdx = parseInt(e.target.getAttribute('data-round'), 10);
                if (!Number.isInteger(rIdx)) return;
                if (!window.dailyRoundAnswers || typeof window.dailyRoundAnswers !== 'object') {
                    window.dailyRoundAnswers = {};
                }
                window.dailyRoundAnswers[rIdx] = e.target.value;

                const orderedAnswers = buildLockedAnswersArray();
                localStorage.setItem(
                    STORAGE_KEYS.COMPLETED_DATA,
                    JSON.stringify({
                        dateStr: savedGameDateStr,
                        score: numericScore,
                        resultsArray: orderedAnswers,
                        scoredRounds: Array.isArray(window.dailyRoundScored) ? window.dailyRoundScored : [],
                        timeSpent: 0
                    })
                );
            };
        });
    }

    // Spoiler-locked "Share Your Blurts!" button + live countdown to Midnight, Eastern Time, U.S.A.
    let shareBlurtsWrap = document.getElementById('share-your-blurts-wrap');
    if (!shareBlurtsWrap && modalCard) {
        shareBlurtsWrap = document.createElement('div');
        shareBlurtsWrap.id = 'share-your-blurts-wrap';
        shareBlurtsWrap.style.cssText = "margin-top: 10px; text-align: center;";
        shareBlurtsWrap.innerHTML = `
            <button type="button" id="share-your-blurts-btn" style="width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.25); background: #2563eb; color: #fff; font-weight: bold; font-size: 0.95rem;"></button>
            <div id="global-blurt-countdown" style="margin-top: 8px; font-size: 0.85rem; color: #cbd5e1;"></div>
        `;
        const challengeBtnRef = document.getElementById('challenge-friend-btn');
        if (challengeBtnRef && challengeBtnRef.parentElement === modalCard) {
            challengeBtnRef.insertAdjacentElement('afterend', shareBlurtsWrap);
        } else {
            modalCard.appendChild(shareBlurtsWrap);
        }
    }

    const shareBlurtsBtn = document.getElementById('share-your-blurts-btn');
    const countdownEl = document.getElementById('global-blurt-countdown');
    if (window.blurtCountdownInterval) {
        clearInterval(window.blurtCountdownInterval);
    }

    const syncSpoilerLockState = () => {
        const currentEasternDate = getEasternDateStr();
        const isUnlocked = Boolean(savedGameDateStr && savedGameDateStr < currentEasternDate);

        if (shareBlurtsBtn) {
            if (isUnlocked) {
                shareBlurtsBtn.disabled = false;
                shareBlurtsBtn.style.opacity = '1';
                shareBlurtsBtn.style.cursor = 'pointer';
                shareBlurtsBtn.textContent = isEs ? '🗣️ ¡Comparte tus Blurts!' : '🗣️ Share Your Blurts!';
            } else {
                shareBlurtsBtn.disabled = true;
                shareBlurtsBtn.style.opacity = '0.45';
                shareBlurtsBtn.style.cursor = 'not-allowed';
                shareBlurtsBtn.textContent = isEs ? '🔒 Bloqueo de spoilers (Mañana)' : '🔒 Spoiler Lock (Unlocks Tomorrow)';
            }
        }

        if (countdownEl) {
            const remaining = getCountdownToEasternMidnight();
            countdownEl.innerHTML = isEs
                ? `⏳ Próximo Día Global Blurt en: <strong>${remaining}</strong><br><span style="display: inline-block; margin-top: 3px; font-size: 1.1rem; color: #94a3b8;">Cada día termina a medianoche, hora del Este, EE. UU.</span>`
                : `⏳ Next Global Blurt Day in: <strong>${remaining}</strong><br><span style="display: inline-block; margin-top: 3px; font-size: 1.1rem; color: #94a3b8;">Each day ends at midnight, Eastern Time, U.S.A.</span>`;
        }
    };

    syncSpoilerLockState();
    window.blurtCountdownInterval = setInterval(syncSpoilerLockState, 1000);

    // Make the completion modal and everything inside it larger & easier to read
    modal.style.padding = '20px';
    const card = modal.querySelector('.modal-card');
    if (card) {
        card.style.width = '92vw';
        card.style.maxWidth = '540px';
        card.style.padding = '26px 24px';
        card.style.borderRadius = '18px';
        card.style.fontSize = '1.08rem';
    }

    const modalTitle = card ? card.querySelector('h1, h2, h3, .modal-title') : null;
    if (modalTitle) {
        modalTitle.style.fontSize = '1.85rem';
        modalTitle.style.marginBottom = '14px';
    }

    if (scoreEl) {
        scoreEl.style.fontSize = '1.85rem';
        scoreEl.style.fontWeight = '800';
    }
    if (streakEl) {
        streakEl.style.fontSize = '1.65rem';
        streakEl.style.fontWeight = '800';
    }

    // Keep all 10 squares on a single row while making them noticeably larger
    if (emojiEl) {
        emojiEl.style.whiteSpace = 'nowrap';
        emojiEl.style.fontSize = '1.5rem';
        emojiEl.style.letterSpacing = '4px';
        emojiEl.style.margin = '12px 0';
        emojiEl.style.display = 'block';
        emojiEl.style.textAlign = 'center';
    }

    if (breakdownContainer) {
        breakdownContainer.style.maxHeight = '230px';
        breakdownContainer.style.fontSize = '1rem';
        breakdownContainer.style.padding = '12px 6px';
        breakdownContainer.querySelectorAll('.round-answer-input').forEach(inp => {
            inp.style.width = '200px';
            inp.style.padding = '7px 10px';
            inp.style.fontSize = '0.95rem';
        });
    }

    ['share-results-btn', 'challenge-friend-btn', 'share-your-blurts-btn'].forEach(btnId => {
        const b = document.getElementById(btnId);
        if (b) {
            b.style.padding = '13px 16px';
            b.style.fontSize = '1.08rem';
            b.style.borderRadius = '10px';
        }
    });

    // Bump "Come back tomorrow for the next Daily Blurt!" by ~15%
    if (card) {
        card.querySelectorAll('p, div, span').forEach(el => {
            const txt = (el.textContent || '').trim();
            if (
                txt === 'Come back tomorrow for the next Daily Blurt!' ||
                txt === '¡Vuelve mañana para el próximo Blurt Diario!'
            ) {
                el.style.fontSize = '1.15rem';
                el.style.lineHeight = '1.4';
            }
        });
    }

    // Keep the timer line at 1.15rem and bump the Eastern Time note below it to 1.1rem
    if (countdownEl) {
        countdownEl.style.fontSize = '1.15rem';
        countdownEl.style.lineHeight = '1.45';
        countdownEl.style.marginTop = '12px';

        const subLine = countdownEl.querySelector('span');
        if (subLine) {
            subLine.style.display = 'inline-block';
            subLine.style.marginTop = '3px';
            subLine.style.fontSize = '1.1rem';
        }
    }

    modal.style.display = 'flex';

    // Wire Close/Dismiss Logic
    const closeBtn = document.getElementById('close-modal-btn');
    if (closeBtn) {
        closeBtn.onclick = () => {
            if (window.blurtCountdownInterval) clearInterval(window.blurtCountdownInterval);
            modal.style.display = 'none';
        };
    }

    modal.onclick = (e) => {
        if (e.target === modal) {
            if (window.blurtCountdownInterval) clearInterval(window.blurtCountdownInterval);
            modal.style.display = 'none';
        }
    };

    // Share Results Button Logic (Spoiler-safe summary)
    const shareBtn = document.getElementById('share-results-btn');
    if (shareBtn) {
        shareBtn.onclick = async () => {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: isEs ? 'Word Blurts! Diario' : 'Word Blurts! Daily',
                        text: richShareText,
                        url: 'https://wordblurts.com'
                    });
                } catch (err) {
                    console.log("Share dismissed or failed:", err);
                }
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(richShareText);
                const originalText = shareBtn.textContent;
                shareBtn.textContent = isEs ? "📋 ¡Copiado al portapapeles!" : "📋 Copied to Clipboard!";
                setTimeout(() => { shareBtn.textContent = originalText; }, 2500);
            }
        };
    }

    // Share Your Blurts! Button Logic (Includes saved gameplay Blurts once unlocked after midnight ET)
    if (shareBlurtsBtn) {
        shareBlurtsBtn.onclick = async () => {
            if (shareBlurtsBtn.disabled) return;

            const currentAnswers = buildLockedAnswersArray();
            const lines = [];
            for (let i = 0; i < 10; i++) {
                const promptObj = (Array.isArray(dailyDeckPrompts) && dailyDeckPrompts[i]) ? dailyDeckPrompts[i] : null;
                const topicLabel = promptObj ? (promptObj.topic || promptObj.prompt || (isEs ? `Ronda ${i + 1}` : `Round ${i + 1}`)) : (isEs ? `Ronda ${i + 1}` : `Round ${i + 1}`);
                const letterLabel = promptObj && promptObj.letter ? ` (${promptObj.letter})` : '';
                const ansText = (currentAnswers[i] && currentAnswers[i].trim()) ? currentAnswers[i].trim() : '—';
                const mark = (Array.isArray(window.dailyRoundScored) && window.dailyRoundScored[i]) ? '🟩' : '🟨';
                lines.push(`${mark} R${i + 1}: ${topicLabel}${letterLabel} → ${ansText}`);
            }

            const blurtsSharePayload = isEs
                ? `🗣️ Mis Blurts (${savedGameDateStr}) — ${numericScore}/10\n${emojiRow}\n${lines.join('\n')}\nJuega gratis: https://wordblurts.com`
                : `🗣️ My Blurts (${savedGameDateStr}) — ${numericScore}/10\n${emojiRow}\n${lines.join('\n')}\nPlay free: https://wordblurts.com`;

            if (navigator.share) {
                try {
                    await navigator.share({
                        title: isEs ? 'Mis Blurts - Word Blurts!' : 'My Blurts - Word Blurts!',
                        text: blurtsSharePayload,
                        url: 'https://wordblurts.com'
                    });
                } catch (err) {
                    console.log("Blurts share dismissed or failed:", err);
                }
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(blurtsSharePayload);
                const prevLabel = shareBlurtsBtn.textContent;
                shareBlurtsBtn.textContent = isEs ? "📋 ¡Blurts copiados!" : "📋 Blurts Copied!";
                setTimeout(() => { shareBlurtsBtn.textContent = prevLabel; }, 2500);
            }
        };
    }

    // Challenge a Friend Button Logic
    const challengeBtn = document.getElementById('challenge-friend-btn');
    if (challengeBtn) {
        challengeBtn.onclick = async () => {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: isEs ? 'Reto - Word Blurts!' : 'Challenge - Word Blurts!',
                        text: challengeText,
                        url: 'https://wordblurts.com'
                    });
                } catch (err) {
                    console.log("Challenge dismissed or failed:", err);
                }
            } else {
                await navigator.clipboard.writeText(challengeText);
                const originalText = challengeBtn.textContent;
                challengeBtn.textContent = isEs ? "⚔️ ¡Reto copiado!" : "⚔️ Challenge Copied!";
                setTimeout(() => { challengeBtn.textContent = originalText; }, 2500);
            }
        };
    }
}

// ==========================================
// AD & UTILITY MANAGEMENT
// ==========================================
function triggerInterstitialAd() {
    if (window.googletag && googletag.apiReady) {
        googletag.cmd.push(function() {
            googletag.display('interstitial-ad-slot'); 
        });
    }
}

function refreshAds() {
    if (document.hidden) return; // Never refresh ads while tab or phone screen is hidden
    const now = Date.now();
    if (now - lastAdRefreshTime >= AD_REFRESH_INTERVAL) {
        if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
                lastAdRefreshTime = now;
            } catch (e) {}
        }
    }
}


window.dailyRoundScored = window.dailyRoundScored || Array(10).fill(false);

function adjustScore(team, delta) {
    const el = document.getElementById(team + "Score");
    if (el) {
        let current = parseInt(el.innerText, 10) || 0;
        const newScore = Math.max(0, current + delta);
        el.innerText = newScore;

        if (delta > 0) {
            if (typeof playSlideUp === 'function') {
                playSlideUp();
            }

            // If in Daily Mode and points were added (+), record green square & show per-round Blurt input
            const activeDaily = (typeof window.isDailyMode !== 'undefined' && window.isDailyMode) ||
                                (typeof isDailyMode !== 'undefined' && isDailyMode);

            if (activeDaily && typeof dailyCurrentIndex !== 'undefined') {
                const parsedIndex = parseInt(dailyCurrentIndex, 10);
                // startNewRound() increments dailyCurrentIndex after selecting the prompt,
                // so the active round being played is dailyCurrentIndex - 1 (clamped to 0..9).
                const roundIdx = Math.max(0, Math.min(9, (Number.isFinite(parsedIndex) ? parsedIndex : 1) - 1));

                if (!window.dailyRoundAnswers || typeof window.dailyRoundAnswers !== 'object') {
                    window.dailyRoundAnswers = {};
                }

                if (team === 'team1') {
                    window.dailyRoundScored[roundIdx] = true;
                }

                // Check if prompt container already has the answer input box for this round
                const promptArea = document.getElementById('promptDisplay') || document.getElementById('topic-display') || document.getElementById('topic');
                if (promptArea && !document.getElementById('live-round-answer-input')) {
                    const inputWrapper = document.createElement('div');
                    inputWrapper.id = 'live-round-answer-input-wrapper';
                    inputWrapper.style.cssText = "margin-top: 14px; text-align: center;";
                    inputWrapper.innerHTML = `
                        <input type="text" id="live-round-answer-input" placeholder="Tell us what you Blurted! (Optional)" style="width: 80%; max-width: 280px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.3); color: #fff; padding: 8px 12px; border-radius: 6px; font-size: 1rem; text-align: center;" />
                    `;
                    promptArea.appendChild(inputWrapper);

                    const liveInput = document.getElementById('live-round-answer-input');
                    liveInput.value = window.dailyRoundAnswers[roundIdx] || '';
                    liveInput.oninput = (e) => {
                        window.dailyRoundAnswers[roundIdx] = e.target.value;
                    };
                }
            }

        } else if (delta < 0 && current > 0) {
            if (typeof playSlideDown === 'function') {
                playSlideDown();
            }
        }
    }
}

function resetScores() {
    const t1 = document.getElementById('team1Score');
    const t2 = document.getElementById('team2Score');
    const hadPoints =
        (t1 && (parseInt(t1.innerText, 10) || 0) > 0) ||
        (t2 && (parseInt(t2.innerText, 10) || 0) > 0);

    if (t1) t1.innerText = '0';
    if (t2) t2.innerText = '0';

    if (hadPoints && typeof playSlideDown === 'function') {
        playSlideDown();
    }

    if (typeof triggerInterstitialAd === 'function') {
        triggerInterstitialAd();
    }
}

// ==========================================
// 9. EVENT LISTENERS & INITIALIZATION
// ==========================================

function initWordBlurts() {
    const savedLang = localStorage.getItem("wordblurts_lang") || "en";
    window.currentLang = savedLang;
    if (typeof switchLanguage === 'function') {
        switchLanguage(savedLang);
    }

    const randomModeBtn = document.getElementById('randomModeBtn');
    const dailyModeBtn = document.getElementById('dailyModeBtn');

    if (randomModeBtn && dailyModeBtn) {
        randomModeBtn.style.opacity = "1";
        dailyModeBtn.style.opacity = "0.7"; // Balanced inactive state

        randomModeBtn.onclick = () => {
            window.isDailyMode = false;
            randomModeBtn.classList.add('active');
            dailyModeBtn.classList.remove('active');
            randomModeBtn.style.opacity = "1";
            dailyModeBtn.style.opacity = "0.7";
            if (typeof stopEverything === 'function') stopEverything();

            const promptEl = document.getElementById('promptDisplay');
            if (promptEl) {
                promptEl.innerHTML = `<div style="font-size: 1.5rem; color: #94a3b8; text-align: center;">
                    ${window.currentLang === 'es' ? '¡Presiona Jugar para comenzar!' : 'Press Play to Start!'}
                </div>`;
            }
        };

        dailyModeBtn.onclick = () => {
            window.isDailyMode = true;
            const isAvailable = typeof initDailyMode === 'function' ? initDailyMode() : true;
            if (!isAvailable) {
                window.isDailyMode = false;
                return;
            }
            dailyModeBtn.classList.add('active');
            randomModeBtn.classList.remove('active');
            dailyModeBtn.style.opacity = "1";
            randomModeBtn.style.opacity = "0.7";
            if (typeof stopEverything === 'function') stopEverything();

            const promptEl = document.getElementById('promptDisplay');
            if (promptEl) {
                promptEl.style.display = 'flex';
                promptEl.style.flexDirection = 'column';
                promptEl.style.alignItems = 'center';
                promptEl.style.justifyContent = 'center';
                
                const line1 = window.currentLang === 'es' ? '¡Blurt Diario listo!' : 'Daily Blurts are ready!';
                const line2 = window.currentLang === 'es' ? 'Presiona Jugar para empezar la Ronda 1.' : 'Press Play to start Round 1.';

                promptEl.innerHTML = `
                    <div style="font-size: 1.5rem; font-weight: bold; color: #ffd700; margin-bottom: 6px; text-align: center; width: 100%;">${line1}</div>
                    <div style="font-size: 1.2rem; color: #cbd5e1; opacity: 0.9; text-align: center; width: 100%;">${line2}</div>
                `;
            }
        };
    }

    const playBtn = document.getElementById('playBtn') || document.getElementById('start-btn');
    if (playBtn) {
        playBtn.onclick = () => {
            if (window.isDailyMode && typeof initDailyMode === 'function') {
                if (typeof dailyDeckPrompts === 'undefined' || !dailyDeckPrompts || dailyDeckPrompts.length === 0) {
                    if (!initDailyMode()) return;
                }
            }
            if (typeof playRound === 'function') {
                playRound();
            }
        };
    }
}

// Execute immediately since script is at the bottom of the body
initWordBlurts();


// ==========================================
// 10. PWA INSTALL PROMPT & SERVICE WORKER
// ==========================================
let deferredPrompt = null;
const pwaBanner = document.getElementById('pwaInstallBanner');
const pwaInstallBtn = document.getElementById('pwaInstallBtn');
const pwaDismissBtn = document.getElementById('pwaDismissBtn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (!localStorage.getItem('pwaPromptDismissed') && pwaBanner) {
        pwaBanner.classList.remove('hidden');
    }
});

if (pwaInstallBtn) {
    pwaInstallBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        if (pwaBanner) pwaBanner.classList.add('hidden');
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
    });
}

if (pwaDismissBtn) {
    pwaDismissBtn.addEventListener('click', () => {
        if (pwaBanner) pwaBanner.classList.add('hidden');
        localStorage.setItem('pwaPromptDismissed', Date.now());
    });
}

window.addEventListener('appinstalled', () => {
    if (pwaBanner) pwaBanner.classList.add('hidden');
    deferredPrompt = null;
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {});
    });
}

// ==========================================
// 11. GLOBAL WINDOW EXPORTS
// ==========================================
window.toggleLanguage = toggleLanguage;
window.switchLanguage = switchLanguage;
window.toggleRules = toggleRules;
window.openAboutModal = openAboutModal;
window.playRound = playRound;
window.startNewRound = startNewRound;
window.adjustScore = adjustScore;
window.resetScores = resetScores;
window.showDailyResultsModal = showDailyResultsModal;

if (typeof syncLanguageState === 'function') {
    window.syncLanguageState = syncLanguageState;
}
if (typeof applyFooterLanguage === 'function') {
    window.applyFooterLanguage = applyFooterLanguage;
}
if (typeof applyRoomBarLanguage === 'function') {
    window.applyRoomBarLanguage = applyRoomBarLanguage;
}

function setGameMode(mode) {
    if (mode === 'daily') {
        if (typeof initDailyMode === 'function') {
            const isAvailable = initDailyMode();
            if (!isAvailable) {
                isDailyMode = false;
                return;
            }
        }
        isDailyMode = true;
        document.getElementById('dailyModeBtn').classList.add('active');
        document.getElementById('randomModeBtn').classList.remove('active');
        if (typeof playRound === 'function') playRound();
    } else {
        isDailyMode = false;
        document.getElementById('randomModeBtn').classList.add('active');
        document.getElementById('dailyModeBtn').classList.remove('active');
    }
}
function showDailyResultsModal() {
    const modal = document.getElementById('results-modal');
    if (!modal) return;

    // 1. Retrieve or calculate actual game stats
    const totalScore = window.dailyScore || 0; 
    const totalTime = window.dailyTotalTime || 0; // seconds
    const streak = parseInt(localStorage.getItem('wb_daily_streak') || '1', 10);

    // 2. Build the Emoji Matrix
    // Example: 🟩 for scored points, 🟨 for missed
    let emojiRow = "";
    if (Array.isArray(window.dailyRoundResults)) {
        emojiRow = window.dailyRoundResults.map(res => res ? "🟩" : "🟨").join("");
    } else {
        emojiRow = "🟩".repeat(totalScore) + "🟨".repeat(Math.max(0, 10 - totalScore));
    }

    const shareText = `🧩 Word Blurts! Daily\n${emojiRow}\nScore: ${totalScore}/10 | Time: ${totalTime}s\nPlay free at WordBlurts.com`;
    const challengeText = `⚔️ I scored ${totalScore}/10 in today's Daily Blurt! Can you beat my time of ${totalTime}s?\nPlay free at WordBlurts.com`;

    // 3. Update DOM Stats
    document.getElementById('res-score').textContent = `${totalScore}/10`;
    document.getElementById('res-time').textContent = `${totalTime}s`;
    document.getElementById('res-streak').textContent = `🔥 ${streak}`;
    document.getElementById('emoji-grid-display').textContent = emojiRow;

    // 4. Display Modal
    modal.style.display = 'flex';

    // 5. Wire Close/Dismiss Logic
    const closeBtn = document.getElementById('close-modal-btn');
    if (closeBtn) {
        closeBtn.onclick = () => { modal.style.display = 'none'; };
    }

    // Dismiss when clicking background outside modal-card
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };

    // 6. Share Results Button Logic
    const shareBtn = document.getElementById('share-results-btn');
    if (shareBtn) {
        shareBtn.onclick = async () => {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'Word Blurts! Daily',
                        text: shareText,
                        url: 'https://wordblurts.com'
                    });
                } catch (err) {
                    console.log("Share dismissed or failed:", err);
                }
            } else {
                await navigator.clipboard.writeText(shareText);
                const originalText = shareBtn.textContent;
                shareBtn.textContent = "📋 Copied to Clipboard!";
                setTimeout(() => { shareBtn.textContent = originalText; }, 2500);
            }
        };
    }

    // 7. Challenge a Friend Button Logic
    const challengeBtn = document.getElementById('challenge-friend-btn');
    if (challengeBtn) {
        challengeBtn.onclick = async () => {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'Challenge - Word Blurts!',
                        text: challengeText,
                        url: 'https://wordblurts.com'
                    });
                } catch (err) {
                    console.log("Challenge dismissed or failed:", err);
                }
            } else {
                await navigator.clipboard.writeText(challengeText);
                const originalText = challengeBtn.textContent;
                challengeBtn.textContent = "⚔️ Challenge Copied!";
                setTimeout(() => { challengeBtn.textContent = originalText; }, 2500);
            }
        };
    }
}
// ==========================================
// 11. GLOBAL WINDOW EXPORTS
// ==========================================
window.toggleLanguage = toggleLanguage;
window.switchLanguage = switchLanguage;
window.toggleRules = toggleRules;
window.openAboutModal = openAboutModal;
window.playRound = playRound;
window.startNewRound = startNewRound;
window.adjustScore = adjustScore;
window.resetScores = resetScores;
window.showDailyResultsModal = showDailyResultsModal;
window.toggleFullScreen = toggleFullScreen; // <-- Make sure this is here!

// Automatically update button text when fullscreen state changes
function updateFullscreenBtnText() {
    const fsBtn = document.getElementById('fullscreenToggleBtn');
    if (!fsBtn) return;
    
    const span = fsBtn.querySelector('span') || fsBtn;
    const isFull = !!document.fullscreenElement;
    
    if (typeof currentLang !== 'undefined' && currentLang === 'es') {
        span.textContent = isFull ? '🖵 Salir de Pantalla Completa' : '🖵 Pantalla Completa';
    } else {
        span.textContent = isFull ? '🖵 Exit Fullscreen' : '🖵 Fullscreen';
    }
}

document.addEventListener('fullscreenchange', updateFullscreenBtnText);
document.addEventListener('webkitfullscreenchange', updateFullscreenBtnText);
// Bulletproof Word Blurts! UI synchronization
function applyWordBlurtsFixes() {
    // Detect Daily Mode reliably via variable OR active Daily button state
    const dailyBtn = document.getElementById('daily-mode-btn') || document.getElementById('dailyModeBtn') || document.querySelector('[data-mode="daily"]');
    const isDaily = (typeof isDailyMode !== 'undefined' && Boolean(isDailyMode)) || 
                    (typeof window.isDailyMode !== 'undefined' && Boolean(window.isDailyMode)) ||
                    (dailyBtn && (dailyBtn.classList.contains('active') || dailyBtn.getAttribute('aria-pressed') === 'true'));

    const isEs = (window.currentLang === 'es') || (typeof currentLang !== 'undefined' && currentLang === 'es');
    const scoreLabel = document.getElementById('score-label-1') || document.querySelector('.team-label') || document.querySelector('.score-label');
    const team2ScoreEl = document.getElementById('team2Score') || document.getElementById('score2') || document.getElementById('player2Score');
    const team2Card = team2ScoreEl ? (team2ScoreEl.closest('.team-score-card') || team2ScoreEl.parentElement) : document.querySelectorAll('.team-score-card')[1];
    const allScoreCards = document.querySelectorAll('.team-score-card');

    if (isDaily) {
        // Daily Mode: Hide Team 2 completely, center/constrain solo card, update label
        if (team2Card) team2Card.style.setProperty('display', 'none', 'important');
        
        allScoreCards.forEach(card => {
            if (card !== team2Card) {
                card.style.maxWidth = '380px';
                card.style.margin = '0 auto';
                card.style.width = '100%';
            }
        });

        if (scoreLabel) scoreLabel.textContent = isEs ? "Puntuación total hasta ahora:" : "Total score so far:";
    } else {
        // Classic Mode: Force-restore Team 2 card and reset sizing
        if (team2Card) {
            team2Card.style.removeProperty('display');
            team2Card.hidden = false;
            team2Card.classList.remove('hidden');
        }
        
        allScoreCards.forEach(card => {
            card.style.removeProperty('display');
            card.style.maxWidth = '';
            card.style.margin = '';
            card.style.width = '';
        });

        if (scoreLabel) scoreLabel.textContent = isEs ? "Jugador / Equipo 1" : "Player / Team 1";
    }

    // Fix the "Tell us what you Blurted! (Optional)" input box text clipping
    const guessInput = document.querySelector('input[type="text"]') || document.querySelector('.guess-input') || document.getElementById('guessInput');
    if (guessInput) {
        guessInput.style.width = '100%';
        guessInput.style.maxWidth = '340px';
        guessInput.style.minWidth = '280px';
        guessInput.style.boxSizing = 'border-box';
        guessInput.style.padding = '10px 16px';
        guessInput.style.fontSize = '14px';
    }
}

// Run on load and restore saved language automatically
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = (localStorage.getItem("wordblurts_lang") === "es") ? "es" : "en";

    if (typeof syncLanguageState === 'function') {
        syncLanguageState(savedLang);
    } else {
        window.currentLang = savedLang;
        if (typeof currentLang !== 'undefined') {
            currentLang = savedLang;
        }
    }

    if (savedLang === 'es' && typeof switchLanguage === 'function') {
        switchLanguage('es');
    } else {
        if (typeof updateStaticUI === 'function') {
            updateStaticUI();
        }
        if (typeof applyFooterLanguage === 'function') {
            applyFooterLanguage(savedLang);
        }
        if (typeof applyRoomBarLanguage === 'function') {
            applyRoomBarLanguage(savedLang);
        }
    }

    if (typeof updateFullscreenBtnText === 'function') {
        updateFullscreenBtnText();
    }

    if (typeof applyWordBlurtsFixes === 'function') {
        applyWordBlurtsFixes();
        setTimeout(applyWordBlurtsFixes, 200);
    }
});

// Continuously sync in the background so mode changes (Daily <-> Classic) apply instantly
setInterval(() => {
    if (typeof applyWordBlurtsFixes === 'function') {
        applyWordBlurtsFixes();
    }
}, 300);

// Also trigger immediately on any click
document.addEventListener('click', () => {
    setTimeout(() => {
        if (typeof applyWordBlurtsFixes === 'function') {
            applyWordBlurtsFixes();
        }
    }, 50);
});

// ==========================================
// iOS Audio & Speech Synthesis Safety Net
// ==========================================

window.iosAudioUnlocked = window.iosAudioUnlocked || false;

function unlockIOSAudioAndSpeech() {
    if (iosAudioUnlocked) return;

    try {
        // 1. Unlock Web Audio API context safely
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            const audioCtx = new AudioContext();
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        }


        // 2. Prime Speech Synthesis ONLY on iOS Safari (protects Android/Windows)
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const dummy = new SpeechSynthesisUtterance('');
            dummy.volume = 0;
            window.speechSynthesis.speak(dummy);
        }
    } catch (err) {
        console.log("Audio unlock safe fallback:", err);
    }

    iosAudioUnlocked = true;
}

// Hook it directly into your game's Play button safely
document.addEventListener('DOMContentLoaded', () => {
    try {
        const playButton = document.getElementById('playButton') || document.querySelector('.play-btn') || document.querySelector('#play-btn');
        if (playButton) {
            playButton.addEventListener('click', () => {
                unlockIOSAudioAndSpeech();
            }, { once: true });
        }
    } catch (e) {
        console.warn("Play button listener warning:", e);
    }
});
// ==========================================
// Game State Reset Helper (Fixes Mode Switch Lockups)
// ==========================================
function resetGameState() {
    if (typeof countdownInterval !== 'undefined' && countdownInterval !== null) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }

    if (typeof isRoundActive !== 'undefined') {
        isRoundActive = false;
    }

    const playBtn = document.getElementById('playBtn') || document.getElementById('start-btn');
    if (playBtn) {
        playBtn.disabled = false;
        playBtn.style.opacity = "1";
        playBtn.style.cursor = "pointer";
    }

    console.log("Game state successfully reset for clean mode switch.");
}

// Hook this reset into your mode buttons safely once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const modeButtons = document.querySelectorAll('.mode-btn, #classicBtn, #dailyBtn');
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            resetGameState();
        });
    });
});
// ==========================================
// DAILY MODE ENGINE (Date-Seeded & Persistence Locked)
// ==========================================

let isDailyModeActive = false;
let currentDailyDate = null;

function loadDailyMode() {
    if (typeof resetGameState === 'function') {
        resetGameState();
    }

    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const completionKey = `wordblurts_daily_completed_${todayStr}`;
    const hasCompletedToday = localStorage.getItem(completionKey) === 'true';

    const promptBox = document.getElementById('promptDisplay') || document.getElementById('prompt-container') || document.querySelector('.game-card');
    const playBtn = document.getElementById('playBtn') || document.getElementById('start-btn');

    if (hasCompletedToday) {
        isDailyModeActive = false;
        if (promptBox) {
            promptBox.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <h2 style="color: #10b981; margin-bottom: 10px;">Daily Blurt Completed! 🎉</h2>
                    <p style="color: #cbd5e1; font-size: 1.1rem;">You've already conquered today's challenge (${todayStr}). Come back tomorrow for a fresh word!</p>
                </div>
            `;
        }
        if (playBtn) {
            playBtn.disabled = true;
            playBtn.style.opacity = "0.5";
            playBtn.style.cursor = "not-allowed";
        }
        return;
    }

    if (typeof dailyWordList === 'undefined' || !dailyWordList.length) {
        console.warn("Daily word list is missing or empty.");
        return;
    }

    let dateHash = 0;
    for (let i = 0; i < todayStr.length; i++) {
        dateHash = (dateHash << 5) - dateHash + todayStr.charCodeAt(i);
        dateHash |= 0;
    }
    const dailyIndex = Math.abs(dateHash) % dailyWordList.length;
    const todaysPrompt = dailyWordList[dailyIndex];

    isDailyModeActive = true;
    currentDailyDate = todayStr;
    window.currentPromptData = todaysPrompt;

    if (promptBox) {
        promptBox.innerHTML = `
            <div style="font-size: 0.9rem; color: #38bdf8; font-weight: bold; margin-bottom: 8px;">📅 DAILY CHALLENGE: ${todayStr}</div>
            <h3 style="font-size: 1.8rem; margin: 5px 0;">${todaysPrompt.primary}</h3>
            ${todaysPrompt.secondary ? `<p style="color: #94a3b8; font-size: 1.1rem; margin-top: 5px;">${todaysPrompt.secondary}</p>` : ''}
            <div style="margin-top: 15px; font-size: 1.2rem;">Letter: <strong style="color: #f43f5e; font-size: 1.4rem;">${todaysPrompt.letter}</strong></div>
        `;
    }

    if (playBtn) {
        playBtn.disabled = false;
        playBtn.style.opacity = "1";
        playBtn.style.cursor = "pointer";
    }
}

function completeDailyChallenge() {
    if (isDailyModeActive && currentDailyDate) {
        localStorage.setItem(`wordblurts_daily_completed_${currentDailyDate}`, 'true');
    }
}
// ==========================================
// MODE TOGGLE EVENT LISTENERS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const randomModeBtn = document.getElementById('randomModeBtn');
    const dailyModeBtn = document.getElementById('dailyModeBtn');

    if (randomModeBtn) {
        randomModeBtn.addEventListener('click', () => {
            // Switch active classes visually
            randomModeBtn.classList.add('active');
            if (dailyModeBtn) dailyModeBtn.classList.remove('active');

            // Deactivate daily mode flag and reset state for classic play
            isDailyModeActive = false;
            if (typeof resetGameState === 'function') {
                resetGameState();
            }
            // Trigger your standard random/classic prompt generator here if needed:
            // if (typeof loadNewPrompt === 'function') loadNewPrompt();
        });
    }

    if (dailyModeBtn) {
        dailyModeBtn.addEventListener('click', () => {
            // Switch active classes visually
            dailyModeBtn.classList.add('active');
            if (randomModeBtn) randomModeBtn.classList.remove('active');

            // Load the date-seeded daily challenge
            loadDailyMode();
        });
    }
});
window.currentLang = localStorage.getItem('wordblurts_lang') === 'es' ? 'es' : 'en';



function updateLanguage(lang) {
    const cleanLang = (lang === 'es') ? 'es' : 'en';
    const t = translations[cleanLang];
    if (!t) return;

    window.currentLang = cleanLang;
    if (typeof syncYesterdayBlurtsButton === 'function') {
        syncYesterdayBlurtsButton();
    }
    localStorage.setItem('wordblurts_lang', cleanLang);

    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el && value !== undefined) {
            el.textContent = value;
        }
    };

    setText('rulesText', t.rulesText);
    setText('aboutText', t.aboutText);
    setText('fullscreenText', t.fullscreenText);
    setText('randomModeBtn', t.randomModeBtn);
    setText('dailyModeBtn', t.dailyModeBtn);
    setText('toggleRoomBarBtn', t.toggleRoomBarBtn);
    setText('playBtn', t.playBtn);
    setText('team1Label', t.team1Label);
    setText('team2Label', t.team2Label);
    setText('resetBtn', t.resetBtn);
    setText('footer-copyright', t.footerCopyright);
    setText('footer-about-link', t.footerAbout);
    setText('footer-teachers-link', t.footerTeachers);
    setText('footer-privacy-link', t.footerPrivacy);
    setText('footer-ads-link', t.footerAdSettings);

    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
        const labelSpan = langBtn.querySelector('span');
        if (labelSpan) {
            labelSpan.textContent = (cleanLang === 'en') ? '🌐 Español' : '🌐 English';
        }
    }
}

function toggleLanguage() {
    const nextLang = (window.currentLang === 'en') ? 'es' : 'en';
    updateLanguage(nextLang);
    syncYesterdayBlurtsButton();
}
document.addEventListener('DOMContentLoaded', syncYesterdayBlurtsButton);
