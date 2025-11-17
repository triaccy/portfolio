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
        <button class="display-nav prev" data-display-id="${displayId}">‹</button>
        <button class="display-nav next" data-display-id="${displayId}">›</button>
      </div>
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
    return;
  }
  
  function updateGallery(direction = 0) {
    galleryState.images.forEach(img => {
      img.classList.remove('active', 'prev');
    });
    if (galleryState.images[galleryState.currentImageIndex]) {
      galleryState.images[galleryState.currentImageIndex].classList.add('active');
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
  
  // Click on container to go to next (but not on video controls)
  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('display-nav')) return;
    if (e.target.closest('.video-controls-overlay')) return;
    if (e.target.closest('.video-controls')) return;
    if (e.target.closest('.video-control-btn')) return;
    if (e.target.closest('.video-progress-container')) return;
    if (e.target.closest('.video-progress-wrapper')) return;
    if (e.target.closest('.video-progress-overlay')) return;
    changeImage(1);
  });
  
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
}

