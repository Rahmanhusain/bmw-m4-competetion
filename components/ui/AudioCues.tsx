"use client";

import { useEffect } from "react";
import { useScrollStore } from "@/lib/scroll-store";
import { useAudioStore } from "@/lib/audio-store";
import { cameraKeyframes } from "@/lib/camera-keyframes";

/**
 * Fires sound effects off scroll state. Renders nothing.
 *
 * This is a separate component rather than logic inside HomePage so that the
 * store subscriptions live somewhere that never renders anything — the cue
 * logic can't cause a re-render of the page tree no matter how often it fires.
 *
 * Both subscriptions are imperative (`store.subscribe`) rather than selector
 * hooks, for the same reason CameraRig reads progress transiently: `progress`
 * updates on every scroll tick, and a selector hook would turn each of those
 * into a React commit.
 */

/** Progress values where the camera reaches a keyframe, minus the endpoints. */
const KEYFRAME_STOPS = cameraKeyframes
  .map((kf) => kf.scrollProgress)
  .filter((p) => p > 0 && p < 1);

/** How close progress must get to a stop before it counts as "arrived". */
const STOP_EPSILON = 0.012;

export default function AudioCues() {
  useEffect(() => {
    const playSfx = useAudioStore.getState().playSfx;

    // --- Section transitions -------------------------------------------
    const unsubSection = useScrollStore.subscribe((state, prev) => {
      if (
        state.activeSection !== prev.activeSection ||
        state.exploreMode !== prev.exploreMode
      ) {
        playSfx("transition");
      }
    });

    // --- Camera keyframe arrivals ---------------------------------------
    // Latched per stop: without this, sitting near a keyframe with a trackpad
    // would retrigger on every sub-pixel scroll event. The latch clears once
    // progress has moved a clear distance away again.
    const latched = new Set<number>();

    const unsubCamera = useScrollStore.subscribe((state) => {
      const p = state.progress;
      for (const stop of KEYFRAME_STOPS) {
        const near = Math.abs(p - stop) < STOP_EPSILON;
        if (near && !latched.has(stop)) {
          latched.add(stop);
          playSfx("camera");
        } else if (!near && Math.abs(p - stop) > STOP_EPSILON * 2.5) {
          latched.delete(stop);
        }
      }
    });

    return () => {
      unsubSection();
      unsubCamera();
    };
  }, []);

  return null;
}
