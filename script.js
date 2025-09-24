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

  function createTopicLinks(topics, anchorX, anchorY) {
    // Clear existing topic links
    topicsLayer.innerHTML = '';
    
    topics.forEach((topic, idx) => {
      const link = document.createElement('a');
      link.className = 'topic-link';
      link.textContent = topic;
      link.href = `#${topic}`;
      
      // Position topics around the hovered year
      const angle = (idx / topics.length) * Math.PI * 2;
      const radius = 80;
      const x = anchorX + Math.cos(angle) * radius;
      const y = anchorY + Math.sin(angle) * radius;
      
      link.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        console.log(`Clicked topic: ${topic}`);
        // Add your topic click handler here
      });
      
      topicsLayer.appendChild(link);
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
