import { useRef, useState, useCallback, forwardRef } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { interpunctPages } from '../data/interpunct'

const TOTAL = interpunctPages.length

// react-pageflip requires forwardRef on page components so it can attach its own refs
const Page = forwardRef<HTMLDivElement, { src: string; alt: string; pageNum: number }>(
  ({ src, alt, pageNum }, ref) => (
    <div ref={ref} style={{ width: '100%', height: '100%', background: '#fff', overflow: 'hidden' }}>
      <img
        src={src}
        alt={alt || `Page ${pageNum}`}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  )
)
Page.displayName = 'Page'

interface FlipBookRef {
  pageFlip: () => {
    flipNext: () => void
    flipPrev: () => void
    getCurrentPageIndex: () => number
  }
}

export function MagazineFlipBook() {
  const bookRef = useRef<FlipBookRef>(null)
  const [currentPage, setCurrentPage] = useState(0)

  const handleFlip = useCallback((e: { data: number }) => {
    setCurrentPage(e.data)
  }, [])

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

  // Pages are 585×594 pts (nearly square, w/h ≈ 0.985)
  const PAGE_RATIO = 585 / 594
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const padH = 80
  const padV = 80

  const pageH = vh - padV * 2
  const pageW = Math.floor(pageH * PAGE_RATIO)
  const maxSpreadW = vw - padH * 2
  const finalPageW = Math.min(pageW, Math.floor(maxSpreadW / 2))
  const finalPageH = Math.floor(finalPageW / PAGE_RATIO)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      background: '#f0f0f0',
    }}>
      <HTMLFlipBook
        ref={bookRef}
        width={finalPageW}
        height={finalPageH}
        size="fixed"
        minWidth={finalPageW}
        maxWidth={finalPageW}
        minHeight={finalPageH}
        maxHeight={finalPageH}
        showCover={false}
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

      <div style={{
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
      }}>
        <span style={{ color: '#333' }}>{currentPage + 1}</span>
        {' / '}
        {TOTAL}
      </div>
    </div>
  )
}
