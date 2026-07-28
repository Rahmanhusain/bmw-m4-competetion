"use client";

import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { buildCameraPath, buildLookAtPath, getCameraPose } from "@/lib/camera-keyframes";
import { useScrollStore } from "@/lib/scroll-store";

const positionCurve = buildCameraPath();
const lookAtCurve = buildLookAtPath();

const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();
const _currentPos = new THREE.Vector3();
const _currentLook = new THREE.Vector3();

export default function CameraRig() {
  const { camera } = useThree();
  const exploreMode = useScrollStore((s) => s.exploreMode);
  const progress = useScrollStore((s) => s.progress);
  const orbitRef = useRef<any>(null);

  // Idle auto-rotate angle for hero
  const idleAngle = useRef(0);
  const hasScrolled = useRef(false);

  useEffect(() => {
    if (progress > 0.01) hasScrolled.current = true;
  }, [progress]);

  useFrame((_, delta) => {
    if (exploreMode) return;

    if (!hasScrolled.current) {
      // Slow idle orbit around hero position
      idleAngle.current += delta * 0.15;
      const r = 7;
      _pos.set(
        Math.sin(idleAngle.current) * r,
        2.5,
        Math.cos(idleAngle.current) * r
      );
      _look.set(0, 0.5, 0);
    } else {
      const pose = getCameraPose(progress, positionCurve, lookAtCurve);
      _pos.copy(pose.position);
      _look.copy(pose.lookAt);
    }

    // Smooth damp toward target
    _currentPos.copy(camera.position);
    _currentLook.set(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);

    camera.position.lerp(_pos, delta * 3);
    _currentLook.lerp(_look, delta * 3);
    camera.lookAt(_currentLook);
  });

  if (exploreMode) {
    return (
      <OrbitControls
        ref={orbitRef}
        enablePan={false}
        minDistance={3}
        maxDistance={12}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 0.5, 0]}
        enableDamping
        dampingFactor={0.05}
      />
    );
  }

  return null;
}
