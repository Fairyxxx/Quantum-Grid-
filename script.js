/* ============================================
   QR Forge — 二维码生成器
   Canvas 粒子背景 & 二维码实时生成
   ============================================ */

// ── Particle Canvas ──────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');

  let width, height;
  const particles = [];
  const PARTICLE_COUNT = 80;
  const CONNECT_DIST = 140;
  const MOUSE_RADIUS = 160;

  const mouse = { x: -9999, y: -9999 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  document.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // Touch support
  document.addEventListener('touchmove', (e) => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.radius = Math.random() * 2 + 0.8;
      this.alpha = Math.random() * 0.5 + 0.2;
    }

    update() {
      // Mouse repulsion / attraction
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MOUSE_RADIUS && dist > 0) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
        const angle = Math.atan2(dy, dx);
        this.vx += Math.cos(angle) * force * 0.03;
        this.vy += Math.sin(angle) * force * 0.03;
      }

      // Damping
      this.vx *= 0.998;
      this.vy *= 0.998;

      this.x += this.vx;
      this.y += this.vy;

      // Wrap around
      if (this.x < -20) this.x = width + 20;
      if (this.x > width + 20) this.x = -20;
      if (this.y < -20) this.y = height + 20;
      if (this.y > height + 20) this.y = -20;
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(250, 30%, 70%, ${this.alpha})`;
      ctx.fill();
    }
  }

  // Initialize particles
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECT_DIST) {
          const opacity = (1 - dist / CONNECT_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `hsla(250, 50%, 65%, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update & draw
    particles.forEach((p) => {
      p.update();
      p.draw(ctx);
    });

    drawConnections();

    requestAnimationFrame(animate);
  }

  animate();
})();

// ── QR Code Generator ────────────────────────
(function initQRGenerator() {
  const textInput = document.getElementById('textInput');
  const clearBtn = document.getElementById('clearBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const copyBtn = document.getElementById('copyBtn');
  const qrContainer = document.getElementById('qrcode');
  const qrPlaceholder = document.getElementById('qrPlaceholder');
  const qrWrapper = document.getElementById('qrWrapper');
  const charCount = document.getElementById('charCount');
  const ecSelect = document.getElementById('ecSelect');
  const ecLevel = document.getElementById('ecLevel');
  const toast = document.getElementById('toast');

  let qrInstance = null;
  let debounceTimer = null;

  const LEVEL_MAP = {
    L: QRCode.CorrectLevel.L,
    M: QRCode.CorrectLevel.M,
    Q: QRCode.CorrectLevel.Q,
    H: QRCode.CorrectLevel.H,
  };

  function updateCharCount() {
    const len = textInput.value.length;
    charCount.textContent = len;
  }

  function generateQR(text) {
    // Clear previous
    qrContainer.innerHTML = '';

    if (!text.trim()) {
      qrPlaceholder.classList.remove('hidden');
      qrWrapper.classList.remove('has-qr');
      downloadBtn.disabled = true;
      copyBtn.disabled = true;
      qrInstance = null;
      updateCharCount();
      return;
    }

    qrPlaceholder.classList.add('hidden');
    qrWrapper.classList.add('has-qr');

    try {
      const level = ecSelect.value;
      ecLevel.textContent = level;

      qrInstance = new QRCode(qrContainer, {
        text: text,
        width: 228,
        height: 228,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: LEVEL_MAP[level],
      });

      downloadBtn.disabled = false;
      copyBtn.disabled = false;
    } catch (err) {
      console.error('QR generation error:', err);
      qrPlaceholder.classList.remove('hidden');
      qrWrapper.classList.remove('has-qr');
      downloadBtn.disabled = true;
      copyBtn.disabled = true;
    }

    updateCharCount();
  }

  // Debounced input
  textInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      generateQR(textInput.value);
    }, 150);

    // Update clear button visibility
    if (textInput.value.length > 0) {
      clearBtn.classList.add('visible');
    } else {
      clearBtn.classList.remove('visible');
    }

    updateCharCount();
  });

  // Clear button
  clearBtn.addEventListener('click', () => {
    textInput.value = '';
    textInput.focus();
    clearBtn.classList.remove('visible');
    generateQR('');
  });

  // Error correction level change
  ecSelect.addEventListener('change', () => {
    generateQR(textInput.value);
  });

  // ── Download PNG ──────────────────────────
  downloadBtn.addEventListener('click', () => {
    if (!qrInstance) return;

    const canvas = qrContainer.querySelector('canvas');
    if (!canvas) {
      // Fallback: try img
      const img = qrContainer.querySelector('img');
      if (!img) return;
      downloadImage(img.src);
      return;
    }

    // Create a high-res export canvas
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 600;
    exportCanvas.height = 600;
    const exportCtx = exportCanvas.getContext('2d');

    // White background
    exportCtx.fillStyle = '#ffffff';
    exportCtx.fillRect(0, 0, 600, 600);

    // Draw QR scaled up
    exportCtx.imageSmoothingEnabled = false;
    exportCtx.drawImage(canvas, 0, 0, 600, 600);

    exportCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      downloadImage(url);
      URL.revokeObjectURL(url);
    }, 'image/png');
  });

  function downloadImage(url) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-code-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('PNG 已下载', 'success');
  }

  // ── Copy to Clipboard ─────────────────────
  copyBtn.addEventListener('click', async () => {
    if (!qrInstance) return;

    const canvas = qrContainer.querySelector('canvas');
    if (!canvas) {
      showToast('无法读取二维码图像', 'error');
      return;
    }

    try {
      // Use Clipboard API with PNG blob
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png');
      });

      if (!blob) {
        showToast('图像生成失败', 'error');
        return;
      }

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);

      showToast('已复制到剪贴板', 'success');
    } catch (err) {
      console.error('Clipboard write error:', err);
      // Fallback message
      showToast('复制失败，请尝试下载', 'error');
    }
  });

  // ── Toast Notification ────────────────────
  let toastTimer = null;

  function showToast(message, type) {
    if (toastTimer) clearTimeout(toastTimer);

    toast.textContent = message;
    toast.className = `toast ${type} show`;

    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
      toastTimer = null;
    }, 2200);
  }

  // ── Init ──────────────────────────────────
  updateCharCount();
})();
