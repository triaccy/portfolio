// Paths relative to wine-bottle-flipbook/index.html (two levels up to portfolio root)
export const book2025Images = [
  { src: '../../images/bottle book /wine booklet  copy-01.png', alt: 'Bottle Book Page 1' },
  { src: '../../images/bottle book /wine booklet  copy-02.png', alt: 'Bottle Book Page 2' },
  { src: '../../images/bottle book /wine booklet  copy-03.png', alt: 'Bottle Book Page 3' },
  { src: '../../images/bottle book /wine booklet  copy-04.png', alt: 'Bottle Book Page 4' },
  { src: '../../images/bottle book /wine booklet  copy-05.png', alt: 'Bottle Book Page 5' },
  { src: '../../images/bottle book /wine booklet  copy-06.png', alt: 'Bottle Book Page 6' },
  { src: '../../images/bottle book /wine booklet  copy-07.png', alt: 'Bottle Book Page 7' },
  { src: '../../images/bottle book /wine booklet  copy-08.png', alt: 'Bottle Book Page 8' },
  { src: '../../images/bottle book /wine booklet  copy-09.png', alt: 'Bottle Book Page 9' },
  { src: '../../images/bottle book /wine booklet  copy-10.png', alt: 'Bottle Book Page 10' },
  { src: '../../images/bottle book /wine booklet  copy-11.png', alt: 'Bottle Book Page 11' },
  { src: '../../images/bottle book /wine booklet  copy-12.png', alt: 'Bottle Book Page 12' },
  { src: '../../images/bottle book /wine booklet  copy-13.png', alt: 'Bottle Book Page 13' },
];

export const getBook2025PageImage = (pageIndex: number): string => {
  const imageIndex = pageIndex % book2025Images.length;
  return book2025Images[imageIndex].src;
};
