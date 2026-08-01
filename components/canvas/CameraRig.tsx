"use client";

import { useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { buildCameraPath, buildLookAtPath, sampleCameraPose } from "@/lib/camera-keyframes";
import { useScrollStore } from "@/lib/scroll-store";

const positionCurve = buildCameraPath();
const lookAtCurve = buildLookAtPath();

const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();
const _currentLook = new THREE.Vector3();

export default function CameraRig() {
  const camera = useThree((s) => s.camera);
  const exploreMode = useScrollStore((s) => s.exploreMode);

  // Idle auto-rotate angle for hero
  const idleAngle = useRef(0);
  const hasScrolled = useRef(false);

  useFrame((_, delta) => {
    if (exploreMode) return;

    // Read scroll progress transiently. Subscribing to it with a selector made
    // this component (and every child of the Canvas tree below it) re-render on
    // every single scroll tick — dozens of React commits per second for a value
    // only ever consumed inside this loop, which already runs every frame.
    const progress = useScrollStore.getState().progress;
    if (progress > 0.01) hasScrolled.current = true;

    if (!hasScrolled.current) {
      // Slow idle orbit around the hero pose.
      idleAngle.current += delta * 0.15;
      const r = 7;
      _pos.set(
        Math.sin(idleAngle.current) * r,
        2.5,
        Math.cos(idleAngle.current) * r
      );
      _look.set(0, 0.5, 0);
    } else {
      sampleCameraPose(progress, positionCurve, lookAtCurve, _pos, _look);
    }

    // Smooth damp toward target. `delta * 3` is only correct at one framerate:
    // on a 144Hz display it damps ~2.4x slower than on 60Hz, and any frame spike
    // makes the factor jump (a 100ms hitch would give 0.3, a visible snap).
    // The exponential form is the same curve sampled correctly for any delta, so
    // motion looks identical at 60Hz and stays stable when frames vary.
    const k = 1 - Math.exp(-3 * delta);

    _currentLook.set(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);

    camera.position.lerp(_pos, k);
    _currentLook.lerp(_look, k);
    camera.lookAt(_currentLook);
  });

  if (exploreMode) {
    return (
      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={12}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 0.5, 0]}
        enableDamping
        // OrbitControls decays its pending rotation by `1 - dampingFactor` per
        // frame, so this number is a *rate*, not an amount of smoothing: at the
        // old 0.05 the camera needed ~45 frames (0.75s) to settle 90% of a drag,
        // which is what read as "not dragging smoothly" — the model trailed the
        // cursor. 0.12 settles the same drag in ~18 frames (~0.3s): still damped,
        // but it tracks the pointer instead of lagging behind it.
        dampingFactor={0.12}
        // A touch above 1:1 so the car feels directly attached to the pointer.
        rotateSpeed={1.05}
        zoomSpeed={0.9}
      />
    );
  }

  return null;
}
