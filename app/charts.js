// Tiny canvas chart helpers for the Hearth & Ledger budget site. No library:
// each function draws one chart on a <canvas> with plain 2D calls, sized to
// the canvas element, with a device-pixel-ratio pass so lines stay crisp on
// phones. Budget progress bars are plain CSS, not canvas.

const PALETTE = ['#2f6f4f', '#4a9b7a', '#e9a13b', '#d96c4f', '#5b7fa6', '#8e6fb8', '#3aa99e', '#b0526b', '#7a8a99', '#c9a227'];

function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.font = '12px system-ui, sans-serif';
  return { ctx, width, height };
}

function niceMax(value) {
  const power = Math.pow(10, Math.floor(Math.log10(value)));
  const scaled = value / power;
  const steps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  const nice = steps.find((s) => scaled <= s) ?? 10;
  return nice * power;
}

function drawGrid(ctx, width, height, pad, max) {
  ctx.strokeStyle = '#e2e8e2';
  ctx.fillStyle = '#66756a';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + ((height - pad.top - pad.bottom) * i) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    ctx.textAlign = 'right';
    const label = max >= 10 ? String(Math.round((max * (4 - i)) / 4)) : String(Math.round(((max * (4 - i)) / 4) * 10) / 10);
    ctx.fillText(label, pad.left - 8, y + 4);
  }
}

export function drawBarChart(canvas, bars, options = {}) {
  const { ctx, width, height } = setupCanvas(canvas);
  const pad = { left: 52, right: 14, top: 14, bottom: 28 };
  const max = niceMax(Math.max(...bars.map((b) => b.value)) * 1.05);
  drawGrid(ctx, width, height, pad, max);
  const slot = (width - pad.left - pad.right) / bars.length;
  const barWidth = Math.min(52, slot * 0.6);

  bars.forEach((b, i) => {
    const x = pad.left + slot * i + (slot - barWidth) / 2;
    const barHeight = (b.value / max) * (height - pad.top - pad.bottom);
    ctx.fillStyle = options.highlight === i ? '#e9a13b' : PALETTE[i % PALETTE.length];
    ctx.fillRect(x, height - pad.bottom - barHeight, barWidth, barHeight);
    ctx.fillStyle = '#24382c';
    ctx.textAlign = 'center';
    ctx.fillText(options.format ? options.format(b.value) : String(b.value), x + barWidth / 2, height - pad.bottom - barHeight - 6);
    ctx.fillStyle = '#66756a';
    ctx.fillText(b.label, x + barWidth / 2, height - 8);
  });
}

export function drawDonut(canvas, slices, options = {}) {
  const { ctx, width, height } = setupCanvas(canvas);
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 12;
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  let angle = -Math.PI / 2;
  slices.forEach((s, i) => {
    const sweep = (s.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, angle, angle + sweep);
    ctx.closePath();
    ctx.fillStyle = PALETTE[i % PALETTE.length];
    ctx.fill();
    angle += sweep;
  });
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.fillStyle = '#2f6f4f';
  ctx.textAlign = 'center';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillText(options.center || '', cx, cy - 2);
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = '#66756a';
  ctx.fillText(options.centerSub || '', cx, cy + 15);
}

export function legendHTML(slices, valueFormat) {
  return (
    '<ul class="legend">' +
    slices
      .map(
        (s, i) =>
          `<li><span class="swatch" style="background:${PALETTE[i % PALETTE.length]}"></span>${s.label} — <strong>${valueFormat ? valueFormat(s.value) : s.value}</strong></li>`,
      )
      .join('') +
    '</ul>'
  );
}

// Redraw every canvas on the page after a resize, so charts never sit at the
// wrong size when a phone rotates or a desktop window changes.
export function redrawAllCharts(draw) {
  let timer = null;
  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(draw, 150);
  });
}

// A single progress bar for a budget category or a savings goal: a labelled
// track whose fill is the share used, coloured amber past 90% and red over 100%.
export function progressBarHTML(used, total, label) {
  const pct = Math.min(100, Math.round((used / total) * 100));
  // Red only when the envelope is actually overdrawn; exactly full (100%) is
  // amber — the money is spent, but nothing is over budget.
  const state = used > total ? 'over' : pct >= 90 ? 'warn' : '';
  return `<div class="progress" role="img" aria-label="${label}: ${pct}% used">
    <div class="progress-fill ${state}" style="width:${pct}%"></div>
  </div>`;
}
