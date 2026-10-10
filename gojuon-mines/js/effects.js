// 演出：画面フラッシュ、揺れ、紙吹雪。動きを減らす設定のときは何もしない
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function shake(el) {
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
}

export function flash(color = 'rgba(232,67,42,0.35)') {
  if (reduced()) return;
  const el = document.createElement('div');
  el.className = 'flash';
  el.style.background = color;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

export function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

const CONFETTI_COLORS = ['#f5c518', '#e8432a', '#7cc4ff', '#7be0a0', '#ff7a8a', '#ffffff'];

export function confetti(count = 120) {
  if (reduced()) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.width = innerWidth * dpr, h = canvas.height = innerHeight * dpr;
  const parts = Array.from({ length: count }, () => ({
    x: w / 2 + (Math.random() - 0.5) * w * 0.3,
    y: h * 0.35,
    vx: (Math.random() - 0.5) * 14 * dpr,
    vy: (-Math.random() * 14 - 6) * dpr,
    size: (5 + Math.random() * 6) * dpr,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
  }));
  const start = performance.now();
  const step = now => {
    const t = now - start;
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.vy += 0.35 * dpr;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - t / 2600);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }
    if (t < 2600) requestAnimationFrame(step); else canvas.remove();
  };
  requestAnimationFrame(step);
}
