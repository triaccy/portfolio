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

  import('./js/constants.js');
  import('./js/utils.js');
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
    }

    function activateYear(anchor) {
      if (activeYears.has(anchor)) return;
      anchor.classList.add('active');
      activeYears.add(anchor);
      nav.classList.add('fade-back');

      const occupied = [];
      anchors.forEach(a => {
        const { w, h } = layout.measureSize ? layout.measureSize(a) : a.getBoundingClientRect();
        const x = Number(a.dataset.x || 0);
        const y = Number(a.dataset.y || 0);
        const width = 'w' in (layout.measureSize ? layout.measureSize(a) : { w: a.offsetWidth }) ? (layout.measureSize ? layout.measureSize(a).w : a.offsetWidth) : a.offsetWidth;
        const height = 'h' in (layout.measureSize ? layout.measureSize(a) : { h: a.offsetHeight }) ? (layout.measureSize ? layout.measureSize(a).h : a.offsetHeight) : a.offsetHeight;
        if (!isNaN(x) && !isNaN(y)) occupied.push({ left: x, top: y, right: x + width, bottom: y + height });
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
    updateWeb();
  });
})();
