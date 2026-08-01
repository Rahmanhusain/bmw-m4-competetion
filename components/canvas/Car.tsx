"use client";

import { useLayoutEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const GLB_PATH = "/models/bmwm4comp.glb";

function RealCar() {
  const { scene } = useGLTF(GLB_PATH);

  // Side effect, so it belongs in a layout effect rather than useMemo — under
  // StrictMode/concurrent rendering useMemo can run on a render that never
  // commits, and React is free to discard the memo and re-traverse the whole
  // graph. Layout effect keeps it to exactly once per scene, before paint.
  useLayoutEffect(() => {
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      // Bounding volumes are needed for frustum culling; computing them once
      // here means three doesn't lazily build them mid-frame later.
      mesh.geometry?.computeBoundingSphere();
    });
  }, [scene]);

  return <primitive object={scene} />;
}

// Kick off the network request as early as possible
useGLTF.preload(GLB_PATH);

export default function Car() {
  return <RealCar />;
}
