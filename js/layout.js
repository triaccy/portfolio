import { CANVAS_PADDING, MIN_GAP, YEAR_ATTEMPTS, TOPIC_ATTEMPTS } from './constants.js';
import { clamp, measureSize, getTranslatePosition, boxesOverlap } from './utils.js';

export function sizeWebToContainer(container, webSvg) {
  const rect = container.getBoundingClientRect();
  webSvg.setAttribute('width', String(Math.round(rect.width)));
  webSvg.setAttribute('height', String(Math.round(rect.height)));
  webSvg.setAttribute('viewBox', `0 0 ${Math.round(rect.width)} ${Math.round(rect.height)}`);
}

export function layoutYearsNoOverlap(container, anchors) {
  const rect = container.getBoundingClientRect();
  const occupied = [];

  anchors.forEach(anchor => {
    const { w, h } = measureSize(anchor);
    let placed = false;
    for (let i = 0; i < YEAR_ATTEMPTS && !placed; i++) {
      const x = clamp(Math.round(Math.random() * (rect.width - w - CANVAS_PADDING * 2)) + CANVAS_PADDING, CANVAS_PADDING, rect.width - CANVAS_PADDING - w);
      const y = clamp(Math.round(Math.random() * (rect.height - h - CANVAS_PADDING * 2)) + CANVAS_PADDING, CANVAS_PADDING, rect.height - CANVAS_PADDING - h);
      const candidate = { left: x, top: y, right: x + w, bottom: y + h };
      if (!occupied.some(r => boxesOverlap(candidate, r, MIN_GAP))) {
        anchor.style.transform = `translate(${x}px, ${y}px)`;
        anchor.dataset.x = String(x);
        anchor.dataset.y = String(y);
        occupied.push(candidate);
        placed = true;
      }
    }
    if (!placed) {
      const x = CANVAS_PADDING; const y = CANVAS_PADDING;
      anchor.style.transform = `translate(${x}px, ${y}px)`;
      anchor.dataset.x = String(x);
      anchor.dataset.y = String(y);
      occupied.push({ left: x, top: y, right: x + w, bottom: y + h });
    }
  });

  return occupied;
}

export function positionTopicNearNoOverlap(container, anchorX, anchorY, element, occupied) {
  const rect = container.getBoundingClientRect();
  const { w, h } = measureSize(element);

  for (let i = 0; i < TOPIC_ATTEMPTS; i++) {
    const baseRadius = 90 + Math.random() * 140;
    const angle = Math.random() * Math.PI * 2;
    const jitterR = (Math.random() - 0.5) * 32;
    const r = baseRadius + jitterR;
    let x = anchorX + Math.cos(angle) * r;
    let y = anchorY + Math.sin(angle) * r;
    x = clamp(Math.round(x), CANVAS_PADDING, rect.width - CANVAS_PADDING - w);
    y = clamp(Math.round(y), CANVAS_PADDING, rect.height - CANVAS_PADDING - h);
    const candidate = { left: x, top: y, right: x + w, bottom: y + h };
    if (!occupied.some(r2 => boxesOverlap(candidate, r2, MIN_GAP))) {
      element.style.transform = `translate(${x}px, ${y}px)`;
      occupied.push(candidate);
      return;
    }
  }
  const x = clamp(Math.round(anchorX), CANVAS_PADDING, rect.width - CANVAS_PADDING - w);
  const y = clamp(Math.round(anchorY), CANVAS_PADDING, rect.height - CANVAS_PADDING - h);
  element.style.transform = `translate(${x}px, ${y}px)`;
  occupied.push({ left: x, top: y, right: x + w, bottom: y + h });
}

export function getNodeCenter(container, element) {
  const appRect = container.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  const { x, y } = getTranslatePosition(element, rect.left - appRect.left, rect.top - appRect.top);
  const size = measureSize(element);
  return { x: x + size.w / 2, y: y + size.h / 2 };
}

