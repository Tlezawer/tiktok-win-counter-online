let state = { current: 0, goal: 10 };
let fxTimeout = null;
let overlayConfig = {
  fontSize: 96,
  outline: 8,
  colorPositive: "#22c55e",
  colorNegative: "#f97373",
  colorZero: "#ffffff",
  colorGoal: "#ffffff",
};

async function fetchConfig() {
  try {
    const res = await fetch('/api/overlay-config');
    if (!res.ok) return;
    const data = await res.json();
    overlayConfig = Object.assign({}, overlayConfig, data);
  } catch (e) {}
}

async function fetchState() {
  try {
    const res = await fetch('/api/state');
    if (!res.ok) return;
    const data = await res.json();
    const prev = state.current;
    state = data;
    render(prev, state.current);
  } catch (e) {}
}

function applyBaseStyle(currentSpan, slashSpan, goalSpan) {
  const fs = Number(overlayConfig.fontSize) || 96;
  const outline = Number(overlayConfig.outline);
  const safeOutline = Number.isFinite(outline) ? outline : 8;

  const shadowParts = [
    "-" + safeOutline + "px -" + safeOutline + "px 0 #000",
    safeOutline + "px -" + safeOutline + "px 0 #000",
    "-" + safeOutline + "px " + safeOutline + "px 0 #000",
    safeOutline + "px " + safeOutline + "px 0 #000",
    "0 0 " + Math.max(4, safeOutline) + "px #000"
  ];
  const baseShadow = shadowParts.join(", ");

  [currentSpan, slashSpan, goalSpan].forEach(el => {
    if (!el) return;
    el.style.fontSize = fs + "px";
    el.style.textShadow = baseShadow;
  });
}

function render(prev, now) {
  const curEl   = document.getElementById('scoreCurrent');
  const slashEl = document.getElementById('scoreSlash');
  const goalEl  = document.getElementById('scoreGoal');
  if (!curEl || !slashEl || !goalEl) return;

  applyBaseStyle(curEl, slashEl, goalEl);

  const delta = now - prev;

  curEl.textContent  = String(state.current);
  goalEl.textContent = String(state.goal);

  if (fxTimeout) {
    clearTimeout(fxTimeout);
    fxTimeout = null;
  }

  const cPos  = overlayConfig.colorPositive || "#22c55e";
  const cNeg  = overlayConfig.colorNegative || "#f97373";
  const cZero = overlayConfig.colorZero     || "#ffffff";
  const cGoal = overlayConfig.colorGoal     || "#ffffff";

  if (state.current > 0) {
    curEl.style.color = cPos;
  } else if (state.current < 0) {
    curEl.style.color = cNeg;
  } else {
    curEl.style.color = cZero;
  }

  slashEl.style.color = cGoal;
  goalEl.style.color  = cGoal;

  if (delta > 0) {
    curEl.style.transform = 'scale(1.08)';
  } else if (delta < 0) {
    curEl.style.transform = 'scale(0.94)';
  } else {
    curEl.style.transform = 'scale(1.0)';
  }

  if (delta !== 0) {
    fxTimeout = setTimeout(() => {
      curEl.style.transform = 'scale(1.0)';
      if (state.current > 0) {
        curEl.style.color = cPos;
      } else if (state.current < 0) {
        curEl.style.color = cNeg;
      } else {
        curEl.style.color = cZero;
      }
    }, 220);
  }
}

window.addEventListener('load', () => {
  fetchConfig();
  fetchState();
  setInterval(fetchConfig, 2000);
  setInterval(fetchState, 300);
});
