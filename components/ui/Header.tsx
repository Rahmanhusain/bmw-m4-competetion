"use client";

import { motion } from "motion/react";
import AudioToggle from "./AudioToggle";
import { scrollToTop } from "@/lib/scroll-to-top";

/**
 * Fixed header. No navigation by design — just the logo lockup, aligned right,
 * with the audio control beside it.
 * `pointerEvents: none` on the bar so it never steals drag gestures from the
 * canvas underneath; only the controls themselves opt back in.
 */
export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "1.2rem clamp(1.20rem, 4vw, 3rem)",
        pointerEvents: "none",
      }}
    >
      {/* Hairline under the bar, brightening toward the logo side. */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 1,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(167, 173, 189, 0.14) 45%, rgba(79, 216, 232, 0.45) 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          pointerEvents: "auto",
        }}
      >
        <AudioToggle />

        {/* Soft bloom behind the mark. Compositor-only, so it stays off the
            WebGL frame budget. */}
        <motion.span
          aria-hidden
          animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.12, 1] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          style={{
            position: "absolute",
            left: -10,
            top: "50%",
            width: 54,
            height: 54,
            marginTop: -27,
            borderRadius: "50%",
            filter: "blur(16px)",
            background:
              "radial-gradient(circle, rgba(79, 216, 232, 0.5) 0%, rgba(58, 111, 245, 0.22) 45%, transparent 72%)",
            pointerEvents: "none",
          }}
        />

        <button
          type="button"
          onClick={scrollToTop}
          className="logo-btn"
          aria-label="Replay the showcase from the top"
        >
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" role="img" aria-label="M4">
            <defs>
              <linearGradient id="hdr-ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4FD8E8" />
                <stop offset="55%" stopColor="#3A6FF5" />
                <stop offset="100%" stopColor="#7B3AF5" />
              </linearGradient>
            </defs>
            <circle cx="15" cy="15" r="13.4" stroke="url(#hdr-ring)" strokeWidth="1.1" opacity="0.95" />
            {/* Three canted bars — a nod to the motorsport stripe, recoloured to
                this project's palette rather than the factory red/blue/violet. */}
            <path d="M7.4 20.6 L11.9 9.4 L14.5 9.4 L10 20.6 Z" fill="#4FD8E8" />
            <path d="M11.5 20.6 L16 9.4 L18.6 9.4 L14.1 20.6 Z" fill="#3A6FF5" />
            <path d="M15.6 20.6 L20.1 9.4 L22.7 9.4 L18.2 20.6 Z" fill="#7B3AF5" />
          </svg>

          <span
            className="gradient-text"
            style={{
              fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
              fontSize: "1.35rem",
              fontWeight: 800,
              letterSpacing: "0.02em",
              lineHeight: 1,
            }}
          >
            M4
          </span>
        </button>
      </div>
    </motion.header>
  );
}
