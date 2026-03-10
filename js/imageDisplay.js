/**
 * Image Display Module
 * Provides reusable functions for creating gallery, vertical, and spread image displays.
 */

// Escape characters that break HTML attributes (preserves URL characters like spaces)
function escapeAttr(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

/**
 * Main entry point — create an image display by type.
 * @param {string} type - 'gallery', 'vertical', or 'spread'
 * @param {Array}  images  - Array of { src, alt, type? } objects
 * @param {Object} options - Optional config (id)
 * @returns {string} HTML string
 */
function createImageDisplay(type, images, options = {}) {
  if (!images || images.length === 0) return '';
  const displayId = options.id || `display-${Date.now()}`;
  switch (type) {
    case 'gallery':  return createGalleryDisplay(images, displayId, options);
    case 'vertical': return createVerticalScrollDisplay(images, displayId, options);
    case 'spread':   return createSpreadDisplay(images, displayId, options);
    default: return '';
  }
}

/**
 * Gallery-style display (full-width with prev/next navigation)
 */
function createGalleryDisplay(images, displayId, options) {
  const imageElements = images.map((img, index) => {
    const isVideo = img.type === 'video' ||
                    img.src.includes('youtube.com') ||
                    img.src.includes('youtu.be') ||
                    img.src.includes('vimeo.com') ||
                    img.src.includes('player.vimeo.com') ||
                    img.src.includes('player.youtube.com');

    if (isVideo) {
      let videoSrc = img.src;
      // Convert YouTube watch URL to embed URL
      if (videoSrc.includes('youtube.com/watch') || videoSrc.includes('youtu.be/')) {
        const match = videoSrc.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
        if (match) {
          videoSrc = `https://www.youtube.com/embed/${match[1]}?autoplay=0&loop=0&muted=0&controls=0&rel=0&modestbranding=1`;
        }
      }
      // Convert bare Vimeo URL to player embed URL
      if (videoSrc.includes('vimeo.com/') && !videoSrc.includes('player.vimeo.com')) {
        const match = videoSrc.match(/vimeo\.com\/(\d+)/);
        if (match) {
          videoSrc = `https://player.vimeo.com/video/${match[1]}?autoplay=0&loop=0&muted=0&controls=0&title=0&byline=0&portrait=0`;
        }
      }
      const src = escapeAttr(videoSrc);
      const alt = escapeAttr(img.alt || 'Video');
      return `<iframe src="${src}"
            class="display-video ${index === 0 ? 'active' : ''}"
            title="${alt}"
            frameborder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowfullscreen>
            </iframe>`;
    } else {
      const src = escapeAttr(img.src);
      const alt = escapeAttr(img.alt || '');
      if (src.toLowerCase().endsWith('.tiff') || src.toLowerCase().endsWith('.tif')) {
        console.warn(`TIFF file detected: ${src}. Browsers do not support TIFF format. Please convert to PNG or JPG.`);
      }
      return `<img src="${src}" class="display-image ${index === 0 ? 'active' : ''}"
            onerror="console.error('Failed to load image:', '${src}'); this.style.display='none';"
            alt="${alt}" />`;
    }
  }).join('\n');

  return `
    <div class="image-display gallery" data-display-id="${displayId}">
      <div class="display-container">
        ${imageElements}
        <button class="display-nav prev" data-display-id="${displayId}" style="display: none;">&lt;</button>
        <button class="display-nav next" data-display-id="${displayId}" style="display: none;">&gt;</button>
      </div>
      <div class="gallery-counter" data-display-id="${displayId}">1/${images.length}</div>
    </div>
  `;
}

/**
 * Vertical scroll display — images stacked top-to-bottom
 */
function createVerticalScrollDisplay(images, displayId, options) {
  const imageElements = images.map(img => {
    const src = escapeAttr(img.src);
    const alt = escapeAttr(img.alt || '');
    if (src.toLowerCase().endsWith('.tiff') || src.toLowerCase().endsWith('.tif')) {
      console.warn(`TIFF file detected: ${src}. Browsers do not support TIFF format. Please convert to PNG or JPG.`);
    }
    return `<img src="${src}" class="display-image"
          onerror="console.error('Failed to load image:', '${src}'); this.style.display='none';"
          alt="${alt}" />`;
  }).join('\n');

  return `
    <div class="image-display vertical" data-display-id="${displayId}">
      ${imageElements}
    </div>
  `;
}

/**
 * Spread display — pairs of images side-by-side like a book spread
 */
function createSpreadDisplay(images, displayId, options) {
  const spreads = [];
  for (let i = 0; i < images.length; i += 2) {
    spreads.push(images.slice(i, i + 2));
  }

  const spreadElements = spreads.map((spread) => {
    const imageElements = spread.map((img) => {
      const src = escapeAttr(img.src);
      const alt = escapeAttr(img.alt || '');
      if (src.toLowerCase().endsWith('.tiff') || src.toLowerCase().endsWith('.tif')) {
        console.warn(`TIFF file detected: ${src}. Browsers do not support TIFF format. Please convert to PNG or JPG.`);
      }
      return `<img src="${src}" class="display-image"
            onerror="console.error('Failed to load image:', '${src}'); this.style.display='none';"
            alt="${alt}" />`;
    }).join('\n');

    return `<div class="spread-row">${imageElements}</div>`;
  }).join('\n');

  return `
    <div class="image-display spread" data-display-id="${displayId}">
      ${spreadElements}
    </div>
  `;
}

/**
 * Initialize all gallery displays on the page.
 * Call after inserting gallery HTML into the DOM.
 */
function initImageDisplays() {
  const galleryContainers = document.querySelectorAll('.image-display.gallery .display-container');

  if (galleryContainers.length === 0) {
    console.log('No gallery containers found');
    return;
  }

  galleryContainers.forEach(container => {
    const allImages = container.querySelectorAll('.display-image');
    const allVideos = container.querySelectorAll('.display-video');
    const allMedia = Array.from(allImages).concat(Array.from(allVideos));

    const checkMedia = () => Array.from(allMedia).filter(item => {
      if (item.style.display === 'none') return false;
      if (item.tagName === 'IFRAME') return true;
      if (!item.complete) return true;
      if (item.naturalHeight === 0) { item.style.display = 'none'; return false; }
      return true;
    });

    let media = checkMedia();

    if (media.length === 0 && allImages.length > 0) {
      const imagePromises = Array.from(allImages).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          const timeout = setTimeout(resolve, 2000);
          img.addEventListener('load',  () => { clearTimeout(timeout); resolve(); }, { once: true });
          img.addEventListener('error', () => { clearTimeout(timeout); resolve(); }, { once: true });
        });
      });
      Promise.allSettled(imagePromises).then(() => {
        media = checkMedia();
        initializeGallery(container, media.length > 0 ? media : Array.from(allMedia), allMedia);
      });
      return;
    }

    initializeGallery(container, media.length > 0 ? media : Array.from(allMedia), allMedia);
  });
}

function initializeGallery(container, images, allImages) {
  if (container.dataset.galleryInitialized === 'true') return;
  container.dataset.galleryInitialized = 'true';

  const galleryState = { currentImageIndex: 0, images };
  const navButtons = container.querySelectorAll('.display-nav');

  if (images.length <= 1) {
    navButtons.forEach(btn => btn.style.display = 'none');
    container.style.cursor = 'default';
    return;
  }

  container.style.cursor = 'ew-resize';

  function updateGallery() {
    galleryState.images.forEach(img => img.classList.remove('active', 'prev'));
    if (galleryState.images[galleryState.currentImageIndex]) {
      galleryState.images[galleryState.currentImageIndex].classList.add('active');
    }

    const gallery = container.closest('.image-display.gallery');
    const counter = gallery ? gallery.querySelector('.gallery-counter') : null;
    if (counter) {
      counter.textContent = `${galleryState.currentImageIndex + 1}/${galleryState.images.length}`;
    }

    // Sync video-nav overlay size when active video changes
    const activeVideo = container.querySelector('.display-video.active');
    if (activeVideo) {
      setTimeout(() => {
        const overlay = container.querySelector('.video-click-overlay');
        if (overlay) {
          const vr = activeVideo.getBoundingClientRect();
          const cr = container.getBoundingClientRect();
          overlay.style.top    = `${vr.top  - cr.top}px`;
          overlay.style.left   = `${vr.left - cr.left}px`;
          overlay.style.width  = `${vr.width}px`;
          overlay.style.height = `${vr.height}px`;
        }
      }, 50);
    }
  }

  function changeImage(direction) {
    let next = galleryState.currentImageIndex + direction;
    if (next >= galleryState.images.length) next = 0;
    else if (next < 0) next = galleryState.images.length - 1;
    galleryState.currentImageIndex = next;
    updateGallery();
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    const gallery = container.closest('.image-display.gallery');
    if (!gallery || !document.body.contains(gallery)) return;
    const rect = gallery.getBoundingClientRect();
    if (rect.top >= window.innerHeight || rect.bottom <= 0) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); changeImage(1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); changeImage(-1); }
  });

  // Nav buttons
  const prevBtn = container.querySelector('.display-nav.prev');
  const nextBtn = container.querySelector('.display-nav.next');
  if (prevBtn) prevBtn.addEventListener('click', () => changeImage(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => changeImage(1));

  // Click to advance (skip nav buttons and video controls)
  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('display-nav')) return;
    if (e.target.closest('.video-controls-overlay') ||
        e.target.closest('.video-controls') ||
        e.target.closest('.video-click-overlay') ||
        e.target.closest('.video-nav-overlay')) return;

    const activeVideo = container.querySelector('.display-video.active');
    if (activeVideo) {
      const vr = activeVideo.getBoundingClientRect();
      const onVideo = e.clientX >= vr.left && e.clientX <= vr.right &&
                      e.clientY >= vr.top  && e.clientY <= vr.bottom;
      if (onVideo) return; // let pause/resume handle it
    }
    changeImage(1);
  });

  // Transparent navigation overlay for video galleries (iframes capture clicks)
  const videos = container.querySelectorAll('.display-video');
  if (videos.length > 0) {
    let navOverlay = container.querySelector('.video-nav-overlay');
    if (!navOverlay) {
      navOverlay = document.createElement('div');
      navOverlay.className = 'video-nav-overlay';
      navOverlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:transparent;cursor:pointer;z-index:4;pointer-events:auto;';
      container.appendChild(navOverlay);
    }

    const updateNavOverlay = () => {
      const hasActiveVideo = !!container.querySelector('.display-video.active');
      navOverlay.style.display = hasActiveVideo ? 'block' : 'none';
      navOverlay.style.pointerEvents = hasActiveVideo ? 'auto' : 'none';
    };
    updateNavOverlay();
    videos.forEach(v => new MutationObserver(updateNavOverlay).observe(v, { attributes: true, attributeFilter: ['class'] }));

    navOverlay.addEventListener('click', (e) => {
      const t = document.elementFromPoint(e.clientX, e.clientY);
      if (t && (t.closest('.video-controls-overlay') || t.closest('.video-controls') ||
                t.closest('.video-click-overlay') || t.closest('.display-nav') ||
                t.tagName === 'IFRAME')) return;
      const av = container.querySelector('.display-video.active');
      if (av) {
        const vr = av.getBoundingClientRect();
        if (e.clientX >= vr.left && e.clientX <= vr.right &&
            e.clientY >= vr.top  && e.clientY <= vr.bottom) return;
      }
      e.stopPropagation();
      e.preventDefault();
      changeImage(1);
    });
  }

  // Handle image load errors
  allImages.forEach(img => {
    img.addEventListener('error', function () {
      this.style.display = 'none';
      const valid = Array.from(allImages).filter(i => i.style.display !== 'none' && i.complete && i.naturalHeight > 0);
      if (valid.length <= 1) navButtons.forEach(btn => btn.style.display = 'none');
    });
  });

  updateGallery();

  const gallery = container.closest('.image-display.gallery');
  const counter = gallery ? gallery.querySelector('.gallery-counter') : null;
  if (counter) counter.textContent = `1/${images.length}`;
}
