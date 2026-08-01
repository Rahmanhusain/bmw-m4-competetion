"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useScrollStore } from "@/lib/scroll-store";

/**
 * True for phones and small tablets — the devices this experience is worth
 * warning about.
 *
 * Tested with `pointer: coarse` *and* a width ceiling rather than a user-agent
 * sniff: the thing that actually degrades here is a small screen driving a heavy
 * WebGL scene, not any particular vendor. A touchscreen laptop reports coarse
 * pointer on some configurations but has the width and the GPU to run this fine,
 * so the width check keeps it out of the warning.
 *
 * Evaluated in an effect rather than during render because `matchMedia` does not
 * exist on the server — reading it in the component body would break the
 * prerender.
 */
function useIsSmallScreen(): boolean {
  const [small, setSmall] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 820px), (pointer: coarse)");
    const update = () => setSmall(query.matches && window.innerWidth <= 1024);
    update();
    query.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      query.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return small;
}

export default function Loader() {
  const loading = useScrollStore((s) => s.loading);
  const loadProgress = useScrollStore((s) => s.loadProgress);
  const isSmallScreen = useIsSmallScreen();

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            // Translucent scrim rather than an opaque fill: the animated radial
            // backdrop sits at z-index 0, so the loader now reads as part of the
            // same environment instead of a flat grey card.
            background:
              "radial-gradient(ellipse at 50% 55%, rgba(10, 10, 11, 0.35) 0%, rgba(6, 6, 8, 0.78) 70%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "2rem",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <motion.p
              className="gradient-text"
              initial={{ opacity: 0, letterSpacing: "0.35em" }}
              animate={{ opacity: 1, letterSpacing: "0.2em" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontSize: "0.7rem", fontWeight: 700, marginBottom: "0.5rem" }}
            >
              BMW M4 COMPETITION
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              style={{ fontSize: "0.65rem", letterSpacing: "0.15em", color: "var(--accent-cyan)" }}
            >
              2021 · G82
            </motion.p>
          </div>

          {/* Progress bar */}
          <div style={{ width: "160px", height: "1px", background: "#1C1D20", position: "relative" }}>
            <motion.div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                background:
                  "linear-gradient(90deg, #4FD8E8, #3A6FF5 55%, #7B3AF5)",
                boxShadow: "0 0 8px rgba(79, 216, 232, 0.55)",
                width: `${loadProgress * 100}%`,
              }}
              transition={{ duration: 0.1 }}
            />
          </div>

          <p
            className="gradient-text-static"
            style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em" }}
          >
            {Math.round(loadProgress * 100)}
          </p>

          {/* Desktop recommendation. Late delay so it arrives after the title and
              progress bar have settled — it's a footnote, not the headline, and
              appearing simultaneously would compete with them. */}
          <AnimatePresence>
            {isSmallScreen && (
              <motion.div
                className="desktop-hint"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Monitor glyph. Drawn rather than an emoji so it inherits the
                    accent colour and stays crisp at this size. */}
                <motion.svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden
                  // A slow breathing pulse draws the eye without the urgency of
                  // a flash — this is advice, not an error.
                  animate={{ opacity: [0.55, 1, 0.55] }}
                  transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
                  style={{ flex: "none" }}
                >
                  <rect
                    x="2.5"
                    y="3.5"
                    width="15"
                    height="10"
                    rx="1.5"
                    stroke="var(--accent-cyan)"
                    strokeWidth="1.1"
                  />
                  <path
                    d="M7.5 16.5h5M10 13.5v3"
                    stroke="var(--accent-cyan)"
                    strokeWidth="1.1"
                    strokeLinecap="round"
                  />
                </motion.svg>

                <span className="desktop-hint-text">
                  BEST EXPERIENCED ON DESKTOP
                  <span className="desktop-hint-sub">
                    Full 3D choreography · larger canvas
                  </span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
