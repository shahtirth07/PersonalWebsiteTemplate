import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import SceneCanvas, { useSceneProgress } from '../core/SceneCanvas';
import {
  palette,
  range,
  easeInOut,
  easeOut,
  clamp,
  lerp,
  damp,
  makeRandom,
  quality,
  fibonacciSphere,
} from './sceneUtils';

/**
 * Applied — four projects, four sub-scenes, one canvas.
 *
 * `progressRef.current` is progress across the whole chapter, so beat N owns
 * roughly [N/4, (N+1)/4]. Each sub-scene remaps that window to its own 0..1 and
 * damps its own 0..1 "am I on screen" weight from `activeBeat`, which is what
 * drives the cross-fade. Lighting lives on the stage rather than inside the
 * beat groups so the light count never changes and shaders never recompile.
 */

const BEAT_COUNT = 4;
const CROSSFADE = 3.6;

const C = {
  lime: new THREE.Color(palette.lime),
  amber: new THREE.Color(palette.amber),
  cyan: new THREE.Color(palette.cyan),
  teal: new THREE.Color(palette.teal),
  violet: new THREE.Color(palette.violet),
  coral: new THREE.Color(palette.coral),
  rose: new THREE.Color(palette.rose),
  slate: new THREE.Color(palette.slate),
  paper: new THREE.Color(palette.paper),
};

/** Corners of a ±1 cube laid out as 12 line-segment pairs (24 verts). */
const CUBE_EDGES = (() => {
  const c = [
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
  ];
  const e = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];
  const out = new Float32Array(72);
  e.forEach(([a, b], i) => {
    out.set(c[a], i * 6);
    out.set(c[b], i * 6 + 3);
  });
  return out;
})();

const emptyPositions = (count) => {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  return geo;
};

const withColors = (geo, vertexCount) => {
  geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3));
  return geo;
};

const segmentGeometry = (pairs) => {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(pairs.length * 6);
  pairs.forEach(([a, b], i) => {
    positions.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6);
  });
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return withColors(geo, pairs.length * 2);
};

/** Write one RGB triple into both ends of segment `i`. */
const paintSegment = (attr, i, color, gain) => {
  const arr = attr.array;
  const r = color.r * gain;
  const g = color.g * gain;
  const b = color.b * gain;
  arr[i * 6] = r; arr[i * 6 + 1] = g; arr[i * 6 + 2] = b;
  arr[i * 6 + 3] = r; arr[i * 6 + 4] = g; arr[i * 6 + 5] = b;
};

const stepWeight = (ref, isActive, delta) => {
  ref.current = damp(ref.current, isActive ? 1 : 0, CROSSFADE, delta);
  return ref.current;
};

/**
 * Shared enter/exit transform. Returns false once a group has faded out so the
 * caller can skip all of its per-instance work while it is off screen.
 */
const applyBeatGroup = (group, w, dir = 1, idleRotY = 0) => {
  if (!group) return false;
  const live = w > 0.005;
  group.visible = live;
  if (!live) return false;
  const e = easeOut(w);
  group.scale.setScalar(0.78 + e * 0.22);
  group.position.z = -6.5 * (1 - e);
  group.rotation.y = idleRotY + (1 - e) * 0.4 * dir;
  return true;
};

/* ------------------------------------------------------------------ *
 * Beat 0 — BookMatch: KNN for warm users, embeddings for cold ones.
 * ------------------------------------------------------------------ */

const KNN_K = 7;
const KNN_EDGES = 18;
const RAY_COUNT = 14;
const WEDGE_HALF = 0.34; // radians; matches the wedge geometry below

function useBookMatchData() {
  return useMemo(() => {
    const rand = makeRandom(11);

    // Backdrop catalog, hollowed out in the middle so the two strategies and
    // the merged result stay legible against it.
    const catalogCount = quality(760, 300);
    const catalog = new Float32Array(catalogCount * 3);
    for (let i = 0; i < catalogCount; i += 1) {
      const side = rand() < 0.5 ? -1 : 1;
      catalog[i * 3] = side * (2.6 + rand() * 6.4);
      catalog[i * 3 + 1] = (rand() - 0.5) * 9.4;
      catalog[i * 3 + 2] = (rand() - 0.5) * 6.2;
    }

    // Warm start: candidates around the user, ranked by plain distance.
    const candidates = Array.from({ length: 46 }, () => {
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const r = 0.95 + Math.pow(rand(), 0.65) * 2.4;
      return new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * r,
        Math.cos(phi) * r * 0.95,
        Math.sin(phi) * Math.sin(theta) * r * 0.7
      );
    });
    const ranked = candidates
      .map((v, i) => ({ i, d: v.length() }))
      .sort((a, b) => a.d - b.d);
    const neighbours = ranked.slice(0, KNN_K).map((o) => o.i);
    const edgeIdx = ranked.slice(0, KNN_EDGES).map((o) => o.i);

    // Cold start: the embedding space itself.
    const cloudCount = quality(150, 66);
    const shell = fibonacciSphere(cloudCount, 3.1);
    const cloud = new Float32Array(cloudCount * 3);
    for (let i = 0; i < cloudCount; i += 1) {
      const j = 0.7 + rand() * 0.55;
      cloud[i * 3] = shell[i][0] * j;
      cloud[i * 3 + 1] = shell[i][1] * j;
      cloud[i * 3 + 2] = shell[i][2] * j * 0.5;
    }

    // Cosine similarity = angular proximity, so ray LENGTHS vary a lot while
    // only the angle decides whether a ray joins the cluster.
    const rays = Array.from({ length: RAY_COUNT }, (_, i) => {
      const angle = -0.5 + (i / (RAY_COUNT - 1)) * 3.05;
      const len = 1.35 + rand() * 1.3;
      return {
        angle,
        len,
        dir: new THREE.Vector3(Math.cos(angle), Math.sin(angle), (rand() - 0.5) * 0.42).normalize(),
      };
    });
    const userRay = 7;

    const results = Array.from({ length: 7 }, (_, i) => (
      new THREE.Vector3(0, (i / 6 - 0.5) * 3.4, 2.6)
    ));

    const streamCount = quality(150, 72);
    const streams = Array.from({ length: streamCount }, () => ({
      cold: rand() < 0.5,
      target: Math.floor(rand() * 7),
      offset: rand(),
      speed: 0.5 + rand() * 0.55,
      arc: (rand() - 0.5) * 1.6,
    }));

    return {
      catalog, catalogCount, candidates, neighbours, edgeIdx,
      cloud, cloudCount, rays, userRay, results, streams,
    };
  }, []);
}

function BookMatchScene({ progressRef, activeBeat }) {
  const d = useBookMatchData();

  const groupRef = useRef();
  const warmRef = useRef();
  const coldRef = useRef();
  const catalogRef = useRef();
  const candRef = useRef();
  const edgeRef = useRef();
  const voteRef = useRef();
  const rayRef = useRef();
  const wedgeRef = useRef();
  const clusterRef = useRef();
  const warmUserRef = useRef();
  const coldUserRef = useRef();
  const resultRef = useRef();
  const streamRef = useRef();

  const wRef = useRef(0);
  const smooth = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);

  const catalogGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(d.catalog, 3));
    return geo;
  }, [d.catalog]);

  const cloudGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(d.cloud, 3));
    return geo;
  }, [d.cloud]);

  const edgeGeo = useMemo(() => segmentGeometry(
    d.edgeIdx.map((i) => [new THREE.Vector3(0, 0, 0), d.candidates[i]])
  ), [d.edgeIdx, d.candidates]);

  const rayGeo = useMemo(() => segmentGeometry(
    d.rays.map((r) => [new THREE.Vector3(0, 0, 0), r.dir.clone().multiplyScalar(r.len)])
  ), [d.rays]);

  const voteGeo = useMemo(() => emptyPositions(KNN_K), []);
  const streamGeo = useMemo(() => emptyPositions(d.streams.length), [d.streams.length]);

  useFrame((state, delta) => {
    const w = stepWeight(wRef, activeBeat === 0, delta);
    const t = state.clock.elapsedTime;
    smooth.current = damp(smooth.current, range(progressRef.current, 0, 0.25), 4.2, delta);
    if (!applyBeatGroup(groupRef.current, w, 1, Math.sin(t * 0.11) * 0.16)) return;

    const lp = smooth.current;
    const field = range(lp, 0, 0.2);
    const knn = range(lp, 0.1, 0.56);
    const cold = range(lp, 0.3, 0.78);
    const merge = range(lp, 0.6, 1);
    const eMerge = easeInOut(merge);

    const warmX = lerp(-4.6, -3.2, eMerge);
    const coldX = lerp(4.2, 2.9, eMerge);
    if (warmRef.current) {
      warmRef.current.position.x = warmX;
      warmRef.current.rotation.y = t * 0.16;
    }
    if (coldRef.current) {
      coldRef.current.position.x = coldX;
      coldRef.current.rotation.y = -t * 0.1;
    }

    if (catalogRef.current) catalogRef.current.material.opacity = w * (0.06 + field * 0.24);
    if (warmUserRef.current) {
      warmUserRef.current.scale.setScalar(easeOut(range(knn, 0, 0.3)) * (0.4 + Math.sin(t * 2.2) * 0.018));
      warmUserRef.current.material.opacity = w;
    }
    if (coldUserRef.current) {
      const ray = d.rays[d.userRay];
      coldUserRef.current.position.copy(ray.dir).multiplyScalar(ray.len * 1.18);
      coldUserRef.current.scale.setScalar(easeOut(range(cold, 0, 0.32)) * (0.36 + Math.sin(t * 2.6) * 0.02));
      coldUserRef.current.material.opacity = w;
    }

    // Nearest neighbours light up in rank order, then each casts a vote that
    // travels back down its edge to the user.
    if (candRef.current) {
      d.candidates.forEach((pos, i) => {
        const rank = d.neighbours.indexOf(i);
        const isNb = rank >= 0;
        const appear = easeOut(range(knn, 0, 0.35));
        const lit = isNb ? easeOut(range(knn, 0.2 + rank * 0.055, 0.55 + rank * 0.055)) : 0;
        const pulse = isNb ? 1 + Math.sin(t * 3.2 - rank * 0.7) * 0.14 * lit : 1;
        dummy.position.copy(pos);
        dummy.position.y += Math.sin(t * 0.7 + i) * 0.045;
        dummy.scale.setScalar((0.09 + lit * 0.1) * appear * pulse);
        dummy.rotation.set(t * 0.2 + i, t * 0.3, 0);
        dummy.updateMatrix();
        candRef.current.setMatrixAt(i, dummy.matrix);
        col.copy(C.slate).lerp(C.lime, lit);
        candRef.current.setColorAt(i, col);
      });
      candRef.current.instanceMatrix.needsUpdate = true;
      if (candRef.current.instanceColor) candRef.current.instanceColor.needsUpdate = true;
      candRef.current.material.opacity = w;
    }

    if (edgeRef.current) {
      const attr = edgeGeo.attributes.color;
      d.edgeIdx.forEach((idx, i) => {
        const rank = d.neighbours.indexOf(idx);
        const gain = rank >= 0
          ? 0.25 + easeOut(range(knn, 0.18 + rank * 0.055, 0.5 + rank * 0.055)) * 0.75
          : 0.07 * knn;
        paintSegment(attr, i, rank >= 0 ? C.lime : C.slate, gain * w);
      });
      attr.needsUpdate = true;
    }

    if (voteRef.current) {
      const arr = voteGeo.attributes.position.array;
      d.neighbours.forEach((idx, k) => {
        const from = d.candidates[idx];
        const travel = (t * 0.55 + k * 0.13) % 1;
        const live = range(knn, 0.3 + k * 0.05, 0.6 + k * 0.05);
        const u = easeInOut(travel) * live;
        arr[k * 3] = from.x * (1 - u);
        arr[k * 3 + 1] = from.y * (1 - u);
        arr[k * 3 + 2] = from.z * (1 - u);
      });
      voteGeo.attributes.position.needsUpdate = true;
      voteRef.current.material.opacity = w * range(knn, 0.28, 0.5) * 0.9;
    }

    // Angular tolerance wedge sweeps onto the user's direction; every ray whose
    // angle falls inside it joins the semantic cluster regardless of length.
    const aim = d.rays[d.userRay].angle + Math.sin(t * 0.5) * 0.09;
    if (wedgeRef.current) {
      wedgeRef.current.rotation.z = aim;
      wedgeRef.current.scale.setScalar(0.55 + easeOut(range(cold, 0.15, 0.7)) * 0.45);
      wedgeRef.current.material.opacity = w * range(cold, 0.2, 0.6) * 0.16;
    }

    if (rayRef.current) {
      const attr = rayGeo.attributes.color;
      d.rays.forEach((r, i) => {
        const diff = Math.abs(r.angle - aim);
        const inside = diff < WEDGE_HALF;
        const near = inside ? 1 - (diff / WEDGE_HALF) * 0.45 : 0;
        const gain = inside
          ? (0.2 + near * 0.9) * easeOut(range(cold, 0.2, 0.7))
          : 0.08 * cold;
        paintSegment(attr, i, inside ? C.lime : C.slate, gain * w);
      });
      attr.needsUpdate = true;
    }

    if (clusterRef.current) {
      d.rays.forEach((r, i) => {
        const diff = Math.abs(r.angle - aim);
        const inside = diff < WEDGE_HALF;
        for (let k = 0; k < 2; k += 1) {
          const idx = i * 2 + k;
          const along = r.len * (0.55 + k * 0.42);
          dummy.position.copy(r.dir).multiplyScalar(along);
          dummy.position.y += Math.sin(t * 0.8 + idx) * 0.04;
          const lit = inside ? easeOut(range(cold, 0.3, 0.75)) : 0;
          dummy.scale.setScalar((0.075 + lit * 0.085) * easeOut(range(cold, 0, 0.4)));
          dummy.rotation.set(t * 0.25 + idx, t * 0.2, 0);
          dummy.updateMatrix();
          clusterRef.current.setMatrixAt(idx, dummy.matrix);
          col.copy(C.slate).lerp(C.teal, lit);
          clusterRef.current.setColorAt(idx, col);
        }
      });
      clusterRef.current.instanceMatrix.needsUpdate = true;
      if (clusterRef.current.instanceColor) clusterRef.current.instanceColor.needsUpdate = true;
      clusterRef.current.material.opacity = w;
    }

    // Merged recommendation list, tapering away from the centre row.
    if (resultRef.current) {
      d.results.forEach((pos, i) => {
        const rank = Math.abs(i - 3);
        const appear = easeOut(range(merge, i * 0.05, i * 0.05 + 0.5));
        dummy.position.copy(pos);
        dummy.position.y += Math.sin(t * 1.1 + i * 0.8) * 0.05;
        dummy.rotation.set(0, Math.sin(t * 0.4 + i) * 0.12, 0);
        dummy.scale.set(
          (2.1 - rank * 0.24) * appear,
          0.24 * appear * (1 + Math.sin(t * 2.4 + i) * 0.07),
          0.24 * appear
        );
        dummy.updateMatrix();
        resultRef.current.setMatrixAt(i, dummy.matrix);
      });
      resultRef.current.instanceMatrix.needsUpdate = true;
      resultRef.current.material.opacity = w;
    }

    if (streamRef.current) {
      const arr = streamGeo.attributes.position.array;
      for (let i = 0; i < d.streams.length; i += 1) {
        const s = d.streams[i];
        const target = d.results[s.target];
        const sx = s.cold ? coldX : warmX;
        const travel = (t * s.speed + s.offset) % 1;
        const u = easeInOut(travel);
        const live = range(merge, s.offset * 0.3, 0.6 + s.offset * 0.3);
        const x = lerp(sx, target.x, u);
        const y = lerp(0, target.y, u) + Math.sin(u * Math.PI) * s.arc;
        const z = lerp(0, target.z, u) + Math.sin(u * Math.PI) * 0.6;
        arr[i * 3] = lerp(sx, x, live);
        arr[i * 3 + 1] = lerp(0, y, live);
        arr[i * 3 + 2] = lerp(0, z, live);
      }
      streamGeo.attributes.position.needsUpdate = true;
      streamRef.current.material.opacity = w * merge * 0.85;
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={catalogRef} geometry={catalogGeo}>
        <pointsMaterial
          color={palette.slate}
          size={0.055}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
        />
      </points>

      {/* warm start — a user with history, resolved by KNN */}
      <group ref={warmRef}>
        <mesh ref={warmUserRef}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color={palette.lime}
            emissive={palette.lime}
            emissiveIntensity={1.2}
            roughness={0.25}
            metalness={0.3}
            transparent
          />
        </mesh>
        <lineSegments ref={edgeRef} geometry={edgeGeo}>
          <lineBasicMaterial
            vertexColors
            transparent
            opacity={0.85}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
        <instancedMesh ref={candRef} args={[null, null, d.candidates.length]}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial roughness={0.35} metalness={0.25} transparent opacity={0} />
        </instancedMesh>
        <points ref={voteRef} geometry={voteGeo}>
          <pointsMaterial
            color={palette.paper}
            size={0.2}
            sizeAttenuation
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>

      {/* cold start — no edges at all, only angular proximity in embedding space */}
      <group ref={coldRef}>
        <points geometry={cloudGeo}>
          <pointsMaterial
            color={palette.slate}
            size={0.07}
            sizeAttenuation
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </points>
        <mesh ref={wedgeRef}>
          <ringGeometry args={[0.2, 2.9, 40, 1, -WEDGE_HALF, WEDGE_HALF * 2]} />
          <meshBasicMaterial
            color={palette.lime}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <lineSegments ref={rayRef} geometry={rayGeo}>
          <lineBasicMaterial
            vertexColors
            transparent
            opacity={0.9}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
        <instancedMesh ref={clusterRef} args={[null, null, RAY_COUNT * 2]}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial roughness={0.3} metalness={0.3} transparent opacity={0} />
        </instancedMesh>
        <mesh ref={coldUserRef}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color={palette.teal}
            emissive={palette.teal}
            emissiveIntensity={1.2}
            roughness={0.25}
            metalness={0.3}
            transparent
          />
        </mesh>
      </group>

      {/* both strategies fold into one ranked list */}
      <instancedMesh ref={resultRef} args={[null, null, d.results.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={palette.lime}
          emissive={palette.lime}
          emissiveIntensity={0.75}
          roughness={0.3}
          metalness={0.35}
          transparent
          opacity={0}
        />
      </instancedMesh>
      <points ref={streamRef} geometry={streamGeo}>
        <pointsMaterial
          color={palette.lime}
          size={0.11}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * Beat 1 — Walnut counting: a detection sweep and a dual-CNN pipeline.
 * ------------------------------------------------------------------ */

const LANE_Y = [2.95, 4.1];
const PLATE_X = [-4.6, -2.7, -0.8, 1.1, 3.0];
const CONSENSUS = new THREE.Vector3(4.75, 3.5, 0);
const METER_CENTER = new THREE.Vector3(5.45, -1.15, 0);
const METER_TICKS = 30;
const BOX_HALF = [0.44, 0.34, 0.38];

function useWalnutData() {
  return useMemo(() => {
    const rand = makeRandom(23);
    const count = quality(60, 30);
    const walnuts = Array.from({ length: count }, () => ({
      pos: new THREE.Vector3(
        -1.05 + (rand() - 0.5) * 8.8,
        -1.15 + (rand() - 0.5) * 4.3,
        (rand() - 0.5) * 2.8
      ),
      rot: [rand() * Math.PI, rand() * Math.PI, rand() * Math.PI],
      size: 0.29 + rand() * 0.11,
      conf: 0.6 + rand() * 0.4,
      bob: rand() * Math.PI * 2,
    })).sort((a, b) => a.pos.x - b.pos.x);

    const laneCount = quality(200, 92);
    const laneParticles = Array.from({ length: laneCount }, (_, i) => ({
      lane: i % 2,
      offset: rand(),
      speed: 0.32 + rand() * 0.26,
      wob: (rand() - 0.5) * 0.55,
      depth: (rand() - 0.5) * 0.7,
    }));

    return { walnuts, laneParticles };
  }, []);
}

function WalnutScene({ progressRef, activeBeat }) {
  const { walnuts, laneParticles } = useWalnutData();

  const groupRef = useRef();
  const nutRef = useRef();
  const boxRef = useRef();
  const frontRef = useRef();
  const glowRef = useRef();
  const plateRef = useRef();
  const laneRef = useRef();
  const consensusRef = useRef();
  const tickRef = useRef();
  const meterCoreRef = useRef();

  const wRef = useRef(0);
  const smooth = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);

  // -1 until the sweep front has passed this walnut; latched so boxes stay put.
  const detected = useMemo(() => new Float32Array(walnuts.length).fill(-1), [walnuts.length]);
  const fillRef = useRef(0);

  const boxGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const verts = walnuts.length * 24;
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts * 3), 3));
    return withColors(geo, verts);
  }, [walnuts.length]);

  const laneGeo = useMemo(() => {
    const geo = emptyPositions(laneParticles.length);
    return withColors(geo, laneParticles.length);
  }, [laneParticles.length]);

  const plateSlots = useMemo(() => {
    const slots = [];
    LANE_Y.forEach((y, laneIdx) => {
      PLATE_X.forEach((x, j) => slots.push({ x, y, lane: laneIdx, step: j }));
    });
    return slots;
  }, []);

  useFrame((state, delta) => {
    const w = stepWeight(wRef, activeBeat === 1, delta);
    const t = state.clock.elapsedTime;
    smooth.current = damp(smooth.current, range(progressRef.current, 0.25, 0.5), 4.2, delta);
    if (!applyBeatGroup(groupRef.current, w, -1, Math.sin(t * 0.09) * 0.12)) return;

    const lp = smooth.current;
    const appear = easeOut(range(lp, 0, 0.16));
    const scan = easeInOut(range(lp, 0.1, 0.9));
    const frontX = lerp(-6.1, 4.2, scan);
    const pipeline = range(lp, 0.05, 0.4);

    if (frontRef.current) {
      frontRef.current.position.x = frontX;
      frontRef.current.material.opacity = w * range(lp, 0.06, 0.16) * (1 - range(lp, 0.92, 1)) * 0.9;
    }
    if (glowRef.current) {
      glowRef.current.position.x = frontX - 0.55;
      glowRef.current.material.opacity = w * range(lp, 0.06, 0.16) * (1 - range(lp, 0.92, 1)) * 0.1;
    }

    let counted = 0;
    const boxPos = boxGeo.attributes.position.array;
    const boxCol = boxGeo.attributes.color.array;
    const nuts = nutRef.current;

    for (let i = 0; i < walnuts.length; i += 1) {
      const nut = walnuts[i];
      const passed = frontX > nut.pos.x;
      if (passed && detected[i] < 0) detected[i] = t;
      if (!passed && detected[i] >= 0) detected[i] = -1;

      const since = detected[i] >= 0 ? t - detected[i] : -1;
      const snap = since >= 0 ? easeOut(clamp(since / 0.32)) : 0;
      if (detected[i] >= 0) counted += 1;

      const bob = Math.sin(t * 0.8 + nut.bob) * 0.05;
      dummy.position.set(nut.pos.x, nut.pos.y + bob, nut.pos.z);
      dummy.rotation.set(nut.rot[0] + t * 0.08, nut.rot[1] + t * 0.05, nut.rot[2]);
      dummy.scale.set(nut.size * 1.15, nut.size * 0.82, nut.size).multiplyScalar(appear);
      dummy.updateMatrix();
      if (nuts) {
        nuts.setMatrixAt(i, dummy.matrix);
        col.copy(C.slate).lerp(C.paper, snap * 0.55);
        nuts.setColorAt(i, col);
      }

      // Boxes drop in oversized and snap tight; opacity carries confidence.
      const spread = lerp(2.3, 1, snap);
      const flicker = 0.86 + Math.sin(t * 5.5 + i) * 0.14;
      const gain = snap * nut.conf * flicker * w;
      const base = i * 72;
      for (let v = 0; v < 24; v += 1) {
        const o = base + v * 3;
        boxPos[o] = dummy.position.x + CUBE_EDGES[v * 3] * BOX_HALF[0] * nut.size * 3 * spread;
        boxPos[o + 1] = dummy.position.y + CUBE_EDGES[v * 3 + 1] * BOX_HALF[1] * nut.size * 3 * spread;
        boxPos[o + 2] = dummy.position.z + CUBE_EDGES[v * 3 + 2] * BOX_HALF[2] * nut.size * 3 * spread;
        boxCol[o] = C.amber.r * gain;
        boxCol[o + 1] = C.amber.g * gain;
        boxCol[o + 2] = C.amber.b * gain;
      }
    }

    if (nuts) {
      nuts.instanceMatrix.needsUpdate = true;
      if (nuts.instanceColor) nuts.instanceColor.needsUpdate = true;
      nuts.material.opacity = w;
    }
    boxGeo.attributes.position.needsUpdate = true;
    boxGeo.attributes.color.needsUpdate = true;

    fillRef.current = damp(fillRef.current, counted / walnuts.length, 7, delta);
    const fill = fillRef.current;

    // Running count, drawn as a ring of ticks that fills instead of a number.
    if (tickRef.current) {
      for (let i = 0; i < METER_TICKS; i += 1) {
        const a = (i / METER_TICKS) * Math.PI * 2 - Math.PI / 2;
        const on = i / METER_TICKS < fill;
        const edge = clamp(1 - Math.abs(i / METER_TICKS - fill) * 14);
        dummy.position.set(
          METER_CENTER.x + Math.cos(a) * 1.12,
          METER_CENTER.y + Math.sin(a) * 1.12,
          0
        );
        dummy.rotation.set(0, 0, a - Math.PI / 2);
        dummy.scale.set(0.075, on ? 0.3 + edge * 0.16 : 0.16, 0.075).multiplyScalar(appear);
        dummy.updateMatrix();
        tickRef.current.setMatrixAt(i, dummy.matrix);
        col.copy(C.slate).lerp(C.amber, on ? 0.85 + edge * 0.15 : 0.05);
        tickRef.current.setColorAt(i, col);
      }
      tickRef.current.instanceMatrix.needsUpdate = true;
      if (tickRef.current.instanceColor) tickRef.current.instanceColor.needsUpdate = true;
      tickRef.current.material.opacity = w;
    }
    if (meterCoreRef.current) {
      meterCoreRef.current.scale.setScalar((0.16 + fill * 0.62) * appear);
      meterCoreRef.current.rotation.set(t * 0.3, t * 0.42, 0);
      meterCoreRef.current.material.opacity = w * (0.25 + fill * 0.7);
    }

    // Two CNN lanes, five layers each, converging on one consensus head.
    if (plateRef.current) {
      plateSlots.forEach((slot, i) => {
        const wave = Math.sin(t * 1.6 - slot.step * 0.8 + slot.lane * 1.2);
        const grow = easeOut(range(pipeline, slot.step * 0.09, slot.step * 0.09 + 0.5));
        dummy.position.set(slot.x, slot.y, 0);
        dummy.rotation.set(0, Math.sin(t * 0.3 + i) * 0.1, 0);
        dummy.scale.set(0.07, (0.42 + slot.step * 0.07) * grow, (0.42 + slot.step * 0.07) * grow);
        dummy.updateMatrix();
        plateRef.current.setMatrixAt(i, dummy.matrix);
        col.copy(slot.lane === 0 ? C.cyan : C.rose).multiplyScalar(0.3 + Math.max(0, wave) * 0.7);
        plateRef.current.setColorAt(i, col);
      });
      plateRef.current.instanceMatrix.needsUpdate = true;
      if (plateRef.current.instanceColor) plateRef.current.instanceColor.needsUpdate = true;
      plateRef.current.material.opacity = w * 0.82;
    }

    if (consensusRef.current) {
      const grow = easeOut(range(pipeline, 0.45, 1));
      consensusRef.current.position.copy(CONSENSUS);
      consensusRef.current.scale.setScalar(grow * (0.42 + Math.sin(t * 3) * 0.03));
      consensusRef.current.rotation.set(t * 0.4, t * 0.6, 0);
      consensusRef.current.material.opacity = w;
    }

    if (laneRef.current) {
      const pos = laneGeo.attributes.position.array;
      const cAttr = laneGeo.attributes.color.array;
      for (let i = 0; i < laneParticles.length; i += 1) {
        const p = laneParticles[i];
        const u = (t * p.speed + p.offset) % 1;
        const laneY = LANE_Y[p.lane];
        let x; let y; let z;
        if (u < 0.6) {
          const k = u / 0.6;
          x = lerp(-5.5, 3.4, k);
          y = laneY + Math.sin(k * Math.PI * 3 + p.offset * 6) * 0.12 + p.wob * 0.2;
          z = p.depth;
        } else if (u < 0.76) {
          const k = (u - 0.6) / 0.16;
          x = lerp(3.4, CONSENSUS.x, k);
          y = lerp(laneY, CONSENSUS.y, easeInOut(k));
          z = lerp(p.depth, 0, k);
        } else {
          const k = (u - 0.76) / 0.24;
          x = lerp(CONSENSUS.x, frontX, easeInOut(k));
          y = lerp(CONSENSUS.y, -1.1, easeInOut(k));
          z = lerp(0, p.depth * 0.6, k);
        }
        const live = range(pipeline, p.offset * 0.35, 0.5 + p.offset * 0.35);
        pos[i * 3] = lerp(-5.5, x, live);
        pos[i * 3 + 1] = lerp(laneY, y, live);
        pos[i * 3 + 2] = z * live;

        // Lane identity up front, single amber consensus after the merge.
        const merged = clamp((u - 0.6) / 0.16);
        col.copy(p.lane === 0 ? C.cyan : C.rose).lerp(C.amber, merged);
        const gain = live * (0.5 + 0.5 * Math.sin(u * Math.PI));
        cAttr[i * 3] = col.r * gain;
        cAttr[i * 3 + 1] = col.g * gain;
        cAttr[i * 3 + 2] = col.b * gain;
      }
      laneGeo.attributes.position.needsUpdate = true;
      laneGeo.attributes.color.needsUpdate = true;
      laneRef.current.material.opacity = w * 0.9;
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={nutRef} args={[null, null, walnuts.length]}>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial roughness={0.65} metalness={0.15} transparent opacity={0} />
      </instancedMesh>

      <lineSegments ref={boxRef} geometry={boxGeo}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* detection front */}
      <mesh ref={frontRef} position={[0, -1.15, 0]}>
        <boxGeometry args={[0.05, 4.7, 3.3]} />
        <meshBasicMaterial
          color={palette.amber}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={glowRef} position={[0, -1.15, 0]}>
        <boxGeometry args={[1.1, 4.7, 3.3]} />
        <meshBasicMaterial
          color={palette.amber}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* dual CNN lanes */}
      <instancedMesh ref={plateRef} args={[null, null, plateSlots.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.4} metalness={0.35} transparent opacity={0} />
      </instancedMesh>
      <mesh ref={consensusRef}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={palette.amber}
          emissive={palette.amber}
          emissiveIntensity={1.1}
          roughness={0.25}
          metalness={0.4}
          transparent
        />
      </mesh>
      <points ref={laneRef} geometry={laneGeo}>
        <pointsMaterial
          vertexColors
          size={0.1}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* running count */}
      <instancedMesh ref={tickRef} args={[null, null, METER_TICKS]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.35} metalness={0.3} transparent opacity={0} />
      </instancedMesh>
      <mesh ref={meterCoreRef} position={METER_CENTER}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color={palette.amber} wireframe transparent opacity={0} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * Beat 2 — BalanciFi: instant cross-device sync and budget allocation.
 * ------------------------------------------------------------------ */

const DEVICES = [
  { pos: [0, 3.5, -1.5], rot: [-0.15, 0, 0], w: 2.9, h: 2.0 },
  { pos: [-4.7, 1.5, 0.2], rot: [0, 0.52, 0.06], w: 1.35, h: 2.4 },
  { pos: [4.7, 1.5, 0.2], rot: [0, -0.52, -0.06], w: 1.35, h: 2.4 },
  { pos: [0, -0.25, 2.5], rot: [0.16, 0, 0], w: 1.5, h: 2.5 },
];
const SYNC_CORE = new THREE.Vector3(0, 1.7, 0);
const ROWS_PER_DEVICE = 4;
const BUCKET_X = [-4.4, -2.2, 0, 2.2, 4.4];
const BUCKET_BASE = -4.25;
const BUCKET_MAX = 2.0;
const SAVINGS = 4;

function useBalanciFiData() {
  return useMemo(() => {
    const rand = makeRandom(37);
    const obj = new THREE.Object3D();

    const rows = [];
    DEVICES.forEach((dev, di) => {
      obj.position.fromArray(dev.pos);
      obj.rotation.fromArray(dev.rot);
      obj.updateMatrix();
      const quat = obj.quaternion.clone();
      for (let k = 0; k < ROWS_PER_DEVICE; k += 1) {
        const local = new THREE.Vector3(0, dev.h * (0.3 - k * 0.17), 0.04);
        rows.push({
          device: di,
          row: k,
          pos: local.applyMatrix4(obj.matrix),
          quat,
          w: dev.w * 0.68,
          h: dev.h * 0.07,
        });
      }
    });

    const deviceAnchors = DEVICES.map((dev) => new THREE.Vector3().fromArray(dev.pos));

    const syncCount = quality(210, 96);
    const sync = Array.from({ length: syncCount }, () => {
      const from = Math.floor(rand() * DEVICES.length);
      let to = Math.floor(rand() * DEVICES.length);
      if (to === from) to = (to + 1) % DEVICES.length;
      return {
        from,
        to,
        offset: rand(),
        speed: 1.15 + rand() * 0.9,
        arc: (rand() - 0.5) * 0.9,
      };
    });

    const budgetCount = quality(180, 84);
    const budget = Array.from({ length: budgetCount }, () => ({
      bucket: Math.floor(rand() * BUCKET_X.length),
      offset: rand(),
      speed: 0.4 + rand() * 0.4,
      lane: (rand() - 0.5) * 0.9,
    }));

    // Category shares; savings is deliberately the one that keeps growing.
    const shares = [0.9, 0.72, 0.58, 0.44, 0.3];

    return { rows, deviceAnchors, sync, budget, shares };
  }, []);
}

function BalanciFiScene({ progressRef, activeBeat }) {
  const { rows, deviceAnchors, sync, budget, shares } = useBalanciFiData();

  const groupRef = useRef();
  const coreRef = useRef();
  const coreShellRef = useRef();
  const rowRef = useRef();
  const syncRef = useRef();
  const budgetRef = useRef();
  const fillRef = useRef();
  const screenRefs = useRef([]);
  const frameRefs = useRef([]);
  const bucketRefs = useRef([]);

  const wRef = useRef(0);
  const smooth = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const levels = useMemo(() => new Float32Array(BUCKET_X.length), []);

  const rectGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const corners = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]];
    const arr = new Float32Array(24);
    for (let i = 0; i < 4; i += 1) {
      const a = corners[i];
      const b = corners[(i + 1) % 4];
      arr.set([a[0], a[1], 0, b[0], b[1], 0], i * 6);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return geo;
  }, []);

  const syncGeo = useMemo(() => withColors(emptyPositions(sync.length), sync.length), [sync.length]);
  const budgetGeo = useMemo(() => emptyPositions(budget.length), [budget.length]);

  useFrame((state, delta) => {
    const w = stepWeight(wRef, activeBeat === 2, delta);
    const t = state.clock.elapsedTime;
    smooth.current = damp(smooth.current, range(progressRef.current, 0.5, 0.75), 4.2, delta);
    if (!applyBeatGroup(groupRef.current, w, 1, Math.sin(t * 0.1) * 0.14)) return;

    const lp = smooth.current;
    const boot = easeOut(range(lp, 0, 0.22));
    const syncPhase = range(lp, 0.14, 0.6);
    const budgetPhase = range(lp, 0.42, 1);

    // One write every ~1.6s; every device commits it within a few frames.
    const ledger = t / 1.6;
    const writeIndex = Math.floor(ledger);
    const writeAge = ledger - writeIndex;

    if (coreRef.current) {
      const beat = 1 + Math.sin(writeAge * Math.PI * 2) * 0.09 * syncPhase;
      coreRef.current.scale.setScalar(boot * 0.6 * beat);
      coreRef.current.rotation.set(t * 0.3, t * 0.55, 0);
      coreRef.current.material.opacity = w;
    }
    if (coreShellRef.current) {
      coreShellRef.current.scale.setScalar(boot * (1.05 + writeAge * 0.5));
      coreShellRef.current.rotation.set(-t * 0.2, t * 0.25, 0);
      coreShellRef.current.material.opacity = w * clamp((1 - writeAge) * 0.35) * syncPhase;
    }

    const sourceDevice = writeIndex % DEVICES.length;

    DEVICES.forEach((dev, i) => {
      const show = easeOut(range(boot, i * 0.08, i * 0.08 + 0.6));
      const flash = i === sourceDevice ? clamp(1 - writeAge * 6) * syncPhase : 0;
      const screen = screenRefs.current[i];
      const frame = frameRefs.current[i];
      if (screen) screen.material.opacity = w * show * (0.07 + flash * 0.16);
      if (frame) frame.material.opacity = w * show * (0.35 + flash * 0.6);
    });

    // The ledger fills row by row and rolls over; every device shows the same
    // rows, with non-source devices trailing by a few frames at most.
    const committed = 1 + (writeIndex % ROWS_PER_DEVICE);

    if (rowRef.current) {
      rows.forEach((row, i) => {
        const delay = row.device === sourceDevice ? 0 : 0.035 + row.device * 0.012;
        const isNewest = row.row === committed - 1;
        const arrive = isNewest ? clamp((writeAge - delay) * 12) : 1;
        const glow = row.row < committed ? (0.3 + arrive * 0.7) * syncPhase : 0;
        dummy.position.copy(row.pos);
        dummy.quaternion.copy(row.quat);
        dummy.scale.set(
          row.w * (0.55 + glow * 0.45) * easeOut(range(boot, 0.2, 1)),
          row.h,
          0.02
        );
        dummy.updateMatrix();
        rowRef.current.setMatrixAt(i, dummy.matrix);
        col.copy(C.slate).lerp(C.cyan, glow);
        rowRef.current.setColorAt(i, col);
      });
      rowRef.current.instanceMatrix.needsUpdate = true;
      if (rowRef.current.instanceColor) rowRef.current.instanceColor.needsUpdate = true;
      rowRef.current.material.opacity = w;
    }

    if (syncRef.current) {
      const pos = syncGeo.attributes.position.array;
      const cAttr = syncGeo.attributes.color.array;
      for (let i = 0; i < sync.length; i += 1) {
        const s = sync[i];
        const from = deviceAnchors[s.from];
        const to = deviceAnchors[s.to];
        const u = (t * s.speed + s.offset) % 1;
        let x; let y; let z;
        if (u < 0.5) {
          const k = easeInOut(u / 0.5);
          x = lerp(from.x, SYNC_CORE.x, k);
          y = lerp(from.y, SYNC_CORE.y, k) + Math.sin(k * Math.PI) * s.arc;
          z = lerp(from.z, SYNC_CORE.z, k);
        } else {
          const k = easeInOut((u - 0.5) / 0.5);
          x = lerp(SYNC_CORE.x, to.x, k);
          y = lerp(SYNC_CORE.y, to.y, k) + Math.sin(k * Math.PI) * s.arc * 0.7;
          z = lerp(SYNC_CORE.z, to.z, k);
        }
        const live = range(syncPhase, s.offset * 0.3, 0.45 + s.offset * 0.3);
        pos[i * 3] = lerp(SYNC_CORE.x, x, live);
        pos[i * 3 + 1] = lerp(SYNC_CORE.y, y, live);
        pos[i * 3 + 2] = lerp(SYNC_CORE.z, z, live);
        col.copy(u < 0.5 ? C.paper : C.cyan);
        const gain = live * (0.4 + Math.sin(u * Math.PI) * 0.6);
        cAttr[i * 3] = col.r * gain;
        cAttr[i * 3 + 1] = col.g * gain;
        cAttr[i * 3 + 2] = col.b * gain;
      }
      syncGeo.attributes.position.needsUpdate = true;
      syncGeo.attributes.color.needsUpdate = true;
      syncRef.current.material.opacity = w * 0.9;
    }

    // Buckets fill toward their share; savings keeps creeping up the longer
    // the beat is on screen.
    for (let b = 0; b < BUCKET_X.length; b += 1) {
      const target = b === SAVINGS
        ? clamp(budgetPhase * 0.55 + range(lp, 0.7, 1) * 0.45)
        : shares[b] * easeOut(range(budgetPhase, b * 0.07, b * 0.07 + 0.7));
      levels[b] = damp(levels[b], target, 3, delta);
    }

    bucketRefs.current.forEach((frame, b) => {
      if (!frame) return;
      frame.material.opacity = w * easeOut(range(budgetPhase, b * 0.05, b * 0.05 + 0.4)) * 0.32;
    });

    if (fillRef.current) {
      for (let b = 0; b < BUCKET_X.length; b += 1) {
        const h = Math.max(0.001, levels[b] * BUCKET_MAX);
        dummy.position.set(BUCKET_X[b], BUCKET_BASE + h / 2, 0);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1.34, h, 0.5);
        dummy.updateMatrix();
        fillRef.current.setMatrixAt(b, dummy.matrix);
        col.copy(b === SAVINGS ? C.teal : C.cyan).lerp(C.violet, b * 0.09);
        fillRef.current.setColorAt(b, col);
      }
      fillRef.current.instanceMatrix.needsUpdate = true;
      if (fillRef.current.instanceColor) fillRef.current.instanceColor.needsUpdate = true;
      fillRef.current.material.opacity = w * 0.62;
    }

    if (budgetRef.current) {
      const pos = budgetGeo.attributes.position.array;
      for (let i = 0; i < budget.length; i += 1) {
        const p = budget[i];
        const bx = BUCKET_X[p.bucket];
        const top = BUCKET_BASE + levels[p.bucket] * BUCKET_MAX;
        const u = (t * p.speed + p.offset) % 1;
        let x; let y;
        if (u < 0.55) {
          const k = easeInOut(u / 0.55);
          x = lerp(SYNC_CORE.x + p.lane, bx, k);
          y = lerp(SYNC_CORE.y, -2.05, k);
        } else {
          const k = (u - 0.55) / 0.45;
          x = bx + p.lane * 0.35 * (1 - k);
          y = lerp(-2.05, top, easeInOut(k));
        }
        const live = range(budgetPhase, p.offset * 0.35, 0.4 + p.offset * 0.35);
        pos[i * 3] = lerp(SYNC_CORE.x, x, live);
        pos[i * 3 + 1] = lerp(SYNC_CORE.y, y, live);
        pos[i * 3 + 2] = p.lane * 0.3 * live;
      }
      budgetGeo.attributes.position.needsUpdate = true;
      budgetRef.current.material.opacity = w * budgetPhase * 0.8;
    }
  });

  return (
    <group ref={groupRef}>
      {DEVICES.map((dev, i) => (
        <group key={i} position={dev.pos} rotation={dev.rot}>
          <mesh
            ref={(el) => { screenRefs.current[i] = el; }}
            scale={[dev.w, dev.h, 1]}
          >
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              color={palette.cyan}
              transparent
              opacity={0}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <lineSegments
            ref={(el) => { frameRefs.current[i] = el; }}
            geometry={rectGeo}
            scale={[dev.w, dev.h, 1]}
          >
            <lineBasicMaterial color={palette.cyan} transparent opacity={0} />
          </lineSegments>
        </group>
      ))}

      <instancedMesh ref={rowRef} args={[null, null, rows.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.4} metalness={0.3} transparent opacity={0} />
      </instancedMesh>

      {/* Firestore sync core */}
      <mesh ref={coreRef} position={SYNC_CORE}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={palette.cyan}
          emissive={palette.cyan}
          emissiveIntensity={1.2}
          roughness={0.2}
          metalness={0.45}
          transparent
        />
      </mesh>
      <mesh ref={coreShellRef} position={SYNC_CORE}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color={palette.paper} wireframe transparent opacity={0} />
      </mesh>

      <points ref={syncRef} geometry={syncGeo}>
        <pointsMaterial
          vertexColors
          size={0.1}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* budget buckets */}
      {BUCKET_X.map((x, b) => (
        <lineSegments
          key={x}
          ref={(el) => { bucketRefs.current[b] = el; }}
          geometry={rectGeo}
          position={[x, BUCKET_BASE + BUCKET_MAX / 2, 0]}
          scale={[1.5, BUCKET_MAX, 1]}
        >
          <lineBasicMaterial
            color={b === SAVINGS ? palette.teal : palette.cyan}
            transparent
            opacity={0}
          />
        </lineSegments>
      ))}
      <instancedMesh ref={fillRef} args={[null, null, BUCKET_X.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          roughness={0.35}
          metalness={0.3}
          transparent
          opacity={0}
        />
      </instancedMesh>
      <points ref={budgetRef} geometry={budgetGeo}>
        <pointsMaterial
          color={palette.teal}
          size={0.09}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * Beat 3 — Library platform: a live microservice mesh behind an auth gate.
 * ------------------------------------------------------------------ */

const ENTRY = new THREE.Vector3(-6.3, 0, 0.7);
const GATE = new THREE.Vector3(-2.8, 0, 0);
const SERVICE_NODES = [
  { pos: new THREE.Vector3(1.5, 2.6, -0.3), size: [1.5, 1.05, 1.0] },
  { pos: new THREE.Vector3(1.5, 0, 0.5), size: [1.6, 1.15, 1.05] },
  { pos: new THREE.Vector3(1.5, -2.6, -0.3), size: [1.5, 1.05, 1.0] },
];
const DB = new THREE.Vector3(5.3, 0, 0);
const AI_NODE = new THREE.Vector3(3.7, 4.5, -1.2);

function makePath(points) {
  const segs = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const dist = points[i].distanceTo(points[i + 1]);
    segs.push(dist);
    total += dist;
  }
  return { points, segs, total };
}

function samplePath(path, u, out) {
  const target = clamp(u) * path.total;
  let acc = 0;
  for (let i = 0; i < path.segs.length; i += 1) {
    if (acc + path.segs[i] >= target || i === path.segs.length - 1) {
      const k = path.segs[i] > 0 ? (target - acc) / path.segs[i] : 0;
      return out.lerpVectors(path.points[i], path.points[i + 1], clamp(k));
    }
    acc += path.segs[i];
  }
  return out.copy(path.points[path.points.length - 1]);
}

function useLibraryData() {
  return useMemo(() => {
    const rand = makeRandom(53);

    const edges = [
      [ENTRY, GATE],
      [GATE, SERVICE_NODES[0].pos],
      [GATE, SERVICE_NODES[1].pos],
      [GATE, SERVICE_NODES[2].pos],
      [SERVICE_NODES[0].pos, DB],
      [SERVICE_NODES[1].pos, DB],
      [SERVICE_NODES[2].pos, DB],
      [SERVICE_NODES[0].pos, AI_NODE],
    ];

    // entry -> gate -> service -> db -> service -> gate -> entry
    const routes = SERVICE_NODES.map((s) => makePath([
      ENTRY, GATE, s.pos, DB, s.pos, GATE, ENTRY,
    ]));
    const gateFraction = routes.map((r) => r.segs[0] / r.total);

    const requestCount = quality(170, 78);
    const requests = Array.from({ length: requestCount }, () => {
      const route = Math.floor(rand() * SERVICE_NODES.length);
      return {
        route,
        authorized: rand() > 0.24,
        offset: rand(),
        speed: 0.3 + rand() * 0.28,
        bounce: new THREE.Vector3(-7.4, (rand() - 0.5) * 4.4, (rand() - 0.5) * 1.6),
        jitter: (rand() - 0.5) * 0.5,
      };
    });

    return { edges, routes, gateFraction, requests };
  }, []);
}

function LibraryScene({ progressRef, activeBeat }) {
  const { edges, routes, gateFraction, requests } = useLibraryData();

  const groupRef = useRef();
  const edgeRef = useRef();
  const boundaryRef = useRef();
  const entryRef = useRef();
  const authRef = useRef();
  const gatePlaneRef = useRef();
  const serviceRef = useRef();
  const dbRef = useRef();
  const aiRef = useRef();
  const reqRef = useRef();

  const wRef = useRef(0);
  const smooth = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const scratch = useMemo(() => new THREE.Vector3(), []);
  const bounceFrom = useMemo(() => new THREE.Vector3(), []);
  const load = useMemo(() => new Float32Array(SERVICE_NODES.length), []);
  const gateHit = useRef(0);

  const edgeGeo = useMemo(() => segmentGeometry(edges), [edges]);
  const reqGeo = useMemo(
    () => withColors(emptyPositions(requests.length), requests.length),
    [requests.length]
  );

  const boundaryGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const arr = new Float32Array(CUBE_EDGES.length);
    for (let i = 0; i < arr.length; i += 3) {
      arr[i] = CUBE_EDGES[i] * 5.4;
      arr[i + 1] = CUBE_EDGES[i + 1] * 4.2;
      arr[i + 2] = CUBE_EDGES[i + 2] * 2.2;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return geo;
  }, []);

  useFrame((state, delta) => {
    const w = stepWeight(wRef, activeBeat === 3, delta);
    const t = state.clock.elapsedTime;
    smooth.current = damp(smooth.current, range(progressRef.current, 0.75, 1), 4.2, delta);
    if (!applyBeatGroup(groupRef.current, w, -1, Math.sin(t * 0.08) * 0.1)) return;

    const lp = smooth.current;
    const build = easeOut(range(lp, 0, 0.26));
    const wire = range(lp, 0.12, 0.45);
    const traffic = range(lp, 0.28, 0.8);
    const fanout = range(lp, 0.5, 1);

    load.fill(0);
    let hits = 0;

    if (reqRef.current) {
      const pos = reqGeo.attributes.position.array;
      const cAttr = reqGeo.attributes.color.array;
      for (let i = 0; i < requests.length; i += 1) {
        const r = requests[i];
        const path = routes[r.route];
        const u = (t * r.speed + r.offset) % 1;
        const live = range(traffic, r.offset * 0.4, 0.35 + r.offset * 0.4);
        let gain = live;

        if (r.authorized) {
          samplePath(path, u, scratch);
          const passed = u > gateFraction[r.route];
          col.copy(passed ? C.violet : C.slate);
          if (!passed) col.lerp(C.paper, 0.35);
          // Downstream legs only open up once the fan-out phase is in.
          if (passed) gain *= 0.35 + fanout * 0.65;
          const near = 1 - clamp(Math.abs(u - gateFraction[r.route]) * 22);
          if (near > 0) hits += near;
          if (u > gateFraction[r.route] && u < 0.62) {
            load[r.route] += 1 - clamp(Math.abs(u - 0.34) * 6);
          }
        } else {
          // Rejected: reaches the gate face, then kicks back out of the mesh.
          const gateFront = GATE.x - 0.85;
          if (u < 0.45) {
            const k = easeOut(u / 0.45);
            scratch.set(
              lerp(ENTRY.x, gateFront, k),
              lerp(ENTRY.y, GATE.y + r.jitter, k),
              lerp(ENTRY.z, GATE.z, k)
            );
            col.copy(C.slate).lerp(C.paper, 0.35);
          } else {
            const k = easeOut((u - 0.45) / 0.55);
            bounceFrom.set(gateFront, GATE.y + r.jitter, GATE.z);
            scratch.lerpVectors(bounceFrom, r.bounce, k);
            col.copy(C.coral);
            gain *= 1 - k;
          }
          const near = 1 - clamp(Math.abs(u - 0.45) * 16);
          if (near > 0) hits += near * 1.6;
        }

        pos[i * 3] = scratch.x;
        pos[i * 3 + 1] = scratch.y;
        pos[i * 3 + 2] = scratch.z;
        cAttr[i * 3] = col.r * gain;
        cAttr[i * 3 + 1] = col.g * gain;
        cAttr[i * 3 + 2] = col.b * gain;
      }
      reqGeo.attributes.position.needsUpdate = true;
      reqGeo.attributes.color.needsUpdate = true;
      reqRef.current.material.opacity = w * 0.95;
    }

    gateHit.current = damp(gateHit.current, clamp(hits / 6), 6, delta);

    if (boundaryRef.current) {
      boundaryRef.current.material.opacity = w * build * 0.12;
      boundaryRef.current.rotation.y = Math.sin(t * 0.12) * 0.02;
    }

    if (edgeRef.current) {
      const attr = edgeGeo.attributes.color;
      edges.forEach((_, i) => {
        const appear = easeOut(range(wire, i * 0.06, i * 0.06 + 0.5));
        const flow = 0.35 + Math.max(0, Math.sin(t * 1.4 - i * 0.6)) * 0.65;
        const downstream = i >= 4 ? 0.35 + fanout * 0.65 : 1;
        const base = i === 7 ? C.cyan : C.violet;
        paintSegment(attr, i, base, appear * flow * downstream * 0.5 * w);
      });
      attr.needsUpdate = true;
    }

    if (entryRef.current) {
      entryRef.current.scale.setScalar(build * (0.38 + Math.sin(t * 2) * 0.02));
      entryRef.current.rotation.set(0, t * 0.4, t * 0.2);
      entryRef.current.material.opacity = w;
    }

    if (authRef.current) {
      const s = build * (1 + gateHit.current * 0.06);
      authRef.current.scale.set(0.6 * s, 0.95 * s, 0.6 * s);
      authRef.current.rotation.y = t * 0.25;
      authRef.current.material.opacity = w;
    }
    if (gatePlaneRef.current) {
      gatePlaneRef.current.material.opacity = w * build * (0.05 + gateHit.current * 0.3);
      gatePlaneRef.current.scale.setScalar(build * (1 + gateHit.current * 0.05));
    }

    if (serviceRef.current) {
      SERVICE_NODES.forEach((s, i) => {
        const appear = easeOut(range(build, 0.2 + i * 0.1, 0.7 + i * 0.1));
        const hot = clamp(load[i] / 3);
        dummy.position.copy(s.pos);
        dummy.position.y += Math.sin(t * 0.7 + i * 1.4) * 0.055;
        dummy.rotation.set(0, Math.sin(t * 0.3 + i) * 0.14, 0);
        dummy.scale.set(
          s.size[0] * appear * (1 + hot * 0.05),
          s.size[1] * appear * (1 + hot * 0.05),
          s.size[2] * appear
        );
        dummy.updateMatrix();
        serviceRef.current.setMatrixAt(i, dummy.matrix);
        col.copy(C.slate).lerp(C.violet, 0.4 + hot * 0.6);
        serviceRef.current.setColorAt(i, col);
      });
      serviceRef.current.instanceMatrix.needsUpdate = true;
      if (serviceRef.current.instanceColor) serviceRef.current.instanceColor.needsUpdate = true;
      serviceRef.current.material.opacity = w;
    }

    if (dbRef.current) {
      const appear = easeOut(range(build, 0.35, 1));
      dbRef.current.scale.setScalar(appear);
      dbRef.current.rotation.y = t * 0.18;
      dbRef.current.children.forEach((disc, i) => {
        if (disc.material) disc.material.opacity = w * (0.55 + Math.max(0, Math.sin(t * 1.6 - i)) * 0.45);
      });
    }

    if (aiRef.current) {
      const appear = easeOut(range(fanout, 0.1, 0.7));
      aiRef.current.scale.setScalar(appear * (0.34 + Math.sin(t * 2.6) * 0.03));
      aiRef.current.rotation.set(t * 0.5, t * 0.7, 0);
      aiRef.current.material.opacity = w;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments ref={boundaryRef} geometry={boundaryGeo} position={[1.3, 0, 0]}>
        <lineBasicMaterial color={palette.violet} transparent opacity={0} />
      </lineSegments>

      <lineSegments ref={edgeRef} geometry={edgeGeo}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* client entry point */}
      <mesh ref={entryRef} position={ENTRY}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={palette.paper}
          emissive={palette.paper}
          emissiveIntensity={0.6}
          roughness={0.3}
          metalness={0.4}
          transparent
        />
      </mesh>

      {/* auth service + the gate face requests must clear */}
      <mesh ref={authRef} position={GATE}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={palette.violet}
          emissive={palette.violet}
          emissiveIntensity={0.7}
          roughness={0.3}
          metalness={0.4}
          transparent
        />
      </mesh>
      <mesh
        ref={gatePlaneRef}
        position={[GATE.x - 0.85, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[3.4, 5.4]} />
        <meshBasicMaterial
          color={palette.violet}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* catalog / checkout / notifications */}
      <instancedMesh ref={serviceRef} args={[null, null, SERVICE_NODES.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.35} metalness={0.4} transparent opacity={0} />
      </instancedMesh>

      {/* postgres */}
      <group ref={dbRef} position={DB}>
        {[-0.62, 0, 0.62].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <cylinderGeometry args={[0.85, 0.85, 0.4, 28, 1]} />
            <meshStandardMaterial
              color={palette.cyan}
              emissive={palette.cyan}
              emissiveIntensity={0.5}
              roughness={0.3}
              metalness={0.45}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* LangChain-assisted search, deliberately outside the cluster boundary */}
      <mesh ref={aiRef} position={AI_NODE}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={palette.cyan}
          emissive={palette.cyan}
          emissiveIntensity={1.2}
          roughness={0.25}
          metalness={0.35}
          transparent
        />
      </mesh>

      <points ref={reqRef} geometry={reqGeo}>
        <pointsMaterial
          vertexColors
          size={0.13}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * Stage — shared lighting rig plus the four beat groups.
 * ------------------------------------------------------------------ */

const LIGHT_RIGS = [
  [
    { p: [0, 0, 7], c: C.lime, i: 34 },
    { p: [-7, 3, 5], c: C.cyan, i: 20 },
    { p: [7, -2, 5], c: C.violet, i: 18 },
  ],
  [
    { p: [0, 1, 6], c: C.amber, i: 32 },
    { p: [-6, 4, 6], c: C.cyan, i: 22 },
    { p: [6, -3, 4], c: C.rose, i: 15 },
  ],
  [
    { p: [0, 2, 7], c: C.cyan, i: 34 },
    { p: [-6, -3, 5], c: C.teal, i: 20 },
    { p: [6, 4, 4], c: C.violet, i: 16 },
  ],
  [
    { p: [-5, 0, 6], c: C.violet, i: 30 },
    { p: [5, 1, 6], c: C.cyan, i: 22 },
    { p: [0, 5, 3], c: C.paper, i: 14 },
  ],
];

function AppliedStage({ progressRef, activeBeat }) {
  const lightRefs = useRef([]);
  const weights = useRef(new Float32Array(BEAT_COUNT));
  const mix = useMemo(() => new THREE.Color(), []);
  const tmp = useMemo(() => new THREE.Color(), []);

  // The rig itself cross-fades, so the lighting changes with the beat without
  // ever changing the light count (which would recompile every shader).
  useFrame((state, delta) => {
    let sum = 0;
    for (let i = 0; i < BEAT_COUNT; i += 1) {
      weights.current[i] = damp(weights.current[i], activeBeat === i ? 1 : 0, CROSSFADE, delta);
      sum += weights.current[i];
    }
    if (sum < 1e-4) return;

    for (let l = 0; l < 3; l += 1) {
      const light = lightRefs.current[l];
      if (!light) continue;
      let px = 0;
      let py = 0;
      let pz = 0;
      let intensity = 0;
      mix.setRGB(0, 0, 0);
      for (let i = 0; i < BEAT_COUNT; i += 1) {
        const k = weights.current[i] / sum;
        if (k < 1e-4) continue;
        const rig = LIGHT_RIGS[i][l];
        px += rig.p[0] * k;
        py += rig.p[1] * k;
        pz += rig.p[2] * k;
        intensity += rig.i * k;
        mix.add(tmp.copy(rig.c).multiplyScalar(k));
      }
      light.position.set(px, py, pz);
      light.intensity = intensity;
      light.color.copy(mix);
    }
  });

  return (
    <group>
      <ambientLight intensity={0.62} />
      {[0, 1, 2].map((i) => (
        <pointLight
          key={i}
          ref={(el) => { lightRefs.current[i] = el; }}
          position={LIGHT_RIGS[0][i].p}
          intensity={LIGHT_RIGS[0][i].i}
          color={palette.lime}
        />
      ))}

      <BookMatchScene progressRef={progressRef} activeBeat={activeBeat} />
      <WalnutScene progressRef={progressRef} activeBeat={activeBeat} />
      <BalanciFiScene progressRef={progressRef} activeBeat={activeBeat} />
      <LibraryScene progressRef={progressRef} activeBeat={activeBeat} />
    </group>
  );
}

const AppliedScene = () => {
  const { progressRef, activeBeat } = useSceneProgress();
  return (
    <SceneCanvas camera={{ position: [0, 0, 14], fov: 46 }}>
      <AppliedStage progressRef={progressRef} activeBeat={activeBeat} />
    </SceneCanvas>
  );
};

export default AppliedScene;
