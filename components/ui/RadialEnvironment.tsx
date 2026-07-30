"use client";

/**
 * Animated radial-gradient backdrop that sits *behind* the WebGL canvas.
 *
 * Deliberately pure CSS rather than a shader plane in the scene: transform and
 * opacity animations on these layers are handled by the compositor, so they
 * never enter the three.js frame budget or trigger a scene re-render. The
 * canvas is transparent over the top of it.
 */
export default function RadialEnvironment() {
  return (
    <div className="radial-env" aria-hidden>
      <div className="radial-env-glow" />
      <div className="radial-env-grain" />
    </div>
  );
}
