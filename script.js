// Landing has no JS requirements yet — reserved for future interactions
(function () {
  console.log('Landing loaded');
})();

// Randomize year link positions within the app container and toggle-persist topics
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

  function place(el, x, y) {
    el.style.left = `${Math.round(x)}px`;
    el.style.top = `${Math.round(y)}px`;
  }

  function layout() {
    const rect = container.getBoundingClientRect();
    const positions = jitteredPositions(anchors.length, rect.width, rect.height);
    anchors.forEach((a, idx) => {
      const { x, y } = positions[idx];
      place(a, x, y);
      a.dataset.x = String(Math.round(x));
      a.dataset.y = String(Math.round(y));
    });
    if (pinnedAnchor) {
      renderTopicsForAnchor(pinnedAnchor);
    }
  }

  function ensureTopicElements() {
    let itemA = topicsLayer.querySelector('.item.a');
    let itemB = topicsLayer.querySelector('.item.b');
    if (!itemA) {
      itemA = document.createElement('a');
      itemA.className = 'item a';
      topicsLayer.appendChild(itemA);
    }
    if (!itemB) {
      itemB = document.createElement('a');
      itemB.className = 'item b';
      topicsLayer.appendChild(itemB);
    }
    return { itemA, itemB };
  }

  function disperseAround(ax, ay, width, height) {
    const r = Math.max(80, Math.min(width, height) * 0.25);
    const angleA = Math.random() * Math.PI * 2;
    const angleB = angleA + (Math.PI / 3 + Math.random() * Math.PI / 3);
    const xA = Math.max(8, Math.min(width - 8, ax + Math.cos(angleA) * r));
    const yA = Math.max(8, Math.min(height - 8, ay + Math.sin(angleA) * r));
    const xB = Math.max(8, Math.min(width - 8, ax + Math.cos(angleB) * r));
    const yB = Math.max(8, Math.min(height - 8, ay + Math.sin(angleB) * r));
    return { xA, yA, xB, yB };
  }

  function renderTopicsForAnchor(a) {
    const { itemA, itemB } = ensureTopicElements();
    const tA = a.getAttribute('data-topic-a') || '';
    const tB = a.getAttribute('data-topic-b') || '';
    const ax = Number(a.dataset.x || 0);
    const ay = Number(a.dataset.y || 0);

    itemA.textContent = tA;
    itemA.href = `#${tA}`;
    itemB.textContent = tB;
    itemB.href = `#${tB}`;

    const rect = container.getBoundingClientRect();
    const { xA, yA, xB, yB } = disperseAround(ax, ay, rect.width, rect.height);
    place(itemA, xA, yA);
    place(itemB, xB, yB);

    topicsLayer.classList.add('active');
    topicsLayer.setAttribute('aria-hidden', 'false');
  }

  function hideTopics() {
    topicsLayer.classList.remove('active');
    topicsLayer.setAttribute('aria-hidden', 'true');
  }

  function togglePin(a) {
    if (pinnedAnchor === a) {
      pinnedAnchor = null;
      hideTopics();
    } else {
      pinnedAnchor = a;
      renderTopicsForAnchor(a);
    }
  }

  anchors.forEach(a => {
    a.addEventListener('mouseenter', () => {
      if (!pinnedAnchor) renderTopicsForAnchor(a); // preview only
    });
    a.addEventListener('mouseleave', () => {
      if (!pinnedAnchor) hideTopics();
    });
    a.addEventListener('click', (e) => {
      e.preventDefault();
      togglePin(a); // pin/unpin on click only
    });
  });

  window.addEventListener('resize', layout);
  window.addEventListener('load', layout);
  layout();
})();
