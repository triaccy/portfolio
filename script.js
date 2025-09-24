// Landing has no JS requirements yet — reserved for future interactions
(function () {
  console.log('Landing loaded');
})();

// Randomize year link positions and show separate topic links on hover
(function () {
  const container = document.getElementById('app');
  const nav = document.querySelector('.years');
  const topicsLayer = document.getElementById('topics');
  if (!container || !nav || !topicsLayer) return;

  const anchors = Array.from(nav.querySelectorAll('a'));
  const activeYears = new Set();
  const yearToTopics = new Map(); // anchor -> Array<HTMLElement>

  function randomPositions(count, width, height) {
    const positions = [];
    const margin = 40;
    const usableWidth = width - margin * 2;
    const usableHeight = height - margin * 2;
    
    for (let i = 0; i < count; i++) {
      let attempts = 0;
      let x, y;
      
      do {
        x = margin + Math.random() * usableWidth;
        y = margin + Math.random() * usableHeight;
        attempts++;
      } while (attempts < 50 && positions.some(pos => {
        const dx = x - pos.x;
        const dy = y - pos.y;
        return Math.sqrt(dx * dx + dy * dy) < 60; // minimum distance
      }));
      
      positions.push({ x, y });
    }
    return positions;
  }

  function layout() {
    const rect = container.getBoundingClientRect();
    const positions = randomPositions(anchors.length, rect.width, rect.height);
    anchors.forEach((a, idx) => {
      const { x, y } = positions[idx];
      a.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
      a.dataset.x = String(Math.round(x));
      a.dataset.y = String(Math.round(y));
    });
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function positionTopicNear(anchorX, anchorY, el) {
    const rect = container.getBoundingClientRect();
    const margin = 8;
    const baseRadius = 70 + Math.random() * 90; // 70-160px
    const angle = Math.random() * Math.PI * 2;  // 0-360 deg
    const jitterR = (Math.random() - 0.5) * 24; // ±24px
    const r = baseRadius + jitterR;

    let x = anchorX + Math.cos(angle) * r;
    let y = anchorY + Math.sin(angle) * r;

    const box = el.getBoundingClientRect();
    const w = Math.ceil(box.width || 60);
    const h = Math.ceil(box.height || 16);
    x = clamp(Math.round(x), margin, rect.width - margin - w);
    y = clamp(Math.round(y), margin, rect.height - margin - h);
    el.style.transform = `translate(${x}px, ${y}px)`;
  }

  function createTopicsForYear(anchor) {
    const topics = (anchor.getAttribute('data-topics') || '').split(',').map(s => s.trim()).filter(Boolean);
    const ax = Number(anchor.dataset.x || 0);
    const ay = Number(anchor.dataset.y || 0);

    const created = [];
    topics.forEach(topic => {
      const link = document.createElement('a');
      link.className = 'topic-link';
      link.href = '#';
      link.textContent = topic;
      topicsLayer.appendChild(link);
      positionTopicNear(ax, ay, link);
      link.addEventListener('click', (e) => {
        e.preventDefault();
        console.log(`Clicked topic: ${topic}`);
      });
      created.push(link);
    });

    topicsLayer.classList.add('active');
    topicsLayer.setAttribute('aria-hidden', 'false');
    return created;
  }

  function activateYear(anchor) {
    if (activeYears.has(anchor)) return; // already active
    anchor.classList.add('active');
    activeYears.add(anchor);
    nav.classList.add('fade-back');

    const els = createTopicsForYear(anchor);
    yearToTopics.set(anchor, els);
  }

  function clearAll() {
    activeYears.forEach(a => a.classList.remove('active'));
    activeYears.clear();
    yearToTopics.clear();
    nav.classList.remove('fade-back');
    topicsLayer.classList.remove('active');
    topicsLayer.setAttribute('aria-hidden', 'true');
    topicsLayer.innerHTML = '';
  }

  anchors.forEach(a => {
    a.addEventListener('mouseenter', () => activateYear(a));
    a.addEventListener('focus', () => activateYear(a));
  });

  container.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest('.topic-link') || target.closest('.years a')) return;
    clearAll();
  });

  window.addEventListener('resize', () => {
    layout();
    if (!activeYears.size) return;
    // Reposition all active topics near their respective active year
    activeYears.forEach(a => {
      const ax = Number(a.dataset.x || 0);
      const ay = Number(a.dataset.y || 0);
      const links = yearToTopics.get(a) || [];
      links.forEach(link => positionTopicNear(ax, ay, link));
    });
  });

  window.addEventListener('load', layout);
  layout();
})();
