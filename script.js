// ==========================================
// 0. GLOBAL STATE & WINDOW ATTACHMENTS
// ==========================================
window.isDailyMode = false;
window.currentLang = localStorage.getItem("wordblurts_lang") || "en";

// Update Fullscreen button text based on current language and state
function updateFullscreenBtnText() {
    const fsBtn = document.getElementById('fullscreenToggleBtn');
    if (fsBtn) {
        const isEs = (window.currentLang === 'es');
        const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
        const label = fsBtn.querySelector('span') || fsBtn;
        if (isFS) {
            label.textContent = isEs ? '🖵 Salir de pantalla completa' : '🖵 Exit fullscreen';
        } else {
            label.textContent = isEs ? '🖵 Pantalla completa' : '🖵 Fullscreen';
        }
    }
}

window.toggleLanguage = function() {
    window.currentLang = (window.currentLang === "es") ? "en" : "es";
    localStorage.setItem("wordblurts_lang", window.currentLang);
    if (typeof switchLanguage === 'function') {
        switchLanguage(window.currentLang);
    }
    updateFullscreenBtnText();
};

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
            "Any animal!", "A pizza topping!", "A brand of car!",
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
function toggleLanguage() {
    const newLang = (currentLang === 'en') ? 'es' : 'en';
    switchLanguage(newLang);
}

function switchLanguage(langCode) {
    if (!GAME_DATA[langCode]) return;
    currentLang = langCode;
    localStorage.setItem("wordblurts_lang", currentLang);

    window.lettersMaster = GAME_DATA[currentLang].lettersMaster;
    window.topicsMaster = GAME_DATA[currentLang].topicsMaster;
    topicsMaster = window.topicsMaster;
    lettersMaster = window.lettersMaster;

    // Reset combo deck so it draws exclusively from the new language
    comboDeck = generateDeck();

    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (typeof stopEverything === 'function') stopEverything();

    // --- INSTANT UI LANGUAGE UPDATE ---
    const promptEl = document.getElementById('promptDisplay') || document.getElementById('topic-display') || document.getElementById('topic');
    if (promptEl && typeof currentActiveTopic !== 'undefined' && currentActiveTopic) {
        if (currentLang === 'es' && GAME_DATA['en'] && GAME_DATA['es']) {
            const esIndex = GAME_DATA['en'].topicsMaster.indexOf(currentActiveTopic);
            const spanishTopic = (esIndex !== -1 && GAME_DATA['es'].topicsMaster[esIndex]) ? GAME_DATA['es'].topicsMaster[esIndex] : currentActiveTopic;
            promptEl.innerHTML = `
                <div style="font-size: 2.0rem; font-weight: bold; color: #ffd700; margin-bottom: 6px; text-align: center; width: 100%; text-shadow: 0 2px 4px rgba(0,0,0,0.6);">${spanishTopic}</div>
                <div style="font-size: 1.5rem; color: #cbd5e1; opacity: 0.9; text-align: center; width: 100%;">(${currentActiveTopic})</div>
            `;
        } else {
            promptEl.innerHTML = `
                <div style="font-size: 1.8rem; font-weight: bold; color: #ffd700; text-align: center; width: 100%; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">${currentActiveTopic}</div>
            `;
        }
    }
    // ----------------------------------

    updateStaticUI();
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
            <p>Each round generates a random category prompt and a starter letter. Once the announcer gives the signal, players race against a 15-second timer to blurt out a matching word before time runs out. Keep score right on the built-in team scoreboard and see who reigns supreme!</p>

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

function drawNextCombo() {
    // Standard Random Mode logic
    if (comboDeck.length === 0) {
        comboDeck = generateDeck();
    }
    if (comboDeck.length === 0) return { topic: "Ready", letter: "A" };
    const index = Math.floor(Math.random() * comboDeck.length);
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
    startNewRound();
}

function startNewRound() {
    // 1. Check if Daily Mode just finished its 10 rounds
    if (window.isDailyMode && currentRound > 10) {
        showDailyResultsModal();
        return;
    }

    // 2. Guard clauses: block if already active or transitioning
    if (typeof isRoundActive !== 'undefined' && isRoundActive) return;
    if (window.isTransitioning) return;
    window.isTransitioning = true;
    setTimeout(() => { window.isTransitioning = false; }, 300);

    stopEverything();

    // ... rest of your normal round setup code goes here ...
}

    // 2. Disable and fade the PLAY button while the round is running
    const playBtn = document.getElementById('playBtn') || document.getElementById('start-btn');
    if (playBtn) {
        playBtn.disabled = true;
        playBtn.style.opacity = "0.5";
        playBtn.style.cursor = "not-allowed";
    }

    // 3. Reset timer display
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

    // 4. Determine next prompt card (Daily vs Classic)
    let nextCard;
    if (window.isDailyMode && typeof dailyDeckPrompts !== 'undefined') {
        if (typeof dailyCurrentIndex === 'undefined') dailyCurrentIndex = 0;
        
        if (dailyCurrentIndex >= 10) {
            if (typeof handleDailyCompletion === 'function') handleDailyCompletion();
            
        }

        nextCard = dailyDeckPrompts[dailyCurrentIndex];
        dailyCurrentIndex++; // Advance index for the next round
    } else {
        nextCard = drawNextCombo();
    }
    
    window.currentActiveTopic = nextCard.topic;

    // 5. Update round counter display for Daily Mode
    const counterEl = document.getElementById('roundCounter');
    if (counterEl) {
        if (window.isDailyMode) {
            const displayRoundNum = dailyCurrentIndex; // Already incremented, so 1-10 matches current round
            counterEl.innerText = (currentLang === 'es') 
                ? `Ronda ${displayRoundNum} de 10` 
                : `Round ${displayRoundNum} of 10`;
            counterEl.style.display = 'block';
        } else {
            counterEl.style.display = 'none';
        }
    }

// 6. Update UI displays for topic and letter
    const promptEl = document.getElementById('promptDisplay') || document.getElementById('topic-display') || document.getElementById('topic');
    const letterEl = document.getElementById('letterDisplay') || document.getElementById('letter-display') || document.getElementById('letter');

    if (promptEl) {
        promptEl.style.display = 'flex';
        promptEl.style.flexDirection = 'column';
        promptEl.style.alignItems = 'center';
        promptEl.style.justifyContent = 'center';

        let spanishTopic = nextCard.topic;
        if (currentLang === 'es' && typeof GAME_DATA !== 'undefined' && GAME_DATA['en'] && GAME_DATA['es']) {
            const esIndex = GAME_DATA['en'].topicsMaster ? GAME_DATA['en'].topicsMaster.indexOf(nextCard.topic) : -1;
            spanishTopic = (esIndex !== -1 && GAME_DATA['es'].topicsMaster && GAME_DATA['es'].topicsMaster[esIndex]) 
                ? GAME_DATA['es'].topicsMaster[esIndex] 
                : (nextCard.topicEs || nextCard.topic);
        }

        // Check language mode and update prompt display
        if (currentLang === 'es' && spanishTopic) {
            promptEl.innerHTML = `
                <div style="font-size: 2.0rem; font-weight: bold; color: #ffd700; margin-bottom: 6px; text-align: center; width: 100%; text-shadow: 0 2px 4px rgba(0,0,0,0.6);">${spanishTopic}</div>
                <div style="font-size: 1.5rem; color: #cbd5e1; opacity: 0.9; text-align: center; width: 100%;">(${nextCard.topic})</div>
            `;
            
            // Speak bilingual announcer sequence: Spanish topic -> English topic -> Letter -> Hype
            if (typeof speakPrompt === 'function') {
                speakPrompt(spanishTopic, nextCard.topic, nextCard.letter);
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

// ==========================================
// 6. ANNOUNCER & TIMER ENGINE
// ==========================================
function speakPrompt(primaryTopic, secondaryTopic, letter) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        let introText, secondaryText, letterText, hypeText, langCode, secondaryLangCode;

        if (currentLang === 'es') {
            introText = primaryTopic; // Spanish topic
            secondaryText = secondaryTopic ? secondaryTopic : ''; // English translation
            letterText = `Empezando con la letra... ${letter}.`;
            hypeText = "¡Dilo ya!";
            langCode = 'es-MX';
            secondaryLangCode = 'en-US';
        } else {
            introText = primaryTopic;
            secondaryText = '';
            letterText = `Starting with the letter... ${letter}.`;
            hypeText = "Blurt it out!";
            langCode = 'en-US';
            secondaryLangCode = 'en-US';
        }

        const utteranceIntro = new SpeechSynthesisUtterance(introText);
        utteranceIntro.lang = langCode;
        utteranceIntro.rate = 1.05;
        utteranceIntro.pitch = 1.1;

        const utteranceSecondary = secondaryText ? new SpeechSynthesisUtterance(secondaryText) : null;
        if (utteranceSecondary) {
            utteranceSecondary.lang = secondaryLangCode;
            utteranceSecondary.rate = 1.05;
            utteranceSecondary.pitch = 1.0;
        }

        const utteranceLetter = new SpeechSynthesisUtterance(letterText);
        utteranceLetter.lang = langCode;
        utteranceLetter.rate = 1.05;
        utteranceLetter.pitch = 1.1;

        const utteranceHype = new SpeechSynthesisUtterance(hypeText);
        utteranceHype.lang = langCode;
        utteranceHype.rate = 1.15;
        utteranceHype.pitch = 1.35;

        // Chain the utterances sequentially
        if (utteranceSecondary) {
            utteranceIntro.onend = () => { window.speechSynthesis.speak(utteranceSecondary); };
            utteranceSecondary.onend = () => { window.speechSynthesis.speak(utteranceLetter); };
        } else {
            utteranceIntro.onend = () => { window.speechSynthesis.speak(utteranceLetter); };
        }

        utteranceLetter.onend = () => {
            window.speechSynthesis.speak(utteranceHype);
        };

        utteranceHype.onend = () => {
            // --- Green Light flash cue (1 full second) ---
            const mainContainer = document.querySelector('.game-card') || document.querySelector('.prompt-box') || document.querySelector('main') || document.querySelector('.container');
            if (mainContainer) {
                mainContainer.style.borderColor = "#10b981"; // Vibrant green
                mainContainer.style.boxShadow = "0 0 40px #10b981, inset 0 0 25px #10b981";
                setTimeout(() => {
                    mainContainer.style.borderColor = "";
                    mainContainer.style.boxShadow = "";
                }, 1000); // 1000ms = exactly 1 full second
            }

            startTimer();
        };

        window.speechSynthesis.speak(utteranceIntro);
    } else {
        startTimer();
    }
}

function startTimer() {
    if (countdownInterval !== null) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }

    if (typeof gameAudio !== 'undefined') {
        gameAudio.unlock();
        const t0 = gameAudio.ctx.currentTime;
        const roundDuration = 15;
        if (typeof gameAudio.layerDrone === 'function') gameAudio.layerDrone(gameAudio.ctx, t0, t0 + roundDuration, gameAudio.music, () => {});
        if (typeof gameAudio.layerOstinato === 'function') gameAudio.layerOstinato(gameAudio.ctx, t0, t0 + roundDuration, gameAudio.music, () => {});
        if (typeof gameAudio.layerHeartbeat === 'function') gameAudio.layerHeartbeat(gameAudio.ctx, t0, t0 + roundDuration, gameAudio.music, () => {});
        if (typeof gameAudio.layerRiser === 'function') gameAudio.layerRiser(gameAudio.ctx, t0, t0 + roundDuration, gameAudio.music, () => {});
    }

    let timeLeft = 15;
    const timerEl = document.getElementById('timerDisplay') || document.getElementById('timer');
    if (timerEl) {
        timerEl.innerText = timeLeft;
        timerEl.style.color = "";
        timerEl.style.fontSize = "";
    }

    countdownInterval = setInterval(() => {
        timeLeft--;
        if (timerEl) {
            timerEl.innerText = timeLeft;
            if (timeLeft <= 4 && timeLeft > 0) {
                timerEl.style.color = "#ff4444";
            }
        }

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            countdownInterval = null;
            isRoundActive = false; // Mark round as inactive so Play button unlocks!

            // --- Re-enable PLAY button ---
            const playBtn = document.getElementById('playBtn') || document.getElementById('start-btn');
            if (playBtn) {
                playBtn.disabled = false;
                playBtn.style.opacity = "1";
                playBtn.style.cursor = "pointer";
            }
            // -----------------------------

            if (typeof gameAudio !== 'undefined' && typeof gameAudio.playSting === 'function') {
                gameAudio.playSting();
            }

            if (timerEl) {
                timerEl.innerText = (currentLang === 'es') ? "¡TIEMPO!" : "TIME'S UP!";
                timerEl.style.fontSize = "2.4rem";
                timerEl.style.fontWeight = "900";
                timerEl.style.color = "#ff0000";
            }

            const mainContainer = document.querySelector('.game-card') || document.querySelector('.prompt-box') || document.querySelector('main') || document.querySelector('.container');
            if (mainContainer) {
                let flashCount = 0;
                const flashInterval = setInterval(() => {
                    if (flashCount >= 6) {
                        clearInterval(flashInterval);
                        mainContainer.style.borderColor = "#ff0000";
                        mainContainer.style.boxShadow = "0 0 30px #ff0000, inset 0 0 15px #ff0000";
                        return;
                    }
                    if (flashCount % 2 === 0) {
                        mainContainer.style.borderColor = "#ff0000";
                        mainContainer.style.boxShadow = "0 0 35px #ff0000, inset 0 0 20px #ff0000";
                    } else {
                        mainContainer.style.borderColor = "";
                        mainContainer.style.boxShadow = "";
                    }
                    flashCount++;
                }, 250);
            }

            if (typeof gameAudio !== 'undefined' && typeof gameAudio.stopAll === 'function') {
                gameAudio.stopAll();
            }
        }
    }, 1000);
}

// ==========================================
// 7. DAILY & CHALLENGE MODE ENGINE
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
    dailyResultsArray = [];
    dailyStartTime = null;

    const dailyBtn = document.getElementById('dailyModeBtn');
    if (dailyBtn) dailyBtn.classList.add('active');

    // Stacked Daily Blurts ready message placed right here inside the function!
    const dailyMessageEl = document.getElementById('dailyMessage') || document.getElementById('promptDisplay'); 
    if (dailyMessageEl) {
        dailyMessageEl.innerHTML = `
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
            <div style="font-size: 1.1rem; color: #cbd5e1; margin-bottom: 16px; text-align: center;">Finished adding your points with the buttons? Click below to save your score!</div>
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
            const newStreak = saveDailyResults(finalScore, dailyResultsArray, 0);
            showDailyResults(finalScore, newStreak, dailyResultsArray);
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

function showDailyResults(totalScore, streak, resultsArray) {
    const scoreEl = document.getElementById('dailyScoreDisplay');
    if (scoreEl) scoreEl.innerText = `${totalScore} pts`;

    const streakEl = document.getElementById('dailyStreakDisplay');
    if (streakEl) streakEl.innerText = `🔥 ${streak} Day Streak`;

    const resultsModal = document.getElementById('dailyResultsModal') || document.getElementById('dailySummary') || document.getElementById('results-modal');
    if (resultsModal) resultsModal.style.display = 'block';
}

// ==========================================
// 8. AD & UTILITY MANAGEMENT
// ==========================================
function triggerInterstitialAd() {
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
            } catch (e) {}
        }
    }
}

function adjustScore(team, delta) {
    const el = document.getElementById(team + "Score");
    if (el) {
        let current = parseInt(el.innerText, 10) || 0;
        el.innerText = Math.max(0, current + delta);
        if (delta > 0) playSlideUp();
        else if (delta < 0 && current > 0) playSlideDown();
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
