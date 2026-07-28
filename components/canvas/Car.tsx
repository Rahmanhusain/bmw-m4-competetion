"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const GLB_PATH = "/models/2021_bmw_m4_competition.glb";

function RealCar() {
  const { scene } = useGLTF(GLB_PATH);

  useMemo(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [scene]);

  return <primitive object={scene} />;
}

// Kick off the network request as early as possible
useGLTF.preload(GLB_PATH);

export default function Car() {
  return <RealCar />;
}
