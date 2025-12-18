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
