import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import SceneCanvas, { useSceneProgress } from '../core/SceneCanvas';
import {
  palette, range, easeInOut, easeOut, clamp, lerp, makeRandom, quality, damp, fibonacciSphere,
} from './sceneUtils';

/**
 * Foundations — beat one etches a PCB: orthogonal copper traces route out of a
 * central die and signal pulses run along them. Beat two dissolves that rigid
 * grid into word-embedding points, so the discrete electrical signal literally
 * becomes a continuous semantic space.
 */

const GRID = 0.45;
const DIE_HALF = 1.5;
const snap = (v) => Math.round(v / GRID) * GRID;
const PULSE_PERIOD = 1.3; // >1 so each trace goes dark between pulses
const BOARD_WIDTH = 18.5; // world units the layout needs before it starts cropping

/** Manhattan-routed traces leaving the die, plus their pads and vias. */
function useBoard() {
  return useMemo(() => {
    const rand = makeRandom(11);
    const routeCount = quality(28, 16);
    const routes = [];

    for (let i = 0; i < routeCount; i += 1) {
      const side = i % 4;
      const along = snap((rand() - 0.5) * 2 * DIE_HALF * 0.85);
      const out1 = 1.1 + rand() * 2.5;
      const out2 = 1.2 + rand() * 3.2;
      const drift = (rand() - 0.5) * 7.2;
      const z = (i % 3) * -0.3; // two copper layers plus the top layer
      let pts;

      if (side < 2) {
        const dir = side === 0 ? 1 : -1;
        const x0 = DIE_HALF * dir;
        const x1 = snap(x0 + out1 * dir);
        const y1 = clamp(snap(along + drift), -4.7, 4.7);
        const x2 = clamp(snap(x1 + out2 * dir), -9, 9);
        pts = [
          new THREE.Vector3(x0, along, z),
          new THREE.Vector3(x1, along, z),
          new THREE.Vector3(x1, y1, z),
          new THREE.Vector3(x2, y1, z),
        ];
      } else {
        const dir = side === 2 ? 1 : -1;
        const y0 = DIE_HALF * dir;
        const y1 = snap(y0 + out1 * dir);
        const y2 = clamp(snap(y1 + out2 * dir), -5, 5);
        const x1 = clamp(snap(along + drift), -8.6, 8.6);
        pts = [
          new THREE.Vector3(along, y0, z),
          new THREE.Vector3(along, y1, z),
          new THREE.Vector3(x1, y1, z),
          new THREE.Vector3(x1, y2, z),
        ];
      }

      // Normalised arc length per vertex so pulses travel at a uniform speed.
      const acc = [0];
      for (let k = 1; k < pts.length; k += 1) {
        acc.push(acc[k - 1] + pts[k].distanceTo(pts[k - 1]));
      }
      const total = acc[acc.length - 1] || 1;
      routes.push({
        pts,
        s: acc.map((l) => l / total),
        delay: rand(),
        speed: 0.24 + rand() * 0.32,
        offset: rand(),
      });
    }

    const segments = [];
    const nodes = [];
    routes.forEach((route, ri) => {
      for (let k = 0; k < route.pts.length - 1; k += 1) {
        segments.push({
          route: ri,
          a: route.pts[k],
          b: route.pts[k + 1],
          s0: route.s[k],
          s1: route.s[k + 1],
        });
        // Corners become vias, the final vertex becomes a solder pad.
        const last = k === route.pts.length - 2;
        nodes.push({
          route: ri,
          pos: route.pts[k + 1],
          s: route.s[k + 1],
          size: last ? 0.2 : 0.1,
        });
      }
    });

    return { routes, segments, nodes };
  }, []);
}

const pointOnRoute = (route, s) => {
  for (let k = 1; k < route.s.length; k += 1) {
    if (s <= route.s[k]) {
      const t = (s - route.s[k - 1]) / (route.s[k] - route.s[k - 1] || 1);
      return route.pts[k - 1].clone().lerp(route.pts[k], t);
    }
  }
  return route.pts[route.pts.length - 1].clone();
};

function CircuitToSemantics({ progressRef }) {
  const { routes, segments, nodes } = useBoard();

  const rootRef = useRef();
  const traceRef = useRef();
  const padRef = useRef();
  const chipRef = useRef();
  const dieRef = useRef();
  const cageRef = useRef();
  const cloudRef = useRef();
  const shellRef = useRef();
  const amberLightRef = useRef();
  const violetLightRef = useRef();
  const smoothed = useRef(0);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tint = useMemo(() => new THREE.Color(), []);
  const amber = useMemo(() => new THREE.Color(palette.amber), []);

  const traceGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(segments.length * 6);
    segments.forEach((seg, i) => {
      positions.set([seg.a.x, seg.a.y, seg.a.z, seg.b.x, seg.b.y, seg.b.z], i * 6);
    });
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(segments.length * 6), 3));
    return geo;
  }, [segments]);

  // Every embedding point starts life somewhere on the copper and ends up in a
  // semantic cluster, so the morph reads as the same material rearranging.
  const cloud = useMemo(() => {
    const rand = makeRandom(23);
    const count = quality(900, 420);
    const clusterCount = 6;
    const hues = [
      palette.violet, palette.cyan, palette.teal,
      palette.violet, palette.cyan, palette.violet,
    ];
    const centers = fibonacciSphere(clusterCount, 1).map(
      ([x, y, z]) => new THREE.Vector3(x * 5.3, y * 2.9, z * 2.4)
    );

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const items = new Array(count);
    const c = new THREE.Color();

    for (let i = 0; i < count; i += 1) {
      const ci = i % clusterCount;
      const route = routes[Math.floor(rand() * routes.length)];
      const src = pointOnRoute(route, rand());
      const dir = new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).normalize();
      const radius = (0.7 + rand() * 0.9) * Math.pow(rand(), 1.3);
      const tgt = centers[ci].clone().addScaledVector(dir, radius);

      items[i] = {
        src,
        tgt,
        delay: rand(),
        lift: (rand() - 0.5) * 3.4,
        rate: 0.25 + rand() * 0.5,
        phase: rand() * Math.PI * 2,
        amp: 0.06 + rand() * 0.13,
      };
      positions.set([src.x, src.y, src.z], i * 3);
      c.set(hues[ci]);
      colors.set([c.r, c.g, c.b], i * 3);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return { count, items, centers, clusterCount, hues, geometry };
  }, [routes]);

  useFrame((state, delta) => {
    smoothed.current = damp(smoothed.current, progressRef.current, 4, delta);
    const prog = smoothed.current;
    const t = state.clock.elapsedTime;

    // Floored, so the chapter has a board to look at the moment it scrolls in
    // rather than a blank canvas at progress 0.
    const etch = 0.14 + range(prog, 0, 0.34) * 0.86; // traces route outward
    const flow = range(prog, 0.12, 0.5); // signals start running
    const dissolve = easeInOut(range(prog, 0.42, 0.68)); // copper gives way
    const morph = range(prog, 0.44, 0.95); // points settle into clusters
    const shell = easeOut(range(prog, 0.62, 0.98));

    if (rootRef.current) {
      // The board sits at an angle, then flattens out as it becomes a cloud.
      rootRef.current.rotation.x = lerp(-0.3, 0, dissolve) + Math.sin(t * 0.17) * 0.025;
      rootRef.current.rotation.y = Math.sin(t * 0.12) * 0.1 + prog * 0.28;
      // The board is wide, so shrink it to fit narrow viewports.
      rootRef.current.scale.setScalar(clamp(state.viewport.width / BOARD_WIDTH, 0.45, 1));
    }

    // Once the copper has fully dissolved there is nothing left to compute for
    // it, and vice versa for the cloud before the morph starts.
    const boardLive = dissolve < 0.999;
    const cloudLive = morph > 0.001;

    const colors = traceGeometry.attributes.color.array;
    for (let i = 0; boardLive && i < segments.length; i += 1) {
      const seg = segments[i];
      const route = routes[seg.route];
      const grow = easeOut(range(etch, route.delay * 0.5, route.delay * 0.5 + 0.5));
      for (let v = 0; v < 2; v += 1) {
        const s = v === 0 ? seg.s0 : seg.s1;
        const drawn = clamp((grow - s) / 0.12);
        let glow = 0;
        for (let k = 0; k < 2; k += 1) {
          const head = (t * route.speed + route.offset + k * 0.5) % PULSE_PERIOD;
          const d = head - s;
          glow += Math.exp(-(d * d) / 0.0045);
        }
        const heat = clamp(glow) * flow * grow;
        const base = 0.17 + flow * 0.09;
        const o = i * 6 + v * 3;
        colors[o] = (base * amber.r + heat * 1.25) * drawn;
        colors[o + 1] = (base * amber.g + heat * 0.95) * drawn;
        colors[o + 2] = (base * amber.b + heat * 0.55) * drawn;
      }
    }
    if (boardLive) traceGeometry.attributes.color.needsUpdate = true;
    [traceRef, padRef, chipRef].forEach((r) => {
      if (r.current) r.current.visible = boardLive;
    });
    if (traceRef.current) traceRef.current.material.opacity = 1 - dissolve;

    if (padRef.current && boardLive) {
      nodes.forEach((node, i) => {
        const route = routes[node.route];
        const grow = easeOut(range(etch, route.delay * 0.5, route.delay * 0.5 + 0.5));
        const on = clamp((grow - node.s) / 0.1);
        let glow = 0;
        for (let k = 0; k < 2; k += 1) {
          const head = (t * route.speed + route.offset + k * 0.5) % PULSE_PERIOD;
          const d = head - node.s;
          glow += Math.exp(-(d * d) / 0.0035);
        }
        const heat = clamp(glow) * flow;
        dummy.position.copy(node.pos);
        dummy.rotation.set(Math.PI / 2, 0, 0);
        const r = node.size * (0.7 + heat * 0.9) * on;
        dummy.scale.set(r, 0.08, r);
        dummy.updateMatrix();
        padRef.current.setMatrixAt(i, dummy.matrix);
        tint.setRGB(0.4 + heat * 0.85, 0.27 + heat * 0.72, 0.12 + heat * 0.5);
        padRef.current.setColorAt(i, tint);
      });
      padRef.current.instanceMatrix.needsUpdate = true;
      if (padRef.current.instanceColor) padRef.current.instanceColor.needsUpdate = true;
      padRef.current.material.opacity = 1 - dissolve;
    }

    if (chipRef.current && boardLive) {
      const boot = 0.55 + easeOut(range(prog, 0, 0.16)) * 0.45;
      chipRef.current.scale.setScalar(boot * (1 - dissolve));
      chipRef.current.rotation.z = Math.sin(t * 0.2) * 0.05;
    }
    if (dieRef.current) {
      dieRef.current.material.emissiveIntensity = 0.5 + flow * 1.3 + Math.sin(t * 3.1) * 0.25;
      dieRef.current.material.opacity = 1 - dissolve;
    }
    if (cageRef.current) cageRef.current.material.opacity = (0.2 + flow * 0.2) * (1 - dissolve);

    const positions = cloud.geometry.attributes.position.array;
    for (let i = 0; cloudLive && i < cloud.items.length; i += 1) {
      const it = cloud.items[i];
      const q = easeInOut(clamp((morph - it.delay * 0.4) / 0.55));
      const drift = q * it.amp;
      const arc = Math.sin(q * Math.PI); // lifts off the board mid-flight
      positions[i * 3] = lerp(it.src.x, it.tgt.x, q) + Math.sin(t * it.rate + it.phase) * drift;
      positions[i * 3 + 1] =
        lerp(it.src.y, it.tgt.y, q) + Math.cos(t * it.rate * 0.8 + it.phase) * drift;
      positions[i * 3 + 2] =
        lerp(it.src.z, it.tgt.z, q) + arc * it.lift + Math.sin(t * it.rate * 1.2 + it.phase) * drift;
    }
    if (cloudLive) cloud.geometry.attributes.position.needsUpdate = true;

    if (cloudRef.current) {
      const fade = range(prog, 0.36, 0.58) * 0.85;
      cloudRef.current.material.opacity = fade;
      cloudRef.current.material.size = 0.09 + morph * 0.05;
      cloudRef.current.visible = fade > 0.002;
    }

    if (shellRef.current) shellRef.current.visible = shell > 0.002;
    if (shellRef.current && shell > 0.002) {
      cloud.centers.forEach((center, i) => {
        dummy.position.copy(center);
        dummy.rotation.set(t * 0.08 + i, t * 0.05, 0);
        dummy.scale.setScalar(2.05 * shell);
        dummy.updateMatrix();
        shellRef.current.setMatrixAt(i, dummy.matrix);
        tint.set(cloud.hues[i]);
        shellRef.current.setColorAt(i, tint);
      });
      shellRef.current.instanceMatrix.needsUpdate = true;
      if (shellRef.current.instanceColor) shellRef.current.instanceColor.needsUpdate = true;
      shellRef.current.material.opacity = shell * 0.16;
    }

    if (amberLightRef.current) amberLightRef.current.intensity = 34 * (1 - dissolve * 0.85);
    if (violetLightRef.current) violetLightRef.current.intensity = 8 + 26 * morph;
  });

  return (
    <group ref={rootRef}>
      <ambientLight intensity={0.6} />
      <pointLight ref={amberLightRef} position={[0, 0, 5]} intensity={34} color={palette.amber} />
      <pointLight ref={violetLightRef} position={[-5, 4, 7]} intensity={8} color={palette.violet} />

      {/* etched copper */}
      <lineSegments ref={traceRef} geometry={traceGeometry}>
        <lineBasicMaterial vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>

      {/* solder pads and vias */}
      <instancedMesh ref={padRef} args={[null, null, nodes.length]}>
        <cylinderGeometry args={[1, 1, 1, 12]} />
        <meshBasicMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </instancedMesh>

      {/* the microcontroller itself */}
      <group ref={chipRef}>
        <mesh>
          <boxGeometry args={[2.9, 2.9, 0.34]} />
          <meshStandardMaterial color="#1b1a24" roughness={0.45} metalness={0.6} />
        </mesh>
        <mesh ref={dieRef} position={[0, 0, 0.24]}>
          <boxGeometry args={[1.5, 1.5, 0.14]} />
          <meshStandardMaterial
            color={palette.amber}
            emissive={palette.amber}
            emissiveIntensity={0.6}
            roughness={0.3}
            transparent
          />
        </mesh>
        <mesh ref={cageRef}>
          <boxGeometry args={[3.3, 3.3, 0.6]} />
          <meshBasicMaterial color={palette.amber} wireframe transparent opacity={0.2} />
        </mesh>
      </group>

      {/* word embeddings */}
      <points ref={cloudRef} geometry={cloud.geometry}>
        <pointsMaterial
          vertexColors
          size={0.09}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* semantic group boundaries */}
      <instancedMesh ref={shellRef} args={[null, null, cloud.clusterCount]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial
          wireframe
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>
    </group>
  );
}

const FoundationsScene = () => {
  const { progressRef } = useSceneProgress();
  return (
    <SceneCanvas camera={{ position: [0, 0, 14], fov: 46 }}>
      <CircuitToSemantics progressRef={progressRef} />
    </SceneCanvas>
  );
};

export default FoundationsScene;
