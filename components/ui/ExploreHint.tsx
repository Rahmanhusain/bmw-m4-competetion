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
          <motion.p
            className="gradient-text"
            animate={{ opacity: [0.65, 1, 0.65] }}
            transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
            style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em" }}
          >
            DRAG TO EXPLORE
          </motion.p>
          <div
            style={{
              width: "1px",
              height: "24px",
              background: "linear-gradient(180deg, #4FD8E8, #3A6FF5 45%, transparent)",
              margin: "0.5rem auto 0",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
