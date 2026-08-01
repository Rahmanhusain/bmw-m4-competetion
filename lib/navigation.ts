import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { sections } from "./sections";

gsap.registerPlugin(ScrollToPlugin);

/**
 * One place that knows how to move the page to a given stop.
 *
 * Everything visible on this site is derived from window scroll position via the
 * ScrollTrigger in `HomePage` — the camera, the panels, the hero, the explore
 * mode. So navigation is never "set the active section"; it is always "scroll to
 * the position that produces that section", and the existing `onUpdate` does the
 * rest. That keeps a single source of truth and means jump-nav, keyboard and the
 * hotspot pins can't ever disagree with the scrollbar.
 */

/**
 * Progress values that `HomePage`'s onUpdate maps to each stop.
 *
 * These mirror the thresholds in that handler exactly: hero below 0.08, explore
 * above 0.88, and the four sections spread evenly across the 0.8 between. Each
 * target is aimed at the *centre* of its band rather than its leading edge, so
 * landing on a section leaves headroom on both sides — stopping exactly on a
 * boundary would leave a nudge in either direction flipping to a neighbour.
 */
export const HERO_PROGRESS = 0.0;
export const EXPLORE_PROGRESS = 0.94;

const SECTION_START = 0.08;
const SECTION_SPAN = 0.8;

/** Centre of section `i`'s progress band. */
export function sectionProgress(i: number): number {
  const band = SECTION_SPAN / sections.length;
  return SECTION_START + band * (i + 0.5);
}

/**
 * Every navigable stop in order: hero, the four sections, then explore.
 * Index into this is the same index `ScrollProgress` renders and the keyboard
 * handler steps through, so "which dot is lit" and "where will ← take me" are
 * guaranteed to be the same list.
 */
export interface Stop {
  id: string;
  label: string;
  progress: number;
  /** Section index this stop maps to: -1 for hero, sections.length-1 for explore. */
  section: number;
}

export const stops: Stop[] = [
  { id: "hero", label: "HERO", progress: HERO_PROGRESS, section: -1 },
  ...sections.map((s, i) => ({
    id: s.id,
    label: `${s.index} ${s.label}`,
    progress: sectionProgress(i),
    section: i,
  })),
  {
    id: "explore",
    label: "EXPLORE",
    progress: EXPLORE_PROGRESS,
    section: sections.length - 1,
  },
];

/** Total scrollable distance in px. */
function maxScroll(): number {
  return Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
}

/**
 * The stop index implied by the store's current state.
 *
 * Derived from store state rather than raw scroll position, because during a GSAP
 * flight the scroll position is mid-transit: computing from raw scrollY would make
 * a second keypress step from wherever the animation happened to be, which stalls
 * or skips. Deriving from `activeSection`/`exploreMode` instead means the
 * keyboard steps from the stop the user can *see* is active — the same value
 * `ScrollProgress` lights up. This is the exact inverse of the `activeIdx`
 * calculation in that component; the two must stay in step.
 */
export function stopIndexForState(activeSection: number, exploreMode: boolean): number {
  return exploreMode ? stops.length - 1 : activeSection + 1;
}

/**
 * Animate the window to a progress value.
 *
 * GSAP rather than `scrollTo({ behavior: "smooth" })` for the same reason
 * `scroll-to-top.ts` uses it: the track is 600vh, and native smooth scrolling
 * across that distance is both slow and non-configurable. Duration scales with
 * how far we're going so a one-section step stays snappy while a jump from hero
 * to explore still reads as a move rather than a teleport.
 *
 * `autoKill` hands control straight back if the user touches the wheel mid-flight
 * — a nav animation should never fight the person using it.
 */
export function scrollToProgress(p: number) {
  if (typeof window === "undefined") return;

  const target = Math.max(0, Math.min(1, p)) * maxScroll();
  const distance = Math.abs(target - window.scrollY);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || distance < 8) {
    window.scrollTo(0, target);
    return;
  }

  gsap.to(window, {
    duration: gsap.utils.clamp(0.55, 1.6, distance / 2600),
    ease: "power2.inOut",
    overwrite: true,
    scrollTo: { y: target, autoKill: true },
  });
}

/** Jump to a stop by index into `stops`. Out-of-range indices are ignored. */
export function goToStop(i: number) {
  const stop = stops[i];
  if (!stop) return;
  scrollToProgress(stop.progress);
}
