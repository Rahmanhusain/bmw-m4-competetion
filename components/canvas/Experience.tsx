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

export default function Experience() {
  // Cap at 2 but never supersample past the display's real pixel ratio.
  const maxDpr = useMemo(
    () =>
      Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1),
    []
  );
  const [dpr, setDpr] = useState(maxDpr);

  return (
    <Canvas
      shadows={{ type: THREE.PCFShadowMap }}
      dpr={dpr}
      camera={{ fov: 40, near: 0.1, far: 100, position: [5, 2.5, 5] }}
      // antialias is a no-op behind EffectComposer (the final pass is a
      // fullscreen quad) — it only costs an extra multisampled canvas buffer.
      gl={{
        antialias: false,
        alpha: false,
        stencil: false,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = 2; // ACESFilmicToneMapping
        gl.toneMappingExposure = 1.1;
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#0A0A0B",
      }}
    >
      <color attach="background" args={["#0A0A0B"]} />
      <fog attach="fog" args={["#0A0A0B", 18, 35]} />

      {/* Actually wired up: trades a little resolution for framerate when the
          GPU can't keep up, instead of dropping frames. */}
      <PerformanceMonitor
        factor={1}
        onChange={({ factor }) =>
          setDpr(
            Math.round(maxDpr * (0.75 + 0.25 * factor) * 100) / 100
          )
        }
      />

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
      <PostProcessing />
    </Canvas>
  );
}
