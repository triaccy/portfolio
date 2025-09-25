export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function measureSize(element) {
  const box = element.getBoundingClientRect();
  return { w: Math.ceil(box.width || 60), h: Math.ceil(box.height || 16) };
}

export function getTranslatePosition(element, fallbackLeft, fallbackTop) {
  const match = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(element.style.transform || '');
  const x = match ? Number(match[1]) : fallbackLeft;
  const y = match ? Number(match[2]) : fallbackTop;
  return { x, y };
}

export function boxesOverlap(a, b, gap) {
  return !(
    a.right + gap < b.left ||
    a.left - gap > b.right ||
    a.bottom + gap < b.top ||
    a.top - gap > b.bottom
  );
}

