// Draws the multi-panel poster: photos in panels, a colour grade, halftone dots and
// vignette, then bold caption lettering over a scrim. The same draw serves the live
// preview and the exported PNG, so what you see is what the file holds.
import { GRADES, LAYOUTS } from './state.js';

/** Draws `state` onto the canvas's 2D context, at the canvas's own size. */
export function drawCover(canvas, state, opts = {}) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const layout = LAYOUTS[state.layout];
  const grade = GRADES[state.grade];
  const gutter = Math.max(6, Math.round(w * 0.012));

  ctx.save();
  ctx.fillStyle = '#160a1e';
  ctx.fillRect(0, 0, w, h);

  const rects = layout.rects(w, h, gutter);
  for (let i = 0; i < layout.count; i++) {
    drawPanel(ctx, rects[i], state.panels[i], grade, w, i === 0);
  }

  drawScrimAndLettering(ctx, w, h, state);
  ctx.restore();

  // Editor-only: outline the panel the user is working on.
  if (opts.preview && opts.selected >= 0 && opts.selected < layout.count) {
    const [x, y, pw, ph] = rects[opts.selected];
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(3, w * 0.004);
    ctx.setLineDash([w * 0.02, w * 0.012]);
    ctx.strokeRect(x + 2, y + 2, pw - 4, ph - 4);
    ctx.restore();
  }
}

/** One panel: the photo (cover-fit, draggable offset, zoom) under the grade. */
function drawPanel(ctx, rect, panel, grade, canvasW, isHero) {
  const [x, y, pw, ph] = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, pw, ph);
  ctx.clip();

  if (panel.img) {
    const base = Math.max(pw / panel.img.naturalWidth, ph / panel.img.naturalHeight);
    const scale = base * panel.zoom;
    const iw = panel.img.naturalWidth * scale;
    const ih = panel.img.naturalHeight * scale;
    ctx.filter = grade.filter;
    ctx.drawImage(panel.img, x + (pw - iw) / 2 + panel.ox * pw, y + (ph - ih) / 2 + panel.oy * ph, iw, ih);
    ctx.filter = 'none';
  } else {
    const empty = ctx.createLinearGradient(x, y, x + pw, y + ph);
    empty.addColorStop(0, '#3d1a56');
    empty.addColorStop(1, '#c22e6e');
    ctx.fillStyle = empty;
    ctx.fillRect(x, y, pw, ph);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = `700 ${Math.round(ph * 0.09)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('+ ADD A PHOTO', x + pw / 2, y + ph / 2);
  }

  // Sunset / neon / noir tint, heavier toward the foot of the panel.
  const tint = ctx.createLinearGradient(0, y, 0, y + ph);
  tint.addColorStop(0, grade.tint[0]);
  tint.addColorStop(0.55, grade.tint[1]);
  tint.addColorStop(1, grade.tint[2]);
  ctx.fillStyle = tint;
  ctx.fillRect(x, y, pw, ph);

  if (isHero) drawHalftone(ctx, x + pw * 0.62, y + ph * 0.62, pw * 0.38, ph * 0.38, grade.dot, canvasW);
  drawVignette(ctx, x, y, pw, ph);

  // A thin light frame keeps the panels reading as a poster, not a collage.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = Math.max(2, canvasW * 0.003);
  ctx.strokeRect(x + 1, y + 1, pw - 2, ph - 2);
  ctx.restore();
}

/** Halftone dots, fading in toward the corner: the print-poster texture. */
function drawHalftone(ctx, x, y, w, h, color, canvasW) {
  const step = Math.max(10, canvasW / 96);
  const cols = Math.ceil(w / step);
  const rows = Math.ceil(h / step);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const t = (row + col) / (rows + cols);
      if (t < 0.3) continue;
      const r = step * (0.08 + 0.38 * t);
      ctx.save();
      ctx.globalAlpha = t * t;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x + col * step + step / 2, y + row * step + step / 2, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

/** Darkened corners so the photo sits inside the poster. */
function drawVignette(ctx, x, y, w, h) {
  const v = ctx.createRadialGradient(
    x + w / 2, y + h / 2, Math.min(w, h) * 0.35,
    x + w / 2, y + h / 2, Math.max(w, h) * 0.75,
  );
  v.addColorStop(0, 'rgba(0, 0, 0, 0)');
  v.addColorStop(1, 'rgba(0, 0, 0, 0.32)');
  ctx.fillStyle = v;
  ctx.fillRect(x, y, w, h);
}

/** The scrim, the big caption and the sub-caption pill along the foot. */
function drawScrimAndLettering(ctx, w, h, state) {
  const scrim = ctx.createLinearGradient(0, h * 0.6, 0, h);
  scrim.addColorStop(0, 'rgba(10, 4, 18, 0)');
  scrim.addColorStop(1, 'rgba(10, 4, 18, 0.62)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, h * 0.6, w, h * 0.4);

  const text = (state.caption || '').trim().toUpperCase();
  if (text) {
    const family = `'Arial Black', Impact, 'Liberation Sans', 'DejaVu Sans', system-ui, sans-serif`;
    // Wide posters get a bigger caption; the fit loop below still caps the width.
    let size = h * (w > h ? 0.16 : 0.115);
    ctx.font = `900 ${size}px ${family}`;
    while (ctx.measureText(text).width > w * 0.92 && size > 12) {
      size -= 2;
      ctx.font = `900 ${size}px ${family}`;
    }
    ctx.save();
    ctx.translate(w / 2, h * 0.875);
    ctx.rotate(-0.028);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    ctx.lineWidth = size * 0.1;
    ctx.strokeStyle = '#140f1c';
    if (state.grade === 'neon') {
      ctx.shadowColor = '#ff2fb3';
      ctx.shadowBlur = size * 0.35;
    } else {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
      ctx.shadowBlur = size * 0.18;
    }
    ctx.strokeText(text, 0, 0);
    ctx.fillStyle = state.grade === 'neon' ? '#fdfaff' : '#ffffff';
    ctx.fillText(text, 0, 0);
    if (state.grade === 'neon') {
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = size * 0.16;
      ctx.fillText(text, 0, 0);
    }
    ctx.restore();
  }

  const sub = (state.subcaption || '').trim().toUpperCase();
  if (sub) {
    const size = Math.max(14, h * 0.026);
    ctx.font = `700 ${size}px system-ui, sans-serif`;
    try { ctx.letterSpacing = `${Math.max(2, size * 0.16)}px`; } catch { /* older canvas */ }
    const tw = ctx.measureText(sub).width;
    const padX = size * 0.9;
    const pillW = tw + padX * 2;
    const pillH = size * 2.1;
    const px = (w - pillW) / 2;
    const py = h * 0.9;
    ctx.fillStyle = 'rgba(10, 6, 16, 0.78)';
    ctx.beginPath();
    ctx.roundRect(px, py, pillW, pillH, pillH / 2);
    ctx.fill();
    ctx.fillStyle = '#ffe9c9';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sub, w / 2, py + pillH / 2 + size * 0.05);
    try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }
  }
}
