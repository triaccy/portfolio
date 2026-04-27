// Paths relative to wine-bottle-flipbook/index.html (two levels up to portfolio root)
export const book2025Images = [
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

export const getBook2025PageImage = (pageIndex: number): string => {
  const imageIndex = pageIndex % book2025Images.length;
  return book2025Images[imageIndex].src;
};
