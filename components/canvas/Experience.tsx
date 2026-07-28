"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import Car from "./Car";
import CameraRig from "./CameraRig";
import Lighting from "./Lighting";
import Ground from "./Ground";
import { useScrollStore } from "@/lib/scroll-store";

// Suppress THREE.Clock deprecation — it's fired by @react-three/fiber internals
// and cannot be fixed without an R3F upgrade.
const _origWarn = console.warn;
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === "string" && args[0].includes("THREE.Clock")) return;
  _origWarn.apply(console, args);
};

function PostProcessing() {
  return (
    <EffectComposer>
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

export default function Experience() {
  const setLoading = useScrollStore((s) => s.setLoading);

  return (
    <Canvas
      shadows={{ type: THREE.PCFShadowMap }}
      dpr={[1, 2]}
      camera={{ fov: 40, near: 0.1, far: 100, position: [5, 2.5, 5] }}
      gl={{ antialias: true, alpha: false }}
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

      <AdaptiveDpr pixelated />
      <PerformanceMonitor />

      <Suspense
        fallback={null}
      >
        <Environment preset="city" background={false} />
        <Lighting />
        <Ground />
        <Car />
      </Suspense>

      <CameraRig />
      <PostProcessing />
    </Canvas>
  );
}
