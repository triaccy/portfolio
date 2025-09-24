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

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function overlaps(a, b, gap = 4) {
    return !(
      a.right + gap < b.left ||
      a.left - gap > b.right ||
      a.bottom + gap < b.top ||
      a.top - gap > b.bottom
    );
  }

  function measureSize(el) {
    const box = el.getBoundingClientRect();
    return { w: Math.ceil(box.width || 60), h: Math.ceil(box.height || 16) };
  }

  function layoutYearsNoOverlap() {
    const rect = container.getBoundingClientRect();
    const margin = 8;
    const occupied = [];

    anchors.forEach(a => {
      const { w, h } = measureSize(a);
      let placed = false;
      for (let i = 0; i < 200 && !placed; i++) {
        const x = clamp(Math.round(Math.random() * (rect.width - w - margin * 2)) + margin, margin, rect.width - margin - w);
        const y = clamp(Math.round(Math.random() * (rect.height - h - margin * 2)) + margin, margin, rect.height - margin - h);
        const candidate = { left: x, top: y, right: x + w, bottom: y + h };
        if (!occupied.some(r => overlaps(candidate, r))) {
          a.style.transform = `translate(${x}px, ${y}px)`;
          a.dataset.x = String(x);
          a.dataset.y = String(y);
          occupied.push(candidate);
          placed = true;
        }
      }
      // fallback: if not placed, keep previous position
    });

    return occupied;
  }

  function positionTopicNearNoOverlap(anchorX, anchorY, el, occupied) {
    const rect = container.getBoundingClientRect();
    const margin = 8;
    const { w, h } = measureSize(el);

    for (let i = 0; i < 200; i++) {
      const baseRadius = 70 + Math.random() * 120; // 70-190px
      const angle = Math.random() * Math.PI * 2;
      const jitterR = (Math.random() - 0.5) * 24;
      const r = baseRadius + jitterR;
      let x = anchorX + Math.cos(angle) * r;
      let y = anchorY + Math.sin(angle) * r;
      x = clamp(Math.round(x), margin, rect.width - margin - w);
      y = clamp(Math.round(y), margin, rect.height - margin - h);
      const candidate = { left: x, top: y, right: x + w, bottom: y + h };
      if (!occupied.some(r2 => overlaps(candidate, r2))) {
        el.style.transform = `translate(${x}px, ${y}px)`;
        occupied.push(candidate);
        return;
      }
    }
    // fallback: place near anchor without overlap guarantee (rare)
    el.style.transform = `translate(${anchorX}px, ${anchorY}px)`;
    occupied.push({ left: anchorX, top: anchorY, right: anchorX + w, bottom: anchorY + h });
  }

  function createTopicsForYear(anchor, occupied) {
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
      positionTopicNearNoOverlap(ax, ay, link, occupied);
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

    // Build occupied with current years and existing topics
    const occupied = [];
    anchors.forEach(a => {
      const { w, h } = measureSize(a);
      const x = Number(a.dataset.x || 0);
      const y = Number(a.dataset.y || 0);
      if (!isNaN(x) && !isNaN(y)) occupied.push({ left: x, top: y, right: x + w, bottom: y + h });
    });
    Array.from(topicsLayer.querySelectorAll('.topic-link')).forEach(el => {
      const box = el.getBoundingClientRect();
      // translate values are relative to container, approximate via current transform positions
      const match = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(el.style.transform || '');
      const tx = match ? Number(match[1]) : box.left;
      const ty = match ? Number(match[2]) : box.top;
      occupied.push({ left: tx, top: ty, right: tx + Math.ceil(box.width), bottom: ty + Math.ceil(box.height) });
    });

    const els = createTopicsForYear(anchor, occupied);
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
    // Relayout years without overlap
    const occupied = layoutYearsNoOverlap();
    // Reposition all active topics respecting new occupied rects
    if (activeYears.size) {
      activeYears.forEach(a => {
        const ax = Number(a.dataset.x || 0);
        const ay = Number(a.dataset.y || 0);
        const links = yearToTopics.get(a) || [];
        links.forEach(link => positionTopicNearNoOverlap(ax, ay, link, occupied));
      });
    }
  });

  window.addEventListener('load', () => {
    layoutYearsNoOverlap();
  });

  // Initial layout
  layoutYearsNoOverlap();
})();
