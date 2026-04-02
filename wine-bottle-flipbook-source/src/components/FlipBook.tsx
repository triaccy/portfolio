import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { book2025Images } from "../data/book2025";

// ── Physical dimensions ───────────────────────────────────────────────────────
const PANEL_W = 88;
const PANEL_H = 525;
const SPINE_W = 18;
const PAPER_T = 3;

const TOTAL = book2025Images.length;  // 13
const STEP  = 360 / TOTAL;
const spreadAngle = (i: number) => (i - 6) * STEP;

// ── 3D Cap geometry ───────────────────────────────────────────────────────────
const FOIL_N    = 64;   // polygon faces for foil sleeve
const FOIL_R    = 32;   // foil cylinder radius
const FOIL_H    = 76;   // foil sleeve height
const FOIL_DROP = 70;   // px to lower the foil + band
const CORK_N    = 24;   // polygon faces for cork
const CORK_R    = 32;   // cork cylinder radius
const CORK_H    = 16;   // cork height
const CORK_DROP = 70;   // px to lower the cork into the foil
const BAND_N    = 32;   // polygon faces for gold band
const BAND_R    = 34;   // gold band radius (slightly wider than foil)
const BAND_H    = 12;   // gold band height
const OVERLAP   = 22;   // px the band bottom sinks into the top of pages

// panel width formula shared by all three cylinders
const panelWidth = (r: number, n: number) => 2 * r * Math.sin(Math.PI / n) + 1.5;
const foilPW = panelWidth(FOIL_R, FOIL_N);
const corkPW = panelWidth(CORK_R, CORK_N);
const bandPW = panelWidth(BAND_R, BAND_N);

// shade factory: cosine-based lightness variation across cylinder faces
const makeShade = (n: number, hue: number, sat: number, lMid: number, lAmp: number) =>
  (i: number) => `hsl(${hue}, ${sat}%, ${lMid + Math.cos((i / n) * 2 * Math.PI) * lAmp}%)`;

const foilShade = makeShade(FOIL_N, 33, 12, 82, 13);
const corkShade = makeShade(CORK_N, 36, 16, 85, 10);
const goldShade = makeShade(BAND_N, 42, 72, 55, 13);

// ── PageTurn (lightbox half-page fold) ────────────────────────────────────────
interface PageTurnProps {
  currentSrc: string; nextSrc: string;
  direction: 1 | -1; onComplete: () => void;
}
function PageTurn({ currentSrc, nextSrc, direction, onComplete }: PageTurnProps) {
  const fwd = direction > 0;
  const flipStyle: React.CSSProperties = {
    position: "absolute", top: 0, bottom: 0,
    ...(fwd ? { left: "50%", right: 0 } : { left: 0, right: "50%" }),
    transformStyle: "preserve-3d",
    transformOrigin: fwd ? "0% 50%" : "100% 50%",
    zIndex: 2,
  };
  const faceBase: React.CSSProperties = {
    position: "absolute", inset: 0, overflow: "hidden", backfaceVisibility: "hidden",
  };
  return (
    <div style={{ position: "relative", display: "inline-block", perspective: "1200px" }}>
      <img src={nextSrc} draggable={false}
        style={{ display: "block", maxWidth: "90vw", maxHeight: "80vh", objectFit: "contain" }} />
      <img src={currentSrc} draggable={false} style={{
        position: "absolute", inset: 0, maxWidth: "90vw", maxHeight: "80vh", objectFit: "contain",
        clipPath: fwd ? "inset(0 50% 0 0)" : "inset(0 0 0 50%)", zIndex: 1,
      }} />
      <motion.div style={flipStyle}
        animate={{ rotateY: fwd ? -180 : 180 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        onAnimationComplete={onComplete}>
        <div style={faceBase}>
          <img src={currentSrc} draggable={false}
            style={{ position: "absolute", top: 0, height: "100%", width: "200%", ...(fwd ? { right: 0 } : { left: 0 }) }} />
        </div>
        <div style={{ ...faceBase, transform: "rotateY(180deg)" }}>
          <img src={nextSrc} draggable={false}
            style={{ position: "absolute", top: 0, height: "100%", width: "200%", ...(fwd ? { left: 0 } : { right: 0 }) }} />
        </div>
      </motion.div>
    </div>
  );
}

// ── FlipBook ──────────────────────────────────────────────────────────────────
export const FlipBook = () => {
  const [fanRotation,  setFanRotation]  = useState(0);
  const [isZoomed,     setIsZoomed]     = useState(false);
  const [activeSpread, setActiveSpread] = useState(6);
  const [turning,      setTurning]      = useState(false);
  const [turnDir,      setTurnDir]      = useState<1 | -1>(1);
  const [open,         setOpen]         = useState(false);
  const [animated,     setAnimated]     = useState(false);
  const [visible,      setVisible]      = useState(false);
  const [capGone,      setCapGone]      = useState(false);
  const [capY,         setCapY]         = useState(0);

  const capDragStart = useRef<number | null>(null);

  // Load: appear fully open instantly, no fan animation
  useEffect(() => {
    const t = setTimeout(() => { setVisible(true); setOpen(true); }, 100);
    return () => clearTimeout(t);
  }, []);

  const pendingSpread = turning ? activeSpread + turnDir : null;

  const goNext = () => { if (turning || activeSpread >= TOTAL - 1) return; setTurnDir(1);  setTurning(true); };
  const goPrev = () => { if (turning || activeSpread <= 0)         return; setTurnDir(-1); setTurning(true); };
  const onTurnComplete = () => {
    setActiveSpread(s => s + turnDir);
    setTurning(false);
  };

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (isZoomed || !capGone) return;
      e.preventDefault();
      setFanRotation(r => r + e.deltaY * 0.15);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [isZoomed, capGone]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isZoomed) { setIsZoomed(false); return; }
      if (isZoomed) {
        if (e.key === "ArrowRight") goNext();
        if (e.key === "ArrowLeft")  goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isZoomed, activeSpread, turning]);

  const handleSpreadClick = (i: number) => {
    if (!capGone) return;
    setActiveSpread(i); setTurning(false); setIsZoomed(true);
  };

  // ── Cap drag handlers ─────────────────────────────────────────────────────
  const onCapDown = (e: React.PointerEvent) => {
    e.preventDefault(); e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    capDragStart.current = e.clientY;
  };
  const onCapMove = (e: React.PointerEvent) => {
    if (capDragStart.current === null) return;
    e.stopPropagation();
    setCapY(-Math.max(0, capDragStart.current - e.clientY));
  };
  const onCapUp = (e: React.PointerEvent) => {
    if (capDragStart.current === null) return;
    const dy = capDragStart.current - e.clientY;
    capDragStart.current = null;
    if (dy > 55) {
      setCapGone(true);
      setOpen(false);
      setTimeout(() => { setAnimated(true); setOpen(true); }, 80);
    } else { setCapY(0); }
  };

  return (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#ffffff", userSelect: "none", overflow: "hidden",
      perspective: "2000px",
    }}>

      {/* ── Lightbox ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div key="lightbox" style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(255,255,255,0.95)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "24px",
          }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }} onClick={() => setIsZoomed(false)}>
            <div onClick={e => e.stopPropagation()}
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              {turning && pendingSpread !== null ? (
                <PageTurn key={`${activeSpread}->${pendingSpread}`}
                  currentSrc={book2025Images[activeSpread].src}
                  nextSrc={book2025Images[pendingSpread].src}
                  direction={turnDir} onComplete={onTurnComplete} />
              ) : (
                <img src={book2025Images[activeSpread].src}
                  alt={book2025Images[activeSpread].alt} draggable={false}
                  style={{ display: "block", maxWidth: "90vw", maxHeight: "80vh", objectFit: "contain" }} />
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}
              onClick={e => e.stopPropagation()}>
              <button onClick={goPrev} disabled={activeSpread === 0 || turning}
                style={navBtnStyle(activeSpread === 0 || turning)}>←</button>
              <span style={{ fontSize: "11px", fontFamily: "ui-monospace, monospace", color: "#888", letterSpacing: "0.06em", width: "48px", textAlign: "center" }}>
                {String((pendingSpread ?? activeSpread) + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
              </span>
              <button onClick={goNext} disabled={activeSpread === TOTAL - 1 || turning}
                style={navBtnStyle(activeSpread === TOTAL - 1 || turning)}>→</button>
            </div>
            <button onClick={() => setIsZoomed(false)} style={{
              background: "none", border: "none", fontSize: "10px",
              fontFamily: "ui-monospace, monospace", color: "#aaa",
              letterSpacing: "0.08em", cursor: "pointer", padding: "4px 8px",
            }}>ESC TO CLOSE</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Fan + ground ─────────────────────────────────────────────────── */}
      <div style={{ position: "relative", flexShrink: 0 }}>

        {/* Shadow */}
        <div style={{
          position: "absolute", bottom: -10, left: "50%",
          transform: "translateX(-50%)",
          width: 220, height: 24,
          background: "rgba(0,0,0,0.12)", borderRadius: "50%",
          filter: "blur(16px)", zIndex: 0,
        }} />

        <motion.div style={{
          position: "relative", width: 0, height: PANEL_H,
          transformStyle: "preserve-3d", transformOrigin: "center center",
          zIndex: 1,
        }}
          animate={{ rotateX: -5, opacity: visible ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 50, damping: 22, opacity: { duration: 0.4 } }}
        >
          {/* Spine */}
          <div style={{
            position: "absolute", top: 0, left: -SPINE_W / 2,
            width: SPINE_W, height: PANEL_H,
            transform: "rotateY(90deg)", transformOrigin: "center center",
            background: "linear-gradient(to bottom, #ccc7bc 0%, #d8d4cc 40%, #ccc7bc 100%)",
            backfaceVisibility: "visible",
          }} />

          {/* Fan rotation wrapper */}
          <motion.div style={{
            position: "absolute", top: 0, left: 0,
            width: "100%", height: "100%",
            transformStyle: "preserve-3d", transformOrigin: "center center",
          }}
            animate={{ rotateY: fanRotation }}
            transition={{ type: "spring", stiffness: 80, damping: 22, mass: 1, restDelta: 0.001 }}
          >
            {/* ── Leaves ─────────────────────────────────────────────── */}
            {book2025Images.map((img, i) => {
              const openTransition = { duration: 0.65, ease: [0.32, 0, 0.18, 1] as const, delay: i * 0.06 };
              const bgSize  = `${PANEL_W * 2}px ${PANEL_H}px`;
              const nextIdx = (i + 1) % TOTAL;
              const nextImg = book2025Images[nextIdx];
              return (
                <motion.div key={i} style={{
                  position: "absolute", top: 0, left: 0,
                  width: PANEL_W, height: PANEL_H,
                  originX: "0%", originY: "50%",
                  transformStyle: "preserve-3d",
                }}
                  animate={{ rotateY: open ? spreadAngle(i) : 0 }}
                  transition={open && animated ? openTransition : { duration: 0 }}
                >
                  <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: `url('${img.src}')`,
                    backgroundSize: bgSize, backgroundRepeat: "no-repeat",
                    backgroundPosition: "100% 50%",
                    backfaceVisibility: "hidden",
                    transform: `translateZ(${PAPER_T / 2}px)`,
                    cursor: capGone ? "pointer" : "default",
                  }} onClick={e => { e.stopPropagation(); handleSpreadClick(i); }} />
                  <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: `url('${nextImg.src}')`,
                    backgroundSize: bgSize, backgroundRepeat: "no-repeat",
                    backgroundPosition: "0% 50%",
                    backfaceVisibility: "hidden",
                    transform: `rotateY(180deg) translateZ(${PAPER_T / 2}px)`,
                    cursor: capGone ? "pointer" : "default",
                  }} onClick={e => { e.stopPropagation(); handleSpreadClick(nextIdx); }} />
                </motion.div>
              );
            })}

            {/* ── 3D Wine Cap ─────────────────────────────────────────── */}
            <AnimatePresence>
              {!capGone && (
                <motion.div
                  key="cap"
                  style={{
                    position: "absolute",
                    top: OVERLAP, left: 0,
                    width: 0, height: 0,
                    transformStyle: "preserve-3d",
                    zIndex: 30, cursor: "grab", touchAction: "none",
                  }}
                  animate={{ y: capY }}
                  transition={{ duration: 0 }}
                  exit={{ y: capY - 500, transition: { duration: 0.46, ease: [0.32, 0, 0.08, 1] } }}
                  onPointerDown={onCapDown}
                  onPointerMove={onCapMove}
                  onPointerUp={onCapUp}
                >
                  {/* Cork top disc */}
                  <div style={{
                    position: "absolute",
                    width: CORK_R * 2, height: CORK_R * 2,
                    borderRadius: "50%",
                    left: -CORK_R,
                    top: -(BAND_H + FOIL_H + CORK_H) + CORK_DROP - CORK_R,
                    transform: "rotateX(90deg)",
                    transformOrigin: `${CORK_R}px ${CORK_R}px 0`,
                    background: "radial-gradient(circle at 40% 40%, #f8f5f0, #d8d4ce)",
                    boxShadow: "inset 0 0 8px rgba(0,0,0,0.1)",
                  }} />

                  {/* Cork cylinder panels */}
                  {Array.from({ length: CORK_N }, (_, i) => (
                    <div key={i} style={{
                      position: "absolute",
                      width: corkPW, height: CORK_H,
                      left: -corkPW / 2,
                      top: -(BAND_H + FOIL_H + CORK_H) + CORK_DROP,
                      background: corkShade(i),
                      backfaceVisibility: "hidden",
                      transform: `rotateY(${i * 360 / CORK_N}deg) translateZ(${CORK_R}px)`,
                    }} />
                  ))}

                  {/* Foil sleeve panels */}
                  {Array.from({ length: FOIL_N }, (_, i) => (
                    <div key={i} style={{
                      position: "absolute",
                      width: foilPW, height: FOIL_H,
                      left: -foilPW / 2,
                      top: -(BAND_H + FOIL_H) + FOIL_DROP,
                      background: foilShade(i),
                      backfaceVisibility: "hidden",
                      transform: `rotateY(${i * 360 / FOIL_N}deg) translateZ(${FOIL_R}px)`,
                    }}>
                      {[14, 28, 44, 58].map(y => (
                        <div key={y} style={{
                          position: "absolute", left: 0, right: 0, top: y, height: 1,
                          background: "rgba(255,255,255,0.45)",
                        }} />
                      ))}
                    </div>
                  ))}

                  {/* Gold band panels */}
                  {Array.from({ length: BAND_N }, (_, i) => (
                    <div key={i} style={{
                      position: "absolute",
                      width: bandPW, height: BAND_H,
                      left: -bandPW / 2,
                      top: -BAND_H + FOIL_DROP,
                      background: goldShade(i),
                      backfaceVisibility: "hidden",
                      transform: `rotateY(${i * 360 / BAND_N}deg) translateZ(${BAND_R}px)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {i === 0 && (
                        <span style={{
                          fontSize: "5px", color: "rgba(255,255,255,0.7)",
                          fontFamily: "ui-serif, Georgia, serif",
                          letterSpacing: "0.15em", fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}>TRACY</span>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>{/* end fanRotation */}
        </motion.div>{/* end outer fan container */}
      </div>

      {/* Caption */}
      <p style={{
        position: "fixed", bottom: "14px", left: "50%", transform: "translateX(-50%)",
        fontSize: "12px",
        fontFamily: "ui-sans-serif, system-ui, -apple-system, Helvetica, Arial, sans-serif",
        color: "#111111", opacity: 0.4,
        letterSpacing: "0.01em", whiteSpace: "nowrap", zIndex: 10,
      }}>
        {capGone ? "scroll to rotate · click to read" : "swipe cap up to open"}
      </p>
    </div>
  );
};

function navBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    width: "32px", height: "32px", borderRadius: "50%",
    background: disabled ? "transparent" : "rgba(255,255,255,0.8)",
    border: "1px solid rgba(0,0,0,0.08)",
    color: disabled ? "#ccc" : "#666",
    fontSize: "14px", cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.3 : 1, transition: "opacity 150ms",
    display: "flex", alignItems: "center", justifyContent: "center",
  };
}
