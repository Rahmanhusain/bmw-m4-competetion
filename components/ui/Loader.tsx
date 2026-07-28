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
            background: "#0A0A0B",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "2rem",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#8B8D93", fontSize: "0.7rem", letterSpacing: "0.2em", marginBottom: "0.5rem" }}>
              BMW M4 COMPETITION
            </p>
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.15em", color: "#8B8D93" }}>
              2021 · G82
            </p>
          </div>

          {/* Progress bar */}
          <div style={{ width: "160px", height: "1px", background: "#1C1D20", position: "relative" }}>
            <motion.div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                background: "linear-gradient(90deg, #3A6FF5, #7B3AF5)",
                width: `${loadProgress * 100}%`,
              }}
              transition={{ duration: 0.1 }}
            />
          </div>

          <p style={{ color: "#8B8D93", fontSize: "0.6rem", letterSpacing: "0.15em" }}>
            {Math.round(loadProgress * 100)}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
