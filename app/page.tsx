"use client";

import { useRef, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { motion } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { useScrollStore } from "@/lib/scroll-store";
import { scrollToTop } from "@/lib/scroll-to-top";
import { sections } from "@/lib/sections";
import SectionPanel from "@/components/ui/SectionPanel";
import ScrollProgress from "@/components/ui/ScrollProgress";
import ExploreHint from "@/components/ui/ExploreHint";
import DesktopTipBanner from "@/components/ui/DesktopTipBanner";
import Loader from "@/components/ui/Loader";
import SocialLinks from "@/components/ui/SocialLinks";
import AudioCues from "@/components/ui/AudioCues";
import Header from "@/components/ui/Header";
import RadialEnvironment from "@/components/ui/RadialEnvironment";
import KeyboardNav from "@/components/ui/KeyboardNav";

// Dynamically import the R3F canvas — no SSR
const Experience = dynamic(() => import("@/components/canvas/Experience"), {
  ssr: false,
});

gsap.registerPlugin(ScrollTrigger);

/* Each section gets ~1.0 viewport height of scroll.
   Total scroll: hero(1vh) + 4 sections(4vh) + explore(1vh) = 6vh
   Scroll multiplier to make it feel luxurious */
const SCROLL_HEIGHT_VH = 600; // 6x viewport

/* Words animate in one at a time. Split on the word rather than the character:
   the headline is set in a condensed display face, and per-letter staggering
   makes the tracking visibly breathe as each glyph lands. */
const HERO_WORDS = ["M4", "COMPETITION"];

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
              marginBottom: "0.75rem",
              display: "flex",
              justifyContent: "center",
              gap: "0.3em",
            }}
          >
            {HERO_WORDS.map((word, i) => (
              <motion.span
                key={word}
                className="gradient-text"
                initial={{ opacity: 0, y: "0.35em", filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.9,
                  delay: 0.45 + i * 0.14,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{ display: "inline-block" }}
              >
                {word}
              </motion.span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, letterSpacing: "0.3em" }}
            transition={{ duration: 1.1, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="gradient-text-static"
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.3em",
              marginBottom: "2rem",
            }}
          >
            2021 · G82 · SAPPHIRE BLACK
          </motion.p>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem" }}
          >
            <p style={{ fontSize: "0.55rem", letterSpacing: "0.25em", color: "var(--text-secondary)" }}>
              SCROLL TO EXPLORE
            </p>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 5L7 9L11 5" stroke="var(--accent-cyan)" strokeWidth="1" />
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
            // Centred by a flex row spanning the viewport rather than
            // `left:50% + translateX(-50%)`. The `y` animation above compiles to
            // a `transform`, which overwrites an inline `translateX` entirely —
            // that is what had this block sitting left of centre.
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "0 1.25rem",
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
          <p style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
            DESIGNED FOR PORTFOLIO · 2024
          </p>

          <SocialLinks />

          <button
            type="button"
            onClick={scrollToTop}
            className="cta-btn"
            aria-label="Replay the showcase from the top"
          >
            <span>VIEW PORTFOLIO</span>
            <span className="cta-arrow" aria-hidden>
              →
            </span>
          </button>
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
  // No `setLoading` selector: the loader interval below writes through
  // useScrollStore.getState() so it doesn't re-subscribe this component.
  const activeSection = useScrollStore((s) => s.activeSection);
  const exploreMode = useScrollStore((s) => s.exploreMode);
  const loading = useScrollStore((s) => s.loading);

  // The canvas only mounts once `loading` flips to false, which means the
  // three.js chunk *and* the 19MB GLB were previously only requested after the
  // loader had already finished — so the loader was pure dead time and the real
  // wait started right as it disappeared. Warming both here overlaps the network
  // with the loader animation. Nothing about the loader's timing or UI changes;
  // by the time it hands off, the model is usually already decoded.
  useEffect(() => {
    let cancelled = false;
    // Importing the module is enough: it pulls in the canvas chunk and its
    // `useGLTF.preload(GLB_PATH)` at module scope kicks off the model fetch.
    import("@/components/canvas/Experience").catch(() => {
      // Warming is best-effort — the real mount below will surface any error.
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
      {/* Animated radial-gradient backdrop. Mounted unconditionally and behind
          the canvas (z-index 0 vs the canvas's 1) so the loader also sits over
          it rather than over a flat fill. */}
      <RadialEnvironment />

      <Loader />

      {/* Fixed 3D canvas */}
      {!loading && <Experience />}

      {/* Header: logo + audio toggle */}
      {!loading && <Header />}

      {/* One-time reminder that the full experience is built for desktop */}
      {!loading && <DesktopTipBanner />}

      {/* Scroll/camera sound cues. Renders nothing. */}
      {!loading && <AudioCues />}

      {/* Arrow/Home/End/digit navigation. Renders nothing. */}
      {!loading && <KeyboardNav />}

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
