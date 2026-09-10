import React, { createContext, useContext, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';

const SceneProgressContext = createContext(null);

/** Scenes call this to sample chapter scroll progress inside useFrame. */
export function useSceneProgress() {
  const ctx = useContext(SceneProgressContext);
  return ctx ?? { progressRef: { current: 0 }, activeBeat: 0 };
}

export function SceneProgressProvider({ progressRef, activeBeat, children }) {
  const value = useMemo(() => ({ progressRef, activeBeat }), [progressRef, activeBeat]);
  return (
    <SceneProgressContext.Provider value={value}>
      {children}
    </SceneProgressContext.Provider>
  );
}

/**
 * Shared R3F canvas defaults. Kept transparent so chapters can layer it over
 * their own background treatment.
 */
const SceneCanvas = ({ children, camera, className = '', ...rest }) => {
  const isCoarse =
    typeof window !== 'undefined' &&
    window.matchMedia('(pointer: coarse)').matches;

  return (
    <Canvas
      className={className}
      dpr={[1, isCoarse ? 1.6 : 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 12], fov: 45, ...camera }}
      {...rest}
    >
      {children}
    </Canvas>
  );
};

export default SceneCanvas;
