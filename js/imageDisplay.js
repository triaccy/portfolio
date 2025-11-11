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
  
  galleryContainers.forEach(container => {
    const allImages = container.querySelectorAll('.display-image');
    
    // Filter out images that fail to load
    // For dynamically inserted images, we need to wait for them to load
    const checkImages = () => {
      const images = Array.from(allImages).filter(img => {
        // Skip if already hidden
        if (img.style.display === 'none') {
          return false;
        }
        // For images that haven't loaded yet, include them (they'll be checked on load)
        if (!img.complete) {
          return true;
        }
        // If image loaded but has 0 height, it's broken
        if (img.naturalHeight === 0) {
          img.style.display = 'none';
          return false;
        }
        return true;
      });
      
      return images;
    };
    
    let images = checkImages();
    
    // If no images are ready yet, wait for them to load
    if (images.length === 0 && allImages.length > 0) {
      // Wait for images to load
      const imagePromises = Array.from(allImages).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', reject, { once: true });
        });
      });
      
      Promise.allSettled(imagePromises).then(() => {
        images = checkImages();
        if (images.length > 0) {
          initializeGallery(container, images, allImages);
        }
      });
      return;
    }
    
    if (images.length === 0) return;
    
    initializeGallery(container, images, allImages);
  });
}

function initializeGallery(container, images, allImages) {
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
  
  // Click on container to go to next
  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('display-nav')) return;
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

