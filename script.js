// Landing has no JS requirements yet — reserved for future interactions
(function () {
  console.log('Landing loaded');
})();

// Randomize year link positions within the app container and show topics on hover
(function () {
  const container = document.getElementById('app');
  const nav = document.querySelector('.years');
  const topicsLayer = document.getElementById('topics');
  if (!container || !nav || !topicsLayer) return;

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
      a.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
      a.dataset.x = String(Math.round(x));
      a.dataset.y = String(Math.round(y));
    });
  }

  function ensureTopicElements() {
    let label = topicsLayer.querySelector('.label');
    let connector = topicsLayer.querySelector('.connector');
    if (!label) {
      label = document.createElement('div');
      label.className = 'label';
      topicsLayer.appendChild(label);
    }
    if (!connector) {
      connector = document.createElement('div');
      connector.className = 'connector';
      topicsLayer.appendChild(connector);
    }
    return { label, connector };
  }

  function showTopicsForAnchor(a) {
    const { label, connector } = ensureTopicElements();
    const text = a.getAttribute('data-topics') || '';
    const ax = Number(a.dataset.x || 0);
    const ay = Number(a.dataset.y || 0);

    // Place label slightly offset to the right/bottom of the anchor
    const lx = ax + 40;
    const ly = ay + 16;
    label.textContent = text;
    label.style.transform = `translate(${lx}px, ${ly}px)`;

    // Draw connector from anchor to label
    const dx = lx - ax;
    const dy = ly - ay;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    connector.style.width = `${Math.max(10, Math.round(dist - 4))}px`;
    connector.style.transform = `translate(${ax}px, ${ay}px) rotate(${angle}deg)`;

    topicsLayer.setAttribute('aria-hidden', 'false');
  }

  function hideTopics() {
    topicsLayer.setAttribute('aria-hidden', 'true');
  }

  anchors.forEach(a => {
    a.addEventListener('mouseenter', () => showTopicsForAnchor(a));
    a.addEventListener('focus', () => showTopicsForAnchor(a));
    a.addEventListener('mouseleave', hideTopics);
    a.addEventListener('blur', hideTopics);
  });

  window.addEventListener('resize', () => {
    layout();
    hideTopics();
  });

  window.addEventListener('load', layout);
  layout();
})();
