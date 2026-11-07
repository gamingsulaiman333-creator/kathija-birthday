/**
 * ===================================================================
 * KATHIJA'S BIRTHDAY WISH WEBSITE - INTERACTIVE JAVASCRIPT
 * Features:
 *   1. "Tap to Start" interaction gate (enables AudioContext & permissions)
 *   2. Microphone blow detection using Web Audio API (AnalyserNode)
 *   3. 5-Second auto fallback + Tap candle fallback
 *   4. Canvas confetti celebration bursts
 *   5. Dual audio: Custom MP3 playback + built-in music box chime synth
 *   6. 3D interactive unfolding envelope with custom letter
 *   7. Responsive Polaroid photo album & full-screen lightbox
 * ===================================================================
 */

// ===================================================================
// 1. CONFIGURATION (Easy to customize!)
// ===================================================================
const CONFIG = {
  friendName: "Kathija",
  senderName: "madu 🐮",
  // 5 seconds fallback if mic is denied, unavailable, or not blown
  autoBlowTimeoutSeconds: 5,
  // Microphone volume sensitivity threshold (0.0 to 1.0)
  micBlowThreshold: 0.14,
  // Custom audio path
  audioPath: "images/birthday.mp3",
  // Captions for the 5 photos in the album
  photoCaptions: [
    { title: "Panda filter madness 🐼", sub: "Silly selfies & endless rooftop laughs! ✨" },
    { title: "Our iconic Spider-heroes 🕷️✌️", sub: "Partners in crime forever & ever! 💖" },
    { title: "Mirror selfie aesthetic ✨", sub: "Serving looks effortlessly always! 🌸" },
    { title: "Sweet smiles & golden days 🌼", sub: "You brighten up every single room! ☀️" },
    { title: "Double Trouble Besties 👯‍♀️💕", sub: "Forever my soul sister and constant! 🐮✨" }
  ]
};

// ===================================================================
// 2. STATE & VARIABLES
// ===================================================================
let isCandleBlown = false;
let audioContext = null;
let micStream = null;
let micAnalyser = null;
let micDataArray = null;
let micAnimationId = null;
let fallbackTimerId = null;
let isMusicPlaying = false;
let synthOscillators = [];
let currentLightboxIndex = 0;

// DOM Elements
const startOverlay = document.getElementById("start-overlay");
const startBtn = document.getElementById("start-btn");
const mainContent = document.getElementById("main-content");
const musicToggle = document.getElementById("music-toggle");
const birthdayAudio = document.getElementById("birthday-audio");

// Candle & Mic Elements
const cakeContainer = document.getElementById("cake-container");
const flameWrapper = document.getElementById("flame-wrapper");
const smokeWrapper = document.getElementById("smoke-wrapper");
const micStatusWrapper = document.getElementById("mic-status-wrapper");
const micLabel = document.getElementById("mic-label");
const micVolumeBar = document.getElementById("mic-volume-bar");
const candleHeading = document.getElementById("candle-heading");
const candleInstruction = document.getElementById("candle-instruction");
const wishSuccessBox = document.getElementById("wish-success-box");
const jumpToLetterBtn = document.getElementById("jump-to-letter-btn");

// Envelope Elements
const envelope = document.getElementById("envelope");
const waxSeal = document.getElementById("wax-seal");
const envelopeGuide = document.getElementById("envelope-guide");

// Lightbox Elements
const polaroidCards = document.querySelectorAll(".polaroid-card");
const lightboxModal = document.getElementById("lightbox-modal");
const lightboxBackdrop = document.getElementById("lightbox-backdrop");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxPrev = document.getElementById("lightbox-prev");
const lightboxNext = document.getElementById("lightbox-next");
const backToTopBtn = document.getElementById("back-to-top-btn");

// ===================================================================
// 3. BACKGROUND PARTICLES (Balloons & Sparkles)
// ===================================================================
function initFloatingDecorations() {
  const balloonContainer = document.getElementById("balloon-container");
  const sparkleContainer = document.getElementById("sparkle-container");
  
  const balloonColors = [
    "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%)",
    "linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)",
    "linear-gradient(120deg, #f6d365 0%, #fda085 100%)",
    "linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%)",
    "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
    "linear-gradient(135deg, #f68084 0%, #a1c4fd 100%)"
  ];

  // Spawn gentle floating balloons
  for (let i = 0; i < 14; i++) {
    const balloon = document.createElement("div");
    balloon.className = "floating-balloon";
    const size = Math.floor(Math.random() * 32) + 36; // 36px to 68px
    balloon.style.width = `${size}px`;
    balloon.style.height = `${Math.floor(size * 1.25)}px`;
    balloon.style.background = balloonColors[i % balloonColors.length];
    balloon.style.left = `${Math.random() * 95}vw`;
    balloon.style.animationDuration = `${Math.random() * 10 + 12}s`;
    balloon.style.animationDelay = `${Math.random() * 8}s`;
    balloonContainer.appendChild(balloon);
  }

  // Spawn twinkling sparkles
  const sparkles = ["✨", "💖", "⭐", "🌸", "💫"];
  for (let i = 0; i < 22; i++) {
    const sparkle = document.createElement("div");
    sparkle.className = "bg-sparkle";
    sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
    sparkle.style.left = `${Math.random() * 96}vw`;
    sparkle.style.top = `${Math.random() * 96}vh`;
    sparkle.style.animationDuration = `${Math.random() * 3 + 2}s`;
    sparkle.style.animationDelay = `${Math.random() * 3}s`;
    sparkleContainer.appendChild(sparkle);
  }
}

// ===================================================================
// 4. MUSIC & SYNTHESIZER
// ===================================================================
// Happy Birthday note frequencies (in Hz)
const NOTES = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.00,
  A4: 440.00,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99
};

// Melody sequence: [note, duration in seconds]
const BIRTHDAY_MELODY = [
  ["G4", 0.35], ["G4", 0.35], ["A4", 0.7], ["G4", 0.7], ["C5", 0.7], ["B4", 1.2],
  ["G4", 0.35], ["G4", 0.35], ["A4", 0.7], ["G4", 0.7], ["D5", 0.7], ["C5", 1.2],
  ["G4", 0.35], ["G4", 0.35], ["G5", 0.7], ["E5", 0.7], ["C5", 0.7], ["B4", 0.7], ["A4", 1.2],
  ["F5", 0.35], ["F5", 0.35], ["E5", 0.7], ["C5", 0.7], ["D5", 0.7], ["C5", 1.4]
];

/**
 * Plays a single music-box chime note using Web Audio API
 */
function playChimeNote(frequency, startTime, duration) {
  if (!audioContext || audioContext.state === "suspended") return;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  // Bell/celesta harmonic overtones
  osc.type = "sine";
  osc.frequency.setValueAtTime(frequency, startTime);

  // Attack & pleasant exponential decay
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(0.2, startTime + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.1);
  synthOscillators.push(osc);
}

/**
 * Plays the full "Happy Birthday" melody in a sweet music-box loop
 */
let melodyLoopTimeout = null;
function playMusicBoxMelody() {
  if (!isMusicPlaying || !audioContext) return;

  let currentTime = audioContext.currentTime + 0.1;
  for (let i = 0; i < BIRTHDAY_MELODY.length; i++) {
    const [noteName, duration] = BIRTHDAY_MELODY[i];
    const freq = NOTES[noteName];
    if (freq) {
      playChimeNote(freq, currentTime, duration);
    }
    currentTime += duration + 0.08;
  }

  // Loop after the song finishes
  const totalDurationMs = (currentTime - audioContext.currentTime) * 1000 + 1500;
  melodyLoopTimeout = setTimeout(() => {
    if (isMusicPlaying) {
      playMusicBoxMelody();
    }
  }, totalDurationMs);
}

/**
 * Plays celebratory audio: checks for audio element or uses chime synth
 */
function startBackgroundCelebrationMusic() {
  isMusicPlaying = true;
  musicToggle.classList.add("playing");

  // Attempt HTML5 audio element first (e.g. if images/birthday.mp3 is added)
  birthdayAudio.volume = 0.65;
  const playPromise = birthdayAudio.play();

  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        // MP3 playback succeeded!
      })
      .catch(() => {
        // MP3 file not found or blocked: Fall back gracefully to Web Audio Chime Synth!
        playMusicBoxMelody();
      });
  } else {
    playMusicBoxMelody();
  }
}

function stopMusic() {
  isMusicPlaying = false;
  musicToggle.classList.remove("playing");
  birthdayAudio.pause();
  if (melodyLoopTimeout) {
    clearTimeout(melodyLoopTimeout);
  }
  synthOscillators.forEach((osc) => {
    try { osc.stop(); } catch (e) {}
  });
  synthOscillators = [];
}

function toggleMusic() {
  if (isMusicPlaying) {
    stopMusic();
  } else {
    if (audioContext && audioContext.state === "suspended") {
      audioContext.resume();
    }
    startBackgroundCelebrationMusic();
  }
}

// ===================================================================
// 5. MICROPHONE & BLOW DETECTION (Web Audio API AnalyserNode)
// ===================================================================
async function setupMicrophone() {
  try {
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      },
      video: false
    });

    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    const source = audioContext.createMediaStreamSource(micStream);
    micAnalyser = audioContext.createAnalyser();
    micAnalyser.fftSize = 512;
    micAnalyser.smoothingTimeConstant = 0.3;
    source.connect(micAnalyser);

    micDataArray = new Uint8Array(micAnalyser.fftSize);
    micLabel.textContent = "Listening for your blow... 🎙️";
    startMicListeningLoop();

  } catch (err) {
    console.warn("Microphone access unavailable or denied:", err);
    micLabel.textContent = "Mic unavailable • Tap the candle anytime! 🎂";
    // The 5-second automatic fallback will also extinguish the flame smoothly
  }
}

let blowCounter = 0;
function startMicListeningLoop() {
  if (isCandleBlown || !micAnalyser) return;

  micAnalyser.getByteTimeDomainData(micDataArray);

  // Calculate Root-Mean-Square (RMS) amplitude volume
  let sum = 0;
  for (let i = 0; i < micDataArray.length; i++) {
    const val = (micDataArray[i] - 128) / 128; // Normalize -1.0 to 1.0
    sum += val * val;
  }
  const rms = Math.sqrt(sum / micDataArray.length);

  // Update volume visualizer bar
  const meterWidth = Math.min(100, Math.round(rms * 280));
  if (micVolumeBar) {
    micVolumeBar.style.width = `${meterWidth}%`;
  }

  // Detect blow sound spike
  if (rms > CONFIG.micBlowThreshold) {
    blowCounter++;
    if (blowCounter >= 2) {
      // Sustained breath detected!
      extinguishCandle("mic");
      return;
    }
  } else {
    blowCounter = Math.max(0, blowCounter - 1);
  }

  micAnimationId = requestAnimationFrame(startMicListeningLoop);
}

function stopMicrophone() {
  if (micAnimationId) {
    cancelAnimationFrame(micAnimationId);
    micAnimationId = null;
  }
  if (micStream) {
    micStream.getTracks().forEach((track) => track.stop());
    micStream = null;
  }
}

// ===================================================================
// 6. CANDLE EXTINGUISHING & CONFETTI CELEBRATION
// ===================================================================
function extinguishCandle(triggerSource = "fallback") {
  if (isCandleBlown) return;
  isCandleBlown = true;

  // Clear fallback timer
  if (fallbackTimerId) {
    clearTimeout(fallbackTimerId);
    fallbackTimerId = null;
  }

  // Stop mic monitoring
  stopMicrophone();

  // Visual: Extinguish flame
  flameWrapper.classList.add("extinguished");

  // Visual: Emit smoke puffs
  smokeWrapper.classList.add("active");

  // Update text & UI
  candleHeading.innerHTML = "Wish Made! ✨ Happy Birthday! 🎂";
  candleInstruction.textContent = "Your wish is sent to the stars! 🌟";
  micStatusWrapper.style.display = "none";

  // Trigger grand confetti bursts!
  launchCelebrationConfetti();

  // Play celebration music / chimes
  startBackgroundCelebrationMusic();

  // Reveal success message box after flame goes out
  setTimeout(() => {
    wishSuccessBox.classList.remove("hidden");
  }, 900);
}

/**
 * Fires multi-stage confetti using canvas-confetti
 */
function launchCelebrationConfetti() {
  if (typeof confetti !== "function") return;

  const count = 200;
  const defaults = {
    origin: { y: 0.65 },
    colors: ["#ff6b8b", "#f59e0b", "#c084fc", "#38bdf8", "#f43f5e", "#fde047"]
  };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  // Multi-blast sequence
  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });

  // Side cannons
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 }
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 }
    });
  }, 300);
}

// ===================================================================
// 7. STEP 1: START SCREEN FLOW
// ===================================================================
function handleStartExperience() {
  // 1. Initialize AudioContext (must be triggered by user gesture)
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  // 2. Hide start overlay with smooth animation
  startOverlay.classList.add("fade-out");
  mainContent.classList.remove("content-hidden");

  // 3. Request microphone access for candle blowing
  setupMicrophone();

  // 4. Set 5-second automatic fallback timer
  // "Fallback: if the mic is denied, unavailable, or nothing is detected, the flame goes out automatically after 5 seconds."
  fallbackTimerId = setTimeout(() => {
    if (!isCandleBlown) {
      extinguishCandle("fallback-5s-timer");
    }
  }, CONFIG.autoBlowTimeoutSeconds * 1000);

  // 5. Initial welcome confetti blast
  setTimeout(() => {
    if (typeof confetti === "function") {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, 400);
}

// ===================================================================
// 8. INTERACTIVE ENVELOPE & LETTER (STEP 4)
// ===================================================================
function openEnvelope() {
  if (envelope.classList.contains("opened")) return;
  envelope.classList.add("opened");
  envelopeGuide.style.display = "none";

  // Little heart sparkles on opening
  if (typeof confetti === "function") {
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.8 },
      shapes: ["circle"],
      colors: ["#ec4899", "#f43f5e", "#fb7185", "#ffd166"]
    });
  }

  // Smoothly scroll letter into comfortable reading view on mobile & desktop
  setTimeout(() => {
    document.getElementById("letter-paper").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }, 400);
}

function closeEnvelope() {
  envelope.classList.remove("opened");
  envelopeGuide.style.display = "inline-block";
}

// ===================================================================
// 9. PHOTO ALBUM LIGHTBOX (STEP 5)
// ===================================================================
function openLightbox(index) {
  currentLightboxIndex = index;
  const photoSrc = `images/${index + 1}.jpg`;
  const captionData = CONFIG.photoCaptions[index] || { title: "", sub: "" };

  lightboxImg.src = photoSrc;
  lightboxImg.alt = `${CONFIG.friendName} - ${captionData.title}`;
  lightboxCaption.innerHTML = `<strong>${captionData.title}</strong><br><small style="color: #6b7280; font-weight: normal;">${captionData.sub}</small>`;

  lightboxModal.classList.add("active");
  lightboxModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden"; // Prevent background scroll
}

function closeLightbox() {
  lightboxModal.classList.remove("active");
  lightboxModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function showPrevPhoto() {
  const total = polaroidCards.length;
  currentLightboxIndex = (currentLightboxIndex - 1 + total) % total;
  openLightbox(currentLightboxIndex);
}

function showNextPhoto() {
  const total = polaroidCards.length;
  currentLightboxIndex = (currentLightboxIndex + 1) % total;
  openLightbox(currentLightboxIndex);
}

// Swipe gestures for mobile in Lightbox
let touchStartX = 0;
let touchEndX = 0;

function handleTouchStart(e) {
  touchStartX = e.changedTouches[0].screenX;
}

function handleTouchEnd(e) {
  touchEndX = e.changedTouches[0].screenX;
  if (touchStartX - touchEndX > 50) {
    showNextPhoto(); // Swiped left -> next
  } else if (touchEndX - touchStartX > 50) {
    showPrevPhoto(); // Swiped right -> prev
  }
}

// ===================================================================
// 10. EVENT LISTENERS
// ===================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Initialize background animations
  initFloatingDecorations();

  // Start button (interaction gate)
  startBtn.addEventListener("click", handleStartExperience);

  // Music toggle button
  musicToggle.addEventListener("click", toggleMusic);

  // Cake / Candle manual click fallback
  cakeContainer.addEventListener("click", () => {
    if (!isCandleBlown) {
      extinguishCandle("tap");
    }
  });

  // Jump to letter button
  jumpToLetterBtn.addEventListener("click", () => {
    document.getElementById("letter-section").scrollIntoView({ behavior: "smooth" });
    if (!envelope.classList.contains("opened")) {
      setTimeout(openEnvelope, 550);
    }
  });

  // Envelope tap to open
  envelope.addEventListener("click", (e) => {
    if (!envelope.classList.contains("opened")) {
      openEnvelope();
    } else if (e.target.closest("#fold-letter-btn")) {
      closeEnvelope();
    }
  });

  waxSeal.addEventListener("click", (e) => {
    e.stopPropagation();
    openEnvelope();
  });

  // Polaroid cards click to open lightbox
  polaroidCards.forEach((card) => {
    card.addEventListener("click", () => {
      const index = parseInt(card.getAttribute("data-index"), 10);
      openLightbox(index);
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const index = parseInt(card.getAttribute("data-index"), 10);
        openLightbox(index);
      }
    });
  });

  // Lightbox controls
  lightboxClose.addEventListener("click", closeLightbox);
  lightboxBackdrop.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", (e) => {
    e.stopPropagation();
    showPrevPhoto();
  });
  lightboxNext.addEventListener("click", (e) => {
    e.stopPropagation();
    showNextPhoto();
  });

  // Keyboard navigation for lightbox
  document.addEventListener("keydown", (e) => {
    if (!lightboxModal.classList.contains("active")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showPrevPhoto();
    if (e.key === "ArrowRight") showNextPhoto();
  });

  // Mobile swipe support
  lightboxModal.addEventListener("touchstart", handleTouchStart, { passive: true });
  lightboxModal.addEventListener("touchend", handleTouchEnd, { passive: true });

  // Back to top button
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
