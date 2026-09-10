import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import SceneCanvas, { useSceneProgress } from '../core/SceneCanvas';
import { palette, range, easeOut, makeRandom, quality, damp, clamp } from './sceneUtils';

/**
 * SAP UCC — a hub broadcasting to 30+ institutional partners. The story beat is
 * latency collapsing from hours to milliseconds, so the pulse rings start slow
 * and wide and tighten into a fast, continuous ripple as the reader scrolls.
 */

const RING_COUNT = 3;

function useInstitutions() {
  return useMemo(() => {
    const count = quality(34, 22);
    const rand = makeRandom(19);
    return Array.from({ length: count }, (_, i) => {
      // Three concentric rings so the mesh reads as depth, not a flat circle.
      const ring = i % RING_COUNT;
      const radius = 4.4 + ring * 1.9;
      const angle = (i / count) * Math.PI * 2 * 1.6 + ring * 0.6;
      const tilt = (rand() - 0.5) * 1.5;
      return {
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          tilt + Math.sin(angle * 2) * 0.5,
          Math.sin(angle) * radius
        ),
        delay: rand(),
        ring,
      };
    });
  }, []);
}

function NotificationMesh({ progressRef }) {
  const institutions = useInstitutions();

  const groupRef = useRef();
  const nodeRef = useRef();
  const hubRef = useRef();
  const spokeRef = useRef();
  const pulseRefs = useRef([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const smoothed = useRef(0);

  const spokeGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(institutions.length * 6);
    institutions.forEach(({ position }, i) => {
      positions.set([0, 0, 0, position.x, position.y, position.z], i * 6);
    });
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [institutions]);

  useFrame((state, delta) => {
    const p = progressRef.current;
    smoothed.current = damp(smoothed.current, p, 4, delta);
    const t = state.clock.elapsedTime;
    const prog = smoothed.current;

    const buildPhase = range(prog, 0, 0.35);
    const linkPhase = range(prog, 0.2, 0.6);
    // Broadcast speed ramps up: the "2 hours -> 500ms" beat.
    const speed = 0.22 + range(prog, 0.4, 1) * 1.5;

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.06 + prog * 0.8;
      groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.08 + 0.18;
    }

    if (hubRef.current) {
      const beat = 1 + Math.sin(t * speed * 3) * 0.08;
      hubRef.current.scale.setScalar((0.5 + easeOut(buildPhase) * 0.8) * beat);
      hubRef.current.rotation.y = t * 0.5;
    }

    if (nodeRef.current) {
      institutions.forEach(({ position, delay }, i) => {
        const appear = easeOut(range(buildPhase, delay * 0.5, delay * 0.5 + 0.5));

        // Distance-based wave: nodes flash as the broadcast front reaches them.
        const dist = position.length();
        const wave = (t * speed - dist * 0.12) % 1.6;
        const flash = wave > 0 && wave < 0.35 ? 1 - wave / 0.35 : 0;

        dummy.position.copy(position);
        dummy.scale.setScalar((0.2 + flash * 0.22) * appear);
        dummy.rotation.set(0, t * 0.4 + i, 0);
        dummy.updateMatrix();
        nodeRef.current.setMatrixAt(i, dummy.matrix);

        color.set(palette.slate).lerp(new THREE.Color(palette.cyan), flash * 0.9 + linkPhase * 0.1);
        nodeRef.current.setColorAt(i, color);
      });
      nodeRef.current.instanceMatrix.needsUpdate = true;
      if (nodeRef.current.instanceColor) nodeRef.current.instanceColor.needsUpdate = true;
    }

    if (spokeRef.current) {
      spokeRef.current.material.opacity = linkPhase * 0.16;
    }

    // Expanding rings = broadcast fronts leaving the hub.
    pulseRefs.current.forEach((ring, i) => {
      if (!ring) return;
      const phase = ((t * speed * 0.55 + i / RING_COUNT) % 1);
      const scale = 0.6 + phase * 9.5;
      ring.scale.setScalar(scale);
      ring.material.opacity = clamp((1 - phase) * 0.5 * range(prog, 0.15, 0.5)) ;
    });
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.7} />
      <pointLight position={[0, 0, 0]} intensity={40} color={palette.cyan} />
      <pointLight position={[6, 6, 8]} intensity={18} color={palette.violet} />

      {/* the hub */}
      <mesh ref={hubRef}>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshStandardMaterial
          color={palette.cyan}
          emissive={palette.cyan}
          emissiveIntensity={1.1}
          roughness={0.25}
          metalness={0.4}
        />
      </mesh>

      {/* broadcast fronts */}
      {Array.from({ length: RING_COUNT }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            pulseRefs.current[i] = el;
          }}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.92, 1, 64]} />
          <meshBasicMaterial
            color={palette.cyan}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      <lineSegments ref={spokeRef} geometry={spokeGeometry}>
        <lineBasicMaterial color={palette.violet} transparent opacity={0} />
      </lineSegments>

      {/* partner institutions */}
      <instancedMesh ref={nodeRef} args={[null, null, institutions.length]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial roughness={0.4} metalness={0.2} />
      </instancedMesh>
    </group>
  );
}

const SapUccScene = () => {
  const { progressRef } = useSceneProgress();
  return (
    <SceneCanvas camera={{ position: [0, 2.5, 16], fov: 48 }}>
      <NotificationMesh progressRef={progressRef} />
    </SceneCanvas>
  );
};

export default SapUccScene;
