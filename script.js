// Landing page — handles year/topic placement and web visualization

(function () {
  const container = document.getElementById('app');
  const nav = document.querySelector('.years');
  const topicsLayer = document.getElementById('topics');
  const webSvg = document.getElementById('web');
  if (!container || !nav || !topicsLayer || !webSvg) return;

  Promise.all([
    import('./js/layout.js'),
    import('./js/topics.js')
  ]).then(([layout, topics]) => {
    const anchors = Array.from(nav.querySelectorAll('a'));
    const activeYears = new Set();
    const yearToTopics = new Map();
    const topicMap = new Map();

    function updateWeb() {
      topics.updateWeb(container, webSvg, topicMap);

      // Custom cross-year connections between different topic names
      const customConnections = [
        { a: { topic: 'interaction', year: '2025' }, b: { topic: 'speculation', year: '2023' } },
        { a: { topic: '3dxpaper',   year: '2025' }, b: { topic: 'chemistry',   year: '2022' } }
      ];
      customConnections.forEach(({ a, b }) => {
        const elA = topicsLayer.querySelector(`[data-topic="${a.topic}"][data-year="${a.year}"]`);
        const elB = topicsLayer.querySelector(`[data-topic="${b.topic}"][data-year="${b.year}"]`);
        if (!elA || !elB) return;
        const aPos = layout.getNodeCenter(container, elA);
        const bPos = layout.getNodeCenter(container, elB);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(aPos.x));
        line.setAttribute('y1', String(aPos.y));
        line.setAttribute('x2', String(bPos.x));
        line.setAttribute('y2', String(bPos.y));
        webSvg.appendChild(line);
      });
    }

    function activateYear(anchor) {
      if (activeYears.has(anchor)) return;
      anchor.classList.add('active');
      activeYears.add(anchor);
      nav.classList.add('fade-back');

      const occupied = [];
      anchors.forEach(a => {
        const rect = a.getBoundingClientRect();
        const w = Math.ceil(rect.width || 60);
        const h = Math.ceil(rect.height || 16);
        const x = Number(a.dataset.x || 0);
        const y = Number(a.dataset.y || 0);
        if (!isNaN(x) && !isNaN(y)) occupied.push({ left: x, top: y, right: x + w, bottom: y + h });
      });
      Array.from(topicsLayer.querySelectorAll('.topic-link')).forEach(el => {
        const pos = layout.getNodeCenter(container, el);
        const rect = el.getBoundingClientRect();
        const x = Math.round(pos.x - rect.width / 2);
        const y = Math.round(pos.y - rect.height / 2);
        occupied.push({ left: x, top: y, right: x + rect.width, bottom: y + rect.height });
      });

      const els = topics.createTopicsForYear(container, topicsLayer, topicMap, anchor, occupied);
      yearToTopics.set(anchor, els);
      updateWeb();
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
      a.addEventListener('mousedown', (e) => e.preventDefault());
    });

    container.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest('.topic-link') || target.closest('.years a')) return;
      clearAll();
    });

    window.addEventListener('resize', () => {
      layout.sizeWebToContainer(container, webSvg);
      const occupied = layout.layoutYearsNoOverlap(container, anchors);
      if (activeYears.size) {
        activeYears.forEach(a => {
          const ax = Number(a.dataset.x || 0);
          const ay = Number(a.dataset.y || 0);
          const links = yearToTopics.get(a) || [];
          links.forEach(link => layout.positionTopicNearNoOverlap(container, ax, ay, link, occupied));
        });
      }
      updateWeb();
    });

    window.addEventListener('load', () => {
      layout.sizeWebToContainer(container, webSvg);
      layout.layoutYearsNoOverlap(container, anchors);
      updateWeb();
    });

    layout.sizeWebToContainer(container, webSvg);
    layout.layoutYearsNoOverlap(container, anchors);
    nav.classList.add('ready');
    updateWeb();
  });
})();
