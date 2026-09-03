/* =========================================================================
   APP — загрузка, менеджер сцен, HUD, управление
   ========================================================================= */

const stage    = $('#stage');
const viewport = $('#viewport');
const scenesEl = $('#scenes');
const gapEl    = $('#gap');
const bootEl   = $('#boot');

let cur = -1;
const refs = [];
const roots = [];
let started = Date.now();

$('#prototypeVersion').textContent = 'PROTOTYPE ' + window.PROTOTYPE_VERSION;

/* ---------------- звук: берём библиотеку самого репозитория ---------------- */
Snd.load('boot',  '../assets/sounds/matrix-monitor.mp3',      false, .45);
Snd.load('scan',  '../assets/sounds/scan.mp3',                false, .55);
Snd.load('blip',  '../assets/sounds/matrix-materialize.mp3',  false, .22);
Snd.load('music', '../assets/sounds/matrix-clubbed-to-death.mp3', true, .26);
Snd.load('outro', '../assets/sounds/matrix-monitor.mp3',      false, .40);
Snd.load('win',   '../assets/sounds/rick-and-morty-intro.mp3', false, .50);
Snd.load('intro', '../assets/sounds/rick-and-morty-intro.mp3', false, .45);

/* ---------------- масштабирование сцены под экран ---------------- */
function fit() {
  if (matchMedia('(max-width:900px)').matches) { stage.style.transform = ''; return; }
  const s = Math.min(viewport.clientWidth / 1600, viewport.clientHeight / 900);
  stage.style.transform = 'scale(' + s + ')';
}
addEventListener('resize', fit);

/* ---------------- HUD ---------------- */
function pad(n) { return String(n).padStart(2, '0'); }
function updateHUD() {
  $('#hudScene').textContent = SCENES[cur] ? SCENES[cur].hud : '';
  const filled = Math.round(((cur + 1) / SCENES.length) * 5);
  $$('#hudBlocks b').forEach((b, i) => b.classList.toggle('on', i < filled));
  $$('#dots button').forEach((b, i) => b.classList.toggle('on', i === cur));
}
setInterval(() => {
  const s = Math.floor((Date.now() - started) / 1000);
  $('#hudTime').textContent = 'EST. TIME: ' + pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60);
}, 1000);

/* ---------------- сборка сцен ---------------- */
function buildAll() {
  SCENES.forEach((s, i) => {
    const root = el('section', 'scene');
    root.dataset.i = i;
    scenesEl.appendChild(root);
    roots[i] = root;
    refs[i] = s.build(root);
  });
}
function rebuild(i) {
  const root = roots[i];
  if (SCENES[i].stop) SCENES[i].stop(refs[i]);
  root.innerHTML = '';
  root.removeAttribute('style');
  refs[i] = SCENES[i].build(root);
}

/* ---------------- переход к сцене ---------------- */
async function goTo(i) {
  if (i < 0 || i >= SCENES.length) return;
  E.typingSound = false;
  E.deniedAlert = false;
  if (cur >= 0 && SCENES[cur].stop) SCENES[cur].stop(refs[cur]);
  if (i < 3 || i > 8) Snd.stop('music');

  E.token++;
  const token = E.token;
  E.paused = false;
  $('#btnPause').textContent = '❚❚ PAUSE';
  gapEl.classList.toggle('on', i === 9);

  /* Перед годовым обзором сцена уже строится под чёрной шторкой. */
  if (i === 3) {
    gapEl.classList.add('on');
    Snd.play('music');
  }
  rebuild(i);
  roots.forEach((n, k) => n.classList.toggle('active', k === i));
  cur = i;
  updateHUD();
  fit();

  if (i === 3) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (E.token !== token) return;
    gapEl.classList.remove('on');
  }
  if (i === 9) {
    await new Promise(resolve => setTimeout(resolve, 650));
    if (E.token !== token) return;
    gapEl.classList.remove('on');
  }

  const ctx = ctxFor(token);
  try {
    await SCENES[i].play(ctx, refs[i]);
  } catch (e) {
    if (e !== SKIP) console.error(e);
    return;
  }
  if (E.token !== token || !E.autoplay) return;

  /* ТЗ: пауза 7–10 секунд между кадром 9 и кадром 10, музыка затихает */
  if (i === 8) {
    await Snd.fadeOut('music', 2200);
    gapEl.classList.add('on');
    try { await ctx.wait(2000); } catch (e) { gapEl.classList.remove('on'); return; }
    gapEl.classList.remove('on');
  }
  if (E.token !== token) return;
  if (i < SCENES.length - 1) goTo(i + 1);
}

/* ---------------- управление ---------------- */
function initControls() {
  const dots = $('#dots');
  SCENES.forEach((s, i) => {
    const b = el('button', null, pad(i + 1));
    b.title = C.menu[i];
    b.addEventListener('click', () => goTo(i));
    dots.appendChild(b);
  });

  $('#btnPrev').addEventListener('click', () => goTo(cur - 1));
  $('#btnNext').addEventListener('click', () => goTo(cur + 1));
  $('#btnReplay').addEventListener('click', () => goTo(cur));
  $('#btnPause').addEventListener('click', togglePause);

  $('#btnAuto').addEventListener('click', e => {
    E.autoplay = !E.autoplay;
    e.currentTarget.classList.toggle('on', E.autoplay);
    e.currentTarget.textContent = E.autoplay ? 'AUTO: ON' : 'AUTO: OFF';
  });

  $('#btnSpeed').addEventListener('click', e => {
    E.speed = E.speed === 1 ? 1.5 : E.speed === 1.5 ? 2 : 1;
    e.currentTarget.textContent = 'SPEED ' + E.speed + '×';
  });

  $('#btnMode').addEventListener('click', e => {
    const b = document.body.classList.toggle('mode-b');
    e.currentTarget.textContent = 'ANIM: ' + (b ? 'B' : 'A');
    e.currentTarget.title = b
      ? 'Режим B — слайд появляется целиком, объекты по очереди подсвечиваются'
      : 'Режим A — карточки приходят поверх кадра, zoom in, затем встают на место';
  });

  $('#btnCrt').addEventListener('click', e => {
    const off = document.body.classList.toggle('no-crt');
    e.currentTarget.textContent = 'CRT: ' + (off ? 'OFF' : 'ON');
  });

  $('#btnMenu').addEventListener('click', () => $('#menu').classList.add('on'));
  $('#menu').addEventListener('click', e => { if (e.target.id === 'menu') $('#menu').classList.remove('on'); });

  const listEl = $('#menuList');
  C.menu.forEach((m, i) => {
    const b = el('button');
    b.append(el('span', 'n', pad(i + 1)), el('span', null, m));
    b.addEventListener('click', () => { $('#menu').classList.remove('on'); goTo(i); });
    listEl.appendChild(b);
  });

  /* общая кнопка звука из ../assets/audio-control.js — переносим в панель */
  const gTog = document.querySelector('.global-audio-toggle');
  if (gTog) $('#bar').appendChild(gTog);

  $('#win').addEventListener('click', e => { if (e.target.id === 'win') closeWin(); });
  $('#winClose').addEventListener('click', closeWin);

  addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeWin(); $('#menu').classList.remove('on'); return; }
    if (!bootEl.classList.contains('gone')) return;
    if (/^[1-9]$/.test(e.key)) { e.preventDefault(); goTo(Number(e.key) - 1); return; }
    if (e.key === '0') { e.preventDefault(); goTo(9); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(cur + 1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(cur - 1); }
    if (e.code === 'Space')     { e.preventDefault(); togglePause(); }
    if (e.key === 'r' || e.key === 'к') goTo(cur);
  });
}
/* Браузер троттлит таймеры в фоновой вкладке — честно ставим на паузу,
   чтобы кадр не «полз» вместо того, чтобы идти в заданном ритме. */
let pausedByHide = false;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (!E.paused) { pausedByHide = true; togglePause(); }
  } else if (pausedByHide) {
    pausedByHide = false;
    if (E.paused) togglePause();
  }
});

function togglePause() {
  E.paused = !E.paused;
  $('#btnPause').textContent = E.paused ? '▶ RESUME' : '❚❚ PAUSE';
  $('#stage').classList.toggle('is-paused', E.paused);
}

/* ---------------- загрузка «старого компьютера» ---------------- */
const BOOTLOG = [
  'SYS-41 PERSONAL ARCHIVE OS   v41.0',
  'COPYRIGHT (C) 1984',
  '',
  'MEMORY TEST ................. 640K OK',
  'DETECTING STORAGE ........... ARCHIVE FOUND',
  'LOADING KERNEL .............. OK',
];
const BOOTLOG2 = [
  'MOUNTING /memories .......... OK',
  'CALIBRATING CRT ............. OK',
  'ARCHIVE READY...............'
];

async function runBoot() {
  const log = $('#bootLog');
  const ctx = ctxFor(E.token);
  const line = t => { const d = el('div'); log.appendChild(d); return d; };

  for (let i = 0; i < 6; i++) {
    await type(ctx, line(), BOOTLOG[i], 150);
    await ctx.wait(90);
  }
  /* «немного подвисает» — по ТЗ */
  const hangLine = line();
  await type(ctx, hangLine, 'MOUNTING /memories .........', 150);
  bootEl.classList.add('hangs');
  await ctx.wait(1900);
  bootEl.classList.remove('hangs');
  hangLine.classList.add('dim');
  for (const t of BOOTLOG2) { await type(ctx, line(), t, 150); await ctx.wait(90); }

  await ctx.wait(400);
  show($('#startBtn'));
  $('#startBtn').focus();
}

function start() {
  /* разблокировка звука должна происходить внутри пользовательского клика */
  Snd.unlockType();
  $('#startBtn').disabled = true;
  $('#startBtn').textContent = '[ LOADING ARCHIVE ]';
  Snd.play('intro');
  setTimeout(() => {
    Snd.stop('intro');
    bootEl.classList.add('gone');
    $('#flicker').classList.add('on');
    started = Date.now();
    gapEl.classList.add('on');
    setTimeout(() => {
      gapEl.classList.remove('on');
      goTo(0);
    }, 1000);
  }, 8000);
}

/* ---------------- старт ---------------- */
buildAll();
initControls();
fit();
$('#startBtn').addEventListener('click', start);
runBoot().catch(() => {});
