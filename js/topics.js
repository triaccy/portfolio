import { positionTopicNearNoOverlap, getNodeCenter, sizeWebToContainer } from './layout.js';

export function parseTopics(anchor) {
  return (anchor.getAttribute('data-topics') || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

export function updateWeb(container, webSvg, topicMap) {
  sizeWebToContainer(container, webSvg);
  while (webSvg.firstChild) webSvg.removeChild(webSvg.firstChild);

  topicMap.forEach((nodes) => {
    if (!nodes || nodes.length < 2) return;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const aPos = getNodeCenter(container, a);
        const bPos = getNodeCenter(container, b);
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

export function createTopicsForYear(container, topicsLayer, topicMap, anchor, occupied) {
  const topics = parseTopics(anchor);
  const ax = Number(anchor.dataset.x || 0);
  const ay = Number(anchor.dataset.y || 0);

  const created = [];
  topics.forEach(topic => {
    const link = document.createElement('a');
    link.className = 'topic-link';
    const year = anchor.textContent.trim();

    if (topic === 'installation') {
      if (year === '2023') {
        link.href = `installations/2023/`;
      } else if (year === '2021') {
        link.href = `installations/2021/`;
      } else {
        link.href = `topic.html?y=${encodeURIComponent(year)}&t=${encodeURIComponent(topic)}`;
      }
    } else {
      link.href = `topic.html?y=${encodeURIComponent(year)}&t=${encodeURIComponent(topic)}`;
    }

    link.textContent = topic;
    link.dataset.topic = topic;
    link.dataset.year = year;
    topicsLayer.appendChild(link);
    positionTopicNearNoOverlap(container, ax, ay, link, occupied);
    created.push(link);

    const arr = topicMap.get(topic) || [];
    arr.push(link);
    topicMap.set(topic, arr);
  });

  topicsLayer.classList.add('active');
  topicsLayer.setAttribute('aria-hidden', 'false');
  return created;
}

