"use client";

import { useRef } from "react";
import { ContactShadows } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Circular display podium replacing the old 50×50 ground plane.
 *
 * Hard constraint: every piece here sits *below* y=0. drei's ContactShadows
 * bakes by rendering the scene from a camera at y=0 looking up with far=4, so
 * any geometry above zero would be stamped into the contact shadow as a solid
 * black slab. Keeping the stand under the shadow plane avoids that entirely.
 */

/** Light sweeping around the outer rim — the only animated node in the scene. */
function SweepArc() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z -= delta * 0.35;
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.012, 0]}>
      {/* A short arc rather than a full ring, so the rotation actually reads. */}
      <ringGeometry args={[3.86, 4.02, 72, 1, 0, 1.15]} />
      <meshBasicMaterial
        color="#4FD8E8"
        transparent
        opacity={0.55}
        side={THREE.DoubleSide}
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function Ground() {
  return (
    <>
      {/* Podium body. Slightly tapered so the rim catches the key light. */}
      <mesh position={[0, -0.14, 0]} receiveShadow>
        <cylinderGeometry args={[3.55, 3.35, 0.24, 96, 1]} />
        <meshStandardMaterial color="#12131a" roughness={0.32} metalness={0.9} />
      </mesh>

      {/* Inset top face, a touch lighter, to read as a separate machined plate. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.019, 0]} receiveShadow>
        <circleGeometry args={[3.3, 96]} />
        <meshStandardMaterial color="#191b23" roughness={0.24} metalness={0.95} />
      </mesh>

      {/* Emissive rim seam between plate and body. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]}>
        <ringGeometry args={[3.31, 3.46, 96]} />
        <meshBasicMaterial
          color="#3A6FF5"
          transparent
          opacity={0.75}
          side={THREE.DoubleSide}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Wide, faint halo ring — hints at scale where the old plane used to be. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <ringGeometry args={[4.3, 4.38, 96]} />
        <meshBasicMaterial
          color="#7B3AF5"
          transparent
          opacity={0.28}
          side={THREE.DoubleSide}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      <SweepArc />

      {/* The car and the podium never move, so this only needs to be baked
          once. By default ContactShadows re-renders the whole scene through a
          depth material plus 4 blur passes on *every* frame. `frames` caps that
          at the first few frames — pixel-identical result, no per-frame cost. */}
      <ContactShadows
        frames={3}
        position={[0, 0, 0]}
        opacity={0.5}
        scale={12}
        blur={2.5}
        far={4}
        color="#000000"
      />
    </>
  );
}
