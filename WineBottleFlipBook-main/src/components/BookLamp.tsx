import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import svgPaths from "../imports/svg-20xrh5pwcw";
import { getBook2025PageImage, book2025Images } from "../data/book2025";

// Dynamic page component that loads images from 2025 book
const createBook2025Page = (pageIndex: number) => {
  const imageSrc = getBook2025PageImage(pageIndex);
  return () => (
    <div className="w-full h-full relative">
      <img 
        src={imageSrc} 
        alt={`Book 2025 Page ${pageIndex + 1}`} 
        className="absolute inset-0 w-full h-full object-cover"
        crossOrigin="anonymous"
        onError={(e) => {
          console.error('Failed to load image:', imageSrc);
          // Show a placeholder instead of hiding
          const target = e.target as HTMLImageElement;
          target.style.backgroundColor = '#f5f5f0';
          target.style.display = 'flex';
          target.style.alignItems = 'center';
          target.style.justifyContent = 'center';
          target.alt = `Page ${pageIndex + 1} - Image not found`;
        }}
      />
    </div>
  );
}; 

interface BookLampProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectProject: (project: any) => void;
}

export const BookLamp: React.FC<BookLampProps> = ({ isOpen, onToggle, onSelectProject }) => {
  // Calculate total pages: use at least 20 pages, or more if we have many images
  // Each spread (2 pages) should show different content
  const minPages = 20;
  const pagesPerImage = 2; // Each image covers a spread (2 pages)
  const totalPages = Math.max(minPages, Math.ceil((book2025Images.length || 1) * pagesPerImage)); 
  
  // Dimensions
  const bookWidth = 0; // Centered spine
  const bookHeight = 380; // Matches bottle height
  const bookDepth = 40;

  // Bottle dimensions
  // Adjusted for new SVG aspect ratio: 307/1093 = 0.28
  // Previous Height: 380. New Width should be ~106.7
  const bottleWidth = 107;
  const bottleHeight = 380;

  // Figma Page Dimensions
  const figmaPageWidth = 283.465;
  const figmaPageHeight = 850.394;
  
  // Scale to cover the bottle area (object-cover logic)
  const scaleX = bottleWidth / figmaPageWidth;
  const scaleY = bottleHeight / figmaPageHeight;
  const contentScale = Math.max(scaleX, scaleY) * 1.05; // 1.05 for slight bleed/safety

  const scaledWidth = figmaPageWidth * contentScale;
  const scaledHeight = figmaPageHeight * contentScale;
  
  // Offsets to center the image within the full bottle shape
  const offsetX = (bottleWidth - scaledWidth) / 2;
  const offsetY = (bottleHeight - scaledHeight) / 2;

  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [prevIsZoomed, setPrevIsZoomed] = useState(false); // Track previous zoom state
  const lastScrollTime = useRef<number>(0);

  // Track zoom state changes for folding animation
  useEffect(() => {
    setPrevIsZoomed(isZoomed);
  }, [isZoomed]);

  const fanAngle = 360;
  const angleStep = fanAngle / (totalPages - 1);

  const getPageBaseAngle = (index: number) => {
      return -180 + (index * angleStep);
  };

  // Calculate page rotation for zoomed view (open book spread)
  const getZoomedPageAngle = (index: number) => {
      // In zoomed view, show only a two-page spread
      const activeSpreadIndex = Math.floor(activePageIndex / 2);
      const leftPageIndex = activeSpreadIndex * 2;
      const rightPageIndex = leftPageIndex + 1;

      if (index === leftPageIndex) {
          return -180; // Flat left
      } else if (index === rightPageIndex) {
          return 0; // Flat right
      } else if (index < leftPageIndex) {
          return -180; // Stacked left
      } else {
          return 0; // Stacked right
      }
  };

  const targetRotation = isZoomed 
    ? 0 // Spine centered
    : (activePageIndex !== -1 ? -getPageBaseAngle(activePageIndex) : 0);

  useEffect(() => {
    if (!isOpen) {
        setActivePageIndex(Math.floor(totalPages / 2));
        setIsZoomed(false);
    } else {
        setActivePageIndex(Math.floor(totalPages / 2));
    }
  }, [isOpen]);

  // Keyboard Navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
          setIsZoomed(false);
      } else if (e.key === "ArrowRight") {
        setActivePageIndex(prev => Math.min(prev + 2, totalPages - 1));
      } else if (e.key === "ArrowLeft") {
        setActivePageIndex(prev => Math.max(prev - 2, 0));
      } else if (e.key === "Enter") {
         setIsZoomed(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activePageIndex, totalPages]);

  // Scroll Navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const now = Date.now();
      if (now - lastScrollTime.current < 200) return; 

      if (Math.abs(e.deltaY) > 10) {
        if (e.deltaY > 0) {
          setActivePageIndex(prev => Math.min(prev + 1, totalPages - 1));
        } else {
          setActivePageIndex(prev => Math.max(prev - 1, 0));
        }
        lastScrollTime.current = now;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [isOpen, totalPages]);

  const handlePageClick = (index: number) => {
    setActivePageIndex(index);
    setIsZoomed(true);
  };

  // Transform to map the vertical bottle path to the vertical page
  // SVG Dimensions: 307 x 1093. Center X: 153.5.
  // Right Page (Content Right): Map [153.5, 307] -> [0, 1]
  // Scale X = 1/153.5 = 0.006514658, Translate X = -1
  // Scale Y = 1/1093 = 0.000914913
  const transformRightPage = "matrix(0.006514658, 0, 0, 0.000914913, -1, 0)";
  
  // Left Page (Content Left): Map [0, 153.5] -> [1, 0] (Flipped X)
  // Scale X = -1/153.5 = -0.006514658, Translate X = 1
  const transformLeftPage = "matrix(-0.006514658, 0, 0, 0.000914913, 1, 0)";

  return (
    <div className="relative flex flex-col items-center justify-center perspective-[2000px] h-full w-full overflow-hidden">
      
      {/* SVG Defs for ClipPath */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <clipPath id="bottle-clip-right" clipPathUnits="objectBoundingBox">
            <path d={svgPaths.p1c5cb8c0} transform={transformRightPage} />
          </clipPath>
          <clipPath id="bottle-clip-left" clipPathUnits="objectBoundingBox">
            <path d={svgPaths.p1c5cb8c0} transform={transformLeftPage} />
          </clipPath>
        </defs>
      </svg>

      {/* Click background to unzoom */}
      {isZoomed && (
          <div className="absolute inset-0 z-0" onClick={() => setIsZoomed(false)} />
      )}

      {/* Desk Shadow */}
      <motion.div 
        className="absolute top-[95%] w-64 h-24 bg-[#8c8c80]/20 blur-xl rounded-[100%]"
        animate={{
            scale: isZoomed ? 2.2 : (isOpen ? 1.5 : 0.8),
            opacity: isZoomed ? 0.1 : 0.3,
            y: 0
        }}
        transition={{ duration: 0.8 }}
      />

      {/* MAIN BOOK CONTAINER */}
      <motion.div
        className="relative preserve-3d cursor-pointer"
        style={{ 
            width: bookWidth, 
            height: bookHeight,
            transformStyle: "preserve-3d",
            transformOrigin: "left center"
        }}
        onClick={(e) => {
            e.stopPropagation();
            if (!isOpen) onToggle();
        }}
        animate={{
            rotateX: isZoomed ? 0 : (isOpen ? -15 : -10), 
            rotateY: isOpen ? 0 : -30,
            y: 0,
            z: isZoomed ? 120 : 0,
            scale: isZoomed ? 1.7 : 1
        }}
        transition={{ 
            duration: 0.8, 
            type: "spring", 
            stiffness: 50, 
            damping: 18 
        }}
      >
        {/* SPINE */}
        <div 
            className="absolute left-0 top-0 bottom-0 bg-[#e5e5e5] rounded-sm"
            style={{ 
                width: bookDepth, 
                height: bookHeight,
                transform: `translateX(-${bookDepth/2}px) rotateY(90deg)`, 
                backfaceVisibility: "visible"
            }}
        />

        {/* FAN ROTATOR */}
        <motion.div
            className="absolute top-0 left-0 w-full h-full preserve-3d"
            style={{ transformStyle: "preserve-3d", transformOrigin: "left center" }}
            animate={{
                rotateY: targetRotation
            }}
            transition={{ 
                type: "spring", 
                stiffness: 120, 
                damping: 20,
                mass: 1,
                restDelta: 0.001
            }}
        >
            {/* PAGES */}
            <div className="absolute left-0 top-[2%] bottom-[2%] preserve-3d" 
                 style={{ left: "0px", transformStyle: "preserve-3d" }}>
    
                {Array.from({ length: totalPages }).map((_, i) => {
                    const rotation = isZoomed ? getZoomedPageAngle(i) : getPageBaseAngle(i);
                    const isActive = activePageIndex === i;
                    const isLeftPage = i % 2 === 0; 
                    
                    const spreadIndex = Math.floor(i / 2);
                    // Use the page index to get the image for this spread
                    const DesignComponent = createBook2025Page(spreadIndex);

                    // Calculate dynamic z-index based on position and mode
                    let calculatedZIndex: number;
                    
                    if (isZoomed) {
                        // In zoomed mode: active spread on top, proper left/right stacking
                        const activeSpreadIndex = Math.floor(activePageIndex / 2);
                        const currentSpreadIndex = Math.floor(i / 2);
                        
                        if (currentSpreadIndex === activeSpreadIndex) {
                            // Active spread gets highest z-index
                            // Left page should be UNDER right page to prevent slipping through
                            calculatedZIndex = 1000 + (isLeftPage ? 1 : 2);
                        } else if (currentSpreadIndex < activeSpreadIndex) {
                            // Pages to the left (already turned) - stack behind left page
                            // These should be well below the active spread
                            const distance = activeSpreadIndex - currentSpreadIndex;
                            calculatedZIndex = 100 - distance;
                        } else {
                            // Pages to the right (not yet turned) - stack behind right page
                            // These should be well below the active spread
                            const distance = currentSpreadIndex - activeSpreadIndex;
                            calculatedZIndex = 200 - distance;
                        }
                    } else {
                        // In fan mode: pages near active page get higher z-index
                        const distanceFromActive = Math.abs(i - activePageIndex);
                        calculatedZIndex = 500 - distanceFromActive;
                    }

                    // BINDING FLIP LOGIC:
                    // Left Page uses 'bottle-clip-left' (Left half of bottle, flipped)
                    // Right Page uses 'bottle-clip-right' (Right half of bottle)
                    const clipPathUrl = isLeftPage ? "url(#bottle-clip-left)" : "url(#bottle-clip-right)";
                    const transformStr = isLeftPage ? transformLeftPage : transformRightPage;

                    return (
                        <BookPage 
                            key={i}
                            index={i}
                            rotation={rotation}
                            isOpen={isOpen}
                            isActive={isActive}
                            isZoomed={isZoomed}
                            onSelect={() => handlePageClick(i)}
                            width={bottleWidth / 2}
                            height={bottleHeight}
                            transformString={transformStr}
                            clipPathUrl={clipPathUrl}
                            isLeftPage={isLeftPage}
                            ContentComponent={DesignComponent}
                            contentScale={contentScale}
                            figmaPageWidth={figmaPageWidth}
                            figmaPageHeight={figmaPageHeight}
                            verticalOffset={offsetY}
                            horizontalOffset={offsetX}
                            bottleWidth={bottleWidth}
                            calculatedZIndex={calculatedZIndex}
                            activePageIndex={activePageIndex}
                            totalPages={totalPages}
                        />
                    );
                })}
            </div>
        </motion.div>

      </motion.div>

      {/* Debug Info Overlay */}
      <AnimatePresence>
        {isZoomed && (
            <motion.div 
                className="fixed top-1/2 right-8 -translate-y-1/2 bg-white/90 backdrop-blur shadow-xl border border-stone-200 p-6 rounded-2xl z-50 pointer-events-none"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
            >
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">Current Selection</span>
                    <div className="text-2xl font-serif text-stone-800">
                        {activePageIndex % 2 === 0 ? "Left Page" : "Right Page"}
                    </div>
                     <span className="text-xs text-stone-500 font-mono">
                        Page Index: {activePageIndex}
                    </span>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <AnimatePresence>
        {isOpen && (
            <motion.div 
                className="fixed bottom-12 left-0 right-0 flex flex-col items-center justify-center gap-4 pointer-events-none"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
            >
                {!isZoomed ? (
                    <>
                        <div className="flex items-center gap-6 pointer-events-auto bg-stone-900/5 backdrop-blur-sm p-2 rounded-full border border-stone-900/10">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActivePageIndex(prev => Math.max(prev - 1, 0));
                                }}
                                className="w-10 h-10 rounded-full bg-white hover:bg-stone-50 shadow-sm flex items-center justify-center text-stone-600 transition-colors disabled:opacity-50"
                                disabled={activePageIndex === 0}
                            >
                                &larr;
                            </button>
                            
                            <span className="text-xs font-mono text-stone-500 w-12 text-center">
                                {(activePageIndex + 1).toString().padStart(2, '0')} / {totalPages}
                            </span>

                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActivePageIndex(prev => Math.min(prev + 1, totalPages - 1));
                                }}
                                className="w-10 h-10 rounded-full bg-white hover:bg-stone-50 shadow-sm flex items-center justify-center text-stone-600 transition-colors disabled:opacity-50"
                                disabled={activePageIndex === totalPages - 1}
                            >
                                &rarr;
                            </button>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggle();
                            }}
                            className="pointer-events-auto text-xs text-stone-400 hover:text-stone-600 underline decoration-stone-300 underline-offset-4"
                        >
                            Close Book
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-8 pointer-events-auto">
                             <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActivePageIndex(prev => Math.max(prev - 2, 0));
                                }}
                                className="w-12 h-12 rounded-full bg-stone-900/5 hover:bg-stone-900/10 flex items-center justify-center text-stone-400 transition-colors disabled:opacity-20"
                                disabled={activePageIndex <= 1}
                            >
                                &larr;
                            </button>
                            
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsZoomed(false);
                                }}
                                className="px-6 py-2 bg-stone-900 text-white text-xs font-bold tracking-widest rounded-full hover:bg-stone-800 transition-colors shadow-lg"
                            >
                                CLOSE VIEW
                            </button>

                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActivePageIndex(prev => Math.min(prev + 2, totalPages - 1));
                                }}
                                className="w-12 h-12 rounded-full bg-stone-900/5 hover:bg-stone-900/10 flex items-center justify-center text-stone-400 transition-colors disabled:opacity-20"
                                disabled={activePageIndex >= totalPages - 2}
                            >
                                &rarr;
                            </button>
                        </div>
                        <span className="text-[10px] font-mono text-stone-400/60">
                            USE ARROW KEYS TO READ
                        </span>
                    </div>
                )}
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BookPage = ({ 
    index, 
    rotation, 
    isOpen, 
    isActive, 
    isZoomed, 
    onSelect, 
    width, 
    height, 
    transformString,
    clipPathUrl,
    isLeftPage,
    ContentComponent,
    contentScale,
    figmaPageWidth,
    figmaPageHeight,
    verticalOffset,
    horizontalOffset,
    bottleWidth,
    calculatedZIndex,
    activePageIndex,
    totalPages
}: any) => {
    
    const [prevZoomed, setPrevZoomed] = React.useState(isZoomed);
    
    // Track zoom state changes
    React.useEffect(() => {
        setPrevZoomed(isZoomed);
    }, [isZoomed]);
    
    // Determine if we're currently closing from zoomed view
    const isClosingFromZoom = prevZoomed && !isZoomed;
    
    // Calculate folding delay based on distance from active spread
    const activeSpreadIndex = Math.floor(activePageIndex / 2);
    const currentSpreadIndex = Math.floor(index / 2);
    const spreadDistance = Math.abs(currentSpreadIndex - activeSpreadIndex);
    
    // Folding effect: pages further from center fold later
    const foldingDelay = isClosingFromZoom ? spreadDistance * 0.03 : 0;
    
    const strokeColor = isActive && !isZoomed ? "#d6d3d1" : (isZoomed && isActive ? "transparent" : "#f5f5f4");
    const strokeWidth = isActive && !isZoomed ? 2 : 1;

    // Calculate translateZ based on z-index for proper 3D depth
    // In 3D space, we need actual depth separation, not just z-index
    // Increased multiplier to prevent z-fighting during animation
    const translateZ = calculatedZIndex > 900 
        ? (calculatedZIndex - 1000) * 0.2 
        : (calculatedZIndex - 500) * 0.5;

    // Content Component Logic
    const PageContent = () => {
        // Position logic:
        // We have a "Virtual Full Bottle" coordinate system.
        // The image is centered in this Virtual Full Bottle at (horizontalOffset, verticalOffset).
        // For Left Page (Back Face): The coordinate system is mirrored by the browser (rotateY(180)).
        // We counter this by flipping the content (scaleX(-1)) and calculating the margin
        // so that the Center of the Image aligns with the Spine (0).
        // Left Page: Margin = (bottleWidth / 2) - horizontalOffset.
        // Right Page: Margin = horizontalOffset - (bottleWidth / 2).
        
        const leftMargin = isLeftPage 
            ? (bottleWidth / 2) - horizontalOffset 
            : horizontalOffset - (bottleWidth / 2);

        const transform = isLeftPage 
            ? `scale(${contentScale}) scaleX(-1)` 
            : `scale(${contentScale})`;

        return (
            <div className="absolute inset-0 overflow-hidden bg-white">
                <div style={{
                    width: figmaPageWidth,
                    height: figmaPageHeight,
                    transformOrigin: "top left",
                    transform: transform,
                    marginLeft: leftMargin,
                    marginTop: verticalOffset
                }}>
                    <ContentComponent />
                </div>
            </div>
        );
    };

    return (
        <motion.div
            className={clsx(
                "absolute left-0 top-0 origin-left cursor-pointer pointer-events-auto"
            )}
            style={{
                width: width,
                height: height,
                backfaceVisibility: "visible", 
                zIndex: calculatedZIndex,
            }}
            variants={{
                closed: { rotateY: 0, z: 0 },
                open: { rotateY: rotation, z: translateZ }
            }}
            animate={isOpen ? "open" : "closed"}
            transition={{ 
                duration: isZoomed ? 0.6 : 1.5, 
                type: "spring", 
                stiffness: isZoomed ? 120 : 30,
                damping: isZoomed ? 20 : 15,
                delay: !isZoomed && isOpen ? Math.abs(index - 20) * 0.015 : foldingDelay
            }}
            onClick={(e) => {
                if (isOpen) {
                    e.stopPropagation();
                    onSelect();
                }
            }}
        >
            {/* Front side */}
            <div 
                className={clsx(
                    "absolute inset-0 w-full h-full bg-white transition-all duration-500 relative overflow-hidden",
                    isActive && !isZoomed ? "brightness-105" : ""
                )}
                style={{ 
                    backfaceVisibility: "hidden",
                    clipPath: clipPathUrl
                }}
            >
                {/* Border Overlay */}
                <svg 
                    className="absolute inset-0 w-full h-full pointer-events-none z-20" 
                    viewBox="0 0 1 1" 
                    preserveAspectRatio="none"
                >
                    <path 
                        d={svgPaths.p1c5cb8c0} 
                        transform={transformString} 
                        fill="none" 
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>

                {/* Content */}
                <PageContent />

                {/* Page Number */}
                <div className={clsx(
                    "absolute bottom-8 text-[8px] font-mono text-stone-400/80 z-20 mix-blend-multiply",
                    isLeftPage ? "left-3" : "right-3"
                )}>
                    {index + 1}
                </div>
            </div>

            {/* Back side */}
            <div 
                className="absolute inset-0 w-full h-full bg-white" 
                style={{ 
                    transform: "rotateY(180deg)", 
                    backfaceVisibility: "hidden",
                    clipPath: clipPathUrl
                }}
            >
                {/* Content on Back */}
                <PageContent />

                <div className="absolute inset-0 bg-stone-900/5 pointer-events-none" />

                <svg 
                    className="absolute inset-0 w-full h-full pointer-events-none z-20" 
                    viewBox="0 0 1 1" 
                    preserveAspectRatio="none"
                >
                    <path 
                        d={svgPaths.p1c5cb8c0} 
                        transform={transformString} 
                        fill="none" 
                        stroke="#e5e5e5"
                        strokeWidth={1}
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>

                <div className={clsx(
                    "absolute bottom-8 text-[8px] font-mono text-stone-400/80 z-20 mix-blend-multiply",
                    isLeftPage ? "right-3" : "left-3"
                )}>
                    {index + 1}
                </div>
            </div>
        </motion.div>
    );
};