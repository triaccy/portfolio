// Landing has no JS requirements yet — reserved for future interactions
(function () {
  console.log('Landing loaded');
})();

// Randomize year link positions and show separate topic links on hover
(function () {
  const container = document.getElementById('app');
  const nav = document.querySelector('.years');
  const topicsLayer = document.getElementById('topics');
  const webSvg = document.getElementById('web');
  if (!container || !nav || !topicsLayer || !webSvg) return;

  const anchors = Array.from(nav.querySelectorAll('a'));
  const activeYears = new Set();
  const yearToTopics = new Map(); // anchor -> Array<HTMLElement>
  const topicMap = new Map(); // topicName -> Array<HTMLElement>

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

  function sizeWebToContainer() {
    const rect = container.getBoundingClientRect();
    webSvg.setAttribute('width', String(Math.round(rect.width)));
    webSvg.setAttribute('height', String(Math.round(rect.height)));
    webSvg.setAttribute('viewBox', `0 0 ${Math.round(rect.width)} ${Math.round(rect.height)}`);
  }

  function layoutYearsNoOverlap() {
    const rect = container.getBoundingClientRect();
    const margin = 15;
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
    });

    return occupied;
  }

  function positionTopicNearNoOverlap(anchorX, anchorY, el, occupied) {
    const rect = container.getBoundingClientRect();
    const margin = 15;
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
    el.style.transform = `translate(${anchorX}px, ${anchorY}px)`;
    occupied.push({ left: anchorX, top: anchorY, right: anchorX + w, bottom: anchorY + h });
  }

  function parseTopics(anchor) {
    return (anchor.getAttribute('data-topics') || '')
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);
  }

  function updateWeb() {
    sizeWebToContainer();
    while (webSvg.firstChild) webSvg.removeChild(webSvg.firstChild);

    topicMap.forEach((nodes) => {
      if (!nodes || nodes.length < 2) return;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const aPos = getNodePosition(a);
          const bPos = getNodePosition(b);
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', String(aPos.x));
          line.setAttribute('y1', String(aPos.y));
          line.setAttribute('x2', String(bPos.x));
          line.setAttribute('y2', String(bPos.y));
          webSvg.appendChild(line);
        }
      }
    });
  }

  function getNodePosition(el) {
    const match = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(el.style.transform || '');
    const rect = el.getBoundingClientRect();
    const appRect = container.getBoundingClientRect();
    const x = match ? Number(match[1]) : rect.left - appRect.left;
    const y = match ? Number(match[2]) : rect.top - appRect.top;
    const size = measureSize(el);
    return { x: x + size.w / 2, y: y + size.h / 2 };
  }

  function createTopicsForYear(anchor, occupied) {
    const topics = parseTopics(anchor);
    const ax = Number(anchor.dataset.x || 0);
    const ay = Number(anchor.dataset.y || 0);

    const created = [];
    topics.forEach(topic => {
      const link = document.createElement('a');
      link.className = 'topic-link';
      link.href = `topic.html?t=${encodeURIComponent(topic)}`;
      link.textContent = topic;
      link.dataset.topic = topic;
      topicsLayer.appendChild(link);
      positionTopicNearNoOverlap(ax, ay, link, occupied);
      created.push(link);

      const arr = topicMap.get(topic) || [];
      arr.push(link);
      topicMap.set(topic, arr);
    });

    topicsLayer.classList.add('active');
    topicsLayer.setAttribute('aria-hidden', 'false');
    updateWeb();
    return created;
  }

  function activateYear(anchor) {
    if (activeYears.has(anchor)) return; // already active
    anchor.classList.add('active');
    activeYears.add(anchor);
    nav.classList.add('fade-back');

    const occupied = [];
    anchors.forEach(a => {
      const { w, h } = measureSize(a);
      const x = Number(a.dataset.x || 0);
      const y = Number(a.dataset.y || 0);
      if (!isNaN(x) && !isNaN(y)) occupied.push({ left: x, top: y, right: x + w, bottom: y + h });
    });
    Array.from(topicsLayer.querySelectorAll('.topic-link')).forEach(el => {
      const pos = getNodePosition(el);
      const { w, h } = measureSize(el);
      const x = Math.round(pos.x - w / 2);
      const y = Math.round(pos.y - h / 2);
      occupied.push({ left: x, top: y, right: x + w, bottom: y + h });
    });

    const els = createTopicsForYear(anchor, occupied);
    yearToTopics.set(anchor, els);
  }

  function clearAll() {
    activeYears.forEach(a => a.classList.remove('active'));
    activeYears.clear();
    yearToTopics.clear();
    topicMap.clear();
    nav.classList.remove('fade-back');
    topicsLayer.classList.remove('active');
    topicsLayer.setAttribute('aria-hidden', 'true');
    topicsLayer.innerHTML = '';
    while (webSvg.firstChild) webSvg.removeChild(webSvg.firstChild);
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
    sizeWebToContainer();
    const occupied = layoutYearsNoOverlap();
    if (activeYears.size) {
      activeYears.forEach(a => {
        const ax = Number(a.dataset.x || 0);
        const ay = Number(a.dataset.y || 0);
        const links = yearToTopics.get(a) || [];
        links.forEach(link => positionTopicNearNoOverlap(ax, ay, link, occupied));
      });
    }
    updateWeb();
  });

  window.addEventListener('load', () => {
    sizeWebToContainer();
    layoutYearsNoOverlap();
    updateWeb();
  });

  sizeWebToContainer();
  layoutYearsNoOverlap();
  updateWeb();
})();
