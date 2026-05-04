import { useRef, useState, useCallback } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { interpunctPages } from '../data/interpunct'

const TOTAL = interpunctPages.length

// react-pageflip exposes its API through a ref with this shape
interface FlipBookRef {
  pageFlip: () => {
    flipNext: (corner?: 'top' | 'bottom') => void
    flipPrev: (corner?: 'top' | 'bottom') => void
    getCurrentPageIndex: () => number
  }
}

function Page({ src, alt, pageNum }: { src: string; alt: string; pageNum: number }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundImage: `url(${src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#fff',
      }}
      aria-label={alt || `Page ${pageNum}`}
    />
  )
}

export function MagazineFlipBook() {
  const bookRef = useRef<FlipBookRef>(null)
  const [currentPage, setCurrentPage] = useState(0)

  const handleFlip = useCallback((e: { data: number }) => {
    setCurrentPage(e.data)
  }, [])

  // Spread index → display label (cover = 1, then each spread = next page pair)
  const pageLabel = currentPage + 1
  const totalLabel = TOTAL

  if (TOTAL === 0) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '100%', height: '100%',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
        fontSize: 14, color: '#999',
      }}>
        Pages coming soon.
      </div>
    )
  }

  // Fit the book inside the viewport with padding
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const padH = 80
  const padV = 80

  // Pages are 585×594 pts (nearly square, w/h ≈ 0.985)
  // Two-page spread = 2× page width side by side
  const PAGE_RATIO = 585 / 594  // width / height
  const pageH = vh - padV * 2
  const pageW = Math.floor(pageH * PAGE_RATIO)
  // Cap total spread width to viewport
  const maxSpreadW = vw - padH * 2
  const finalPageW = Math.min(pageW, Math.floor(maxSpreadW / 2))
  const finalPageH = Math.floor(finalPageW / PAGE_RATIO)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        background: '#f0f0f0',
      }}
    >
      <HTMLFlipBook
        ref={bookRef}
        width={finalPageW}
        height={finalPageH}
        size="fixed"
        minWidth={finalPageW}
        maxWidth={finalPageW}
        minHeight={finalPageH}
        maxHeight={finalPageH}
        showCover={true}
        flippingTime={700}
        maxShadowOpacity={0.4}
        mobileScrollSupport={false}
        useMouseEvents={true}
        style={{}}
        startPage={0}
        drawShadow={true}
        usePortrait={false}
        startZIndex={0}
        autoSize={false}
        clickEventForward={true}
        swipeDistance={0}
        showPageCorners={true}
        disableFlipByClick={false}
        className=""
        onFlip={handleFlip}
      >
        {interpunctPages.map((page, i) => (
          <Page key={i} src={page.src} alt={page.alt} pageNum={i + 1} />
        ))}
      </HTMLFlipBook>

      {/* Page counter — matches portfolio lv-gallery-counter style */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, Helvetica, Arial, sans-serif',
          fontSize: 14,
          color: '#999',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <span style={{ color: '#333' }}>{pageLabel}</span>
        {' / '}
        {totalLabel}
      </div>
    </div>
  )
}
