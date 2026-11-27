// The Kitchen Table Ledger — canvas charts, drawn by hand from the data.
// No chart library: the whole site stays a few small files, so the first load
// is light. Every chart is followed on its page by a table with the same numbers.

const PALETTE = ['#2e6b4f', '#c96f2e', '#3f7fae', '#8a6fb8', '#b8455a', '#7a9a3a', '#d9a441', '#5b7a8c', '#a35d8f', '#4f8a6b', '#96805f'];

function setup(canvas, height) {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || canvas.parentElement.clientWidth || 600;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.height = height + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, width, height };
}

function niceMax(value) {
  const step = value <= 500 ? 100 : value <= 2000 ? 500 : value <= 5000 ? 1000 : 2000;
  return Math.ceil(value / step) * step;
}

function moneyShort(v) {
  return '$' + (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : Math.round(v));
}

// Grouped bars: one group per month, income in green, spending in terracotta.
export function cashFlowChart(canvas, months) {
  const { ctx, width, height } = setup(canvas, 260);
  const pad = { l: 52, r: 12, t: 14, b: 30 };
  const max = niceMax(Math.max(...months.map((m) => Math.max(m.income, m.spending))));
  const plotW = width - pad.l - pad.r;
  const plotH = height - pad.t - pad.b;
  const groupW = plotW / months.length;
  const barW = Math.min(34, (groupW - 24) / 2);
  ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#6b6259';
  for (let g = 0; g <= 4; g++) {
    const v = (max / 4) * g;
    const y = pad.t + plotH - (v / max) * plotH;
    ctx.strokeStyle = g === 0 ? '#c9bda9' : '#e8e0d0';
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(width - pad.r, y); ctx.stroke();
    ctx.fillText(moneyShort(v), pad.l - 8, y + 4);
  }
  months.forEach((m, i) => {
    const cx = pad.l + groupW * i + groupW / 2;
    const h1 = (m.income / max) * plotH;
    const h2 = (m.spending / max) * plotH;
    ctx.fillStyle = '#2e6b4f';
    ctx.fillRect(cx - barW - 3, pad.t + plotH - h1, barW, h1);
    ctx.fillStyle = '#c96f2e';
    ctx.fillRect(cx + 3, pad.t + plotH - h2, barW, h2);
    ctx.fillStyle = '#3d362e';
    ctx.textAlign = 'center';
    ctx.fillText(m.month, cx, height - 8);
  });
  ctx.textAlign = 'left';
  ctx.fillStyle = '#2e6b4f'; ctx.fillText('■ Income', pad.l, 12);
  ctx.fillStyle = '#c96f2e'; ctx.fillText('■ Spending', pad.l + 90, 12);
}

// Line chart: savings (income minus spending) across the six months.
export function savingsLineChart(canvas, months) {
  const { ctx, width, height } = setup(canvas, 220);
  const pad = { l: 52, r: 16, t: 16, b: 30 };
  const saved = months.map((m) => m.income - m.spending);
  const max = niceMax(Math.max(...saved));
  const min = 0;
  const plotW = width - pad.l - pad.r;
  const plotH = height - pad.t - pad.b;
  ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#6b6259';
  for (let g = 0; g <= 4; g++) {
    const v = min + ((max - min) / 4) * g;
    const y = pad.t + plotH - ((v - min) / (max - min)) * plotH;
    ctx.strokeStyle = g === 0 ? '#c9bda9' : '#e8e0d0';
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(width - pad.r, y); ctx.stroke();
    ctx.fillText(moneyShort(v), pad.l - 8, y + 4);
  }
  const x = (i) => pad.l + (plotW * i) / (months.length - 1);
  const y = (v) => pad.t + plotH - ((v - min) / (max - min)) * plotH;
  ctx.strokeStyle = '#2e6b4f';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  saved.forEach((v, i) => (i === 0 ? ctx.moveTo(x(i), y(v)) : ctx.lineTo(x(i), y(v))));
  ctx.stroke();
  ctx.lineWidth = 1;
  saved.forEach((v, i) => {
    ctx.fillStyle = '#2e6b4f';
    ctx.beginPath(); ctx.arc(x(i), y(v), 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x(i), y(v), 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3d362e';
    ctx.textAlign = 'center';
    ctx.fillText('$' + Math.round(v).toLocaleString('en-US'), x(i), y(v) - 10);
    ctx.fillText(months[i].month, x(i), height - 8);
  });
}

// Donut: spending by category, largest slice first, with a legend. On a phone
// the legend moves under the donut instead of beside it.
export function donutChart(canvas, slices) {
  const narrow = (canvas.clientWidth || canvas.parentElement.clientWidth || 600) < 560;
  const height = narrow ? 208 + slices.length * 22 + 14 : 260;
  const { ctx, width } = setup(canvas, height);
  const total = slices.reduce((s, x) => s + x.value, 0);
  const cx = narrow ? width / 2 : 130;
  const cy = narrow ? 104 : height / 2;
  const r = 96;
  const inner = 58;
  let angle = -Math.PI / 2;
  slices.forEach((s, i) => {
    const a2 = angle + (s.value / total) * Math.PI * 2;
    ctx.fillStyle = PALETTE[i % PALETTE.length];
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle, a2);
    ctx.closePath();
    ctx.fill();
    angle = a2;
  });
  ctx.fillStyle = '#fdf9f0';
  ctx.beginPath(); ctx.arc(cx, cy, inner, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3d362e';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Spent', cx, cy - 4);
  ctx.font = 'bold 19px system-ui, sans-serif';
  ctx.fillText('$' + Math.round(total).toLocaleString('en-US'), cx, cy + 20);
  ctx.font = '13px system-ui, sans-serif';
  ctx.textAlign = 'left';
  slices.forEach((s, i) => {
    const lx = narrow ? 16 : 252;
    const ly = narrow ? 222 + i * 22 : 24 + i * 22;
    ctx.fillStyle = PALETTE[i % PALETTE.length];
    ctx.fillRect(lx, ly - 10, 12, 12);
    ctx.fillStyle = '#3d362e';
    ctx.fillText(`${s.label} — $${Math.round(s.value).toLocaleString('en-US')} (${Math.round((s.value / total) * 100)}%)`, lx + 18, ly);
  });
}

// Horizontal bars: who paid what, Maya vs Daniel.
export function splitBars(canvas, rows) {
  const { ctx, width, height } = setup(canvas, 120);
  const max = Math.max(...rows.map((r) => r.value));
  const padL = 70;
  const barH = 26;
  ctx.font = '13px system-ui, sans-serif';
  rows.forEach((r, i) => {
    const y = 18 + i * 48;
    ctx.fillStyle = '#3d362e';
    ctx.textAlign = 'right';
    ctx.fillText(r.label, padL - 10, y + 17);
    ctx.fillStyle = PALETTE[i % PALETTE.length];
    const w = ((width - padL - 90) * r.value) / max;
    ctx.fillRect(padL, y, w, barH);
    ctx.fillStyle = '#3d362e';
    ctx.textAlign = 'left';
    ctx.fillText('$' + Math.round(r.value).toLocaleString('en-US'), padL + w + 8, y + 17);
  });
}
