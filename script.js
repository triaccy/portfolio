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

  function createTopicLinks(topics, anchorX, anchorY) {
    // Clear existing topic links
    topicsLayer.innerHTML = '';
    
    const rect = container.getBoundingClientRect();
    const margin = 12;

    topics.forEach(() => {
      const link = document.createElement('a');
      link.className = 'topic-link';
      link.href = '#';

      // Random nearby polar placement
      const baseRadius = 60 + Math.random() * 60; // 60-120px
      const angle = Math.random() * Math.PI * 2;  // 0-360 deg
      const jitterR = (Math.random() - 0.5) * 20; // ±20px
      const r = baseRadius + jitterR;

      let x = anchorX + Math.cos(angle) * r;
      let y = anchorY + Math.sin(angle) * r;

      x = clamp(Math.round(x), margin, rect.width - margin);
      y = clamp(Math.round(y), margin, rect.height - margin);

      link.style.transform = `translate(${x}px, ${y}px)`;
      topicsLayer.appendChild(link);
    });

    // After positions are set, assign text so width doesn't affect clamping calc
    const links = Array.from(topicsLayer.querySelectorAll('.topic-link'));
    links.forEach((link, i) => {
      link.textContent = topics[i];
      link.addEventListener('click', (e) => {
        e.preventDefault();
        console.log(`Clicked topic: ${topics[i]}`);
      });
    });
  }

  function showTopicsForAnchor(a) {
    const topics = a.getAttribute('data-topics').split(',');
    const ax = Number(a.dataset.x || 0);
    const ay = Number(a.dataset.y || 0);
    
    nav.classList.add('fade-back');
    createTopicLinks(topics, ax, ay);
    topicsLayer.classList.add('active');
    topicsLayer.setAttribute('aria-hidden', 'false');
  }

  function hideTopics() {
    nav.classList.remove('fade-back');
    topicsLayer.classList.remove('active');
    topicsLayer.setAttribute('aria-hidden', 'true');
    topicsLayer.innerHTML = '';
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
