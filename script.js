// Landing has no JS requirements yet — reserved for future interactions
(function () {
  console.log('Landing loaded');
})();

// Randomize year link positions within the app container and show topics on hover/click
(function () {
  const container = document.getElementById('app');
  const nav = document.querySelector('.years');
  const topicsLayer = document.getElementById('topics');
  if (!container || !nav || !topicsLayer) return;

  const anchors = Array.from(nav.querySelectorAll('a'));
  let pinnedAnchor = null;

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
    if (pinnedAnchor) {
      showTopicsForAnchor(pinnedAnchor);
    }
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

  function renderTopics(labelEl, a) {
    const tA = a.getAttribute('data-topic-a') || '';
    const tB = a.getAttribute('data-topic-b') || '';
    labelEl.innerHTML = '';
    const linkA = document.createElement('a');
    linkA.href = `#${tA}`;
    linkA.textContent = tA;
    const sep = document.createElement('span');
    sep.className = 'sep';
    sep.textContent = 'and';
    const linkB = document.createElement('a');
    linkB.href = `#${tB}`;
    linkB.textContent = tB;
    labelEl.appendChild(linkA);
    labelEl.appendChild(sep);
    labelEl.appendChild(linkB);
  }

  function showTopicsForAnchor(a) {
    const { label, connector } = ensureTopicElements();
    const ax = Number(a.dataset.x || 0);
    const ay = Number(a.dataset.y || 0);

    renderTopics(label, a);

    // Place label slightly offset to the right/bottom of the anchor
    const lx = ax + 40;
    const ly = ay + 16;
    label.style.transform = `translate(${lx}px, ${ly}px)`;

    // Draw connector from anchor to label
    const dx = lx - ax;
    const dy = ly - ay;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    connector.style.width = `${Math.max(10, Math.round(dist - 4))}px`;
    connector.style.transform = `translate(${ax}px, ${ay}px) rotate(${angle}deg)`;

    topicsLayer.classList.add('active');
    topicsLayer.setAttribute('aria-hidden', 'false');
  }

  function hideTopics() {
    topicsLayer.classList.remove('active');
    topicsLayer.setAttribute('aria-hidden', 'true');
  }

  anchors.forEach(a => {
    a.addEventListener('mouseenter', () => {
      if (!pinnedAnchor) showTopicsForAnchor(a);
    });
    a.addEventListener('focus', () => {
      if (!pinnedAnchor) showTopicsForAnchor(a);
    });
    a.addEventListener('mouseleave', () => {
      if (!pinnedAnchor) hideTopics();
    });
    a.addEventListener('blur', () => {
      if (!pinnedAnchor) hideTopics();
    });
    a.addEventListener('click', (e) => {
      e.preventDefault();
      if (pinnedAnchor === a) {
        pinnedAnchor = null;
        hideTopics();
      } else {
        pinnedAnchor = a;
        showTopicsForAnchor(a);
      }
    });
  });

  // Dismiss on background click or Escape
  container.addEventListener('click', (e) => {
    if (pinnedAnchor) {
      const withinYear = anchors.some(a => a === e.target);
      const withinTopics = topicsLayer.contains(e.target);
      if (!withinYear && !withinTopics) {
        pinnedAnchor = null;
        hideTopics();
      }
    }
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && pinnedAnchor) {
      pinnedAnchor = null;
      hideTopics();
    }
  });

  window.addEventListener('resize', layout);
  window.addEventListener('load', layout);
  layout();
})();
