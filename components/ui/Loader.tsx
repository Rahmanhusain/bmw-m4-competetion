"use client";

import { motion, AnimatePresence } from "motion/react";
import { useScrollStore } from "@/lib/scroll-store";

export default function Loader() {
  const loading = useScrollStore((s) => s.loading);
  const loadProgress = useScrollStore((s) => s.loadProgress);

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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
