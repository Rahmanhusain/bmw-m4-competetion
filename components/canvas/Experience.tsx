"use client";

import { Suspense, useMemo, useRef, useState, useLayoutEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, PerformanceMonitor, Preload } from "@react-three/drei";
import * as THREE from "three";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import Car from "./Car";
import CameraRig from "./CameraRig";
import Lighting from "./Lighting";
import Ground from "./Ground";

// Suppress THREE.Clock deprecation — it's fired by @react-three/fiber internals
// and cannot be fixed without an R3F upgrade.
const _origWarn = console.warn;
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === "string" && args[0].includes("THREE.Clock")) return;
  _origWarn.apply(console, args);
};

/** Aspect the camera keyframes were framed against (a typical desktop window). */
const REFERENCE_ASPECT = 16 / 9;

function PostProcessing() {
  return (
    // 4x MSAA is visually indistinguishable from the default 8x here but
    // roughly halves the resolve cost of the composer's HDR buffers.
    <EffectComposer multisampling={4} stencilBuffer={false}>
      <Bloom
        intensity={0.3}
        luminanceThreshold={0.8}
        luminanceSmoothing={0.5}
        mipmapBlur
        // Default is 8. Each level is another downsample + upsample pass over
        // the HDR buffer; levels 7 and 8 operate on 1-2px mips whose
        // contribution at this intensity is imperceptible. Cutting to 6 drops
        // four fullscreen-ish passes per frame.
        levels={6}
      />
      <Vignette offset={0.35} darkness={0.6} />
    </EffectComposer>
  );
}

/**
 * Nothing in the scene moves once loaded — only the camera does. So the shadow
 * map only needs to be rendered a handful of times instead of every frame,
 * which removes a full-scene depth pass from the frame budget.
 */
function FreezeShadows() {
  const gl = useThree((s) => s.gl);
  const warmupFrames = useRef(0);

  useLayoutEffect(() => {
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
    return () => {
      gl.shadowMap.autoUpdate = true;
    };
  }, [gl]);

  useFrame(() => {
    // A few frames of grace so late material/texture uploads are captured.
    if (warmupFrames.current < 4) {
      warmupFrames.current++;
      gl.shadowMap.needsUpdate = true;
    }
  });

  return null;
}

/**
 * Widens the field of view on narrow viewports so the car still fits.
 *
 * A perspective camera's `fov` is *vertical*; the horizontal extent is derived
 * from it via the aspect ratio. The keyframe path in `camera-keyframes.ts` was
 * framed on a desktop window (aspect ~1.7), where 40° vertical gives a wide
 * enough horizontal cone to hold a 4.8m car. On a phone in portrait (aspect
 * ~0.46) that same 40° yields barely a third of the horizontal angle, so the
 * nose and tail fall outside the frustum — the car is cut off at both ends.
 *
 * Rather than authoring a second set of keyframes for mobile, this solves for
 * the vertical fov that keeps the *horizontal* cone constant. The distances,
 * timings and lookAt targets all stay exactly as choreographed; only the lens
 * gets wider, which is the same thing a photographer would do stepping back
 * into a tight space.
 *
 * Clamped at 68° because past that the perspective distortion becomes obvious
 * and the wheels start to bow outward at the frame edge.
 */
function ResponsiveCamera() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);

  useLayoutEffect(() => {
    const aspect = size.width / Math.max(1, size.height);

    // The horizontal cone the desktop framing produces, held as the target.
    const baseVertical = THREE.MathUtils.degToRad(40);
    const baseHorizontal = 2 * Math.atan(Math.tan(baseVertical / 2) * REFERENCE_ASPECT);

    // Only ever widen. On wide screens the original 40° already frames well and
    // narrowing it would push the car uncomfortably large in the viewport.
    const fov =
      aspect >= REFERENCE_ASPECT
        ? 40
        : Math.min(
            68,
            THREE.MathUtils.radToDeg(
              2 * Math.atan(Math.tan(baseHorizontal / 2) / aspect)
            )
          );

    camera.fov = fov;
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  return null;
}

export default function Experience() {
  // Cap at 2 but never supersample past the display's real pixel ratio.
  const maxDpr = useMemo(
    () =>
      Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1),
    []
  );
  const [dpr, setDpr] = useState(maxDpr);

  // PerformanceMonitor trades DPR for framerate. Tuned to clamp tighter under
  // load: the earlier version had a wide range (0.75×max → max), which meant
  // degrading from 2 to 1.5 on a retina display. That doesn't save much — both
  // are still well above 1× — and the user only notices the resolution drop.
  // Cutting the floor to 0.5×max means the monitor can reach 1× before hitting
  // bottom, which is where the frame-time savings actually live.
  const handlePerformanceChange = useMemo(
    () => ({ factor }: { factor: number }) =>
      setDpr(Math.round(maxDpr * (0.5 + 0.5 * factor) * 100) / 100),
    [maxDpr]
  );

  return (
    <Canvas
      shadows={{ type: THREE.PCFShadowMap }}
      dpr={dpr}
      camera={{ fov: 40, near: 0.1, far: 100, position: [5, 2.5, 5] }}
      // alpha is on so the animated radial-gradient backdrop in the DOM shows
      // through instead of a flat fill. antialias stays off: it's a no-op behind
      // EffectComposer (the final pass is a fullscreen quad) and only costs an
      // extra multisampled canvas buffer.
      gl={{
        antialias: false,
        alpha: true,
        stencil: false,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = 2; // ACESFilmicToneMapping
        gl.toneMappingExposure = 1.1;
        // Fully transparent clear so the CSS gradients behind the canvas are
        // the visible environment.
        gl.setClearAlpha(0);
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        // `dvh` rather than `vh`: on mobile browsers `100vh` is the *largest*
        // viewport (URL bar retracted), so a `100vh` canvas is taller than what
        // is actually on screen and the bottom of the frame — where the car's
        // wheels sit — is hidden behind the browser chrome.
        height: "100dvh",
        // No background here — the .radial-env layer underneath is the backdrop.
        zIndex: 1,
      }}
    >
      {/* No <color attach="background"> — an opaque scene background would
          paint over the DOM gradient. Fog stays: it still fades any distant
          geometry toward the backdrop's base tone. */}
      <fog attach="fog" args={["#08080C", 18, 35]} />

      {/* Actually wired up: trades a little resolution for framerate when the
          GPU can't keep up, instead of dropping frames. */}
      <PerformanceMonitor factor={1} onChange={handlePerformanceChange} />

      <Suspense fallback={null}>
        <Environment preset="city" background={false} />
        <Lighting />
        <Ground />
        <Car />
        <FreezeShadows />
        {/* Compile shaders / upload textures up front so the first frames
            after the loader don't hitch. */}
        <Preload all />
      </Suspense>

      <CameraRig />
      <ResponsiveCamera />
      <PostProcessing />
    </Canvas>
  );
}
