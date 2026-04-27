// Paths relative to wine-bottle-flipbook/index.html (one level up to portfolio root)
export const book2025Images = [
  // Add your book page images here
  // For now, using the back cover reference as a placeholder
  // You can add more images by copying them to images/magazine 2025/ and listing them here
  { src: '../../images/magazine 2025/BACK COVER REFERENCE.jpg', alt: 'Back Cover' },
  // Add more pages as needed:
  // { src: '../../images/magazine 2025/page-01.jpg', alt: 'Page 1' },
  // { src: '../../images/magazine 2025/page-02.jpg', alt: 'Page 2' },
  // etc.
];

// If you have images in a specific order, list them here
// The flipbook will cycle through these images for the pages
export const getBook2025PageImage = (pageIndex: number): string => {
  if (book2025Images.length === 0) {
    // Fallback to a default image or placeholder
    return '../../images/magazine 2025/BACK COVER REFERENCE.jpg';
  }
  // Cycle through available images
  const imageIndex = pageIndex % book2025Images.length;
  return book2025Images[imageIndex].src;
};


// Configuration for 2025 Book images
// Images will be loaded from the parent portfolio's images/magazine 2025 folder
// Using absolute paths from portfolio root for GitHub Pages compatibility
const getImagePath = (imagePath: string): string => {
  // Check if we're in a production build or GitHub Pages
  // Use absolute path from portfolio root
  if (typeof window !== 'undefined') {
    const basePath = window.location.pathname.includes('/portfolio/') 
      ? '/portfolio' 
      : '';
    return `${basePath}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  }
  return imagePath;
};

export const book2025Images = [
  // Add your book page images here
  // Images are in the portfolio's images/magazine 2025 folder
  { src: getImagePath('images/magazine 2025/BACK COVER REFERENCE.jpg'), alt: 'Back Cover' },
  // Add more pages as needed:
  // { src: getImagePath('images/magazine 2025/page-01.jpg'), alt: 'Page 1' },
  // { src: getImagePath('images/magazine 2025/page-02.jpg'), alt: 'Page 2' },
  // etc.
];

// If you have images in a specific order, list them here
// The flipbook will cycle through these images for the pages
export const getBook2025PageImage = (pageIndex: number): string => {
  if (book2025Images.length === 0) {
    // Fallback to a default image or placeholder
    return getImagePath('images/magazine 2025/BACK COVER REFERENCE.jpg');
  }
  // Cycle through available images
  const imageIndex = pageIndex % book2025Images.length;
  return book2025Images[imageIndex].src;
};


// Configuration for 2025 Book images
// Images will be loaded from the parent portfolio's images/magazine 2025 folder
// Paths are relative to wine-bottle-flipbook/index.html (go up two levels to portfolio root)
export const book2025Images = [
  // Add your book page images here
  // Images should be placed in the portfolio's images/magazine 2025/ folder
  { src: '../../images/magazine 2025/BACK COVER REFERENCE.jpg', alt: 'Back Cover' },
  // Add more pages as needed:
  // { src: '../../images/magazine 2025/page-01.jpg', alt: 'Page 1' },
  // { src: '../../images/magazine 2025/page-02.jpg', alt: 'Page 2' },
  // etc.
];

// If you have images in a specific order, list them here
// The flipbook will cycle through these images for the pages
export const getBook2025PageImage = (pageIndex: number): string => {
  if (book2025Images.length === 0) {
    // Fallback to a default image or placeholder
    return '../../images/magazine 2025/BACK COVER REFERENCE.jpg';
  }
  // Cycle through available images
  const imageIndex = pageIndex % book2025Images.length;
  return book2025Images[imageIndex].src;
};

// Configuration for 2025 Book images
// Images will be loaded from the parent portfolio's images/magazine 2025 folder
// Paths are relative to wine-bottle-flipbook/index.html (go up two levels to portfolio root)
export const book2025Images = [
  // Bottle book images - these create the fanned bottle shape
  { src: '../../images/bottle book /b1.png', alt: 'Bottle Book Page 1' },
  { src: '../../images/bottle book /b2.png', alt: 'Bottle Book Page 2' },
  { src: '../../images/bottle book /b3.png', alt: 'Bottle Book Page 3' },
  { src: '../../images/bottle book /b4.png', alt: 'Bottle Book Page 4' },
  { src: '../../images/bottle book /b5.png', alt: 'Bottle Book Page 5' },
  { src: '../../images/bottle book /b6.png', alt: 'Bottle Book Page 6' },
  { src: '../../images/bottle book /b7.jpg', alt: 'Bottle Book Page 7' },
  { src: '../../images/bottle book /b8.jpg', alt: 'Bottle Book Page 8' },
  { src: '../../images/bottle book /b9.jpg', alt: 'Bottle Book Page 9' },
  { src: '../../images/bottle book /b11.jpg', alt: 'Bottle Book Page 11' },
  { src: '../../images/bottle book /b12.jpg', alt: 'Bottle Book Page 12' },
  { src: '../../images/bottle book /b13.jpg', alt: 'Bottle Book Page 13' },
  { src: '../../images/bottle book /b109.jpg', alt: 'Bottle Book Page 109' },
];
// If you have images in a specific order, list them here
// The flipbook will cycle through these images for the pages
export const getBook2025PageImage = (pageIndex: number): string => {
  if (book2025Images.length === 0) {
    // Fallback to a default image or placeholder
    return '../../images/bottle book /b1.png';
  }
  // Cycle through available images
  const imageIndex = pageIndex % book2025Images.length;
  return book2025Images[imageIndex].src;
};


// Configuration for 2025 Book images
// Images will be loaded from the parent portfolio's images/bottle book folder
// Paths are relative to wine-bottle-flipbook/index.html (go up two levels to portfolio root)
export const book2025Images = [
  // Bottle book images - these create the fanned bottle shape
  // Images are ordered numerically to create the proper sequence
  { src: '../../images/bottle book /b1.png', alt: 'Bottle Book Page 1' },
  { src: '../../images/bottle book /b2.png', alt: 'Bottle Book Page 2' },
  { src: '../../images/bottle book /b3.png', alt: 'Bottle Book Page 3' },
  { src: '../../images/bottle book /b4.png', alt: 'Bottle Book Page 4' },
  { src: '../../images/bottle book /b5.png', alt: 'Bottle Book Page 5' },
  { src: '../../images/bottle book /b6.png', alt: 'Bottle Book Page 6' },
  { src: '../../images/bottle book /b7.jpg', alt: 'Bottle Book Page 7' },
  { src: '../../images/bottle book /b8.jpg', alt: 'Bottle Book Page 8' },
  { src: '../../images/bottle book /b9.jpg', alt: 'Bottle Book Page 9' },
  { src: '../../images/bottle book /b11.jpg', alt: 'Bottle Book Page 11' },
  { src: '../../images/bottle book /b12.jpg', alt: 'Bottle Book Page 12' },
  { src: '../../images/bottle book /b13.jpg', alt: 'Bottle Book Page 13' },
  { src: '../../images/bottle book /b109.jpg', alt: 'Bottle Book Page 109' },
];

// If you have images in a specific order, list them here
// The flipbook will cycle through these images for the pages
export const getBook2025PageImage = (pageIndex: number): string => {
  if (book2025Images.length === 0) {
    // Fallback to a default image or placeholder
    return '../../images/bottle book /b1.png';
  }
  // Cycle through available images
  const imageIndex = pageIndex % book2025Images.length;
  return book2025Images[imageIndex].src;
};

