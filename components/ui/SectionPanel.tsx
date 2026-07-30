"use client";

import { motion } from "motion/react";
import type { Variants } from "motion/react";
import type { Section } from "@/lib/sections";

interface SectionPanelProps {
  section: Section;
  visible: boolean;
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
  exit: {
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
};

const lineVariants: Variants = {
  hidden: (alignment: "left" | "right") => ({
    opacity: 0,
    x: alignment === "left" ? -40 : 40,
  }),
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (alignment: "left" | "right") => ({
    opacity: 0,
    x: alignment === "left" ? -20 : 20,
    transition: { duration: 0.3, ease: "easeIn" },
  }),
};

export default function SectionPanel({ section, visible }: SectionPanelProps) {
  const isLeft = section.alignment === "left";

  return (
    <motion.div
      initial="hidden"
      animate={visible ? "visible" : "exit"}
      exit="exit"
      variants={containerVariants}
      style={{
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        ...(isLeft ? { left: "clamp(2rem, 6vw, 8rem)" } : { right: "clamp(2rem, 6vw, 8rem)" }),
        maxWidth: "420px",
        pointerEvents: visible ? "auto" : "none",
        textAlign: isLeft ? "left" : "right",
      }}
    >
      {/* Eyebrow: section number + label */}
      <motion.p
        custom={section.alignment}
        variants={lineVariants}
        style={{
          fontSize: "0.65rem",
          letterSpacing: "0.25em",
          color: "var(--accent-cyan)",
          marginBottom: "0.75rem",
        }}
      >
        {section.index}&ensp;{section.label}
      </motion.p>

      {/* Accent hairline */}
      <motion.div
        custom={section.alignment}
        variants={lineVariants}
        style={{
          width: "40px",
          height: "1px",
          background: "linear-gradient(90deg, #3A6FF5, #7B3AF5)",
          marginBottom: "1.25rem",
          ...(isLeft ? {} : { marginLeft: "auto" }),
        }}
      />

      {/* Headline */}
      <motion.h2
        custom={section.alignment}
        variants={lineVariants}
        className="gradient-text"
        style={{
          fontSize: "clamp(1.5rem, 3vw, 2.4rem)",
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          marginBottom: "0.75rem",
        }}
      >
        {section.headline}
      </motion.h2>

      {/* Body copy */}
      <motion.p
        custom={section.alignment}
        variants={lineVariants}
        style={{
          fontSize: "0.85rem",
          lineHeight: 1.65,
          color: "var(--text-secondary)",
          maxWidth: "360px",
          ...(isLeft ? {} : { marginLeft: "auto" }),
        }}
      >
        {section.body}
      </motion.p>

      {/* Stats (performance section) */}
      {section.stats && (
        <motion.div
          custom={section.alignment}
          variants={lineVariants}
          style={{
            display: "flex",
            gap: "2.5rem",
            marginTop: "1.75rem",
            justifyContent: isLeft ? "flex-start" : "flex-end",
          }}
        >
          {section.stats.map((stat) => (
            <div key={stat.label} style={{ textAlign: isLeft ? "left" : "right" }}>
              <span
                className="gradient-text"
                style={{
                  fontSize: "clamp(2rem, 4vw, 3.2rem)",
                  fontWeight: 800,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "var(--accent-cyan)",
                  marginLeft: "0.3rem",
                  letterSpacing: "0.05em",
                }}
              >
                {stat.unit}
              </span>
              <p style={{ fontSize: "0.6rem", color: "var(--text-secondary)", letterSpacing: "0.15em", marginTop: "0.25rem" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
