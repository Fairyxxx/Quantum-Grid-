// ── Canvas Background ──
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: -1000, y: -1000 };

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

document.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.size = Math.random() * 1.5 + 0.5;
    this.opacity = Math.random() * 0.5 + 0.15;
    this.hue = Math.random() < 0.5 ? 186 : 262; // cyan or purple
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;

    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 180) {
      const force = (180 - dist) / 180;
      this.vx += (dx / dist) * force * 0.03;
      this.vy += (dy / dist) * force * 0.03;
    }

    this.vx *= 0.999;
    this.vy *= 0.999;

    if (this.x < -20 || this.x > canvas.width + 20 || this.y < -20 || this.y > canvas.height + 20) {
      this.reset();
    }
  }
  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    const color = this.hue === 186
      ? `rgba(0,229,255,${this.opacity})`
      : `rgba(124,77,255,${this.opacity})`;
    ctx.fillStyle = color;
    ctx.fill();
  }
}

for (let i = 0; i < 80; i++) {
  particles.push(new Particle());
}

// Draw connections
function drawConnections(ctx, particles) {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(0,229,255,${0.06 * (1 - dist/100)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const p of particles) {
    p.update();
    p.draw(ctx);
  }
  drawConnections(ctx, particles);
  requestAnimationFrame(animate);
}
animate();

// ── QR Code Generator ──
const qrStage = document.getElementById('qr-stage');
const qrInput = document.getElementById('qr-input');
const downloadBtn = document.getElementById('download-btn');
const copyBtn = document.getElementById('copy-btn');
const levelBtns = document.querySelectorAll('[data-level]');
const sizeValue = document.getElementById('size-value');
const levelValue = document.getElementById('level-value');
const charCount = document.getElementById('char-count');
const toast = document.getElementById('toast');

let currentLevel = 'H';
let qrDataUrl = '';
let qrCanvas = null;

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 2000);
}

function generateQR() {
  const text = qrInput.value.trim();
  if (!text) {
    qrStage.innerHTML = `
      <div class="qr-placeholder">
        <div class="qr-icon">⊞</div>
        <span>输入内容生成二维码</span>
      </div>`;
    qrDataUrl = '';
    qrCanvas = null;
    charCount.textContent = '0';
    downloadBtn.style.opacity = '0.4';
    downloadBtn.style.pointerEvents = 'none';
    copyBtn.style.opacity = '0.4';
    copyBtn.style.pointerEvents = 'none';
    return;
  }

  charCount.textContent = text.length;

  QRCode.toDataURL(text, {
    width: 240,
    margin: 2,
    color: { dark: '#0a0e14', light: '#ffffff' },
    errorCorrectionLevel: currentLevel
  }, (err, url) => {
    if (err) return;
    qrDataUrl = url;
    downloadBtn.style.opacity = '1';
    downloadBtn.style.pointerEvents = 'auto';
    copyBtn.style.opacity = '1';
    copyBtn.style.pointerEvents = 'auto';

    const img = new Image();
    img.onload = () => {
      qrCanvas = document.createElement('canvas');
      qrCanvas.width = img.width;
      qrCanvas.height = img.height;
      const ctx2 = qrCanvas.getContext('2d');
      ctx2.drawImage(img, 0, 0);
      qrStage.innerHTML = '';
      qrStage.appendChild(qrCanvas);
    };
    img.src = url;
  });
}

qrInput.addEventListener('input', generateQR);

levelBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    levelBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentLevel = btn.dataset.level;
    levelValue.textContent = currentLevel;
    generateQR();
  });
});

downloadBtn.addEventListener('click', () => {
  if (!qrDataUrl) return;
  const a = document.createElement('a');
  a.href = qrDataUrl;
  a.download = `qrcode-${Date.now()}.png`;
  a.click();
  showToast('PNG 已下载');
});

copyBtn.addEventListener('click', async () => {
  if (!qrCanvas) return;
  try {
    const blob = await new Promise(resolve => qrCanvas.toBlob(resolve, 'image/png'));
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
    showToast('二维码已复制到剪贴板');
  } catch (e) {
    // Fallback: copy as data URL
    try {
      await navigator.clipboard.writeText(qrDataUrl);
      showToast('已复制（base64）');
    } catch {
      showToast('复制失败，请使用下载功能');
    }
  }
});

// ── Init ──
generateQR();
