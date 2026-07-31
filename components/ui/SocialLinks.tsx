"use client";

import { motion } from "motion/react";

/**
 * Social row for the end-of-scroll explore state.
 *
 * Every href is a placeholder — swap the URLs in LINKS below for real ones.
 * Icons are inline SVG paths rather than an icon package: four glyphs isn't
 * worth a dependency, and inline paths can inherit `currentColor` so the hover
 * transition is a single CSS property.
 */

type Link = {
  id: string;
  label: string;
  href: string;
  /** 24x24 viewBox path data. */
  path: string;
};

const LINKS: Link[] = [
  {
    id: "github",
    label: "GitHub",
    href: "https://github.com/",
    path: "M12 2C6.48 2 2 6.58 2 12.23c0 4.51 2.87 8.34 6.84 9.69.5.09.68-.22.68-.49 0-.24-.01-1.05-.01-1.91-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.4 9.4 0 0 1 2.5-.34c.85 0 1.71.12 2.5.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.35 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.05 10.05 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://linkedin.com/",
    path: "M6.94 5.5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0ZM3.4 8.9h3.2V21H3.4V8.9Zm5.5 0h3.07v1.65h.04c.43-.81 1.47-1.67 3.03-1.67 3.24 0 3.84 2.13 3.84 4.9V21h-3.2v-6.36c0-1.52-.03-3.47-2.11-3.47-2.12 0-2.44 1.65-2.44 3.36V21H8.9V8.9Z",
  },
  {
    id: "twitter",
    label: "X (Twitter)",
    href: "https://x.com/",
    path: "M17.53 3h3.2l-6.99 7.99L22 21h-6.4l-4.6-6.02L5.7 21H2.5l7.28-8.32L2 3h6.4l4.36 5.77L17.53 3Zm-1.13 16.08h1.77L7.68 4.82H5.78l10.62 14.26Z",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    href: "https://example.com/",
    path: "M12 2 2 7l10 5 10-5-10-5Zm0 7.53L4.87 6 12 2.47 19.13 6 12 9.53ZM2 12l10 5 10-5-1.79-.9L12 15.2 3.79 11.1 2 12Zm0 5 10 5 10-5-1.79-.9L12 20.2 3.79 16.1 2 17Z",
  },
];

export default function SocialLinks() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.9rem",
        marginBottom: "1.5rem",
      }}
    >
      {LINKS.map((link, i) => (
        <motion.a
          key={link.id}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          title={link.label}
          className="social-btn"
          initial={{ opacity: 0, y: 14, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.55,
            delay: 0.15 + i * 0.09,
            ease: [0.22, 1, 0.36, 1],
          }}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.94 }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d={link.path} />
          </svg>
        </motion.a>
      ))}
    </div>
  );
}
