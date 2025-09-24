// Landing has no JS requirements yet — reserved for future interactions
(function () {
  console.log('Landing loaded');
})();

// Randomize year link positions within the app container
(function () {
  const container = document.getElementById('app');
  const nav = document.querySelector('.years');
  if (!container || !nav) return;

  const anchors = Array.from(nav.querySelectorAll('a'));

  function jitteredPositions(count, width, height) {
    const positions = [];
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const cellW = width / cols;
    const cellH = height / rows;

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const baseX = col * cellW + cellW / 2;
      const baseY = row * cellH + cellH / 2;
      const jitterX = (Math.random() - 0.5) * cellW * 0.6;
      const jitterY = (Math.random() - 0.5) * cellH * 0.6;
      let x = baseX + jitterX;
      let y = baseY + jitterY;
      x = Math.max(8, Math.min(width - 8, x));
      y = Math.max(8, Math.min(height - 8, y));
      positions.push({ x, y });
    }
    return positions;
  }

  function layout() {
    const rect = container.getBoundingClientRect();
    const positions = jitteredPositions(anchors.length, rect.width, rect.height);
    anchors.forEach((a, idx) => {
      const { x, y } = positions[idx];
      // place with transform to keep text crisp
      a.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    });
  }

  window.addEventListener('resize', () => {
    layout();
  });

  // Initial after fonts/layout settle
  window.addEventListener('load', layout);
  layout();
})();
