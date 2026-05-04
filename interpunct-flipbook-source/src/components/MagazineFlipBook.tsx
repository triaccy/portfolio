import { useRef, useState, useEffect, useCallback, forwardRef, RefObject } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { interpunctPages } from '../data/interpunct'

const TOTAL = interpunctPages.length

interface FoldConfig {
  flapSide: 'left' | 'right'
  foldLinePercent: number
}

// Pages 23 and 24 (0-indexed) have fold-in flaps per the dotted lines printed in the images.
// Page 23 (printed "24"): right flap at 50%, folds toward spine
// Page 24 (printed "25"): left flap at 44%, folds toward spine
const FOLD_CONFIGS: Record<number, FoldConfig> = {
  23: { flapSide: 'right', foldLinePercent: 50 },
  24: { flapSide: 'left', foldLinePercent: 44 },
}

const Page = forwardRef<
  HTMLDivElement,
  {
    src: string
    alt: string
    pageNum: number
    foldConfig?: FoldConfig
    animate: boolean
    pageWidth: number
    pageHeight: number
  }
>(({ src, alt, pageNum, foldConfig, animate, pageWidth, pageHeight }, ref) => {
  const flapRef = useRef<HTMLDivElement>(null)

  // Drive the fold animation imperatively to avoid the CSS gotcha where changing
  // `transition` and `transform` in the same render prevents the transition from firing.
  useEffect(() => {
    const el = (flapRef as RefObject<HTMLDivElement>).current
    if (!el || !foldConfig) return

    const targetDeg = foldConfig.flapSide === 'right' ? '90deg' : '-90deg'

    if (animate) {
      // Snap to 0deg without transition, force a reflow so the browser commits
      // that state, then apply the transition + target in the next paint frame.
      el.style.transition = 'none'
      el.style.transform = 'perspective(1000px) rotateY(0deg)'
      void el.offsetWidth // force reflow
      requestAnimationFrame(() => {
        el.style.transition = 'transform 1.1s cubic-bezier(0.45, 0, 0.55, 1)'
        el.style.transform = `perspective(1000px) rotateY(${targetDeg})`
      })
    } else {
      el.style.transition = 'none'
      el.style.transform = 'perspective(1000px) rotateY(0deg)'
    }
  }, [animate, foldConfig])

  const flapContainerStyle: React.CSSProperties = foldConfig
    ? foldConfig.flapSide === 'right'
      ? {
          position: 'absolute',
          top: 0, bottom: 0,
          left: `${foldConfig.foldLinePercent}%`, right: 0,
          overflow: 'hidden',
          transformOrigin: '0% 50%',
          pointerEvents: 'none',
          willChange: 'transform',
        }
      : {
          position: 'absolute',
          top: 0, bottom: 0,
          left: 0, width: `${foldConfig.foldLinePercent}%`,
          overflow: 'hidden',
          transformOrigin: '100% 50%',
          pointerEvents: 'none',
          willChange: 'transform',
        }
    : {}

  const flapImgStyle: React.CSSProperties = foldConfig
    ? foldConfig.flapSide === 'right'
      ? {
          position: 'absolute',
          top: 0,
          left: -(foldConfig.foldLinePercent / 100) * pageWidth,
          width: pageWidth,
          height: pageHeight,
          objectFit: 'cover',
          display: 'block',
        }
      : {
          position: 'absolute',
          top: 0, left: 0,
          width: pageWidth,
          height: pageHeight,
          objectFit: 'cover',
          display: 'block',
        }
    : {}

  return (
    <div
      ref={ref}
      style={{ width: '100%', height: '100%', background: '#fff', overflow: 'hidden', position: 'relative' }}
    >
      <img
        src={src}
        alt={alt || `Page ${pageNum}`}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      {foldConfig && (
        <div ref={flapRef} style={flapContainerStyle}>
          <img src={src} alt="" style={flapImgStyle} />
        </div>
      )}
    </div>
  )
})
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
  const [foldAnimating, setFoldAnimating] = useState(false)

  const handleFlip = useCallback((e: { data: number }) => {
    setCurrentPage(e.data)
  }, [])

  // Trigger fold animation when arriving at the spread containing pages 23–24 (0-indexed).
  // Delay 800ms to start after the page-flip animation (700ms) finishes.
  useEffect(() => {
    if (currentPage === 23) {
      const timer = setTimeout(() => setFoldAnimating(true), 800)
      return () => clearTimeout(timer)
    } else {
      setFoldAnimating(false)
    }
  }, [currentPage])

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
          <Page
            key={i}
            src={page.src}
            alt={page.alt}
            pageNum={i + 1}
            foldConfig={FOLD_CONFIGS[i]}
            animate={foldAnimating && i in FOLD_CONFIGS}
            pageWidth={finalPageW}
            pageHeight={finalPageH}
          />
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
