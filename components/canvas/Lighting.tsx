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
        // Frustum bounds stay at the default ±5 so the shadow footprint is
        // unchanged; only the depth range is tightened. The default far plane is
        // 500 units for a light that sits ~14 units from the subject, which
        // wastes almost the entire depth buffer's precision. Fitting it to the
        // scene resolves the same shadow from a much better-conditioned depth
        // range, at no visual cost.
        shadow-camera-near={1}
        shadow-camera-far={30}
      />
      {/* Hard rim light — left rear, makes black paint sing */}
      <directionalLight position={[-4, 2, -4]} intensity={0.1} color="#c8d8ff" />
      {/* Soft fill — right, low, warm */}
      <directionalLight position={[5, 1, 6]} intensity={0.6} color="#ffe8d0" />
      {/* Ground bounce */}
      <hemisphereLight args={["#1a1c22", "#0a0a0b", 0.4]} />
    </>
  );
}
