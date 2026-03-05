/* ═══════════════════════════════════════════════════════════
   Ruleta de Actividades — app.js
   Canvas spinning wheel + confetti + motivational messages
   ═══════════════════════════════════════════════════════════ */

// ── DOM refs ────────────────────────────────────────────────
const els = {
  fileInput:      document.getElementById("fileInput"),
  loadDemo:       document.getElementById("loadDemo"),
  resetAll:       document.getElementById("resetAll"),
  manualInput:    document.getElementById("manualInput"),
  manualAdd:      document.getElementById("manualAdd"),
  spinBtn:        document.getElementById("spinBtn"),
  doneBtn:        document.getElementById("doneBtn"),
  skipBtn:        document.getElementById("skipBtn"),
  undoBtn:        document.getElementById("undoBtn"),
  wheelCanvas:    document.getElementById("wheelCanvas"),
  resultBanner:   document.getElementById("resultBanner"),
  resultText:     document.getElementById("resultText"),
  pendingCount:   document.getElementById("pendingCount"),
  doneCount:      document.getElementById("doneCount"),
  pendingList:    document.getElementById("pendingList"),
  doneList:       document.getElementById("doneList"),
  motivational:   document.getElementById("motivational"),
  confettiLayer:  document.getElementById("confettiLayer"),
  langBtn:        document.getElementById("langBtn"),
  allDoneOverlay: document.getElementById("allDoneOverlay"),
  allDoneClose:   document.getElementById("allDoneClose"),
};

// ── Constants ────────────────────────────────────────────────
const STORAGE_KEY = "ruleta_actividades_v2";

// Segment color pairs [inner, outer] for radial gradient
const SEGMENT_COLORS = [
  ["#ff6b9d","#c44569"], ["#ff9f43","#e55039"],
  ["#feca57","#f0932b"], ["#1dd1a1","#10ac84"],
  ["#48dbfb","#0abde3"], ["#a29bfe","#6c5ce7"],
  ["#fd79a8","#e84393"], ["#55efc4","#00b894"],
  ["#74b9ff","#0984e3"], ["#fdcb6e","#e17055"],
  ["#e17055","#d63031"], ["#00cec9","#00b8a9"],
];

// ── Translations ────────────────────────────────────────────
const TRANSLATIONS = {
  es: {
    h1:           "🎡 Ruleta de Actividades",
    subtitle:     "Solo dejate llevar por la vida",
    fileBtn:      "📄 Subir TXT",
    resetAll:     "🗑 Resetear",
    pendingLabel: "Pendientes",
    doneLabel:    "Completadas 🏆",
    spinBtn:      "🎰 Girar",
    doneBtn:      "✅ ¡Listo!",
    skipBtn:      "🔄 Otra",
    undoBtn:      "↩ Deshacer",
    resultLabel:  "¡Te tocó!",
    pendingTitle: "⏳ Pendientes",
    doneTitle:    "🏆 Completadas",
    tip:          "Tip: una actividad por línea en el TXT. Líneas vacías se ignoran.",
    langBtn:      "🌐 EN",
    emptyLabel:   "Cargá actividades",
    undoMsg:      "Deshecho. Nada se perdió en el multiverso. 🌀",
    allDoneTitle: "¡Lo lograste! 🎉",
    allDoneMsg:   "Completaste todo. Charmander está bailando por vos.",
    allDoneClose: "Cerrar",
    motivation: [
      "Te lo juro que me alegra tanto que lo hayas hecho 🥺💛",
      "Sabía que ibas a poder. Te conozco. 🤍",
      "Pará, ¿lo terminaste? Estoy tan orgullosa/o de vos 🫂",
      "Eso que acabás de hacer parece chiquito pero a mí me parece enorme 💜",
      "Qué lindo verte así, avanzando de a poquito 🌱",
      "No te das cuenta lo bien que te sienta hacerte caso 😭✨",
      "Sos más capaz de lo que te creés, en serio 🤍",
      "Me encanta cuando te cuidás así, aunque sea en cositas 🥹",
      "Esto también cuenta. No lo minimices. Fue real. 💛",
      "Si pudiera darte un abrazo ahora mismo, te lo daría 🫶",
      "Eso estuvo buenísimo. Y vos también estás buenísima/o 😌🌟",
      "Gracias por no abandonarte hoy. Eso importa muchísimo 💙",
    ],
    manualPlaceholder: "Escribí una actividad y presioná ＋",
    demoActivities: [
      "Ordenar el escritorio 10 min",
      "Hacer 20 sentadillas",
      "Leer 5 páginas",
    ],
  },
  en: {
    h1:           "🎡 Activity Wheel",
    subtitle:     "Just let life carry you",
    fileBtn:      "📄 Upload TXT",
    resetAll:     "🗑 Reset",
    pendingLabel: "Pending",
    doneLabel:    "Completed 🏆",
    spinBtn:      "🎰 Spin",
    doneBtn:      "✅ Done!",
    skipBtn:      "🔄 Skip",
    undoBtn:      "↩ Undo",
    resultLabel:  "You got:",
    pendingTitle: "⏳ Pending",
    doneTitle:    "🏆 Completed",
    tip:          "Tip: one activity per line in the TXT. Empty lines are ignored.",
    langBtn:      "🌐 ES",
    emptyLabel:   "Load activities",
    undoMsg:      "Undone. Nothing was lost in the multiverse. 🌀",
    allDoneTitle: "You did it! 🎉",
    allDoneMsg:   "You completed everything. Charmander is dancing for you.",
    allDoneClose: "Close",
    motivation: [
      "I knew you'd do it. I just knew it. 🥺💛",
      "Look at you. Seriously, I'm so proud of you 🤍",
      "Wait, you actually finished?? That's my person 🫂",
      "That might seem small but to me it's everything 💜",
      "It's so good to see you moving forward, little by little 🌱",
      "You don't even realize how good it looks on you to trust yourself 😭✨",
      "You're so much more capable than you give yourself credit for 🤍",
      "I love when you take care of yourself, even in little ways 🥹",
      "This counts too. Don't minimize it. It was real. 💛",
      "If I could hug you right now, I absolutely would 🫶",
      "That was amazing. And so are you 😌🌟",
      "Thank you for not giving up on yourself today. That means everything 💙",
    ],
    manualPlaceholder: "Type an activity and press ＋",
    demoActivities: [
      "Tidy your desk for 10 min",
      "Do 20 squats",
      "Read 5 pages",
    ],
  },
};

let lang = "es";

// ── State ────────────────────────────────────────────────────
let state = {
  pending: [],
  done: [],
  current: null,
  lastAction: null,
};

// ── Wheel animation state ────────────────────────────────────
let rotation    = 0;   // current wheel rotation in radians
let isSpinning  = false;
let animId      = null;

// ── Persistence ──────────────────────────────────────────────
function save(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, rotation, lang }));
}
function load(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) return;
  try{
    const p = JSON.parse(raw);
    if(p && Array.isArray(p.pending) && Array.isArray(p.done)){
      state = { ...state, ...p };
      if(typeof p.rotation === "number") rotation = p.rotation;
      if(typeof p.lang === "string" && TRANSLATIONS[p.lang]) lang = p.lang;
    }
  }catch(_){}
}

// ── Audio (Web Audio API — no external files) ───────────────
let audioCtx = null;

function getCtx(){
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if(audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function beep({ type="square", freq=440, vol=0.15, dur=0.08, slide=0, delay=0 }){
  const ctx  = getCtx();
  const now  = ctx.currentTime + delay;
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if(slide) osc.frequency.linearRampToValueAtTime(freq + slide, now + dur);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(vol, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.start(now);
  osc.stop(now + dur + 0.01);
}

// Short click when wheel passes a segment divider
function playTick(progress){
  // pitch rises from slow (50 %) to fast (start of spin)  
  const speed = 1 - progress;   // 0 = just stopped, 1 = full speed
  const freq  = 180 + speed * 340;
  const vol   = 0.06 + speed * 0.04;
  beep({ type:"square", freq, vol, dur:0.03 });
}

// Two-tone "bwoop" when wheel lands
function playLand(){
  beep({ type:"square", freq:523, vol:0.18, dur:0.09 });
  beep({ type:"square", freq:784, vol:0.22, dur:0.14, delay:0.09 });
}

// Ascending arpeggio — Pokemon item-get style
function playDone(){
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => beep({ type:"square", freq, vol:0.18, dur:0.11, delay: i * 0.09 }));
}

// Victory fanfare — 8-bit Nintendo style
function playAllDone(){
  const melody = [
    [784, 0.00], [784, 0.12], [784, 0.24],
    [659, 0.38], [784, 0.50],
    [1047,0.65], [1047,0.85], [1047,1.10],
  ];
  melody.forEach(([freq, delay]) => beep({ type:"square", freq, vol:0.20, dur:0.22, delay }));
}

// ── i18n ─────────────────────────────────────────────────────
function t(key){ return TRANSLATIONS[lang][key]; }

function applyLang(){
  document.documentElement.lang = lang;
  document.title = t("h1").replace(/^🎡\s*/, "") + " 🎡";
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const val = TRANSLATIONS[lang][el.dataset.i18n];
    if(val !== undefined) el.textContent = val;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const val = TRANSLATIONS[lang][el.dataset.i18nPlaceholder];
    if(val !== undefined) el.placeholder = val;
  });
  drawWheel(rotation);
}

function showAllDone(){
  els.allDoneOverlay.classList.remove("hidden");
  els.allDoneOverlay.style.animation = "none";
  els.allDoneOverlay.offsetHeight;
  els.allDoneOverlay.style.animation = "";
  playAllDone();
  spawnConfetti();
  setTimeout(spawnConfetti, 700);
  setTimeout(spawnConfetti, 1400);
}

function hideAllDone(){
  els.allDoneOverlay.classList.add("hidden");
}

// ── Helpers ──────────────────────────────────────────────────
function randPick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }
function escapeHtml(s){
  return s.replaceAll("&","&amp;").replaceAll("<","&lt;")
          .replaceAll(">","&gt;").replaceAll('"',"&quot;");
}
function normalizeLines(text){
  return text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
}

// ── Canvas wheel draw ────────────────────────────────────────
function drawWheel(rot){
  const canvas = els.wheelCanvas;
  const ctx    = canvas.getContext("2d");

  // ── HiDPI / Retina scaling ──────────────────────────────
  const dpr  = window.devicePixelRatio || 1;
  const SIZE = 420;                          // logical CSS pixels
  if(canvas.width !== SIZE * dpr || canvas.height !== SIZE * dpr){
    canvas.width        = SIZE * dpr;
    canvas.height       = SIZE * dpr;
    canvas.style.width  = SIZE + "px";
    canvas.style.height = SIZE + "px";
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);   // reset + apply DPR scale

  const W  = SIZE, H = SIZE;
  const cx = W / 2, cy = H / 2;
  const R  = Math.min(cx, cy) - 6;

  ctx.clearRect(0, 0, W, H);

  const items = state.pending.length > 0 ? state.pending : [t("emptyLabel")];
  const n     = items.length;
  const arc   = (2 * Math.PI) / n;

  // ── Shared text metrics (calculated ONCE for all segments) ──
  // All labels are anchored at the same fixed radial fraction → equal distance from centre.
  const textCenterX = R * 0.63;          // radial centre of every label, always the same
  const maxWidth    = R * 0.52;          // max line width (radial budget), same for all
  const chordH      = 2 * textCenterX * Math.sin(arc / 2); // perpendicular space at that radius

  const maxLines = 2;
  const lineGap  = 1.3;
  let   fontSize = Math.floor(chordH / (maxLines * lineGap));
  fontSize       = Math.min(13, Math.max(8, fontSize));

  // ── Pre-compute word-wrapped lines for every item ──────────
  // (font must be set on ctx before measuring)
  ctx.font = `600 ${fontSize}px system-ui, -apple-system, Arial`;
  const allLines = items.map(text => {
    const words  = text.split(" ");
    const result = [];
    let   line   = "";
    for(const word of words){
      const test = line ? line + " " + word : word;
      if(ctx.measureText(test).width <= maxWidth){
        line = test;
      } else {
        if(line) result.push(line);
        line = word;
      }
    }
    if(line) result.push(line);

    // Trim to maxLines, truncate last with ellipsis if needed
    const out = result.slice(0, maxLines);
    if(result.length > maxLines){
      let last = out[maxLines - 1];
      while(ctx.measureText(last + "…").width > maxWidth && last.length > 1)
        last = last.slice(0, -1);
      out[maxLines - 1] = last + "…";
    }
    return out;
  });

  const lineHeight = fontSize * lineGap;

  // ── Draw segments ────────────────────────────────────────
  for(let i = 0; i < n; i++){
    const start = rot + i * arc;
    const end   = start + arc;
    const mid   = (start + end) / 2;
    const [c1, c2] = SEGMENT_COLORS[i % SEGMENT_COLORS.length];

    // Gradient
    const grad = ctx.createLinearGradient(
      cx + R * 0.25 * Math.cos(mid), cy + R * 0.25 * Math.sin(mid),
      cx + R        * Math.cos(mid), cy + R        * Math.sin(mid)
    );
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, start, end);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = "rgba(0,0,0,.25)";
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    // ── Text ────
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(mid);

    // Clip to this segment so text never bleeds into neighbours
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, R - 2, start - mid, end - mid);
    ctx.closePath();
    ctx.clip();

    ctx.font         = `600 ${fontSize}px system-ui, -apple-system, Arial`;
    ctx.fillStyle    = "rgba(255,255,255,.95)";
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor  = "rgba(0,0,0,.8)";
    ctx.shadowBlur   = 3;

    const segLines = allLines[i];
    const totalH   = segLines.length * lineHeight;
    const startY   = -totalH / 2 + lineHeight / 2;

    segLines.forEach((l, li) => {
      ctx.fillText(l, textCenterX, startY + li * lineHeight, maxWidth);
    });

    ctx.restore();
  }

  // ── Outer ring
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, 2 * Math.PI);
  ctx.strokeStyle = "rgba(255,255,255,.25)";
  ctx.lineWidth   = 4;
  ctx.stroke();

  // ── Center hub shadow
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.6)";
  ctx.shadowBlur  = 12;
  ctx.beginPath();
  ctx.arc(cx, cy, 26, 0, 2 * Math.PI);
  ctx.fillStyle = "#07090f";
  ctx.fill();
  ctx.restore();

  // ── Center hub ring
  ctx.beginPath();
  ctx.arc(cx, cy, 26, 0, 2 * Math.PI);
  ctx.strokeStyle = "rgba(255,255,255,.35)";
  ctx.lineWidth   = 3;
  ctx.stroke();

  // ── Center dot
  ctx.beginPath();
  ctx.arc(cx, cy, 8, 0, 2 * Math.PI);
  ctx.fillStyle = "rgba(255,255,255,.8)";
  ctx.fill();
}

// ── Spin animation ───────────────────────────────────────────
function easeOutQuint(t){ return 1 - Math.pow(1 - t, 5); }

function animateSpin(targetRot, onEnd){
  const startRot   = rotation;
  const totalRot   = targetRot - startRot;
  const duration   = 4200;   // ms
  const startTime  = performance.now();
  const segArc     = (2 * Math.PI) / (state.pending.length || 1);
  let   lastSeg    = Math.floor(rotation / segArc);

  els.wheelCanvas.classList.add("spinning");

  function frame(now){
    const t      = Math.min((now - startTime) / duration, 1);
    rotation     = startRot + totalRot * easeOutQuint(t);
    drawWheel(rotation);

    // Tick on each segment boundary crossing
    const currSeg = Math.floor(rotation / segArc);
    if(currSeg !== lastSeg){
      playTick(easeOutQuint(t));   // easeOutQuint(t) ≈ progress → passed to playTick as progress
      lastSeg = currSeg;
    }

    if(t < 1){
      animId = requestAnimationFrame(frame);
    } else {
      rotation = targetRot;
      drawWheel(rotation);
      els.wheelCanvas.classList.remove("spinning");
      isSpinning = false;
      playLand();
      onEnd();
    }
  }
  animId = requestAnimationFrame(frame);
}

// ── Spin logic ───────────────────────────────────────────────
function spin(){
  if(isSpinning || state.pending.length === 0) return;

  isSpinning = true;
  state.lastAction = null;

  // Hide any previous result + motivation
  els.resultBanner.classList.add("hidden");
  els.motivational.textContent = "";

  const n   = state.pending.length;
  const arc = (2 * Math.PI) / n;

  // Pick random item
  const idx   = Math.floor(Math.random() * n);
  state.current = state.pending[idx];

  // The pointer sits at angle 0 (right side of canvas).
  // Segment i occupies [rotation + i*arc … rotation + (i+1)*arc].
  // We want center of segment idx === 0 (mod 2π).
  // center = rotation_final + idx*arc + arc/2 ≡ 0
  // rotation_final = -(idx*arc + arc/2) + 2π*k

  const diff = ((-(idx * arc + arc / 2) - rotation) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
  const extraSpins = 6 + Math.floor(Math.random() * 4); // 6-9 full rotations
  const targetRot  = rotation + diff + extraSpins * 2 * Math.PI;

  save();
  render();

  animateSpin(targetRot, () => {
    save();
    render();
    // Pop in the result banner
    els.resultBanner.classList.remove("hidden");
    // Re-trigger animation
    els.resultBanner.style.animation = "none";
    els.resultBanner.offsetHeight;   // reflow
    els.resultBanner.style.animation = "";
  });
}

function skip(){
  if(!state.current || isSpinning) return;

  if(state.pending.length <= 1){ spin(); return; }

  // Pick anything except the current
  const prev = state.current;
  let   next = prev;
  let   guard = 0;
  while(next === prev && guard < 30){
    next = state.pending[Math.floor(Math.random() * state.pending.length)];
    guard++;
  }

  // If we somehow looped 30 times (shouldn't happen with >1 item), just pick first different
  if(next === prev){
    next = state.pending.find(a => a !== prev) ?? prev;
  }

  // Re-spin to that item by index
  isSpinning = true;
  state.current = next;
  state.lastAction = null;
  els.resultBanner.classList.add("hidden");
  els.motivational.textContent = "";

  const n   = state.pending.length;
  const arc = (2 * Math.PI) / n;
  const idx = state.pending.indexOf(next);

  const diff = ((-(idx * arc + arc / 2) - rotation) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
  const extraSpins = 3 + Math.floor(Math.random() * 3);
  const targetRot  = rotation + diff + extraSpins * 2 * Math.PI;

  save();
  render();

  animateSpin(targetRot, () => {
    save();
    render();
    els.resultBanner.classList.remove("hidden");
    els.resultBanner.style.animation = "none";
    els.resultBanner.offsetHeight;
    els.resultBanner.style.animation = "";
  });
}

// ── Mark done ────────────────────────────────────────────────
function markDone(){
  if(!state.current || isSpinning) return;

  const activity = state.current;
  const idx      = state.pending.indexOf(activity);
  if(idx >= 0) state.pending.splice(idx, 1);

  state.done.unshift(activity);
  state.current = null;
  state.lastAction = { type:"DONE", payload:activity };

  // Hide result banner
  els.resultBanner.classList.add("hidden");

  // Motivational message with pop animation
  const msg = randPick(t("motivation"));
  els.motivational.textContent = msg;
  els.motivational.classList.remove("pop");
  els.motivational.offsetHeight;
  els.motivational.classList.add("pop");

  spawnConfetti();
  playDone();
  save();
  render();

  if(state.pending.length === 0) showAllDone();
}

// ── Undo ─────────────────────────────────────────────────────
function undo(){
  if(!state.lastAction) return;
  const { type, payload } = state.lastAction;
  if(type === "DONE"){
    const i = state.done.indexOf(payload);
    if(i >= 0) state.done.splice(i, 1);
    state.pending.unshift(payload);
    state.current = payload;
  }
  state.lastAction = null;
  els.resultBanner.classList.remove("hidden");
  els.motivational.textContent = t("undoMsg");
  els.motivational.classList.remove("pop");
  els.motivational.offsetHeight;
  els.motivational.classList.add("pop");
  save();
  render();
}

// ── Load / Reset ──────────────────────────────────────────────
function loadActivities(lines){
  const unique = Array.from(new Set(lines));
  state.pending    = unique;
  state.done       = [];
  state.current    = null;
  state.lastAction = null;
  rotation = 0;
  hideAllDone();
  els.resultBanner.classList.add("hidden");
  els.motivational.textContent = "";
  save();
  render();
}

function resetAll(){
  state = { pending:[], done:[], current:null, lastAction:null };
  rotation = 0;
  localStorage.removeItem(STORAGE_KEY);
  hideAllDone();
  els.resultBanner.classList.add("hidden");
  els.motivational.textContent = "";
  render();
}

// ── Render ────────────────────────────────────────────────────
function render(){
  els.pendingCount.textContent = state.pending.length;
  els.doneCount.textContent    = state.done.length;

  els.pendingList.innerHTML = state.pending
    .map((a, i) => `<li>${escapeHtml(a)} <small>#${i + 1}</small></li>`)
    .join("");

  els.doneList.innerHTML = state.done
    .map((a, i) => `<li class="done-item">${escapeHtml(a)} <small>#${i + 1}</small></li>`)
    .join("");

  const hasItems   = state.pending.length > 0;
  const hasCurrent = !!state.current;

  els.spinBtn.disabled = !hasItems || isSpinning;
  els.doneBtn.disabled = !hasCurrent || isSpinning;
  els.skipBtn.disabled = !hasCurrent || isSpinning;
  els.undoBtn.disabled = !state.lastAction || isSpinning;

  // Result banner text
  if(hasCurrent){
    els.resultText.textContent = state.current;
  }

  drawWheel(rotation);
}

// ── Confetti ──────────────────────────────────────────────────
const CONFETTI_COLORS = [
  "#ff6b9d","#feca57","#1dd1a1","#48dbfb",
  "#a29bfe","#ff9f43","#fd79a8","#55efc4",
  "#74b9ff","#fff","#ff6b6b","#fdcb6e",
];

function spawnConfetti(){
  const layer = els.confettiLayer;
  const count = 80;

  for(let i = 0; i < count; i++){
    const el = document.createElement("div");
    el.className = "confetti-piece";

    // Random position horizontally
    const x    = Math.random() * 100;
    const size = 6 + Math.random() * 8;
    const dur  = 1.4 + Math.random() * 1.6;
    const delay= Math.random() * 0.6;
    const color= CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const rot  = Math.random() > .5 ? "border-radius:50%" : "";

    el.style.cssText = `
      left:${x}%;
      width:${size}px; height:${size}px;
      background:${color};
      ${rot};
      animation-duration:${dur}s;
      animation-delay:${delay}s;
    `;

    layer.appendChild(el);
    // Remove after animation
    setTimeout(() => el.remove(), (dur + delay) * 1000 + 200);
  }
}

// ── Add single activity manually ─────────────────────────────
function addManual(){
  const val = els.manualInput.value.trim();
  if(!val) return;
  if(!state.pending.includes(val)){
    state.pending.push(val);
  }
  els.manualInput.value = "";
  els.manualInput.focus();
  save();
  render();
}

// ── Event listeners ───────────────────────────────────────────
els.fileInput.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if(!file) return;
  const text  = await file.text();
  const lines = normalizeLines(text);
  loadActivities(lines);
  e.target.value = ""; // allow re-loading same file
});

els.loadDemo.addEventListener("click", () => {
  loadActivities(t("demoActivities"));
});

els.spinBtn.addEventListener("click", spin);
els.doneBtn.addEventListener("click", markDone);
els.skipBtn.addEventListener("click", skip);
els.undoBtn.addEventListener("click", undo);
els.resetAll.addEventListener("click", resetAll);

els.manualAdd.addEventListener("click", addManual);
els.manualInput.addEventListener("keydown", (e) => {
  if(e.key === "Enter") addManual();
});

els.langBtn.addEventListener("click", () => {
  lang = lang === "es" ? "en" : "es";
  save();
  applyLang();
});

els.allDoneClose.addEventListener("click", hideAllDone);

// ── Init ──────────────────────────────────────────────────────
load();
render();
applyLang();