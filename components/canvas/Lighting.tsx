"use client";

export default function Lighting() {
  return (
    <>
      {/* Key light — warm, slightly off-axis */}
      <directionalLight
        position={[8, 10, 5]}
        intensity={1.8}
        color="#fff5e8"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      {/* Hard rim light — left rear, makes black paint sing */}
      <directionalLight position={[-6, 4, -8]} intensity={2.4} color="#c8d8ff" />
      {/* Soft fill — right, low, warm */}
      <directionalLight position={[5, 1, 6]} intensity={0.6} color="#ffe8d0" />
      {/* Ground bounce */}
      <hemisphereLight args={["#1a1c22", "#0a0a0b", 0.4]} />
    </>
  );
}
