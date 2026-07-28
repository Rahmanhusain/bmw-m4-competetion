import * as THREE from "three";

/**
 * Camera keyframes for the scroll-driven choreography.
 * scrollProgress: 0 = top of pinned section, 1 = bottom
 * position: camera world position
 * lookAt: point camera aims at
 */
export interface CameraKeyframe {
  scrollProgress: number;
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
}

export const cameraKeyframes: CameraKeyframe[] = [
  // Hero — elevated 3/4 front-right, slightly above
  {
    scrollProgress: 0.0,
    position: new THREE.Vector3(5, 2.5, 5),
    lookAt: new THREE.Vector3(0, 0.5, 0),
  },
  // 01 Exterior — classic 3/4 front-left, lower angle to emphasize hood line
  {
    scrollProgress: 0.2,
    position: new THREE.Vector3(-4.5, 1.6, 4),
    lookAt: new THREE.Vector3(0, 0.3, 0),
  },
  // 02 Performance — low rear 3/4, looking up toward exhaust and diffuser
  {
    scrollProgress: 0.4,
    position: new THREE.Vector3(3.5, 0.8, -4.5),
    lookAt: new THREE.Vector3(0, 0.4, -0.5),
  },
  // 03 Interior — close-in toward driver's side window/cockpit
  {
    scrollProgress: 0.6,
    position: new THREE.Vector3(-2.5, 1.8, 1.5),
    lookAt: new THREE.Vector3(-0.3, 1.0, 0),
  },
  // 04 Details — tight orbit on front wheel/fender area
  {
    scrollProgress: 0.8,
    position: new THREE.Vector3(2.8, 1.0, 2.8),
    lookAt: new THREE.Vector3(0.8, 0.4, 0.5),
  },
  // Explore — settling to a resting 3/4 view
  {
    scrollProgress: 1.0,
    position: new THREE.Vector3(4.5, 2.2, 4.5),
    lookAt: new THREE.Vector3(0, 0.5, 0),
  },
];

/** Build a CatmullRom curve from the keyframe positions */
export function buildCameraPath(): THREE.CatmullRomCurve3 {
  const points = cameraKeyframes.map((kf) => kf.position.clone());
  return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
}

/** Build a CatmullRom curve for lookAt targets */
export function buildLookAtPath(): THREE.CatmullRomCurve3 {
  const points = cameraKeyframes.map((kf) => kf.lookAt.clone());
  return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
}

/**
 * Given a scroll progress 0-1, compute camera position and lookAt
 * by sampling the CatmullRom curves.
 */
export function getCameraPose(
  t: number,
  positionCurve: THREE.CatmullRomCurve3,
  lookAtCurve: THREE.CatmullRomCurve3
): { position: THREE.Vector3; lookAt: THREE.Vector3 } {
  const clamped = THREE.MathUtils.clamp(t, 0, 1);
  return {
    position: positionCurve.getPoint(clamped),
    lookAt: lookAtCurve.getPoint(clamped),
  };
}
