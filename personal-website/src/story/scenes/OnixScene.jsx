import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import SceneCanvas, { useSceneProgress } from '../core/SceneCanvas';
import { palette, range, easeInOut, makeRandom, quality, damp } from './sceneUtils';

/**
 * Onix / Datametica — legacy warehouses on the left migrate through a
 * transformation core into a consolidated graph on the right. Edges light up
 * as the migration framework comes online, then data streams across.
 */

const LEGACY = ['DataStage', 'Informatica', 'Alteryx', 'Teradata', 'Oracle'];

function useGraph() {
  return useMemo(() => {
    const rand = makeRandom(7);

    // Source cluster: legacy platforms, stacked on the left.
    const sources = LEGACY.map((_, i) => {
      const t = i / (LEGACY.length - 1);
      return new THREE.Vector3(-7.2, (t - 0.5) * 6.4, (rand() - 0.5) * 1.6);
    });

    // Target cluster: a consolidated graph on the right.
    const targetCount = quality(26, 16);
    const targets = Array.from({ length: targetCount }, (_, i) => {
      const golden = Math.PI * (3 - Math.sqrt(5));
      const y = 1 - (i / (targetCount - 1 || 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      return new THREE.Vector3(
        6.6 + Math.cos(theta) * r * 2.5,
        y * 3.1,
        Math.sin(theta) * r * 2.5
      );
    });

    // Edges inside the destination graph.
    const graphEdges = [];
    targets.forEach((node, i) => {
      const neighbours = targets
        .map((other, j) => ({ j, d: node.distanceTo(other) }))
        .filter((n) => n.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      neighbours.forEach((n) => {
        if (n.j > i) graphEdges.push([node, targets[n.j]]);
      });
    });

    return { sources, targets, graphEdges };
  }, []);
}

function MigrationGraph({ progressRef }) {
  const { sources, targets, graphEdges } = useGraph();

  const sourceRef = useRef();
  const targetRef = useRef();
  const coreRef = useRef();
  const streamRef = useRef();
  const groupRef = useRef();
  const edgeRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particleCount = quality(420, 200);

  // Each streaming particle picks a source and a destination once.
  const routes = useMemo(() => {
    const rand = makeRandom(31);
    return Array.from({ length: particleCount }, () => ({
      from: Math.floor(rand() * sources.length),
      to: Math.floor(rand() * targets.length),
      offset: rand(),
      speed: 0.35 + rand() * 0.5,
      wobble: (rand() - 0.5) * 2.4,
    }));
  }, [particleCount, sources.length, targets.length]);

  const streamGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(particleCount * 3), 3)
    );
    return geo;
  }, [particleCount]);

  const edgeGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(graphEdges.length * 6);
    graphEdges.forEach(([a, b], i) => {
      positions.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6);
    });
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [graphEdges]);

  const smoothed = useRef(0);

  useFrame((state, delta) => {
    const p = progressRef.current;
    smoothed.current = damp(smoothed.current, p, 4, delta);
    const t = state.clock.elapsedTime;

    // Phases: 0-.3 sources appear, .25-.6 core spins up, .45-1 data streams.
    const sourcePhase = range(smoothed.current, 0, 0.3);
    const corePhase = range(smoothed.current, 0.25, 0.6);
    const streamPhase = range(smoothed.current, 0.45, 1);

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.15) * 0.22 + smoothed.current * 0.5;
    }

    if (sourceRef.current) {
      sources.forEach((pos, i) => {
        const appear = easeInOut(range(sourcePhase, i * 0.12, i * 0.12 + 0.5));
        dummy.position.copy(pos);
        dummy.position.x += Math.sin(t * 0.6 + i) * 0.08;
        const s = 0.42 * appear;
        dummy.scale.setScalar(s);
        dummy.rotation.set(t * 0.2 + i, t * 0.15, 0);
        dummy.updateMatrix();
        sourceRef.current.setMatrixAt(i, dummy.matrix);
      });
      sourceRef.current.instanceMatrix.needsUpdate = true;
    }

    if (coreRef.current) {
      const s = 0.2 + easeInOut(corePhase) * 1.15;
      coreRef.current.scale.setScalar(s);
      coreRef.current.rotation.y = t * 0.7;
      coreRef.current.rotation.x = t * 0.35;
      coreRef.current.material.opacity = 0.15 + corePhase * 0.5;
    }

    if (targetRef.current) {
      targets.forEach((pos, i) => {
        const appear = easeInOut(
          range(streamPhase, (i / targets.length) * 0.5, (i / targets.length) * 0.5 + 0.45)
        );
        dummy.position.copy(pos);
        dummy.position.y += Math.sin(t * 0.8 + i * 0.5) * 0.06;
        dummy.scale.setScalar(0.3 * appear);
        dummy.rotation.set(0, t * 0.3 + i, 0);
        dummy.updateMatrix();
        targetRef.current.setMatrixAt(i, dummy.matrix);
      });
      targetRef.current.instanceMatrix.needsUpdate = true;
    }

    if (edgeRef.current) {
      edgeRef.current.material.opacity = streamPhase * 0.35;
    }

    if (streamRef.current) {
      const arr = streamGeometry.attributes.position.array;
      const core = new THREE.Vector3(0, 0, 0);
      for (let i = 0; i < routes.length; i += 1) {
        const route = routes[i];
        const active = range(streamPhase, route.offset * 0.35, 1);
        // Loop each particle along source -> core -> destination.
        const travel = (t * route.speed + route.offset) % 1;
        const from = sources[route.from];
        const to = targets[route.to];

        let x;
        let y;
        let z;
        if (travel < 0.5) {
          const k = travel / 0.5;
          x = THREE.MathUtils.lerp(from.x, core.x, k);
          y = THREE.MathUtils.lerp(from.y, core.y, k) + Math.sin(k * Math.PI) * route.wobble;
          z = THREE.MathUtils.lerp(from.z, core.z, k);
        } else {
          const k = (travel - 0.5) / 0.5;
          x = THREE.MathUtils.lerp(core.x, to.x, k);
          y = THREE.MathUtils.lerp(core.y, to.y, k) + Math.sin(k * Math.PI) * route.wobble * 0.6;
          z = THREE.MathUtils.lerp(core.z, to.z, k);
        }

        // Park inactive particles inside the core so they stay invisible.
        arr[i * 3] = THREE.MathUtils.lerp(0, x, active);
        arr[i * 3 + 1] = THREE.MathUtils.lerp(0, y, active);
        arr[i * 3 + 2] = THREE.MathUtils.lerp(0, z, active);
      }
      streamGeometry.attributes.position.needsUpdate = true;
      streamRef.current.material.opacity = 0.15 + streamPhase * 0.75;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 0, 6]} intensity={45} color={palette.cyan} />
      <pointLight position={[-8, 3, 4]} intensity={20} color={palette.amber} />

      {/* legacy sources */}
      <instancedMesh ref={sourceRef} args={[null, null, sources.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={palette.amber}
          emissive={palette.amber}
          emissiveIntensity={0.5}
          roughness={0.35}
          metalness={0.3}
        />
      </instancedMesh>

      {/* transformation core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.7, 1]} />
        <meshBasicMaterial
          color={palette.violet}
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* destination graph */}
      <instancedMesh ref={targetRef} args={[null, null, targets.length]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={palette.teal}
          emissive={palette.teal}
          emissiveIntensity={0.7}
          roughness={0.3}
        />
      </instancedMesh>

      <lineSegments ref={edgeRef} geometry={edgeGeometry}>
        <lineBasicMaterial color={palette.teal} transparent opacity={0} />
      </lineSegments>

      {/* migrating records */}
      <points ref={streamRef} geometry={streamGeometry}>
        <pointsMaterial
          color={palette.cyan}
          size={0.14}
          sizeAttenuation
          transparent
          opacity={0.6}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

const OnixScene = () => {
  const { progressRef } = useSceneProgress();
  return (
    <SceneCanvas camera={{ position: [0, 0.5, 15], fov: 46 }}>
      <MigrationGraph progressRef={progressRef} />
    </SceneCanvas>
  );
};

export default OnixScene;
