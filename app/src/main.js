// Wires the page: layout and grade pickers, caption editing, per-panel photos
// (upload or bundled sample, drag to move, zoom), and PNG export in the three
// post sizes. A `?shot=` query sets up a fixed scene for a screenshot (./shots.js).
import { drawCover } from './cover.js';
import { GRADES, LAYOUTS, SIZES, defaultState } from './state.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const captionInput = document.getElementById('caption');
const subInput = document.getElementById('subcaption');
const status = document.getElementById('status');
const state = defaultState();
let selected = 0;
let dragging = null;

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function panelCount() { return LAYOUTS[state.layout].count; }

function resizeCanvas() {
  const [w, h] = SIZES[state.size];
  canvas.width = w;
  canvas.height = h;
}

function redraw() {
  resizeCanvas();
  drawCover(canvas, state, { preview: true, selected });
  renderPanelButtons();
}

function renderPanelButtons() {
  const row = document.getElementById('panels');
  row.innerHTML = '';
  for (let i = 0; i < panelCount(); i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (i === selected ? ' on' : '');
    b.textContent = `Panel ${i + 1}`;
    b.addEventListener('click', () => { selected = i; syncPanelControls(); redraw(); });
    row.appendChild(b);
  }
}

function syncPanelControls() {
  const panel = state.panels[selected];
  document.getElementById('zoom').value = panel.zoom;
  document.getElementById('zoom-value').textContent = `${Math.round(panel.zoom * 100)}%`;
}

function setSample(name) {
  const panel = state.panels[selected];
  panel.sample = name;
  loadImage(`samples/${name}.jpg`).then((img) => { panel.img = img; redraw(); });
}

function fillAllWithSelected() {
  const src = state.panels[selected];
  for (const panel of state.panels) {
    panel.img = src.img;
    panel.sample = src.sample;
    panel.ox = src.ox;
    panel.oy = src.oy;
    panel.zoom = src.zoom;
  }
  redraw();
  status.textContent = 'One photo in every panel.';
}

function exportPNG(sizeKey) {
  const [w, h] = SIZES[sizeKey];
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  drawCover(off, { ...state, size: sizeKey });
  off.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cover-${sizeKey}.png`;
    a.click();
    status.textContent = `Saved cover-${sizeKey}.png`;
  }, 'image/png');
}

/** Fixed scenes for screenshots: applies layout, grade, size, photos and words. */
export async function applyScene(scene) {
  state.layout = scene.layout ?? state.layout;
  state.grade = scene.grade ?? state.grade;
  state.size = scene.size ?? state.size;
  state.caption = scene.caption ?? state.caption;
  state.subcaption = scene.sub ?? state.subcaption;
  captionInput.value = state.caption;
  subInput.value = state.subcaption;
  const names = scene.photos ?? ['pier', 'boulevard', 'pier', 'boulevard'];
  for (let i = 0; i < state.panels.length; i++) {
    const panel = state.panels[i];
    panel.sample = names[i % names.length];
    panel.img = await loadImage(`samples/${panel.sample}.jpg`);
    panel.ox = 0;
    panel.oy = 0;
    panel.zoom = 1;
  }
  if (scene.heroZoom) state.panels[0].zoom = scene.heroZoom;
  selected = 0;
  redraw();
}

// --- controls ---------------------------------------------------------------
function chipRow(id, entries, get, set) {
  const row = document.getElementById(id);
  for (const [key, label] of entries) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (get() === key ? ' on' : '');
    b.textContent = label;
    b.addEventListener('click', () => {
      set(key);
      row.querySelectorAll('.chip').forEach((c) => c.classList.remove('on'));
      b.classList.add('on');
      if (id === 'layouts') { selected = Math.min(selected, panelCount() - 1); syncPanelControls(); }
      redraw();
    });
    row.appendChild(b);
  }
}

chipRow('layouts', Object.entries(LAYOUTS).map(([k, v]) => [k, v.label]),
  () => state.layout, (v) => { state.layout = v; });
chipRow('grades', Object.entries(GRADES).map(([k, v]) => [k, v.label]),
  () => state.grade, (v) => { state.grade = v; });
chipRow('sizes', Object.keys(SIZES).map((k) => [k, k.replace('x', ' × ')]),
  () => state.size, (v) => { state.size = v; });

captionInput.addEventListener('input', () => { state.caption = captionInput.value; redraw(); });
subInput.addEventListener('input', () => { state.subcaption = subInput.value; redraw(); });

document.getElementById('upload').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const panel = state.panels[selected];
  panel.sample = null;
  panel.img = await loadImage(URL.createObjectURL(file));
  panel.ox = 0; panel.oy = 0; panel.zoom = 1;
  syncPanelControls();
  redraw();
  status.textContent = 'Photo loaded — drag it on the poster to move it.';
});
for (const name of ['pier', 'boulevard']) {
  document.getElementById(`sample-${name}`).addEventListener('click', () => setSample(name));
}
document.getElementById('fill-all').addEventListener('click', fillAllWithSelected);
document.getElementById('reset-panel').addEventListener('click', () => {
  const panel = state.panels[selected];
  panel.ox = 0; panel.oy = 0; panel.zoom = 1;
  syncPanelControls();
  redraw();
});
document.getElementById('zoom').addEventListener('input', (e) => {
  state.panels[selected].zoom = Number(e.target.value);
  syncPanelControls();
  redraw();
});
document.getElementById('export').addEventListener('click', () => exportPNG(state.size));

// --- picking and dragging a panel photo on the preview -----------------------
function panelAt(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  const x = ((clientX - r.left) / r.width) * canvas.width;
  const y = ((clientY - r.top) / r.height) * canvas.height;
  const gutter = Math.max(6, Math.round(canvas.width * 0.012));
  const rects = LAYOUTS[state.layout].rects(canvas.width, canvas.height, gutter);
  for (let i = 0; i < panelCount(); i++) {
    const [rx, ry, rw, rh] = rects[i];
    if (x >= rx && x < rx + rw && y >= ry && y < ry + rh) return { index: i, x, y, rect: rects[i] };
  }
  return null;
}

canvas.addEventListener('pointerdown', (e) => {
  const hit = panelAt(e.clientX, e.clientY);
  if (!hit) return;
  selected = hit.index;
  syncPanelControls();
  const panel = state.panels[selected];
  dragging = { x: hit.x, y: hit.y, ox: panel.ox, oy: panel.oy, rect: hit.rect };
  canvas.setPointerCapture(e.pointerId);
  redraw();
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const hit = panelAt(e.clientX, e.clientY);
  if (!hit) return;
  const panel = state.panels[selected];
  const [, , rw, rh] = dragging.rect;
  panel.ox = Math.max(-0.45, Math.min(0.45, dragging.ox + (hit.x - dragging.x) / rw));
  panel.oy = Math.max(-0.45, Math.min(0.45, dragging.oy + (hit.y - dragging.y) / rh));
  redraw();
});
canvas.addEventListener('pointerup', () => { dragging = null; });

// --- start ------------------------------------------------------------------
const query = new URLSearchParams(location.search);
if (query.get('shot')) {
  document.body.classList.add('shot-' + query.get('shot'));
  runShot(query, applyScene).then(() => { window.__shotReady = true; });
} else {
  (async () => {
    for (const panel of state.panels) {
      panel.img = await loadImage(`samples/${panel.sample}.jpg`);
    }
    syncPanelControls();
    redraw();
  })();
}
