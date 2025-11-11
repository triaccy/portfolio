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
  const imageElements = images.map((img, index) => 
    `<img src="${img.src}" class="display-image ${index === 0 ? 'active' : ''}" 
          onerror="this.style.display='none';" 
          alt="${img.alt || ''}" />`
  ).join('\n');
  
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
  const imageElements = images.map(img => 
    `<img src="${img.src}" class="display-image" 
          onerror="this.style.display='none';" 
          alt="${img.alt || ''}" />`
  ).join('\n');
  
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
    const images = Array.from(allImages).filter(img => {
      if (!img.complete || img.naturalHeight === 0 || img.style.display === 'none') {
        return false;
      }
      return true;
    });
    
    if (images.length === 0) return;
    
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
  });
}

