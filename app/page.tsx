"use client";

import { useRef, useEffect, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import { motion } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { useScrollStore } from "@/lib/scroll-store";
import { sections } from "@/lib/sections";
import SectionPanel from "@/components/ui/SectionPanel";
import ScrollProgress from "@/components/ui/ScrollProgress";
import ExploreHint from "@/components/ui/ExploreHint";
import Loader from "@/components/ui/Loader";

// Dynamically import the R3F canvas — no SSR
const Experience = dynamic(() => import("@/components/canvas/Experience"), {
  ssr: false,
});

gsap.registerPlugin(ScrollTrigger);

/* Each section gets ~1.0 viewport height of scroll.
   Total scroll: hero(1vh) + 4 sections(4vh) + explore(1vh) = 6vh
   Scroll multiplier to make it feel luxurious */
const SCROLL_HEIGHT_VH = 600; // 6x viewport

function HeroOverlay({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          transition={{ duration: 1, delay: 0.3 }}
          style={{
            position: "absolute",
            bottom: "15vh",
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
            pointerEvents: "none",
            zIndex: 30,
          }}
        >
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 4.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              color: "#E8E6E1",
              marginBottom: "0.75rem",
            }}
          >
            M4 COMPETITION
          </h1>
          <p
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.3em",
              color: "#8B8D93",
              marginBottom: "2rem",
            }}
          >
            2021 · G82 · SAPPHIRE BLACK
          </p>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem" }}
          >
            <p style={{ fontSize: "0.55rem", letterSpacing: "0.25em", color: "#8B8D93" }}>
              SCROLL TO EXPLORE
            </p>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 5L7 9L11 5" stroke="#8B8D93" strokeWidth="1" />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ClosingSection({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: "fixed",
            bottom: "6rem",
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
            zIndex: 30,
          }}
        >
          <div
            style={{
              width: "40px",
              height: "1px",
              background: "linear-gradient(90deg, #3A6FF5, #7B3AF5)",
              margin: "0 auto 1.5rem",
            }}
          />
          <p style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "#8B8D93", marginBottom: "1rem" }}>
            DESIGNED FOR PORTFOLIO · 2024
          </p>
          <a
            href="#"
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
              color: "#E8E6E1",
              textDecoration: "none",
              borderBottom: "1px solid #3A6FF5",
              paddingBottom: "2px",
            }}
          >
            VIEW PORTFOLIO →
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const setProgress = useScrollStore((s) => s.setProgress);
  const setActiveSection = useScrollStore((s) => s.setActiveSection);
  const setExploreMode = useScrollStore((s) => s.setExploreMode);
  const setLoading = useScrollStore((s) => s.setLoading);
  const activeSection = useScrollStore((s) => s.activeSection);
  const exploreMode = useScrollStore((s) => s.exploreMode);
  const loading = useScrollStore((s) => s.loading);

  // Simulate loading (real progress would come from model loader)
  useEffect(() => {
    const store = useScrollStore.getState();
    let p = 0;
    const tick = setInterval(() => {
      p += 0.02 + Math.random() * 0.04;
      if (p >= 1) {
        p = 1;
        clearInterval(tick);
        setTimeout(() => store.setLoading(false), 400);
      }
      store.setLoadProgress(p);
    }, 60);
    return () => clearInterval(tick);
  }, []);

  // GSAP ScrollTrigger: pin the viewport-height container and scrub progress 0→1
  useEffect(() => {
    if (!containerRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.5,
      onUpdate: (self) => {
        const p = self.progress;
        setProgress(p);

        // Map progress to active section
        if (p < 0.08) {
          setActiveSection(-1); // hero
          setExploreMode(false);
        } else if (p > 0.88) {
          setActiveSection(sections.length - 1);
          setExploreMode(true);
        } else {
          setExploreMode(false);
          // 4 sections between 0.08 and 0.88
          const sectionProgress = (p - 0.08) / 0.8;
          const idx = Math.floor(sectionProgress * sections.length);
          setActiveSection(Math.min(idx, sections.length - 1));
        }
      },
    });

    return () => trigger.kill();
  }, [setProgress, setActiveSection, setExploreMode]);

  const isHero = activeSection === -1 && !exploreMode;

  return (
    <>
      <Loader />

      {/* Fixed 3D canvas */}
      {!loading && <Experience />}

      {/* Scroll-progress dots */}
      {!loading && <ScrollProgress />}

      {/* Hero title */}
      {!loading && <HeroOverlay visible={isHero} />}

      {/* Section text panels */}
      {!loading && (
        <div style={{ position: "fixed", inset: 0, zIndex: 30, pointerEvents: "none" }}>
          {sections.map((section, i) => (
            <SectionPanel
              key={section.id}
              section={section}
              visible={activeSection === i && !exploreMode}
            />
          ))}
        </div>
      )}

      {/* Explore hint */}
      {!loading && <ExploreHint />}

      {/* Closing CTA */}
      {!loading && <ClosingSection visible={exploreMode} />}

      {/* Scroll track — the invisible tall div that creates the scroll distance */}
      <div
        ref={containerRef}
        style={{
          height: `${SCROLL_HEIGHT_VH}vh`,
          position: "relative",
          zIndex: 0,
          pointerEvents: "none",
        }}
        aria-hidden
      />
    </>
  );
}
