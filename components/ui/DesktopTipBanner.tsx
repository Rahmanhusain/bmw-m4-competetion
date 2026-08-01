"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useIsSmallScreen } from "@/lib/use-is-small-screen";

const DISMISSED_KEY = "bmw-desktop-tip-dismissed";

/**
 * Follow-up to the loader's desktop hint: that one is gone by the time the
 * scene is actually visible, so a phone/tablet visitor never sees it once
 * they're looking at the car. This repeats the same advice as a small,
 * dismissible banner once the experience is live.
 *
 * Dismissal is remembered in sessionStorage rather than shown every visit —
 * once acknowledged, repeating it would just be nagging.
 */
export default function DesktopTipBanner() {
  const isSmallScreen = useIsSmallScreen();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISSED_KEY) === "1");
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {isSmallScreen && !dismissed && (
        <motion.div
          className="desktop-hint desktop-hint-banner"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden
            style={{ flex: "none" }}
          >
            <rect x="2.5" y="3.5" width="15" height="10" rx="1.5" stroke="var(--accent-cyan)" strokeWidth="1.1" />
            <path d="M7.5 16.5h5M10 13.5v3" stroke="var(--accent-cyan)" strokeWidth="1.1" strokeLinecap="round" />
          </svg>

          <span className="desktop-hint-text">
            BEST EXPERIENCED ON DESKTOP
            <span className="desktop-hint-sub">Full 3D choreography · larger canvas</span>
          </span>

          <button
            type="button"
            className="desktop-hint-dismiss"
            onClick={dismiss}
            aria-label="Dismiss desktop tip"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
