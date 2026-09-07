/* =========================================================================
   SCENES — построение и таймлайн всех 10 кадров
   ========================================================================= */

const C = window.CONTENT;
const NS = 'http://www.w3.org/2000/svg';
const ns = (t, a) => {
  const n = document.createElementNS(NS, t);
  if (a) for (const k in a) n.setAttribute(k, a[k]);
  return n;
};

/* ---------- общие мелкие конструкторы ---------- */

function head(title, opts) {
  const o = opts || {};
  const h = el('div', 'sc-head');
  const left = el('div');
  const t = el('h1', 'sc-title rv' + (o.sm ? ' sm' : ''), title);
  left.appendChild(t);
  let sub = null;
  if (o.sub) { sub = el('div', 'sc-sub rv', o.sub); left.appendChild(sub); }
  h.appendChild(left);
  let quote = null;
  if (o.quote) {
    quote = el('div', 'sc-quote rv');
    o.quote.forEach(l => quote.appendChild(el('div', null, l)));
    h.appendChild(quote);
  }
  const rule = el('div', 'sc-rule');
  return { node: h, rule, t, sub, quote };
}

function list(items, cls) {
  const ul = el('ul', cls);
  items.forEach(i => ul.appendChild(el('li', null, i)));
  return ul;
}

/* динозаврик — пиксельный силуэт, «менее ярко» и мельче по ТЗ */
function dinoNode(note) {
  const d = el('div', 'dino');
  const svg = ns('svg', { viewBox: '0 0 60 50' });
  const R = [
    [2, 22, 14, 8], [14, 20, 26, 18], [34, 12, 10, 12], [38, 4, 16, 12],
    [52, 10, 6, 4], [18, 38, 6, 10], [18, 46, 10, 3], [28, 38, 6, 8],
    [28, 44, 10, 3], [36, 26, 7, 3]
  ];
  R.forEach(r => svg.appendChild(ns('rect', { x: r[0], y: r[1], width: r[2], height: r[3], fill: 'currentColor' })));
  svg.appendChild(ns('rect', { x: 46, y: 7, width: 3, height: 3, fill: '#030d07' }));
  d.appendChild(svg);
  const course = el('div', 'dino-course');
  for (let i = 0; i < 4; i++) course.appendChild(el('i', null, '🌵'));
  d.appendChild(course);
  d.appendChild(el('div', 'dino-note', note));
  d.appendChild(el('div', 'ground'));
  return d;
}

/* ---------- коллаж для блока FRIENDSHIP ---------- */
function collageSlot(base, n, title) {
  const box = el('div', 'photo has-img');
  const grid = el('div', 's5-collage');
  for (let i = 1; i <= n; i++) {
    const cell = el('div');
    const cfg = { src: base + '-' + i + '.jpg', title: title + ' ' + i, label: 'PHOTO ' + i };
    const img = el('img');
    img.alt = cfg.title;
    img.addEventListener('error', () => { img.remove(); cell.classList.add('miss'); });
    img.src = cfg.src;
    const ph = el('div', 'ph', 'PHOTO ' + i);
    cell.append(img, ph);
    cell.addEventListener('click', e => { e.stopPropagation(); openWin(cfg); });
    grid.appendChild(cell);
  }
  box.appendChild(grid);
  return box;
}

/* ---------- синий человечек Optimus Poker (запасной вектор) ---------- */
function optimusLogo(src) {
  const w = el('div', 's5-logo');
  const img = el('img');
  img.alt = 'Optimus Poker';
  img.addEventListener('error', () => {
    img.remove();
    const svg = ns('svg', { viewBox: '0 0 40 40' });
    svg.appendChild(ns('circle', { cx: 20, cy: 12, r: 7, fill: 'var(--blue)' }));
    const p = ns('path', { d: 'M6 38c0-8 6.3-13 14-13s14 5 14 13z', fill: 'var(--blue)' });
    svg.appendChild(p);
    w.appendChild(svg);
  });
  img.src = src;
  w.appendChild(img);
  return w;
}

/* =========================================================================
   КАДР 1
   ========================================================================= */
const SC1 = {
  hud: C.s1.boot,
  build(root) {
    root.className = 'scene s-boot';
    const term = el('div', 'term');
    const lines = C.s1.lines.map(() => {
      const d = el('div', 'ln');
      term.appendChild(d);
      return d;
    });
    const load = el('div', 's1-load');
    const lbl = el('div', 'dim rv', C.s1.loadLabel);
    const bar = makeBar('', 44);
    load.append(lbl, bar);
    root.append(term, load);
    return { lines, bar, lbl, load };
  },
  async play(ctx, r) {
    E.typingSound = true;
    E.typingProfile = 0;
    for (let i = 0; i < C.s1.lines.length; i++) {
      const L = C.s1.lines[i];
      await typeVerdict(ctx, r.lines[i], L.t, L.v);
      await ctx.wait(L.v === 'DENIED' ? 560 : 170);
    }
    await ctx.wait(320);
    show(r.load);
    show(r.lbl);
    await ctx.wait(260);
    await runBar(ctx, r.bar, C.s1.loadTo, 2300);
    await ctx.wait(1100);
    E.typingSound = false;
  }
};

/* =========================================================================
   КАДР 2
   ========================================================================= */
const SC2 = {
  hud: C.s2.boot,
  build(root) {
    root.className = 'scene s-boot';
    const term = el('div', 'term');
    const broken = el('div', 'ln');
    term.appendChild(broken);
    const lines = C.s2.lines.map(() => { const d = el('div', 'ln'); term.appendChild(d); return d; });
    const observer = el('div', 's2-observer');
    term.appendChild(observer);
    const lines2 = C.s2.lines2.map(() => { const d = el('div', 'ln'); term.appendChild(d); return d; });
    const mission = el('div', 's2-mission');
    term.appendChild(mission);
    const lines3 = C.s2.lines3.map(() => { const d = el('div', 'ln'); term.appendChild(d); return d; });
    const prompt = el('div', 'ln');
    term.appendChild(prompt);
    const warn = el('div', 's2-warn rv');
    warn.appendChild(el('span', null, '[ ! ] ' + C.s2.warn));
    root.append(term, warn);
    return { broken, lines, observer, lines2, mission, lines3, prompt, warn };
  },
  async play(ctx, r) {
    E.typingSound = true;
    E.deniedAlert = true;
    E.typingProfile = 0;
    await typeVerdict(ctx, r.broken, C.s2.broken, 'DENIED');
    await ctx.wait(700);
    /* «чиним» строку */
    for (let i = 0; i < 6; i++) { r.broken.style.opacity = i % 2 ? '.12' : '1'; await ctx.wait(95); }
    r.broken.style.opacity = '1';
    r.broken.textContent = '';
    await typeVerdict(ctx, r.broken, C.s2.fixed, 'ACCEPTED');
    await ctx.wait(430);

    for (let i = 0; i < C.s2.lines.length; i++) {
      await type(ctx, r.lines[i], '> ' + C.s2.lines[i], 62);
      await ctx.wait(150);
    }
    await ctx.wait(420);
    await type(ctx, r.observer, C.s2.observer, 22);
    await ctx.wait(320);
    for (let i = 0; i < C.s2.lines2.length; i++) {
      await type(ctx, r.lines2[i], '> ' + C.s2.lines2[i], 62);
      await ctx.wait(140);
    }
    await type(ctx, r.mission, C.s2.mission, 26);
    r.mission.classList.add('flash');
    await ctx.wait(900);
    for (let i = 0; i < C.s2.lines3.length; i++) {
      await type(ctx, r.lines3[i], '> ' + C.s2.lines3[i], 55);
      await ctx.wait(160);
    }
    show(r.warn);
    await type(ctx, r.prompt, '> ' + C.s2.prompt, 40);
    r.prompt.appendChild(el('span', 'caret'));
    await ctx.wait(1400);
    E.typingSound = false;
    E.deniedAlert = false;
  }
};

/* =========================================================================
   КАДР 3
   ========================================================================= */
const SC3 = {
  hud: C.s3.boot,
  build(root) {
    root.className = 'scene';
    const grid = el('div', 's3-grid');

    const left = el('div');
    const rows = el('div', 's3-rows');
    const rowNodes = C.s3.rows.map(() => {
      const d = el('div', 'ln');
      const k = el('span', 'k');
      const v = el('span', 'v');
      d.append(k, v);
      rows.appendChild(d);
      return { k, v };
    });
    const sys = el('div', 's3-sys');
    const sysNodes = C.s3.sysLines.map(() => { const d = el('div'); sys.appendChild(d); return d; });
    const alert = el('div', 's3-alert', C.s3.alert);
    left.append(rows, sys, alert);

    const right = el('div');
    const scanbox = el('div', 'scanbox rv');
    const photo = photoSlot(C.s3.photo, 's3-photo');
    scanbox.append(photo, el('div', 'scanline'));
    const cap = el('div', 's3-cap rv', C.s3.scanCaption);
    right.append(scanbox, cap);

    grid.append(left, right);
    const dino = dinoNode(C.s3.dinoNote);
    root.append(grid, dino);
    return { rowNodes, sysNodes, alert, scanbox, cap, dino };
  },
  async play(ctx, r) {
    show(r.dino);
    E.typingSound = true;
    E.typingProfile = 0;
    for (let i = 0; i < C.s3.rows.length; i++) {
      const [k, v] = C.s3.rows[i];
      await type(ctx, r.rowNodes[i].k, k + ': ', 90);
      await type(ctx, r.rowNodes[i].v, v, 55);
      await ctx.wait(170);
    }
    await ctx.wait(340);
    for (let i = 0; i < C.s3.sysLines.length; i++) {
      await type(ctx, r.sysNodes[i], '> ' + C.s3.sysLines[i], 110);
      await ctx.wait(180);
    }
    await ctx.wait(300);
    E.typingSound = false;
    show(r.alert);
    Snd.alert();
    r.alert.classList.add('triple-flash');
    await ctx.wait(900);
    show(r.scanbox);
    r.scanbox.classList.add('photo-reveal');
    await ctx.wait(900);
    Snd.play('scan');
    r.scanbox.classList.add('scanning');
    await ctx.wait(4600);
    show(r.cap);
  }
};

/* =========================================================================
   КАДР 4 — планер
   ========================================================================= */
function monthCard(m) {
  const c = el('article', 'card mcard' + (m.gap ? ' mcard--gap' : ''));
  if (m.photoOnly) {
    c.classList.add('mcard--photo-only');
    c.appendChild(photoSlot(m.photo, 'm-photo'));
    c._bars = [];
    c._words = [];
    return c;
  }
  const top = el('div', 'm-top');
  top.append(el('span', 'n', m.n + '.'), el('span', null, m.m));
  c.appendChild(top);
  if (m.ribbon) c.appendChild(el('span', 'ribbon', m.ribbon));

  const h = el('div', 'm-head');
  h.append(el('span', 'ic', m.icon), el('span', null, m.head));
  c.appendChild(h);
  c.appendChild(list(m.body));

  c._bars = [];
  if (m.bar) { const b = makeBar(m.bar.label, 18, 'sm'); c.appendChild(b); c._bars.push([b, m.bar.to]); }
  if (m.bar2) { const b = makeBar(m.bar2.label, 18, 'sm'); c.appendChild(b); c._bars.push([b, m.bar2.to]); }
  if (m.body2) c.appendChild(list(m.body2));

  if (m.loaders) {
    const box = el('div', 'loaders');
    c._loaders = m.loaders.map(name => {
      const d = el('div');
      d.appendChild(el('span', null, name + ': '));
      const b = el('b', null, '…');
      d.appendChild(b);
      box.appendChild(d);
      return b;
    });
    c.appendChild(box);
  }
  if (m.lock) {
    const l = el('div', 'lock', m.lock.from);
    c.appendChild(l);
    c._lock = [l, m.lock.to];
  }
  if (m.photo) c.appendChild(photoSlot(m.photo, 'm-photo'));
  if (m.sub) {
    const s = el('div', 'm-sub');
    s.appendChild(el('div', 'sh', m.sub.head));
    s.appendChild(list(m.sub.body));
    if (m.sub.lock) s.appendChild(el('div', 'lock un', m.sub.lock));
    c.appendChild(s);
  }
  if (m.quote) c.appendChild(el('div', 'm-quote', m.quote));

  /* текст карточки выводится по словам, когда она встала на место */
  c._words = wordifyAll(c, '.m-head span:last-child, ul li, .m-sub .sh, .m-quote');
  return c;
}

const SC4 = {
  hud: 'SCENE 04',
  build(root) {
    root.className = 'scene';
    const H = head(C.s4.title);
    const meta = el('div', 's4-meta rv');
    C.s4.meta.forEach(m => meta.appendChild(el('span', null, m)));

    const notes = el('div', 's4-notes');
    const noteA = el('div', 's4-note s4-note--a', '↘ ' + C.s4.noteA);
    const noteB = el('div', 's4-note s4-note--b', '↘ ' + C.s4.noteB);
    notes.append(noteA, noteB);

    const grid = el('div', 's4-grid');
    const cards = C.s4.months.map(m => { const c = monthCard(m); grid.appendChild(c); return c; });

    const foot = el('div', 's4-foot rv', C.s4.footer);
    root.append(H.node, H.rule, meta, notes, grid, foot);
    return { H, meta, noteA, noteB, cards, foot };
  },
  async play(ctx, r) {
    await type(ctx, r.H.t, C.s4.title, 28); show(r.H.rule);
    await ctx.wait(1300);
    show(r.meta);
    await ctx.wait(520);
    for (let i = 0; i < r.cards.length; i++) {
      const c = r.cards[i];
      c.classList.add('enter');
      await ctx.wait(620);
      c.classList.remove('enter');
      c.classList.add('settle');
      await ctx.wait(260);

      await revealWords(ctx, c._words, 300);
      for (const [bar, to] of (c._bars || [])) await runBar(ctx, bar, to, 900);
      if (c._loaders) {
        for (const b of c._loaders) { b.textContent = 'LOADING'; await ctx.wait(150); }
      }
      if (c._lock) {
        await ctx.wait(200);
        c._lock[0].textContent = c._lock[1];
        c._lock[0].classList.add('un');
      }
      if (i === 1) { show(r.noteA); await ctx.wait(520); }
      if (i === 3) {
        show(r.noteB);
        await ctx.wait(180);
      }
      await ctx.wait(130);
    }
    if (C.s4.footer) show(r.foot);
    await ctx.wait(1600);
  }
};

/* =========================================================================
   КАДР 5
   ========================================================================= */
const SC5 = {
  hud: 'SCENE 05',
  build(root) {
    root.className = 'scene';
    const H = head(C.s5.title, { quote: C.s5.quote });
    const grid = el('div', 's5-grid');
    const blocks = C.s5.blocks.map(b => {
      const w = el('div', 'card s5-block s5-' + b.key.toLowerCase());
      w.appendChild(el('div', 'k', b.key));
      const ph = b.collage
        ? collageSlot('photos/s5-friends', 3, 'FRIENDS')
        : photoSlot({ src: b.src, title: b.key, label: 'PHOTO / SCAN' });
      if (b.logo) ph.appendChild(optimusLogo(b.logo));
      w.appendChild(ph);
      const cap = el('div', 'cap', b.caption);
      w.appendChild(cap);
      w._words = wordify(cap);
      grid.appendChild(w);
      return w;
    });

    const sum = el('div', 's5-summary rv');
    sum.appendChild(el('div', 'ico', '👥'));
    const txt = el('div', 'txt');
    C.s5.summary.forEach(l => txt.appendChild(el('div', null, l)));
    const bar = makeBar('', 30);
    sum.append(txt, bar);

    const foot = el('div', 's5-foot rv', C.s5.footer);
    root.append(H.node, H.rule, grid, sum, foot);
    return { H, blocks, sum, bar, foot };
  },
  async play(ctx, r) {
    await type(ctx, r.H.t, C.s5.title, 28); show(r.H.rule);
    await ctx.wait(700);
    show(r.H.quote);
    await ctx.wait(2000);
    for (const b of r.blocks) {
      b.classList.add('enter');
      await ctx.wait(850);
      b.classList.remove('enter');
      b.classList.add('settle');
      await revealWords(ctx, b._words, 180);
      await ctx.wait(2000);
    }
    await ctx.wait(300);
    show(r.sum);
    await ctx.wait(400);
    await runBar(ctx, r.bar, 100, 1500);
    if (C.s5.footer) show(r.foot);
    await ctx.wait(1500);
  }
};

/* =========================================================================
   КАДР 6 — карта
   ========================================================================= */
const ANDALUCIA =
  'M63,264 L94,228 L117,180 L140,147 L193,165 L239,147 L293,108 L377,121 L431,85 ' +
  'L492,55 L554,49 L615,72 L676,76 L738,85 L784,67 L830,76 L868,112 L914,157 ' +
  'L952,201 L929,255 L883,291 L906,336 L929,363 L883,390 L822,393 L760,408 ' +
  'L699,413 L638,411 L577,413 L528,415 L493,434 L455,456 L417,488 L386,515 ' +
  'L348,510 L302,497 L256,470 L241,425 L226,380 L172,353 L126,344 L73,327 Z';

function pinNode(p, s) {
  const k = s || 1;
  const g = ns('g', {
    class: 'pin' + (p.hot ? ' hot' : '') + (p.city ? ' city' : ''),
    transform: 'translate(' + p.x + ',' + p.y + ')'
  });
  const anim = ns('g', { class: 'pin-anim' });   // без transform-атрибута: его анимирует CSS
  const box = ns('g', { transform: 'scale(' + k + ')' });

  box.appendChild(ns('path', { d: 'M0,0 C-9,-13 -13,-19 -13,-25 A13,13 0 1 1 13,-25 C13,-19 9,-13 0,0 Z' }));
  box.appendChild(ns('circle', { cx: 0, cy: -25, r: 4.5, fill: '#030d07' }));

  const w = p.name.length * 9.2 + 16;
  let x, y;
  if (p.labelOffset) {
    /* подпись вынесена в сторону от маркера (например, у плотной группы точек) —
       маркер остаётся на точной географической позиции, к подписи ведёт leader line */
    x = p.labelOffset.dx;
    y = p.labelOffset.dy;
    box.appendChild(ns('path', { class: 'leader', d: 'M0,-25 L' + (x + w / 2) + ',' + (y + 12) }));
  } else {
    x = p.side === 'left' ? -(w + 16) : 16;
    y = -12;
  }
  box.appendChild(ns('rect', { x: x, y: y, width: w, height: 24 }));
  const t = ns('text', { x: x + 8, y: y + 17 });
  t.textContent = p.name;
  box.appendChild(t);

  anim.appendChild(box);
  g.appendChild(anim);
  return g;
}

const SC6 = {
  hud: 'SCENE 06',
  build(root) {
    root.className = 'scene';
    const H = head(C.s6.title);
    const grid = el('div', 's6-grid');

    const map = el('div', 'mapbox');
    const regionLbl = el('div', 'lbl lbl-region rv', C.s6.region);
    map.appendChild(regionLbl);
    const svg = ns('svg', { viewBox: '0 0 1000 600', preserveAspectRatio: 'xMidYMid meet' });
    const outline = ns('path', { class: 'outline', d: ANDALUCIA, pathLength: 1000 });
    svg.appendChild(outline);
    const pinsG = ns('g');
    svg.appendChild(pinsG);
    const pins = C.s6.pins.map(p => { const n = pinNode(p); pinsG.appendChild(n); return n; });
    const cityPin = pinNode(Object.assign({ city: true, side: 'left' }, C.s6.malaga));
    pinsG.appendChild(cityPin);
    map.appendChild(svg);

    const side = el('div', 's6-side');
    const zoom = el('div', 'mapbox mapbox--zoomin');
    zoom.appendChild(el('div', 'lbl', C.s6.zoomTitle));
    /* native viewBox исходника (photos/s6-malaga-source.png, 1564×1006) —
       preserveAspectRatio:xMidYMid meet, карта не должна растягиваться.
       Base — тот же кадр БЕЗ пяти POI (см. content.js/zoomPins); каждый
       POI — готовый растровый слой pin+label, вырезанный из исходника в
       ЕГО ЖЕ координатах, поэтому ложится поверх base без подгонки */
    const zsvg = ns('svg', { viewBox: '0 0 1564 1006', preserveAspectRatio: 'xMidYMid meet' });
    const zoutline = ns('image', {
      class: 'malaga-map-base', href: 'photos/s6-malaga-base.png',
      x: 0, y: 0, width: 1564, height: 1006
    });
    zsvg.appendChild(zoutline);
    const zpins = C.s6.zoomPins.map(p => {
      const g = ns('g', { class: 'malaga-poi' });
      g.appendChild(ns('image', { href: p.src, x: p.x, y: p.y, width: p.width, height: p.height }));
      zsvg.appendChild(g);
      return g;
    });
    zoom.appendChild(zsvg);

    const status = el('div', 's6-panel rv');
    status.appendChild(el('div', 'h', 'EXPLORATION'));
    C.s6.status.forEach(l => status.appendChild(el('div', null, l)));

    const sum = el('div', 's6-panel rv');
    sum.appendChild(el('div', 'h', 'SUMMARY'));
    C.s6.summary.forEach(l => sum.appendChild(el('div', null, l)));

    const hot = el('div', 's6-panel s6-hot rv');
    hot.appendChild(el('div', 't', C.s6.highlight[0]));
    hot.appendChild(el('div', null, C.s6.highlight[1]));

    side.append(zoom, status, sum, hot);
    grid.append(map, side);
    root.append(H.node, H.rule, grid);
    return { H, regionLbl, outline, pins, cityPin, zoom, zoutline, zpins, status, sum, hot };
  },
  async play(ctx, r) {
    await type(ctx, r.H.t, C.s6.title, 23); show(r.H.rule);
    await ctx.wait(1200);
    show(r.regionLbl);
    await ctx.wait(1320);
    r.outline.classList.add('draw');
    await ctx.wait(2640);
    show(r.cityPin); Snd.play('blip'); await ctx.wait(1080);
    for (const p of r.pins) { show(p); Snd.play('blip'); await ctx.wait(936); }
    await ctx.wait(600);
    /* «подъезжаем» камерой к точке MÁLAGA перед тем, как открыть карту города */
    r.cityPin.classList.add('approach');
    await ctx.wait(840);
    show(r.zoom);
    r.cityPin.classList.remove('approach');
    await ctx.wait(1080);
    r.zoutline.classList.add('draw');
    await ctx.wait(1200);
    for (const p of r.zpins) { show(p); await ctx.wait(744); }
    await ctx.wait(480);
    await showSeq(ctx, [r.status, r.sum, r.hot], 624);
    await ctx.wait(1800);
  }
};

/* нижний HUD-футер слайда 7:
   [ RICK & MORTY VISUAL ] — [ DATA STREAM / HUD ] — [ LEGACY STATUS ] */
function rmVisual() {
  const box = el('div', 's7-rm rv');
  const img = el('img');
  img.src = 'photos/s7-rickandmorty.png';
  img.alt = 'Rick & Morty';
  box.appendChild(img);
  return box;
}
function streamLine() {
  const svg = ns('svg', { class: 's7-stream-line', viewBox: '0 0 600 12', preserveAspectRatio: 'none' });
  svg.appendChild(ns('path', { d: 'M0,6 L600,6', pathLength: 1000 }));
  return svg;
}
function streamFx() {
  const wrap = el('div', 's7-stream-fx');
  const wave = el('div', 's7-wave');
  for (let i = 0; i < 26; i++) wave.appendChild(el('i'));
  const markers = el('div', 's7-markers blocks');
  for (let i = 0; i < 6; i++) markers.appendChild(el('b', i < 4 ? 'on' : null));
  wrap.append(wave, markers);
  return wrap;
}
function legacyPanel() {
  const box = el('div', 's7-legacy rv');
  const h = el('div', 's7-legacy-h', C.s7.legacy.title);
  const rows = C.s7.legacy.lines.map(l => el('div', 's7-legacy-row rv', l));
  const bar = makeBar('', 16, 'sm');
  box.append(h, ...rows, bar);
  return { box, rows, bar };
}

/* =========================================================================
   КАДР 7
   ========================================================================= */
const SC7 = {
  hud: 'SCENE 07',
  build(root) {
    root.className = 'scene';
    const H = head(C.s7.title, { sub: C.s7.sub });
    const grid = el('div', 's7-grid');

    const cards = [];
    C.s7.blocks.forEach((b, i) => {
      const c = el('article', 'card fcard');
      const h = el('div', 'h');
      h.append(el('span', 'n', b.n), el('span', null, b.t));
      c.append(h, list(b.items));
      c._words = wordifyAll(c, '.h span:last-child, ul li');
      grid.appendChild(c);
      cards.push(c);
    });

    const rm = rmVisual();
    const sLine = streamLine();
    const fx = streamFx();
    const legacy = legacyPanel();
    const stream = el('div', 's7-stream');
    stream.append(sLine, fx);
    const footer = el('div', 's7-footer');
    footer.append(rm, stream, legacy.box);
    const opinion = el('div', 's7-opinion rv', C.s7.opinion);
    cards[3].appendChild(opinion);
    const foot = el('div', 's7-foot');
    const note = el('div', 's7-note rv');
    C.s7.footnote.forEach(l => note.appendChild(el('span', null, l)));
    const ver = el('div', 's7-note rv', C.s7.version);
    foot.append(note, ver);
    root.append(H.node, H.rule, grid, footer, foot);
    return { H, cards, opinion, note, ver, rm, sLine, fx, legacy };
  },
  async play(ctx, r) {
    await type(ctx, r.H.t, C.s7.title, 28); show(r.H.rule);
    await ctx.wait(500);
    await type(ctx, r.H.sub, C.s7.sub, 32);
    await ctx.wait(700);
    for (const c of r.cards) {
      c.classList.add('enter');
      await ctx.wait(650);
      c.classList.remove('enter');
      c.classList.add('settle');
      if (c._words) await revealWords(ctx, c._words, 300);
      await ctx.wait(750);
    }
    await ctx.wait(400);
    show(r.opinion);
    await ctx.wait(500);
    /* 1. HUD/data-stream линия */
    show(r.sLine);
    await ctx.wait(700);
    /* 2. Rick & Morty visual */
    show(r.rm);
    await ctx.wait(650);
    /* 3. waveform / digital-элементы */
    show(r.fx);
    await ctx.wait(700);
    /* 4. LEGACY STATUS появляется */
    show(r.legacy.box);
    await ctx.wait(400);
    /* 5. строки внутри LEGACY STATUS */
    await showSeq(ctx, r.legacy.rows, 260);
    await ctx.wait(300);
    /* 6. progress bar заполняется последним */
    await runBar(ctx, r.legacy.bar, 100, 1300);
    await ctx.wait(400);
    show(r.note); show(r.ver);
    await ctx.wait(1600);
  }
};

/* =========================================================================
   КАДР 8
   ========================================================================= */
const SC8 = {
  hud: 'SCENE 08',
  build(root) {
    root.className = 'scene s8';
    const H = head(C.s8.title, { sub: C.s8.sub });
    const grid = el('div', 's8-grid');

    const mk = t => {
      const c = el('article', 'card tcard');
      const h = el('div', 'h');
      h.append(el('span', null, t.i), el('span', null, t.t));
      c.append(h, el('div', 'd', t.d));
      c._words = wordifyAll(c, '.h span:last-child, .d');
      return c;
    };
    const colL = el('div', 's8-col');
    const colR = el('div', 's8-col');
    const cardsL = C.s8.traits.slice(0, 4).map(t => { const c = mk(t); colL.appendChild(c); return c; });
    const cardsR = C.s8.traits.slice(4).map(t => { const c = mk(t); colR.appendChild(c); return c; });

    /* оригинальная фотография — по центру слайда, между колонками карточек */
    const center = el('div', 's8-center');
    const photo = photoSlot(C.s8.photo, 's8-photo card');
    center.appendChild(photo);

    /* дополнительный текст (без рамок) — продолжает левую колонку под
       карточками 01-04, свободное terminal-текст на фоне, без карточек */
    const status = el('div', 'sc-sub rv', C.s8.status);
    const dev = el('div', 's8-dev rv', C.s8.centerTop);
    const ring = el('div', 'ring rv');
    const rsvg = ns('svg', { viewBox: '0 0 132 132', width: 132, height: 132 });
    rsvg.appendChild(ns('circle', { class: 'bg', cx: 66, cy: 66, r: 58 }));
    const fg = ns('circle', { class: 'fg', cx: 66, cy: 66, r: 58 });
    const CIRC = 2 * Math.PI * 58;
    fg.setAttribute('stroke-dasharray', CIRC);
    fg.setAttribute('stroke-dashoffset', CIRC);
    rsvg.appendChild(fg);
    const num = el('div', 'num', '0%');
    ring.append(rsvg, num);
    const scoreLbl = el('div', 'sc-sub rv', C.s8.score);
    const scoreBox = el('div', 's8-scorebox');
    scoreBox.append(ring, scoreLbl);
    const extraL = el('div', 's8-extra');
    extraL.append(status, dev, scoreBox);
    colL.appendChild(extraL);

    /* дополнительный текст (без рамок) — продолжает правую колонку под
       карточками 05-08 */
    const log = el('div', 's8-log');
    const logNodes = C.s8.centerLog.map(() => { const d = el('div'); log.appendChild(d); return d; });
    const mid = el('div', 's8-mid rv');
    C.s8.centerMid.forEach(l => mid.appendChild(el('div', null, l)));
    const st = el('div', 's8-status rv', C.s8.centerStatus);
    const note = el('div', 's8-note rv');
    C.s8.note.forEach(l => note.appendChild(el('div', null, l)));
    const secret = el('div', 's8-secret rv');
    secret.appendChild(el('b', null, C.s8.secret[0]));
    secret.appendChild(el('div', null, C.s8.secret[1]));
    secret.appendChild(el('div', null, C.s8.secret[2]));
    const extraR = el('div', 's8-extra');
    extraR.append(log, mid, st, note, secret);
    colR.appendChild(extraR);

    grid.append(colL, center, colR);
    root.append(H.node, H.rule, grid);
    return { H, cardsL, cardsR, photo, status, dev, logNodes, mid, st, ring, fg, num, CIRC, scoreLbl, note, secret };
  },
  async play(ctx, r) {
    await type(ctx, r.H.t, C.s8.title, 28); show(r.H.rule);
    await ctx.wait(520);
    show(r.H.sub);
    await ctx.wait(1100);
    r.photo.classList.add('enter');
    await ctx.wait(400);
    r.photo.classList.remove('enter');
    r.photo.classList.add('settle');
    await ctx.wait(260);

    /* карточки чередуются: слева — справа */
    const inter = [];
    for (let i = 0; i < 4; i++) { inter.push(r.cardsL[i]); inter.push(r.cardsR[i]); }
    for (const c of inter) {
      c.classList.add('enter');
      await ctx.wait(620);
      c.classList.remove('enter');
      c.classList.add('settle');
      if (c._words) await revealWords(ctx, c._words, 300);
      await ctx.wait(420);
    }

    /* дополнительный текст без рамок — только теперь, когда весь текст
       во всех карточках 01-08 полностью вышел */
    show(r.status);
    await ctx.wait(360);
    await ctx.wait(300);
    show(r.dev);
    await ctx.wait(300);
    for (const n of r.logNodes) {
      await type(ctx, n, '> ' + C.s8.centerLog[r.logNodes.indexOf(n)], 90);
      await ctx.wait(120);
    }
    show(r.mid);
    await ctx.wait(500);
    show(r.st);
    await ctx.wait(400);
    show(r.ring); show(r.scoreLbl);
    r.fg.style.transition = 'stroke-dashoffset 1.8s ease';
    r.fg.setAttribute('stroke-dashoffset', 0);
    await countTo(ctx, r.num, 100, 1800, '', '%');
    await ctx.wait(400);
    show(r.note);
    await ctx.wait(900);
    show(r.secret);
    await ctx.wait(2200);
  }
};

/* =========================================================================
   КАДР 9
   ========================================================================= */
function trendNode(t, labels) {
  const w = el('div', 'trend');
  const th = el('div', 'th');
  th.append(el('span', null, t.i + ' ' + t.name), el('span', 'tag', t.tag || ''));
  w.appendChild(th);

  const svg = ns('svg', { viewBox: '0 0 300 52', preserveAspectRatio: 'none' });
  svg.appendChild(ns('path', { class: 'axis', d: 'M2,48 L298,48' }));
  const pts = t.data.map((v, i) => [4 + i * (292 / 11), 48 - (v / 100) * 42]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  svg.appendChild(ns('path', { class: 'areaP', d: d + ' L296,48 L4,48 Z' }));
  const line = ns('path', { class: 'lineP', d: d });
  svg.appendChild(line);
  w.appendChild(svg);

  const months = el('div', 's9-months');
  labels.forEach(l => months.appendChild(el('span', null, l)));
  w.appendChild(months);
  return w;
}

const SC9 = {
  hud: 'SCENE 09',
  build(root) {
    root.className = 'scene';
    const H = head(C.s9.title);
    const grid = el('div', 's9-grid');

    /* левая колонка — тренды */
    const left = el('div', 's9-panel');
    const trendsTitle = el('div', 'ph rv strong', C.s9.trendsTitle);
    left.appendChild(trendsTitle);
    const trends = C.s9.trends.map(t => { const n = trendNode(t, C.s9.monthLabels); left.appendChild(n); return n; });
    const shift = el('div', 's9-shift rv', C.s9.shift);
    left.appendChild(shift);

    /* правая колонка — цифры */
    const right = el('div', 's9-panel');
    const statsTitle = el('div', 'ph rv strong', C.s9.statsTitle);
    right.appendChild(statsTitle);
    const stats = C.s9.stats.map(s => {
      const row = el('div', 'statrow rv');
      row.append(el('span', 'l', s.label), el('span', 'dots'));
      const v = el('span', 'v', s.raw != null ? s.raw : '0');
      row.appendChild(v);
      right.appendChild(row);
      return { row, v, s };
    });

    const coffee = el('div', 'coffee rv');
    coffee.appendChild(el('div', 'cl', C.s9.coffee.label));
    const cv = el('div', 'cv', '0');
    coffee.appendChild(cv);
    coffee.appendChild(el('div', 'cu', C.s9.coffee.unit));
    const calert = el('div', 'alert', '⚠ ' + C.s9.coffee.alert);
    coffee.appendChild(calert);
    right.appendChild(coffee);

    const repairsTitle = el('div', 'ph rv strong', C.s9.repairsTitle);
    right.appendChild(repairsTitle);
    const repairs = C.s9.repairs.map(x => {
      const row = el('div', 'statrow rv');
      row.append(el('span', 'l', x.i + ' ' + x.label), el('span', 'dots'), el('span', 'v', x.v));
      right.appendChild(row);
      return row;
    });

    grid.append(left, right);

    const foot = el('div', 's9-foot rv');
    const footText = el('div', 's9-foot-tx');
    C.s9.footnote.forEach(l => footText.appendChild(el('div', null, l)));
    const bar = makeBar(C.s9.progress.label, 40, 'sm');
    foot.append(footText, bar);

    root.append(H.node, H.rule, grid, foot);
    return { H, trendsTitle, statsTitle, repairsTitle, trends, shift, stats, cv, calert, repairs, foot, bar };
  },
  async play(ctx, r) {
    await type(ctx, r.H.t, C.s9.title, 28); show(r.H.rule);
    await ctx.wait(400);
    show(r.trendsTitle);
    await ctx.wait(500);
    for (const t of r.trends) { t.classList.add('in'); await ctx.wait(2700); }
    await ctx.wait(300);
    show(r.shift);
    await ctx.wait(2000);

    show(r.statsTitle);
    await ctx.wait(600);
    for (const st of r.stats) {
      show(st.row);
      if (st.s.raw == null) {
        await countTo(ctx, st.v, st.s.value, st.s.value > 1000 ? 1440 : 780, st.s.prefix || '', st.s.suffix || '');
      }
      await ctx.wait(600);
    }
    await ctx.wait(360);
    show(r.cv.parentNode);
    await countTo(ctx, r.cv, C.s9.coffee.value, 2160);
    show(r.calert);
    await ctx.wait(840);
    show(r.repairsTitle);
    await ctx.wait(540);
    await showSeq(ctx, r.repairs, 540);
    await ctx.wait(480);
    show(r.foot);
    await runBar(ctx, r.bar, C.s9.progress.to, 1920);
    await ctx.wait(1680);
  }
};

/* =========================================================================
   КАДР 10
   ========================================================================= */
const SC10 = {
  hud: C.s10.boot,
  build(root) {
    root.className = 'scene s10';
    const wrap = el('div', 's10-wrap');

    const arch = el('div', 's10-arch rv');
    C.s10.head.forEach(l => arch.appendChild(el('div', 'big', l)));
    C.s10.period.forEach(kv => {
      const row = el('div', 'kv');
      row.append(el('span', null, kv[0]), el('b', null, kv[1]));
      arch.appendChild(row);
    });
    const hlT = el('div', 'ph rv', C.s10.highlightsTitle);
    const hl = el('div', 's10-hl');
    const hlNodes = C.s10.highlights.map(h => { const d = el('div', 'rv', h); hl.appendChild(d); return d; });
    const saved = el('div', 's10-saved');
    const savedNodes = C.s10.saved.map(s => { const d = el('div', 'rv', s); saved.appendChild(d); return d; });
    const thanks = el('div', 's10-thanks rv', C.s10.thanks);
    arch.append(hlT, hl, saved, thanks);

    const term = el('div', 's10-term');
    const promptNodes = C.s10.prompt.map(() => { const d = el('div', 'ln'); term.appendChild(d); return d; });
    const bar = makeBar(C.s10.installLabel, 40, 'rv');
    const sysNodes = C.s10.systems.map(() => { const d = el('div', 'ln'); term.appendChild(d); return d; });
    const logNodes = C.s10.installLog.map(() => { const d = el('div', 'ln'); term.appendChild(d); return d; });
    term.appendChild(bar);
    const done = el('div', 's10-dev rv', C.s10.done);
    term.appendChild(done);

    wrap.append(arch, term);

    const hbd = el('div', 's10-hbd rv', C.s10.hbd);
    const wish = el('div', 's10-wish');
    const wishNodes = C.s10.wishes.map(w => { const d = el('div', 'rv', w); wish.appendChild(d); return d; });
    const tail = el('div', 's10-tail rv');
    C.s10.tail.forEach(t => tail.appendChild(el('div', null, t)));

    const fw = el('canvas');
    fw.id = 'fireworks';

    root.append(wrap, hbd, wish, tail, fw);
    return { arch, hlT, hlNodes, savedNodes, thanks, promptNodes, bar, sysNodes, logNodes, done, hbd, wishNodes, tail, fw };
  },
  async play(ctx, r) {
    Snd.play('outro');
    show(r.arch);
    await ctx.wait(900);
    show(r.hlT);
    await showSeq(ctx, r.hlNodes, 260);
    await ctx.wait(300);
    await showSeq(ctx, r.savedNodes, 300);
    await ctx.wait(400);
    show(r.thanks);
    await ctx.wait(900);

    E.typingSound = true;
    E.typingProfile = 0;
    for (let i = 0; i < C.s10.prompt.length; i++) {
      await type(ctx, r.promptNodes[i], C.s10.prompt[i], 40);
      await ctx.wait(400);
    }
    for (let i = 0; i < C.s10.systems.length; i++) {
      await type(ctx, r.sysNodes[i], C.s10.systems[i], 90);
      await ctx.wait(130);
    }
    await ctx.wait(300);
    for (let i = 0; i < C.s10.installLog.length; i++) {
      await type(ctx, r.logNodes[i], '> ' + C.s10.installLog[i], 62);
      await ctx.wait(220);
    }
    E.typingSound = false;
    await ctx.wait(300);
    show(r.bar);
    await ctx.wait(400);
    await runBar(ctx, r.bar, 100, 2400);

    /* Переход на 11-й кадр привязан СТРОГО к завершению именно этой
       дорожки (см. addEventListener('ended', ...) ниже) — не к тому,
       сколько ещё продлятся fireworks/пожелания/эта функция. goTo() в
       app.js специально не запускает обычный auto-next для кадра 10
       (см. special-case там же), поэтому единственный, кто вызывает
       переход — обработчик 'ended'. Сама эта функция вполне может быть
       прервана токеном сцены задолго до своего естественного конца —
       это ожидаемо и не является багом. */
    Snd.play('mario');
    const marioTrack = Snd.tracks.mario;
    if (marioTrack && !marioTrack._dead) {
      const onMarioEnded = () => { if (!ctx.dead && E.autoplay) goTo(10); };
      marioTrack.addEventListener('ended', onMarioEnded, { once: true });
      r._marioCleanup = () => marioTrack.removeEventListener('ended', onMarioEnded);
    }
    await ctx.wait(300);
    show(r.done);
    await ctx.wait(900);

    show(r.hbd);
    r._stopFw = fireworks(r.fw);
    await ctx.wait(900);
    await showSeq(ctx, r.wishNodes, 950);
    await ctx.wait(700);
    show(r.tail);
    await ctx.wait(6000);
  },
  stop(r) {
    if (r && r._stopFw) { r._stopFw(); r._stopFw = null; }
    if (r && r._marioCleanup) { r._marioCleanup(); r._marioCleanup = null; }
  }
};

/* =========================================================================
   КАДР 11 — повреждённый сектор: Matrix-fill → дешифровка ячеек по клеткам
   ========================================================================= */
/* только Matrix-глифы — визуальный язык стартового Matrix-экрана
   (selector.js), без единого читаемого английского слова: фон не должен
   содержать никаких «смысловых» токенов, даже редких/скрытых */
const S11_GLYPHS = [
  '0', '1',
  'ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ', 'サ', 'シ', 'ス', 'セ', 'ソ',
  'Ж', 'Д', 'Й', 'Ф', 'Σ', 'λ',
  '{', '}', '[', ']', '<', '>', '/', '\\', '+', '-', '*'
];
/* целевая доля заполнения экрана «осевшими» символами в момент t (сек) —
   приблизительная, самокорректирующаяся кривая (см. trySettle) */
const S11_CURVE = [[0, 0], [0.8, .15], [1.6, .35], [2.4, .60], [3.2, .80], [4.0, .95]];
function s11CurveDensity(t) {
  if (t <= 0) return 0;
  for (let i = 1; i < S11_CURVE.length; i++) {
    const [t0, d0] = S11_CURVE[i - 1], [t1, d1] = S11_CURVE[i];
    if (t <= t1) return d0 + (d1 - d0) * (t - t0) / (t1 - t0);
  }
  return S11_CURVE[S11_CURVE.length - 1][1];
}

/* Один canvas на две роли по очереди: сначала «Matrix-заливка» повреждённого
   слоя (накопительная, ничего не тает), потом та же поверхность становится
   сеткой ячеек-«блоков памяти», которые пользователь дешифрует, водя
   курсором рядом (clearRect по ячейке после короткой decrypt-анимации,
   не стирание кистью). photoBox — элемент, по размеру которого подгоняется
   canvas; photoImg — сам <img>, нужен для geometry object-fit:contain. */
/* непрозрачный «видеобуфер» повреждённого сектора — тот же тёмный тон,
   что и фон .s11-stage, чтобы под ASCII не было видно ни кусочка фото */
const S11_BG = '#020704';

function corruptedMask(canvas, photoBox, photoImg) {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const cellSize = 20;
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0, cols = 0, rows = 0, drops = [];
  let raf = null, fillStartTs = 0, lastTs = 0, fillDone = false, prepared = false;
  let windingDown = false, windDownStart = 0;
  /* интерактивная фаза — «дешифровка» ячеек, а не стирание кистью:
     cellStatus: 0=locked 1=pending/decrypting (лежит в active[]) 2=revealed.
     validCell — какие ячейки вообще относятся к реальному изображению (не
     letterbox/pillarbox от object-fit:contain) и поэтому участвуют в
     progress/интеракции; totalValidCells — их количество (знаменатель %). */
  let cellStatus = null, validCell = null, totalValidCells = 0, revealedCount = 0;
  let active = [], raf2 = null;
  let pointerId = null, lastPt = null, lastTriggerPt = null, completed = false, recoveredFired = false;
  /* decryptRadius — фактический радиус активации ячеек — НЕ равен размеру
     видимого курсора (тот чисто визуальный, задаётся в CSS через --s11size
     у .s11-cursor). На touch зона и так «съедается» пальцем, поэтому там
     радиус даже меньше десктопного, а не больше: маленький viewport +
     большой radius раньше открывал картинку за 1-2 свайпа.
     maxCellsPerMove — сколько НОВЫХ ячеек может активировать один вызов
     triggerNear() (иначе один широкий жест мышью/пальцем сразу открывает
     весь кластер внутри радиуса и ощущение контроля пропадает).
     pathStep — сколько нужно физически проехать курсором/пальцем в CSS-px,
     прежде чем triggerNear() вызовется снова — иначе он гоняется на
     каждый нативный pointermove (могут идти через доли пикселя). */
  const isCoarse = matchMedia('(pointer:coarse)').matches;
  const decryptRadius = isCoarse ? 24 : 42;
  /* фото s11-dawnwalker.jpg широкое (2.39:1) — на портретном мобильном
     экране letterbox съедает большую часть высоты, и валидная область
     сжимается всего до ~120 ячеек (проверено на iPhone-size вьюпорте).
     Даже при decryptRadius=24 один поперечный свайп на весь экран без
     доп. ограничения открывал >90% за раз — поэтому maxCellsPerMove на
     touch снижен до 2 (не 4), чтобы на реальном изображении требовалось
     заметно больше одного жеста, как и просили. */
  const maxCellsPerMove = isCoarse ? 2 : 8;
  const pathStep = isCoarse ? 18 : 20;
  const DECRYPT_MS = 230;

  /* ДВА слоя в одном canvas:
     1. settled[] — «осевшие» символы: раз нарисованный такой символ
        хранится здесь как готовый рецепт отрисовки и перерисовывается
        КАЖДЫЙ кадр заново (не тает, не стирается полупрозрачным
        оверлеем — тот приём стирал бы уже осевшие данные, поэтому тут
        честная память ячеек вместо трюка с rgba-фейдом);
     2. drops[] — активные падающие колонки (голова + короткий хвост),
        рисуются поверх settled[] каждый кадр заново, без накопления.
     Оба слоя — один и тот же визуальный ряд Matrix-глифов; фон нигде не
     содержит читаемых слов и никак не выделяет отдельные ячейки цветом
     «по смыслу» — единственный читаемый текст сцены это центральная
     UI-подсказка поверх canvas (.s11-hint). */
  let settled = null, drawList = [], settledCount = 0;

  function settleCell(c, row) {
    const idx = row * cols + c;
    if (settled[idx] != null) return;
    settled[idx] = {
      ch: S11_GLYPHS[(Math.random() * S11_GLYPHS.length) | 0],
      color: ['#2f7a49', '#3b9858'][(Math.random() * 2) | 0]
    };
    drawList.push(idx); settledCount++;
  }
  /* решает, «осядет» ли символ в ячейке (c,row), мимо которой только что
     прошла падающая колонка. Вероятность подстраивается под целевую
     плотность из S11_CURVE: если текущая плотность отстаёт от кривой —
     оседаем почти всегда, если обогнали — почти никогда, отсюда
     самокорректирующееся (пусть и приблизительное) приближение к кривой */
  function trySettle(c, row, elapsed) {
    if (row < 0 || row >= rows) return;
    const idx = row * cols + c;
    if (settled[idx] != null) return;
    const target = s11CurveDensity(elapsed) * cols * rows;
    const p = settledCount < target ? 0.85 : 0.05;
    if (Math.random() < p) settleCell(c, row);
  }
  function spawnDrop(c, initial) {
    drops[c] = { y: initial ? -Math.random() * rows * 0.6 : -(2 + Math.random() * rows * 0.5),
                 speed: 9 + Math.random() * 15, headRow: -1 };
  }
  /* prepare() отделена от запуска самой Matrix-анимации: она должна
     выполниться ДО печати intro-текста (первым же кадром сцены), чтобы
     фото не было видно вообще ни на один frame — а не только с момента,
     когда запускается падение символов */
  function prepare() {
    if (prepared) return;
    /* offsetWidth/Height — размер в собственных CSS-пикселях элемента, БЕЗ
       учёта масштабирующего transform на #stage (в отличие от
       getBoundingClientRect). Если взять здесь уже отмасштабированный
       размер, canvas получит его как свой style.width/height и масштаб
       применится ещё раз поверх — картинка останется видна узкой полосой
       по краю, которую canvas не докрывает */
    W = Math.max(1, photoBox.offsetWidth); H = Math.max(1, photoBox.offsetHeight);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.max(1, Math.ceil(W / cellSize)); rows = Math.max(1, Math.ceil(H / cellSize));
    settled = new Array(cols * rows).fill(null);
    drawList = []; settledCount = 0; drops = [];
    cellStatus = null; active = []; completed = false; recoveredFired = false;
    revealedCount = 0; totalValidCells = 0;
    fillDone = false; windingDown = false;
    /* сразу целиком закрашиваем непрозрачным фоном — фото не видно ни на
       миг, даже до того как упадёт первый символ Matrix-заливки */
    ctx.fillStyle = S11_BG;
    ctx.fillRect(0, 0, W, H);
    prepared = true;
  }
  /* КАЖДЫЙ кадр перерисовываем всё заново в строгом порядке:
     непрозрачная чёрная база → осевшие символы → падающие колонки.
     Так фото гарантированно скрыто на любом кадре (шаг 1 перекрывает
     весь canvas целиком), а «осевшие» символы не тают, потому что их
     рецепты живут в settled[] и перерисовываются, а не накапливаются
     через прозрачность. */
  function render() {
    ctx.fillStyle = S11_BG;
    ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = 'top';
    ctx.font = (cellSize * 0.82) + 'px "Roboto Mono", monospace';
    ctx.shadowBlur = 0;
    for (let i = 0; i < drawList.length; i++) {
      const idx = drawList[i];
      const d = settled[idx];
      if (!d) continue;
      const row = (idx / cols) | 0, c = idx % cols;
      ctx.fillStyle = d.color;
      ctx.fillText(d.ch, c * cellSize + 2, row * cellSize + 1);
    }
    /* падающий слой — голова + короткий тающий хвост, целиком по мотивам
       selector.js (тот же яркий/тусклый цвет), но БЕЗ его приёма с
       rgba-заливкой всего канваса — здесь трейл лишь визуальный и не
       должен ничего стирать из settled[] */
    for (let c = 0; c < cols; c++) {
      const d = drops[c]; if (!d) continue;
      for (let k = 0; k < 3; k++) {
        const row = d.headRow - k;
        if (row < 0 || row >= rows) continue;
        ctx.globalAlpha = k === 0 ? 1 : (k === 1 ? 0.5 : 0.22);
        ctx.font = (cellSize * 0.82) + 'px "Roboto Mono", monospace';
        if (k === 0) { ctx.shadowColor = 'rgba(160,255,200,.85)'; ctx.shadowBlur = 7; ctx.fillStyle = '#d5ffe0'; }
        else { ctx.shadowBlur = 0; ctx.fillStyle = '#3b9858'; }
        ctx.fillText(S11_GLYPHS[(Math.random() * S11_GLYPHS.length) | 0], c * cellSize + 2, row * cellSize + 1);
      }
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  }
  function finishFill() {
    fillDone = true;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }
  function frame(ts) {
    if (!lastTs) { lastTs = ts; fillStartTs = ts; }
    const elapsed = (ts - fillStartTs) / 1000;
    const dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;

    /* приближаемся к ~90% плотности или затянули дольше разумного —
       начинаем плавный «выход»: колонки становятся реже и не
       респавнятся, вместо резкой остановки всего разом */
    if (!windingDown && (settledCount / (cols * rows) >= 0.90 || elapsed > 6)) {
      windingDown = true; windDownStart = ts;
    }

    for (let c = 0; c < cols; c++) {
      const d = drops[c]; if (!d) continue;
      d.y += d.speed * dt;
      const newRow = Math.floor(d.y);
      if (newRow !== d.headRow) {
        const start = Math.max(d.headRow, 0);
        for (let rr = start; rr < newRow; rr++) trySettle(c, rr, elapsed);
        d.headRow = newRow;
      }
      if (d.y - 2 > rows) {
        if (windingDown) drops[c] = null;
        else spawnDrop(c, false);
      }
    }

    render();

    if (windingDown) {
      /* колонки должны становиться реже и полностью остановиться в
         пределах ~300-500мс от начала выхода, а не «когда повезёт» —
         поэтому вероятность обрыва растёт по мере приближения к
         жёсткому пределу в 320мс, на котором гарантированно гасим
         всё оставшееся разом */
      const windElapsed = ts - windDownStart;
      if (windElapsed > 320) {
        for (let c = 0; c < cols; c++) drops[c] = null;
      } else {
        const p = 0.05 + (windElapsed / 320) * 0.3;
        for (let c = 0; c < cols; c++) { if (drops[c] && Math.random() < p) drops[c] = null; }
      }
      const stillActive = drops.some(d => d);
      if (!stillActive && windElapsed > 340) { finishFill(); return; }
    }
    raf = requestAnimationFrame(frame);
  }

  function startFill() {
    prepare(); lastTs = 0; fillStartTs = 0; windingDown = false; drops = [];
    for (let c = 0; c < cols; c++) spawnDrop(c, true);
    raf = requestAnimationFrame(frame);
  }
  /* мгновенная заливка (тестовый режим E.instant) — без анимации падения
     сразу «осаживаем» ~90% ячеек в случайном порядке той же логикой
     settleCell(), что и обычное падение, и рисуем один статичный кадр */
  function fillInstant() {
    prepare();
    const total = cols * rows;
    const target = Math.floor(total * 0.90);
    const order = Array.from({ length: total }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const t = order[i]; order[i] = order[j]; order[j] = t;
    }
    for (let k = 0; k < order.length && settledCount < target; k++) {
      const idx = order[k];
      if (settled[idx] != null) continue;
      settleCell(idx % cols, (idx / cols) | 0);
    }
    drops = [];
    render();
    finishFill();
  }

  function ptFromEvent(e) {
    /* getBoundingClientRect уже учитывает масштабирующий transform на
       #stage (fit() подгоняет 1600x900 под размер окна) — а вся сеточная
       логика ведётся в СОБСТВЕННЫХ CSS-пикселях canvas (W,H из prepare()).
       Делим на текущий коэффициент масштаба, иначе триггер ячеек будет
       промахиваться мимо курсора всюду, кроме родного 1600x900 */
    const r = canvas.getBoundingClientRect();
    const scale = r.width / W;
    return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale };
  }
  /* какие ячейки вообще относятся к реальному изображению — считаем их
     по геометрии object-fit:contain (фото могло не заполнить весь stage,
     оставив чёрные letterbox/pillarbox поля); эти поля никогда не входят
     в totalValidCells и никогда не декодируются (ничего интересного под
     ними всё равно нет — под ними просто фон .s11-stage) */
  function computeValidRegion() {
    validCell = new Uint8Array(cols * rows);
    totalValidCells = 0;
    const iw = photoImg.naturalWidth, ih = photoImg.naturalHeight;
    if (!iw || !ih) { validCell.fill(1); totalValidCells = cols * rows; return; }
    const scale = Math.min(W / iw, H / ih);
    const rw = iw * scale, rh = ih * scale;
    const rx = (W - rw) / 2, ry = (H - rh) / 2;
    for (let row = 0; row < rows; row++) {
      for (let c = 0; c < cols; c++) {
        const cx = c * cellSize + cellSize / 2, cy = row * cellSize + cellSize / 2;
        if (cx >= rx && cx <= rx + rw && cy >= ry && cy <= ry + rh) {
          validCell[row * cols + c] = 1; totalValidCells++;
        }
      }
    }
    if (!totalValidCells) { validCell.fill(1); totalValidCells = cols * rows; }
  }
  function progressPct() {
    return totalValidCells ? Math.min(100, Math.round((revealedCount / totalValidCells) * 100)) : 0;
  }

  function paintCellBase(c, row) {
    ctx.fillStyle = S11_BG;
    ctx.fillRect(c * cellSize, row * cellSize, cellSize, cellSize);
  }
  /* стадии дешифровки одной ячейки (см. DECRYPT_MS): 0-80мс — быстрый
     фликер случайных глифов чуть ярче обычного; 80-180мс — устойчиво
     яркий глиф; 180-230мс — почти белая вспышка перед раскрытием. Каждый
     кадр перекрашиваем ТОЛЬКО эту ячейку (не весь canvas) — так дешевле
     и не трогает уже открытые/остальные запертые ячейки. */
  function paintDecryptFrame(cell, age) {
    paintCellBase(cell.col, cell.row);
    ctx.textBaseline = 'top';
    ctx.font = (cellSize * 0.82) + 'px "Roboto Mono", monospace';
    const glyphCh = S11_GLYPHS[(Math.random() * S11_GLYPHS.length) | 0];
    let color;
    if (age < 80) { color = '#5fd98a'; ctx.shadowBlur = 0; }
    else if (age < 180) { color = '#9dffc0'; ctx.shadowColor = 'rgba(157,255,192,.65)'; ctx.shadowBlur = 6; }
    else { color = '#effff4'; ctx.shadowColor = 'rgba(239,255,244,.9)'; ctx.shadowBlur = 10; }
    ctx.fillStyle = color;
    ctx.fillText(glyphCh, cell.col * cellSize + 2, cell.row * cellSize + 1);
    ctx.shadowBlur = 0;
  }
  function revealCellNow(c, row) {
    const idx = row * cols + c;
    if (cellStatus[idx] === 2) return;
    cellStatus[idx] = 2;
    ctx.clearRect(c * cellSize, row * cellSize, cellSize, cellSize);
    if (validCell[idx]) revealedCount++;
  }

  /* 0-89% — целиком ручная дешифровка. На пороге запускается один раз
     цепная реакция по оставшимся запертым ячейкам (см. maybeAutoComplete) —
     не мгновенный clearRect, а такая же decrypt-анимация волной. */
  const AUTO_CLEAN_THRESHOLD = 90;

  let onProgress = null, onRecovered = null, onVerifying = null, onCursorHide = null;

  /* общий rAF-цикл интерактивной фазы — крутится, только пока в active[]
     что-то есть (после fill-фазы отдельный raf для падения уже остановлен) */
  function interactiveFrame(ts) {
    for (let i = active.length - 1; i >= 0; i--) {
      const cell = active[i];
      if (cell.state === 'pending') {
        if (ts >= cell.activateAt) { cell.state = 'decrypting'; cell.decryptStart = ts; }
        else continue;
      }
      const age = ts - cell.decryptStart;
      if (age >= DECRYPT_MS) {
        revealCellNow(cell.col, cell.row);
        active.splice(i, 1);
        if (onProgress) onProgress(progressPct());
        maybeAutoComplete();
        maybeFinishRecovery();
      } else {
        paintDecryptFrame(cell, age);
      }
    }
    raf2 = active.length ? requestAnimationFrame(interactiveFrame) : null;
  }
  function ensureInteractiveLoop() { if (!raf2) raf2 = requestAnimationFrame(interactiveFrame); }

  /* находит запертые валидные ячейки в decryptRadius от точки (cx,cy),
     берёт из них случайные maxCellsPerMove штук (не все разом — иначе
     один широкий жест открывает целый кластер) и планирует их дешифровку
     с небольшой задержкой по расстоянию (волна) + джиттер — так эффект
     выглядит как расходящаяся от курсора реакция, а не «всё сразу» */
  function triggerNear(cx, cy) {
    const c0 = Math.max(0, Math.floor((cx - decryptRadius) / cellSize));
    const c1 = Math.min(cols - 1, Math.floor((cx + decryptRadius) / cellSize));
    const r0 = Math.max(0, Math.floor((cy - decryptRadius) / cellSize));
    const r1 = Math.min(rows - 1, Math.floor((cy + decryptRadius) / cellSize));
    const rad2 = decryptRadius * decryptRadius;
    const candidates = [];
    for (let rr = r0; rr <= r1; rr++) {
      for (let cc = c0; cc <= c1; cc++) {
        const idx = rr * cols + cc;
        if (cellStatus[idx] !== 0 || !validCell[idx]) continue;
        const dx = cc * cellSize + cellSize / 2 - cx, dy = rr * cellSize + cellSize / 2 - cy;
        const dist2 = dx * dx + dy * dy;
        if (dist2 > rad2) continue;
        candidates.push({ col: cc, row: rr, dist: Math.sqrt(dist2) });
      }
    }
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const t = candidates[i]; candidates[i] = candidates[j]; candidates[j] = t;
    }
    const picked = candidates.slice(0, maxCellsPerMove);
    if (!picked.length) return;
    const now = performance.now();
    picked.forEach(cand => {
      const idx = cand.row * cols + cand.col;
      const bandDelay = cand.dist < 20 ? 0 : cand.dist < 40 ? 40 : 80;
      cellStatus[idx] = 1;
      active.push({ col: cand.col, row: cand.row, state: 'pending', activateAt: now + bandDelay + Math.random() * 60 });
    });
    ensureInteractiveLoop();
  }
  function enableScratch(cbs) {
    onProgress = cbs.onProgress; onRecovered = cbs.onRecovered; onVerifying = cbs.onVerifying;
    onCursorHide = cbs.onCursorHide;
    computeValidRegion();
    cellStatus = new Uint8Array(cols * rows);
    revealedCount = 0; completed = false; recoveredFired = false; active = [];
    canvas.addEventListener('pointerdown', downH);
    canvas.addEventListener('pointermove', moveH);
    addEventListener('pointerup', upH);
    addEventListener('pointercancel', upH);
  }
  function stopScratchInput() {
    canvas.removeEventListener('pointerdown', downH);
    canvas.removeEventListener('pointermove', moveH);
    removeEventListener('pointerup', upH);
    removeEventListener('pointercancel', upH);
    pointerId = null; lastTriggerPt = null;
  }
  function downH(e) {
    if (completed) return;
    pointerId = e.pointerId;
    canvas.setPointerCapture(pointerId);
    const pt = ptFromEvent(e);
    lastPt = pt; lastTriggerPt = pt;
    triggerNear(pt.x, pt.y);
  }
  /* triggerNear() зовём не на каждый нативный pointermove (те могут идти
     через доли пикселя), а раз в pathStep CSS-px реального перемещения —
     иначе плавный жест «прожигает» дорожку сплошняком без ощущения
     отдельных шагов. lastPt (в отличие от lastTriggerPt) обновляется
     всегда — это «последняя настоящая точка курсора», её использует волна
     авто-завершения (maybeAutoComplete) как источник цепной реакции. */
  function moveH(e) {
    if (completed || e.pointerId !== pointerId) return;
    if (e.buttons === 0) return;
    const pt = ptFromEvent(e);
    lastPt = pt;
    if (lastTriggerPt) {
      const dx = pt.x - lastTriggerPt.x, dy = pt.y - lastTriggerPt.y;
      if (dx * dx + dy * dy < pathStep * pathStep) return;
    }
    lastTriggerPt = pt;
    triggerNear(pt.x, pt.y);
  }
  function upH() { pointerId = null; }
  /* срабатывает РОВНО один раз (guard completed=true в начале — ни ещё
     одна открытая ячейка, ни новый pointer-эвент не вызовут её повторно):
     останавливает ручной ввод, прячет курсор, показывает «проверка» и
     запускает цепную дешифровку ВСЕХ оставшихся запертых валидных ячеек —
     волной от последней известной точки курсора (или центра, если
     взаимодействия ещё не было). onRecovered придёт позже, из
     maybeFinishRecovery(), когда волна на самом деле дорисуется. */
  function maybeAutoComplete() {
    if (completed || progressPct() < AUTO_CLEAN_THRESHOLD) return;
    completed = true;
    stopScratchInput();
    if (onCursorHide) onCursorHide();
    if (onVerifying) onVerifying();
    Snd.play('scan');
    canvas.classList.add('glitch');
    const originX = lastPt ? lastPt.x : W / 2, originY = lastPt ? lastPt.y : H / 2;
    const now = performance.now();
    let maxDist = 1;
    const remaining = [];
    for (let idx = 0; idx < cols * rows; idx++) {
      if (cellStatus[idx] !== 0 || !validCell[idx]) continue;
      const rr = (idx / cols) | 0, cc = idx % cols;
      const dx = cc * cellSize + cellSize / 2 - originX, dy = rr * cellSize + cellSize / 2 - originY;
      const dist = Math.hypot(dx, dy);
      remaining.push({ col: cc, row: rr, dist });
      if (dist > maxDist) maxDist = dist;
    }
    const WAVE_MS = 700; /* + собственный DECRYPT_MS хвост каждой ячейки — итог укладывается в желаемые 600-1200мс */
    remaining.forEach(cellInfo => {
      const idx = cellInfo.row * cols + cellInfo.col;
      cellStatus[idx] = 1;
      const delay = (cellInfo.dist / maxDist) * WAVE_MS + Math.random() * 100;
      active.push({ col: cellInfo.col, row: cellInfo.row, state: 'pending', activateAt: now + delay });
    });
    ensureInteractiveLoop();
    maybeFinishRecovery();
  }
  function maybeFinishRecovery() {
    if (!completed || recoveredFired || active.length) return;
    recoveredFired = true;
    if (onRecovered) onRecovered();
  }
  /* только для E.instant (мгновенное превью) — реальный пользователь
     всегда доходит до 90% сам, эта функция не часть обычного UX */
  function forceComplete() {
    if (completed) return;
    completed = true;
    stopScratchInput();
    if (onCursorHide) onCursorHide();
    active = []; raf2 = null;
    if (!cellStatus) { computeValidRegion(); cellStatus = new Uint8Array(cols * rows); }
    for (let idx = 0; idx < cols * rows; idx++) {
      if (!validCell[idx] || cellStatus[idx] === 2) continue;
      cellStatus[idx] = 2;
      ctx.clearRect((idx % cols) * cellSize, ((idx / cols) | 0) * cellSize, cellSize, cellSize);
    }
    revealedCount = totalValidCells;
    if (onProgress) onProgress(100);
    recoveredFired = true;
    if (onRecovered) onRecovered();
  }
  function destroy() {
    if (raf) cancelAnimationFrame(raf);
    if (raf2) cancelAnimationFrame(raf2);
    stopScratchInput();
  }

  return {
    prepare, startFill, fillInstant, enableScratch, forceComplete, destroy,
    isFillDone: () => fillDone, isRecovered: () => completed, isDecrypting: () => active.length > 0
  };
}

const SC11 = {
  hud: C.s11.boot,
  build(root) {
    root.className = 'scene s11';

    const intro = el('div', 's11-intro');
    const introNodes = C.s11.intro.map(() => { const d = el('div', 'ln'); intro.appendChild(d); return d; });

    const stage = el('div', 's11-stage');
    const photo = el('img', 's11-photo');
    photo.alt = C.s11.photo.title;
    photo.src = C.s11.photo.src;
    photo.draggable = false;
    const canvas = el('canvas', 's11-canvas');
    const cursor = el('div', 's11-cursor');
    cursor.append(el('i', 'tl'), el('i', 'tr'), el('i', 'bl'), el('i', 'br'), el('span', 'dot'));

    const hint = el('div', 's11-hint rv');
    C.s11.hint.forEach(l => hint.appendChild(el('div', null, l)));

    const progress = el('div', 's11-progress rv');
    progress.appendChild(el('span', 'lbl', C.s11.progressLabel + ':'));
    const progressVal = el('span', 'val', '00%');
    progress.appendChild(progressVal);

    const verified = el('div', 's11-hint s11-verified rv', C.s11.verified);

    const final = el('div', 's11-final');
    final.appendChild(el('div', 't', C.s11.final[0]));
    final.appendChild(el('div', null, C.s11.final[1]));
    final.appendChild(el('div', 'file', C.s11.final[2]));

    /* intro — дочерний overlay именно у .s11-stage (а не сосед в .scene),
       чтобы position:absolute считался от уже отступающего от HUD/рамки
       stage, а не от внешнего края всей сцены */
    stage.append(photo, canvas, cursor, intro, hint, progress, verified, final);
    root.append(stage);

    /* курсор-индикатор двигается вместе с указателем внутри области.
       Делим на масштаб #stage (fit() уменьшает всю сцену под окно) —
       иначе translate() из screen-координат сам ещё раз домножится на
       тот же transform и кружок «убежит» от настоящего курсора */
    stage.addEventListener('pointermove', e => {
      if (mask.isRecovered()) return;
      const r = stage.getBoundingClientRect();
      const scale = r.width / stage.offsetWidth;
      cursor.style.transform = 'translate(' + ((e.clientX - r.left) / scale) + 'px,' + ((e.clientY - r.top) / scale) + 'px)';
      cursor.classList.add('on');
      cursor.classList.toggle('active', mask.isDecrypting());
    });
    stage.addEventListener('pointerleave', () => cursor.classList.remove('on'));

    const mask = corruptedMask(canvas, stage, photo);
    return { introNodes, stage, photo, canvas, cursor, hint, progress, progressVal, verified, final, mask };
  },
  async play(ctx, r) {
    /* закрываем фото непрозрачным чёрным ДО печати intro-текста — так
       пользователь не видит его вообще ни на один кадр, ещё до того как
       начнут падать первые символы Matrix-заливки */
    r.mask.prepare();

    for (let i = 0; i < C.s11.intro.length; i++) {
      await type(ctx, r.introNodes[i], C.s11.intro[i], 60);
      await ctx.wait(i === 0 ? 380 : 700);
    }

    if (E.instant) r.mask.fillInstant();
    else {
      r.mask.startFill();
      while (!r.mask.isFillDone()) { await ctx.wait(120); }
    }
    await ctx.wait(400);

    show(r.hint);
    show(r.progress);

    let recovered = false, labelChanged = false;
    r.mask.enableScratch({
      onProgress(pct) {
        r.progressVal.textContent = pad(pct) + '%';
        /* вторая строка подсказки меняется, как только пользователь
           реально начал дешифровку, а не при первом же случайном движении */
        if (pct > 0 && !labelChanged) {
          labelChanged = true;
          r.hint.lastElementChild.textContent = C.s11.hintActive;
        }
        if (pct >= 10) r.hint.classList.add('hide');
      },
      onVerifying() { r.hint.classList.add('hide'); show(r.verified); },
      onRecovered() { r.verified.classList.remove('in'); recovered = true; },
      onCursorHide() { r.cursor.classList.remove('on', 'active'); }
    });
    if (E.instant) r.mask.forceComplete();
    while (!recovered) { await ctx.wait(150); }

    show(r.final);
    await ctx.wait(2200);
  },
  stop(r) { if (r && r.mask) r.mask.destroy(); }
};

const SCENES = [SC1, SC2, SC3, SC4, SC5, SC6, SC7, SC8, SC9, SC10, SC11];
