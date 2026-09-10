/**
 * Shared helpers for the chapter scenes.
 *
 * IMPORTANT PATTERN
 * -----------------
 * React context does not cross the react-three-fiber <Canvas> boundary, because
 * the canvas mounts its own reconciler root. So every scene reads progress with
 * `useSceneProgress()` OUTSIDE the canvas and passes `progressRef` down as a
 * prop. The ref identity is stable, so the inner component can sample
 * `progressRef.current` inside useFrame without re-rendering.
 *
 *   const MyScene = () => {
 *     const { progressRef, activeBeat } = useSceneProgress();
 *     return (
 *       <SceneCanvas>
 *         <MyGeometry progressRef={progressRef} activeBeat={activeBeat} />
 *       </SceneCanvas>
 *     );
 *   };
 */

export const palette = {
  ink: '#0b0b0f',
  violet: '#6c63ff',
  cyan: '#38d6ff',
  teal: '#2ee6c5',
  amber: '#ffb057',
  coral: '#ff6b6b',
  rose: '#ff5d9e',
  lime: '#a8e05f',
  slate: '#8b8a99',
  paper: '#f0eff6',
};

export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export const lerp = (a, b, t) => a + (b - a) * t;

/** Frame-rate independent easing toward a target. */
export const damp = (current, target, lambda, delta) =>
  lerp(current, target, 1 - Math.exp(-lambda * delta));

/** Remap `value` from [inMin,inMax] to [0,1], clamped. */
export const range = (value, inMin, inMax) =>
  clamp((value - inMin) / (inMax - inMin || 1));

export const easeInOut = (t) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export const easeOut = (t) => 1 - Math.pow(1 - t, 3);

/** Deterministic pseudo-random so scenes look identical on every reload. */
export function makeRandom(seed = 1) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Evenly distributed points on a sphere. */
export function fibonacciSphere(count, radius = 1) {
  const points = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1 || 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    points.push([
      Math.cos(theta) * r * radius,
      y * radius,
      Math.sin(theta) * r * radius,
    ]);
  }
  return points;
}

export const isCoarsePointer = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: coarse)').matches;

/** Scale down particle counts on phones so the scenes stay smooth. */
export const quality = (desktop, mobile) => (isCoarsePointer() ? mobile : desktop);
