import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import SceneCanvas, { useSceneProgress } from '../core/SceneCanvas';
import {
  palette,
  range,
  easeInOut,
  easeOut,
  damp,
  makeRandom,
  quality,
  fibonacciSphere,
} from './sceneUtils';

/**
 * Research — grounding conversational AI. A diffuse cloud of candidate claims
 * churns around a central answer node until retrieval beams reach a ring of
 * source documents. Supported claims snap onto their tether and light up;
 * the unsupported 40% desaturate and fall away. What survives then resolves
 * into four crystalline publications wired back to the evidence.
 */

const PUB_COUNT = 4;

const makeSegments = (segments) => {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(segments * 6), 3));
  return geo;
};

function useResearchGraph() {
  return useMemo(() => {
    const rand = makeRandom(41);

    // Ring of grounding sources the retriever can reach for.
    const sourceCount = quality(10, 7);
    const sources = Array.from({ length: sourceCount }, (_, i) => {
      const a = (i / sourceCount) * Math.PI * 2;
      return new THREE.Vector3(
        Math.cos(a) * 6.5,
        Math.sin(a * 2) * 0.85 + (rand() - 0.5) * 0.4,
        Math.sin(a) * 6.5
      );
    });

    // Publications settle into a shallow arc facing the reader.
    const publications = Array.from({ length: PUB_COUNT }, (_, i) => {
      const k = i - (PUB_COUNT - 1) / 2;
      return new THREE.Vector3(k * 3.05, Math.sin(i * 1.35) * 0.75, 2.1 - Math.abs(k) * 0.95);
    });

    const claimCount = quality(170, 90);
    const claims = Array.from({ length: claimCount }, (_, i) => {
      // Exactly two in five are unsupported: the 40% the pipeline prunes.
      const grounded = i % 5 >= 2;
      const sourceIndex = Math.floor(rand() * sourceCount);
      const source = sources[sourceIndex];
      const along = 0.3 + rand() * 0.55;

      return {
        grounded,
        sourceIndex,
        chaos: new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1)
          .normalize()
          .multiplyScalar(2.8 + rand() * 5.4),
        // Where a supported claim locks in: on the beam between answer and source.
        anchor: source
          .clone()
          .multiplyScalar(along)
          .add(new THREE.Vector3((rand() - 0.5) * 0.8, (rand() - 0.5) * 0.8, (rand() - 0.5) * 0.8)),
        fall: new THREE.Vector3((rand() - 0.5) * 2.4, -3 - rand() * 3.5, (rand() - 0.5) * 2.4),
        pub: i % PUB_COUNT,
        orbitAngle: rand() * Math.PI * 2,
        orbitRadius: 0.95 + rand() * 0.85,
        orbitY: (rand() - 0.5) * 1.5,
        delay: rand(),
        cyan: rand() > 0.62,
      };
    });

    const groundedCount = claims.filter((c) => c.grounded).length;
    return { sources, publications, claims, groundedCount };
  }, []);
}

function GroundingField({ progressRef }) {
  const { sources, publications, claims, groundedCount } = useResearchGraph();

  const groupRef = useRef();
  const answerRef = useRef();
  const claimRef = useRef();
  const docRef = useRef();
  const beamRef = useRef();
  const tetherRef = useRef();
  const citationRef = useRef();
  const dustRef = useRef();
  const pubRefs = useRef([]);
  const smoothed = useRef(0);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const vec = useMemo(() => new THREE.Vector3(), []);
  const orbit = useMemo(() => new THREE.Vector3(), []);
  const tint = useMemo(() => new THREE.Color(), []);
  const colors = useMemo(
    () => ({
      slate: new THREE.Color(palette.slate),
      violet: new THREE.Color(palette.violet),
      cyan: new THREE.Color(palette.cyan),
      ink: new THREE.Color(palette.ink),
    }),
    []
  );

  // Live publication positions, shared by claim orbits and citation lines.
  const livePubs = useMemo(
    () => publications.map(() => new THREE.Vector3()),
    [publications]
  );

  const beamGeometry = useMemo(() => makeSegments(sources.length), [sources.length]);
  const tetherGeometry = useMemo(() => makeSegments(groundedCount), [groundedCount]);
  const citationGeometry = useMemo(() => makeSegments(PUB_COUNT * 2), []);

  const dustGeometry = useMemo(() => {
    const count = quality(340, 160);
    const rand = makeRandom(97);
    const positions = new Float32Array(count * 3);
    fibonacciSphere(count, 1).forEach(([x, y, z], i) => {
      const r = 3.4 + rand() * 6.2;
      positions.set([x * r, y * r * 0.8, z * r], i * 3);
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((state, delta) => {
    smoothed.current = damp(smoothed.current, progressRef.current, 4, delta);
    const prog = smoothed.current;
    const t = state.clock.elapsedTime;

    const wake = range(prog, 0, 0.12);
    const retrieve = range(prog, 0.12, 0.44);
    const ground = range(prog, 0.16, 0.55);
    const resolve = range(prog, 0.55, 0.9);
    const compose = range(prog, 0.72, 1);

    if (groupRef.current) {
      // Rotation slows as the story moves from churn to composure.
      groupRef.current.rotation.y = t * (0.13 - compose * 0.1) + prog * 0.55;
      groupRef.current.rotation.x = 0.14 + Math.sin(t * 0.2) * 0.06 * (1 - compose * 0.8);
    }

    if (answerRef.current) {
      const jitter = 1 - ground * 0.8;
      answerRef.current.scale.setScalar(
        (0.55 + easeOut(wake) * 0.75) * (1 + Math.sin(t * 2.4) * 0.05 * jitter)
      );
      answerRef.current.rotation.y = t * (0.9 - ground * 0.6);
      answerRef.current.rotation.x = t * 0.35 * jitter;
      answerRef.current.material.emissiveIntensity = 0.5 + ground * 1.1;
    }

    if (dustRef.current) {
      // The noisy real-world input dissipates once grounding kicks in.
      dustRef.current.rotation.y = -t * 0.05;
      dustRef.current.scale.setScalar(1 + ground * 0.35);
      dustRef.current.material.opacity = 0.42 * (1 - range(prog, 0.1, 0.52));
    }

    if (docRef.current) {
      sources.forEach((pos, i) => {
        const appear = easeOut(range(retrieve, (i / sources.length) * 0.45, (i / sources.length) * 0.45 + 0.5));
        dummy.position.copy(pos);
        dummy.position.y += Math.sin(t * 0.6 + i * 1.3) * 0.12;
        dummy.lookAt(0, dummy.position.y, 0);
        dummy.scale.set(appear, appear, appear);
        dummy.updateMatrix();
        docRef.current.setMatrixAt(i, dummy.matrix);
      });
      docRef.current.instanceMatrix.needsUpdate = true;
      docRef.current.material.opacity = 0.25 + retrieve * 0.6;
    }

    if (beamRef.current) {
      // Beams grow out of the answer node toward each source.
      const arr = beamGeometry.attributes.position.array;
      sources.forEach((pos, i) => {
        const reach = easeInOut(range(retrieve, (i / sources.length) * 0.4, (i / sources.length) * 0.4 + 0.55));
        arr.set([0, 0, 0, pos.x * reach, pos.y * reach, pos.z * reach], i * 6);
      });
      beamGeometry.attributes.position.needsUpdate = true;
      beamRef.current.material.opacity = retrieve * 0.4;
    }

    // Publications resolve first so claim orbits can track their live positions.
    publications.forEach((base, i) => {
      const g = pubRefs.current[i];
      const appear = easeOut(range(resolve, i * 0.13, i * 0.13 + 0.62));
      const float = Math.sin(t * 0.45 + i * 1.7) * 0.18 * (1 - compose * 0.55);
      livePubs[i].set(base.x * appear, (base.y + float) * appear, base.z * appear);
      if (!g) return;
      g.position.copy(livePubs[i]);
      g.scale.setScalar(0.0001 + appear * 0.92);
      g.rotation.y = t * (0.55 - compose * 0.42) + i * 1.1;
      g.rotation.x = Math.sin(t * 0.3 + i) * 0.3 * (1 - compose * 0.75);
    });

    if (claimRef.current) {
      const tethers = tetherGeometry.attributes.position.array;
      let ti = 0;

      claims.forEach((c, i) => {
        const snap = easeInOut(range(ground, c.delay * 0.42, c.delay * 0.42 + 0.55));
        const churn = 1 - snap * 0.9;

        vec.copy(c.chaos);
        vec.x += Math.sin(t * 0.55 + i * 0.7) * 0.85 * churn;
        vec.y += Math.cos(t * 0.47 + i * 1.1) * 0.85 * churn;
        vec.z += Math.sin(t * 0.61 + i * 0.4) * 0.85 * churn;

        let scale;
        if (c.grounded) {
          vec.lerp(c.anchor, snap);

          const pub = livePubs[c.pub];
          const spin = c.orbitAngle + t * 0.22;
          orbit.set(
            pub.x + Math.cos(spin) * c.orbitRadius,
            pub.y + c.orbitY * 0.7,
            pub.z + Math.sin(spin) * c.orbitRadius
          );
          const pull = easeInOut(range(resolve, c.pub * 0.09 + c.delay * 0.2, c.pub * 0.09 + c.delay * 0.2 + 0.6));
          vec.lerp(orbit, pull * 0.86);

          scale = 0.1 + snap * 0.075;
          tint.copy(colors.slate).lerp(c.cyan ? colors.cyan : colors.violet, snap);

          const src = sources[c.sourceIndex];
          tethers.set([vec.x, vec.y, vec.z, src.x, src.y, src.z], ti * 6);
          ti += 1;
        } else {
          const prune = easeInOut(range(ground, 0.18 + c.delay * 0.4, 0.8 + c.delay * 0.2));
          vec.addScaledVector(c.fall, prune);
          scale = 0.095 * (1 - prune);
          tint.copy(colors.slate).lerp(colors.ink, prune);
        }

        dummy.position.copy(vec);
        dummy.scale.setScalar(scale);
        dummy.rotation.set(t * 0.5 + i, t * 0.4 + i * 0.6, 0);
        dummy.updateMatrix();
        claimRef.current.setMatrixAt(i, dummy.matrix);
        claimRef.current.setColorAt(i, tint);
      });

      claimRef.current.instanceMatrix.needsUpdate = true;
      if (claimRef.current.instanceColor) claimRef.current.instanceColor.needsUpdate = true;
      tetherGeometry.attributes.position.needsUpdate = true;
    }

    if (tetherRef.current) {
      tetherRef.current.material.opacity = ground * 0.26;
    }

    if (citationRef.current) {
      // Each publication cites the answer core and the source ring behind it.
      const arr = citationGeometry.attributes.position.array;
      livePubs.forEach((pos, i) => {
        const src = sources[(i * 3) % sources.length];
        arr.set([pos.x, pos.y, pos.z, 0, 0, 0], i * 12);
        arr.set([pos.x, pos.y, pos.z, src.x, src.y, src.z], i * 12 + 6);
      });
      citationGeometry.attributes.position.needsUpdate = true;
      citationRef.current.material.opacity = resolve * 0.34;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.55} />
      <pointLight position={[0, 0, 0]} intensity={34} color={palette.violet} />
      <pointLight position={[6, 5, 8]} intensity={22} color={palette.cyan} />
      <pointLight position={[-7, -3, 4]} intensity={12} color={palette.rose} />

      {/* unfiltered noise around the question */}
      <points ref={dustRef} geometry={dustGeometry}>
        <pointsMaterial
          color={palette.slate}
          size={0.07}
          sizeAttenuation
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </points>

      {/* the answer being grounded */}
      <mesh ref={answerRef}>
        <icosahedronGeometry args={[1.05, 1]} />
        <meshStandardMaterial
          color={palette.violet}
          emissive={palette.violet}
          emissiveIntensity={0.5}
          roughness={0.22}
          metalness={0.45}
          flatShading
        />
      </mesh>

      <lineSegments ref={beamRef} geometry={beamGeometry} frustumCulled={false}>
        <lineBasicMaterial color={palette.cyan} transparent opacity={0} depthWrite={false} />
      </lineSegments>

      {/* retrieved source documents */}
      <instancedMesh ref={docRef} args={[null, null, sources.length]}>
        <boxGeometry args={[1.05, 1.35, 0.07]} />
        <meshStandardMaterial
          color={palette.paper}
          emissive={palette.cyan}
          emissiveIntensity={0.35}
          roughness={0.5}
          metalness={0.1}
          transparent
          opacity={0.25}
        />
      </instancedMesh>

      <lineSegments ref={tetherRef} geometry={tetherGeometry} frustumCulled={false}>
        <lineBasicMaterial color={palette.violet} transparent opacity={0} depthWrite={false} />
      </lineSegments>

      {/* candidate claims */}
      <instancedMesh ref={claimRef} args={[null, null, claims.length]} frustumCulled={false}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          roughness={0.26}
          metalness={0.4}
          emissive={palette.violet}
          emissiveIntensity={0.22}
          flatShading
        />
      </instancedMesh>

      <lineSegments ref={citationRef} geometry={citationGeometry} frustumCulled={false}>
        <lineBasicMaterial color={palette.teal} transparent opacity={0} depthWrite={false} />
      </lineSegments>

      {/* four peer-reviewed publications */}
      {publications.map((_, i) => (
        <group
          key={i}
          ref={(el) => {
            pubRefs.current[i] = el;
          }}
          scale={0.0001}
        >
          <mesh>
            <octahedronGeometry args={[0.72, 0]} />
            <meshStandardMaterial
              color={palette.paper}
              emissive={palette.violet}
              emissiveIntensity={0.85}
              roughness={0.15}
              metalness={0.6}
              flatShading
            />
          </mesh>
          <mesh>
            <icosahedronGeometry args={[1.12, 0]} />
            <meshBasicMaterial
              color={palette.cyan}
              wireframe
              transparent
              opacity={0.35}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const ResearchScene = () => {
  const { progressRef } = useSceneProgress();
  return (
    <SceneCanvas camera={{ position: [0, 1.4, 15], fov: 46 }}>
      <GroundingField progressRef={progressRef} />
    </SceneCanvas>
  );
};

export default ResearchScene;
