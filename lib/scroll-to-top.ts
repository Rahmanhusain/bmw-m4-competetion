import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

/**
 * Returns the page to the very start so the showcase can be watched again.
 *
 * Everything on this page is derived from window scroll position through the
 * ScrollTrigger in HomePage, so there is no separate state to reset: driving
 * the scroll back to 0 replays progress through `onUpdate` in reverse, which
 * puts the camera, section panels and hero back exactly where they began.
 *
 * GSAP rather than `window.scrollTo({ behavior: "smooth" })` because the track
 * is 600vh tall — native smooth scrolling over that distance is slow and its
 * duration isn't controllable. `autoKill` hands control straight back if the
 * user scrolls mid-flight instead of fighting them for the next second.
 */
export function scrollToTop() {
  if (typeof window === "undefined") return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const distance = window.scrollY;

  if (reduceMotion || distance < 8) {
    window.scrollTo(0, 0);
    return;
  }

  gsap.to(window, {
    // Long trips get a little more time, but never so much that the button
    // feels unresponsive from the bottom of the track.
    duration: gsap.utils.clamp(0.9, 1.8, distance / 2600),
    ease: "power2.inOut",
    overwrite: true,
    scrollTo: { y: 0, autoKill: true },
  });
}
