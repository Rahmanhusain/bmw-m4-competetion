"use client";

import { ContactShadows } from "@react-three/drei";

export default function Ground() {
  return (
    <>
      {/* Reflective ground plane — subtle, not a mirror */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#0a0a0b" roughness={0.85} metalness={0.1} />
      </mesh>
      {/* The car and the ground never move, so this only needs to be baked
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
