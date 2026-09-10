import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import SceneCanvas from '../core/SceneCanvas';
import { palette, makeRandom, quality, damp, fibonacciSphere } from './sceneUtils';

/**
 * Opening scene: a constellation of services that breathes and reacts to the
 * pointer. Deliberately abstract — it sets tone without claiming a subject.
 */

function Constellation() {
  const groupRef = useRef();
  const nodeRef = useRef();
  const linkRef = useRef();
  const haloRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const pointer = useRef({ x: 0, y: 0 });

  const nodeCount = quality(90, 46);

  const { nodes, links, drift } = useMemo(() => {
    const rand = makeRandom(11);
    const shell = fibonacciSphere(nodeCount, 5.6);
    const pts = shell.map(([x, y, z]) => {
      // Push nodes off a perfect sphere so it reads organic, not geometric.
      const jitter = 0.75 + rand() * 0.55;
      return new THREE.Vector3(x * jitter, y * jitter, z * jitter);
    });

    const edges = [];
    pts.forEach((node, i) => {
      const near = pts
        .map((other, j) => ({ j, d: node.distanceTo(other) }))
        .filter((n) => n.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      near.forEach((n) => {
        if (n.j > i) edges.push([i, n.j]);
      });
    });

    const speeds = pts.map(() => ({
      phase: rand() * Math.PI * 2,
      rate: 0.3 + rand() * 0.7,
      amp: 0.1 + rand() * 0.22,
    }));

    return { nodes: pts, links: edges, drift: speeds };
  }, [nodeCount]);

  const linkGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(links.length * 6), 3)
    );
    return geo;
  }, [links.length]);

  const live = useMemo(() => nodes.map((n) => n.clone()), [nodes]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const px = state.pointer.x;
    const py = state.pointer.y;
    pointer.current.x = damp(pointer.current.x, px, 2.5, delta);
    pointer.current.y = damp(pointer.current.y, py, 2.5, delta);

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.05 + pointer.current.x * 0.35;
      groupRef.current.rotation.x = pointer.current.y * -0.25;
    }

    if (nodeRef.current) {
      nodes.forEach((base, i) => {
        const d = drift[i];
        const breathe = 1 + Math.sin(t * d.rate + d.phase) * d.amp * 0.35;
        live[i].copy(base).multiplyScalar(breathe);

        dummy.position.copy(live[i]);
        const pulse = 0.055 + Math.abs(Math.sin(t * d.rate + d.phase)) * 0.05;
        dummy.scale.setScalar(pulse);
        dummy.updateMatrix();
        nodeRef.current.setMatrixAt(i, dummy.matrix);
      });
      nodeRef.current.instanceMatrix.needsUpdate = true;
    }

    if (linkRef.current) {
      const arr = linkGeometry.attributes.position.array;
      links.forEach(([a, b], i) => {
        arr.set(
          [live[a].x, live[a].y, live[a].z, live[b].x, live[b].y, live[b].z],
          i * 6
        );
      });
      linkGeometry.attributes.position.needsUpdate = true;
    }

    if (haloRef.current) {
      haloRef.current.rotation.z = t * 0.08;
      haloRef.current.rotation.x = Math.PI / 2.6 + Math.sin(t * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.8} />
      <pointLight position={[0, 0, 8]} intensity={35} color={palette.violet} />
      <pointLight position={[-7, 5, -4]} intensity={18} color={palette.cyan} />

      <instancedMesh ref={nodeRef} args={[null, null, nodes.length]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={palette.paper}
          emissive={palette.violet}
          emissiveIntensity={0.6}
          roughness={0.35}
          metalness={0.25}
        />
      </instancedMesh>

      <lineSegments ref={linkRef} geometry={linkGeometry}>
        <lineBasicMaterial color={palette.violet} transparent opacity={0.22} />
      </lineSegments>

      <mesh ref={haloRef}>
        <torusGeometry args={[7.4, 0.012, 8, 200]} />
        <meshBasicMaterial color={palette.cyan} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

const HeroScene = () => (
  <SceneCanvas camera={{ position: [0, 0, 15], fov: 45 }}>
    <Constellation />
  </SceneCanvas>
);

export default HeroScene;
