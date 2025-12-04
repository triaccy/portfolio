/**
 * Image Display Module
 * Provides reusable functions for creating different image display styles
 */

/**
 * Main function to create image displays
 * @param {string} type - 'gallery' or 'vertical'
 * @param {Array} images - Array of image objects: [{src: 'path', alt: 'text'}, ...]
 * @param {Object} options - Optional configuration
 * @returns {string} HTML string
 */
function createImageDisplay(type, images, options = {}) {
  if (!images || images.length === 0) return '';
  
  const displayId = options.id || `display-${Date.now()}`;
  
  switch(type) {
    case 'gallery':
      return createGalleryDisplay(images, displayId, options);
    case 'vertical':
      return createVerticalScrollDisplay(images, displayId, options);
    default:
      return '';
  }
}

/**
 * Creates gallery-style display (full-width with navigation)
 */
function createGalleryDisplay(images, displayId, options) {
  // Escape HTML attribute values (preserves URL characters like spaces, which browsers encode automatically)
  const escapeAttr = (str) => {
    if (!str) return '';
    // Only escape characters that break HTML attributes
    return String(str).replace(/&/g, '&amp;')
                      .replace(/"/g, '&quot;');
  };
  
  const imageElements = images.map((img, index) => {
    // For src, preserve URL as-is (browser will URL-encode when making request)
    // Only escape HTML-breaking characters
    const src = escapeAttr(img.src);
    const alt = escapeAttr(img.alt || '');
    return `<img src="${src}" class="display-image ${index === 0 ? 'active' : ''}" 
          onerror="this.style.display='none';" 
          alt="${alt}" />`;
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
 * Creates vertical scroll display
 */
function createVerticalScrollDisplay(images, displayId, options) {
  // Escape HTML attribute values (preserves URL characters like spaces, which browsers encode automatically)
  const escapeAttr = (str) => {
    if (!str) return '';
    // Only escape characters that break HTML attributes
    return String(str).replace(/&/g, '&amp;')
                      .replace(/"/g, '&quot;');
  };
  
  const imageElements = images.map(img => {
    // For src, preserve URL as-is (browser will URL-encode when making request)
    // Only escape HTML-breaking characters
    const src = escapeAttr(img.src);
    const alt = escapeAttr(img.alt || '');
    return `<img src="${src}" class="display-image" 
          onerror="this.style.display='none';" 
          alt="${alt}" />`;
  }).join('\n');
  
  return `
    <div class="image-display vertical" data-display-id="${displayId}">
      ${imageElements}
    </div>
  `;
}

/**
 * Initialize all image displays on the page
 */
function initImageDisplays() {
  // Initialize gallery displays
  const galleryContainers = document.querySelectorAll('.image-display.gallery .display-container');
  
  if (galleryContainers.length === 0) {
    console.log('No gallery containers found');
    return;
  }
  
  galleryContainers.forEach(container => {
    // Get both images and videos
    const allImages = container.querySelectorAll('.display-image');
    const allVideos = container.querySelectorAll('.display-video');
    const allMedia = Array.from(allImages).concat(Array.from(allVideos));
    
    console.log(`Gallery container found: ${allImages.length} images, ${allVideos.length} videos`);
    
    // Filter out media that fail to load
    // For dynamically inserted media, we need to wait for them to load
    const checkMedia = () => {
      const media = Array.from(allMedia).filter(item => {
        // Skip if already hidden
        if (item.style.display === 'none') {
          return false;
        }
        // For videos (iframes), always include them
        if (item.tagName === 'IFRAME') {
          return true;
        }
        // For images that haven't loaded yet, include them (they'll be checked on load)
        if (!item.complete) {
          return true;
        }
        // If image loaded but has 0 height, it's broken
        if (item.naturalHeight === 0) {
          item.style.display = 'none';
          return false;
        }
        return true;
      });
      
      return media;
    };
    
    let media = checkMedia();
    
    // If no media are ready yet, wait for images to load (videos don't need to wait)
    if (media.length === 0 && allImages.length > 0) {
      // Wait for images to load
      const imagePromises = Array.from(allImages).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', reject, { once: true });
        });
      });
      
      Promise.allSettled(imagePromises).then(() => {
        media = checkMedia();
        if (media.length > 0) {
          initializeGallery(container, media, allMedia);
        }
      });
      return;
    }
    
    if (media.length === 0) {
      console.log('No valid media found in gallery container');
      return;
    }
    
    console.log(`Initializing gallery with ${media.length} media items`);
    initializeGallery(container, media, allMedia);
  });
}

function initializeGallery(container, images, allImages) {
  // Skip if already initialized (check for existing data attribute)
  if (container.dataset.galleryInitialized === 'true') {
    return;
  }
  container.dataset.galleryInitialized = 'true';
  
  // Each gallery has its own state
  const galleryState = {
    currentImageIndex: 0,
    images: images
  };
  
  // Hide navigation if only one image
  const navButtons = container.querySelectorAll('.display-nav');
  if (images.length <= 1) {
    navButtons.forEach(btn => btn.style.display = 'none');
    // Change cursor to default if only one item
    container.style.cursor = 'default';
    return;
  }
  
  // Set cursor to ew-resize for navigable galleries
  container.style.cursor = 'ew-resize';
  
  function updateGallery(direction = 0) {
    galleryState.images.forEach(img => {
      img.classList.remove('active', 'prev');
    });
    if (galleryState.images[galleryState.currentImageIndex]) {
      galleryState.images[galleryState.currentImageIndex].classList.add('active');
    }
    
    // Update counter - find counter outside container (sibling of display-container)
    const gallery = container.closest('.image-display.gallery');
    const counter = gallery ? gallery.querySelector('.gallery-counter') : null;
    if (counter && galleryState.images.length > 0) {
      const current = galleryState.currentImageIndex + 1;
      const total = galleryState.images.length;
      counter.textContent = `${current}/${total}`;
    }
  }
  
  function changeImage(direction) {
    let newIndex = galleryState.currentImageIndex + direction;
    if (newIndex >= galleryState.images.length) {
      newIndex = 0;
    } else if (newIndex < 0) {
      newIndex = galleryState.images.length - 1;
    }
    galleryState.currentImageIndex = newIndex;
    updateGallery(direction);
  }
  
  // Set up navigation buttons
  const prevBtn = container.querySelector('.display-nav.prev');
  const nextBtn = container.querySelector('.display-nav.next');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => changeImage(-1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => changeImage(1));
  }
  
  // Click on container to go to next (but not on video controls or videos)
  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('display-nav')) return;
    if (e.target.closest('.video-controls-overlay')) return;
    if (e.target.closest('.video-controls')) return;
    if (e.target.closest('.video-control-btn')) return;
    if (e.target.closest('.video-progress-container')) return;
    if (e.target.closest('.video-progress-wrapper')) return;
    if (e.target.closest('.video-progress-overlay')) return;
    // Don't navigate if clicking directly on a video iframe (handled separately)
    if (e.target.classList.contains('display-video')) return;
    
    // If there are videos in the gallery and we're clicking outside the video, navigate
    const videos = container.querySelectorAll('.display-video');
    if (videos.length > 0) {
      // Check if click is on the video itself
      const clickedVideo = e.target.closest('.display-video');
      if (!clickedVideo) {
        // Click is outside video, navigate to next
        changeImage(1);
      }
    } else {
      // No videos, just navigate normally
      changeImage(1);
    }
  });
  
  // Add click handlers for video navigation
  // Videos need special handling because iframes from other domains capture clicks
  // We'll add a transparent navigation overlay that allows clicks through to controls
  const videos = container.querySelectorAll('.display-video');
  
  if (videos.length > 0) {
    // Create a single navigation overlay for the container
    let navOverlay = container.querySelector('.video-nav-overlay');
    if (!navOverlay) {
      navOverlay = document.createElement('div');
      navOverlay.className = 'video-nav-overlay';
      navOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: transparent;
        cursor: pointer;
        z-index: 4;
        pointer-events: auto;
      `;
      container.appendChild(navOverlay);
    }
    
    // Update overlay visibility based on active video
    const updateNavOverlay = () => {
      const activeVideo = container.querySelector('.display-video.active');
      if (activeVideo && navOverlay) {
        // Show overlay only when there's an active video
        navOverlay.style.display = 'block';
        navOverlay.style.pointerEvents = 'auto';
      } else if (navOverlay) {
        navOverlay.style.display = 'none';
        navOverlay.style.pointerEvents = 'none';
      }
    };
    
    // Initial update
    updateNavOverlay();
    
    // Watch for active class changes on videos
    videos.forEach((video) => {
      const observer = new MutationObserver(updateNavOverlay);
      observer.observe(video, { attributes: true, attributeFilter: ['class'] });
    });
    
    // Add click handler to navigation overlay - navigate when clicking outside video
    navOverlay.addEventListener('click', (e) => {
      // Check what element is actually at the click point
      const clickTarget = document.elementFromPoint(e.clientX, e.clientY);
      
      if (clickTarget) {
        // Don't navigate if click is on controls, progress bar, or video itself
        if (clickTarget.closest('.video-controls-overlay') ||
            clickTarget.closest('.video-controls') ||
            clickTarget.closest('.video-control-btn') ||
            clickTarget.closest('.video-progress-container') ||
            clickTarget.closest('.video-progress-wrapper') ||
            clickTarget.closest('.video-progress-overlay') ||
            clickTarget.closest('.display-nav') ||
            clickTarget.classList.contains('display-nav') ||
            clickTarget.classList.contains('display-video') ||
            clickTarget.tagName === 'IFRAME') {
          return;
        }
      }
      
      // Click is outside video - navigate to next video/image
      e.stopPropagation();
      e.preventDefault();
      changeImage(1);
    });
    
    // Also handle mousedown to ensure we catch the event
    navOverlay.addEventListener('mousedown', (e) => {
      const clickTarget = document.elementFromPoint(e.clientX, e.clientY);
      if (clickTarget && (
        clickTarget.closest('.video-controls-overlay') ||
        clickTarget.closest('.video-controls') ||
        clickTarget.closest('.video-control-btn') ||
        clickTarget.closest('.video-progress-container') ||
        clickTarget.closest('.display-nav')
      )) {
        return; // Let controls handle it
      }
      // Don't prevent default here, just mark for navigation on click
    });
  }
  
  // Handle image load errors
  allImages.forEach(img => {
    img.addEventListener('error', function() {
      this.style.display = 'none';
      const validImages = Array.from(allImages).filter(i => 
        i.style.display !== 'none' && (i.complete && i.naturalHeight > 0)
      );
      if (validImages.length <= 1) {
        navButtons.forEach(btn => btn.style.display = 'none');
      }
    });
  });
  
  // Initialize gallery
  updateGallery();
  
  // Update counter with actual number of valid images - find counter outside container
  const gallery = container.closest('.image-display.gallery');
  const counter = gallery ? gallery.querySelector('.gallery-counter') : null;
  if (counter && images.length > 0) {
    counter.textContent = `1/${images.length}`;
  }
  
  // Update cursor based on number of items
  if (images.length <= 1) {
    container.style.cursor = 'default';
  } else {
    container.style.cursor = 'ew-resize';
  }
}

