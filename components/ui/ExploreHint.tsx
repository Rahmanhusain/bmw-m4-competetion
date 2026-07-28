"use client";

import { motion, AnimatePresence } from "motion/react";
import { useScrollStore } from "@/lib/scroll-store";

export default function ExploreHint() {
  const exploreMode = useScrollStore((s) => s.exploreMode);

  return (
    <AnimatePresence>
      {exploreMode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            position: "fixed",
            bottom: "2.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 40,
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <p style={{ fontSize: "0.65rem", letterSpacing: "0.2em", color: "#8B8D93" }}>
            DRAG TO EXPLORE
          </p>
          <div
            style={{
              width: "1px",
              height: "24px",
              background: "linear-gradient(180deg, #3A6FF5, transparent)",
              margin: "0.5rem auto 0",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
