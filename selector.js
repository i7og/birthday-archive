const canvas = document.querySelector('#matrixCanvas');
const ctx = canvas.getContext('2d');
const selector = document.querySelector('#selector');
const choose = document.querySelector('#chooseButton');
const audio = document.querySelector('#sharedAudio');
const reveal = document.querySelector('#revealSound');
const buttons = [...document.querySelectorAll('[data-audio]')];
const glyphs = '01アイウエオカキクケコサシスセソЖДЙФΣλ{}[]<>/';
let cols = [];
let opened = false;

document.querySelector('#prototype3Title').textContent = 'ПРОТОТИП ' + window.PROTO3_VERSION;
document.querySelector('#prototype3Badge').textContent = '0' + window.PROTO3_VERSION;
document.querySelector('#prototype4Title').textContent = 'ПРОТОТИП ' + window.PROTO4_VERSION;
document.querySelector('#prototype4Badge').textContent = '0' + window.PROTO4_VERSION;

function resize() {
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * ratio;
  canvas.height = innerHeight * ratio;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  cols = Array.from({ length: Math.ceil(innerWidth / 18) }, () => Math.random() * -70);
}

function rain() {
  ctx.fillStyle = opened ? 'rgba(1,5,2,.14)' : 'rgba(1,5,2,.09)';
  ctx.fillRect(0, 0, innerWidth, innerHeight);
  ctx.font = '14px monospace';
  cols.forEach((position, index) => {
    ctx.fillStyle = Math.random() > .96 ? '#d5ffe0' : opened ? '#27613a' : '#63ed8c';
    ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], index * 18, position * 18);
    cols[index] = position * 18 > innerHeight && Math.random() > .975
      ? Math.random() * -30
      : position + (opened ? .38 : .72);
  });
  requestAnimationFrame(rain);
}

function open() {
  if (opened) return;
  opened = true;
  selector.classList.add('is-open');
  document.querySelector('#interfaceState').textContent = 'DECRYPTED';
  reveal.currentTime = 0;
  reveal.play().catch(() => {});
}

function play(b) {
  if (audio.dataset.source === b.dataset.audio && !audio.paused) {
    audio.pause();
    reset('PAUSED');
    return;
  }
  reset('LOADING');
  audio.src = b.dataset.audio;
  audio.dataset.source = b.dataset.audio;
  audio.currentTime = 0;
  audio.play().then(() => {
    b.classList.add('is-playing');
    b.querySelector('b').textContent = 'Ⅱ';
    status('PLAYING');
  }).catch(() => status('AUDIO BLOCKED'));
}

function status(t) { document.querySelector('#soundStatus').textContent = t; }
function reset(t) {
  buttons.forEach(b => { b.classList.remove('is-playing'); b.querySelector('b').textContent = '▶'; });
  status(t);
}

choose.addEventListener('click', open);
buttons.forEach(b => b.addEventListener('click', () => play(b)));
audio.addEventListener('ended', () => reset('PLAYBACK COMPLETE'));

addEventListener('resize', resize);
resize();
rain();
