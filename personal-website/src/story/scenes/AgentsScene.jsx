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
 * Agentic AI chapter — four projects, four sub-scenes, one canvas.
 *
 * `activeBeat` selects which sub-scene owns the screen; the other three stay
 * mounted but damp their weight to zero, which fades their materials, shrinks
 * their group and pushes them back in z. Chapter progress is global (0..1 over
 * all four beats) so each sub-scene remaps it to a local 0..1 with
 * `range(p, n / 4, (n + 1) / 4)`.
 */

const ACCENTS = [palette.rose, palette.cyan, palette.amber, palette.teal];

// Everything is authored inside this box, then uniformly scaled to fit the
// chapter's half-width column (which is taller than it is wide on desktop).
const DESIGN_W = 12.4;
const DESIGN_H = 9.4;

/* ------------------------------------------------------------------ utils */

function boxEdges(w, h, d) {
  const box = new THREE.BoxGeometry(w, h, d);
  const edges = new THREE.EdgesGeometry(box);
  box.dispose();
  return edges;
}

function rectEdges(w, h) {
  const hw = w / 2;
  const hh = h / 2;
  const corners = [
    [-hw, -hh],
    [hw, -hh],
    [hw, hh],
    [-hw, hh],
  ];
  const positions = new Float32Array(24);
  for (let i = 0; i < 4; i += 1) {
    const a = corners[i];
    const b = corners[(i + 1) % 4];
    positions.set([a[0], a[1], 0, b[0], b[1], 0], i * 6);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return geo;
}

const curveFrom = (points) =>
  new THREE.CatmullRomCurve3(points.map(([x, y, z = 0]) => new THREE.Vector3(x, y, z)));

/** Curves drawn as discrete segments so we can stay on <lineSegments>. */
function curveSegments(curve, divisions) {
  const pts = curve.getPoints(divisions);
  const positions = new Float32Array((pts.length - 1) * 6);
  for (let i = 0; i < pts.length - 1; i += 1) {
    const a = pts[i];
    const b = pts[i + 1];
    positions.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return geo;
}

function emptyPoints(count) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  return geo;
}

/**
 * Fold a sub-scene in or out. Returns the current weight; callers bail out of
 * their frame work entirely while the group is invisible.
 */
function stepWeight(groupRef, weightRef, isActive, delta) {
  const g = groupRef.current;
  if (!g) return 0;
  weightRef.current = damp(weightRef.current, isActive ? 1 : 0, 5.5, delta);
  const w = weightRef.current;
  g.visible = w > 0.005;
  if (!g.visible) return 0;
  g.scale.setScalar(0.86 + w * 0.14);
  g.position.z = (1 - w) * -3.2;
  return w;
}

/**
 * Materials tagged with `userData.base` hold a constant opacity, so the
 * cross-fade scales them here instead of in each animation block.
 */
function applyBaseFade(root, w) {
  root.traverse((object) => {
    const material = object.material;
    if (material && material.userData.base !== undefined) {
      material.opacity = material.userData.base * w;
    }
  });
}

/* ============================================================= beat 0 ==== */
/* MockMouse — a planner fans agents out; each agent drives its own sandboxed
   browser viewport, cursor clicks and all.                                  */

const SANDBOX = [3.05, 2.3, 1.05];
const BAR_ROWS = [
  { y: 0.3, w: 1.5 },
  { y: 0.02, w: 1.95 },
  { y: -0.26, w: 1.1 },
];

function MockMouseScene({ progressRef, beatRef }) {
  const agentCount = quality(4, 3);

  const agents = useMemo(() => {
    const slots =
      agentCount >= 4
        ? [
            [-3.95, 2.25],
            [3.95, 2.25],
            [-3.95, -2.25],
            [3.95, -2.25],
          ]
        : [
            [-3.55, 2.1],
            [3.55, 2.1],
            [0, -2.6],
          ];
    const rand = makeRandom(11);
    return slots.slice(0, agentCount).map(([x, y], i) => {
      const pos = new THREE.Vector3(x, y, -0.5 + (i % 2) * 0.3);
      // The agent "brain" sits just outside the sandbox, on the planner side.
      const node = new THREE.Vector3(x, y, pos.z + 0.3).addScaledVector(
        new THREE.Vector3(-x, -y, 0).normalize(),
        1.95
      );
      return {
        pos,
        node,
        delay: i * 0.1,
        speed: 0.15 + rand() * 0.07,
        offset: rand(),
        waypoints: Array.from(
          { length: 4 },
          () => new THREE.Vector2((rand() - 0.5) * 1.9, (rand() - 0.5) * 0.95)
        ),
      };
    });
  }, [agentCount]);

  const groupRef = useRef();
  const weight = useRef(0);
  const plannerRef = useRef();
  const shellRef = useRef();
  const spokeRef = useRef();
  const brainRef = useRef();
  const barsRef = useRef();
  const taskRef = useRef();
  const sandboxRefs = useRef([]);
  const cursorRefs = useRef([]);
  const rippleRefs = useRef([]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const spawn = useMemo(() => new Float32Array(agents.length), [agents.length]);

  const spokeGeometry = useMemo(() => {
    const positions = new Float32Array(agents.length * 6);
    agents.forEach(({ node }, i) => {
      positions.set([0, 0, 0, node.x, node.y, node.z], i * 6);
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [agents]);

  const sandboxGeometry = useMemo(() => boxEdges(...SANDBOX), []);

  const taskCount = agents.length * 6;
  const taskGeometry = useMemo(() => emptyPoints(taskCount), [taskCount]);
  const taskRoutes = useMemo(() => {
    const rand = makeRandom(23);
    return Array.from({ length: taskCount }, (_, i) => ({
      agent: i % agents.length,
      offset: rand(),
      speed: 0.4 + rand() * 0.35,
      arc: (rand() - 0.5) * 0.7,
    }));
  }, [taskCount, agents.length]);

  const accent = useMemo(() => new THREE.Color(palette.rose), []);
  const paper = useMemo(() => new THREE.Color(palette.paper), []);
  const scratch = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    const f = stepWeight(groupRef, weight, beatRef.current === 0, delta);
    if (!f) return;
    applyBaseFade(groupRef.current, f);

    const t = state.clock.elapsedTime;
    const lp = range(progressRef.current, 0, 0.25);
    const plannerPhase = easeOut(range(lp, 0, 0.28));
    const workPhase = range(lp, 0.4, 0.85);

    if (plannerRef.current) {
      const beat = 1 + Math.sin(t * 2.1) * 0.06;
      plannerRef.current.scale.setScalar(plannerPhase * 0.62 * beat);
      plannerRef.current.rotation.y = t * 0.5;
      plannerRef.current.material.emissiveIntensity = 0.9 + workPhase * 0.8;
    }
    if (shellRef.current) {
      shellRef.current.scale.setScalar(plannerPhase * (1.05 + Math.sin(t * 0.9) * 0.04));
      shellRef.current.rotation.set(t * 0.18, t * 0.31, 0);
      shellRef.current.material.opacity = 0.34 * plannerPhase * f;
    }
    if (spokeRef.current) spokeRef.current.material.opacity = 0.3 * plannerPhase * f;

    agents.forEach((agent, i) => {
      spawn[i] = easeOut(range(lp, 0.14 + agent.delay, 0.14 + agent.delay + 0.4));
    });

    if (brainRef.current) {
      agents.forEach((agent, i) => {
        const pulse = 0.5 + 0.5 * Math.sin(t * 3 + i * 1.9);
        dummy.position.copy(agent.node);
        dummy.scale.setScalar((0.2 + pulse * 0.05) * spawn[i]);
        dummy.rotation.set(t * 0.6 + i, t * 0.4, 0);
        dummy.updateMatrix();
        brainRef.current.setMatrixAt(i, dummy.matrix);
      });
      brainRef.current.instanceMatrix.needsUpdate = true;
    }

    sandboxRefs.current.forEach((group, i) => {
      if (!group) return;
      const s = spawn[i];
      group.visible = s > 0.01;
      group.scale.setScalar(s);
      group.position.y = agents[i].pos.y + Math.sin(t * 0.7 + i * 1.3) * 0.06;
      group.rotation.y = Math.sin(t * 0.35 + i) * 0.05;
    });

    if (barsRef.current) {
      agents.forEach((agent, a) => {
        const s = spawn[a];
        BAR_ROWS.forEach((row, r) => {
          // Bars fill and drain like a page repainting under the agent.
          const fill = 0.28 + 0.72 * (0.5 + 0.5 * Math.sin(t * 1.7 + a * 1.9 + r * 2.3));
          const w = row.w * lerp(1, fill, workPhase);
          dummy.position.set(
            agent.pos.x + (-1.05 + w / 2) * s,
            agent.pos.y + row.y * s,
            agent.pos.z + 0.16 * s
          );
          dummy.rotation.set(0, 0, 0);
          dummy.scale.set(Math.max(0.001, w * s), 0.1 * s, 1);
          dummy.updateMatrix();
          barsRef.current.setMatrixAt(a * BAR_ROWS.length + r, dummy.matrix);
          scratch.copy(paper).lerp(accent, r === 0 ? 0.6 : 0.15);
          barsRef.current.setColorAt(a * BAR_ROWS.length + r, scratch);
        });
      });
      barsRef.current.instanceMatrix.needsUpdate = true;
      if (barsRef.current.instanceColor) barsRef.current.instanceColor.needsUpdate = true;
      barsRef.current.material.opacity = 0.5 * f;
    }

    agents.forEach((agent, i) => {
      const cursor = cursorRefs.current[i];
      const ripple = rippleRefs.current[i];
      const cycle = (t * agent.speed + agent.offset) % 1;
      const seg = Math.floor(cycle * agent.waypoints.length);
      const k = cycle * agent.waypoints.length - seg;
      const from = agent.waypoints[seg];
      const to = agent.waypoints[(seg + 1) % agent.waypoints.length];
      const ease = easeInOut(k);

      if (cursor) {
        cursor.position.set(
          lerp(from.x, to.x, ease),
          lerp(from.y, to.y, ease) + Math.sin(k * Math.PI) * 0.06,
          0.22
        );
        cursor.rotation.z = -0.42 + Math.sin(k * Math.PI * 2) * 0.05;
        cursor.material.opacity = workPhase * f;
      }
      if (ripple) {
        // Each segment starts on an arrival, so the click lands at `from`.
        const hit = range(k, 0, 0.3);
        ripple.position.set(from.x, from.y, 0.2);
        ripple.scale.setScalar(0.08 + hit * 0.42);
        ripple.material.opacity = (1 - hit) * 0.85 * workPhase * f;
      }
    });

    if (taskRef.current) {
      const pos = taskGeometry.attributes.position.array;
      const col = taskGeometry.attributes.color.array;
      for (let i = 0; i < taskRoutes.length; i += 1) {
        const route = taskRoutes[i];
        const agent = agents[route.agent];
        const travel = (t * route.speed + route.offset) % 1;
        const s = spawn[route.agent] * workPhase;
        const bow = Math.sin(travel * Math.PI) * route.arc;
        pos[i * 3] = lerp(0, agent.node.x, travel) * s;
        pos[i * 3 + 1] = (lerp(0, agent.node.y, travel) + bow) * s;
        pos[i * 3 + 2] = lerp(0, agent.node.z, travel) * s;
        const a = Math.sin(travel * Math.PI) * s * f;
        col[i * 3] = accent.r * a;
        col[i * 3 + 1] = accent.g * a;
        col[i * 3 + 2] = accent.b * a;
      }
      taskGeometry.attributes.position.needsUpdate = true;
      taskGeometry.attributes.color.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* planner */}
      <mesh ref={plannerRef}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={palette.rose}
          emissive={palette.rose}
          emissiveIntensity={1}
          roughness={0.25}
          metalness={0.35}
          transparent
          userData={{ base: 1 }}
        />
      </mesh>
      <mesh ref={shellRef}>
        <icosahedronGeometry args={[1.35, 1]} />
        <meshBasicMaterial color={palette.rose} wireframe transparent opacity={0} />
      </mesh>

      <lineSegments ref={spokeRef} geometry={spokeGeometry}>
        <lineBasicMaterial color={palette.rose} transparent opacity={0} />
      </lineSegments>

      {/* agent brains */}
      <instancedMesh ref={brainRef} args={[null, null, agents.length]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={palette.rose}
          emissive={palette.rose}
          emissiveIntensity={0.9}
          roughness={0.3}
          transparent
          userData={{ base: 1 }}
        />
      </instancedMesh>

      {agents.map((agent, i) => (
        <group
          key={i}
          position={[agent.pos.x, agent.pos.y, agent.pos.z]}
          ref={(el) => {
            sandboxRefs.current[i] = el;
          }}
        >
          {/* the sandbox each agent is confined to */}
          <lineSegments geometry={sandboxGeometry}>
            <lineBasicMaterial
              color={palette.rose}
              transparent
              opacity={0.4}
              userData={{ base: 0.4 }}
            />
          </lineSegments>
          <mesh>
            <boxGeometry args={SANDBOX} />
            <meshBasicMaterial
              color={palette.rose}
              transparent
              opacity={0.045}
              side={THREE.BackSide}
              depthWrite={false}
              userData={{ base: 0.045 }}
            />
          </mesh>

          {/* browser viewport */}
          <mesh position={[0, -0.02, 0.1]}>
            <planeGeometry args={[2.62, 1.7]} />
            <meshBasicMaterial
              color={palette.rose}
              transparent
              opacity={0.2}
              userData={{ base: 0.2 }}
            />
          </mesh>
          <mesh position={[0, -0.02, 0.12]}>
            <planeGeometry args={[2.5, 1.58]} />
            <meshBasicMaterial
              color={palette.ink}
              transparent
              opacity={0.72}
              userData={{ base: 0.72 }}
            />
          </mesh>
          <mesh position={[0, 0.68, 0.14]}>
            <planeGeometry args={[2.5, 0.18]} />
            <meshBasicMaterial
              color={palette.rose}
              transparent
              opacity={0.42}
              userData={{ base: 0.42 }}
            />
          </mesh>

          <mesh
            ref={(el) => {
              cursorRefs.current[i] = el;
            }}
            rotation={[0, 0, -0.42]}
          >
            <coneGeometry args={[0.075, 0.22, 3]} />
            <meshBasicMaterial color={palette.paper} transparent opacity={0} />
          </mesh>
          <mesh
            ref={(el) => {
              rippleRefs.current[i] = el;
            }}
          >
            <ringGeometry args={[0.72, 1, 24]} />
            <meshBasicMaterial
              color={palette.rose}
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      ))}

      {/* viewport UI bars, instanced across every agent */}
      <instancedMesh ref={barsRef} args={[null, null, agents.length * BAR_ROWS.length]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </instancedMesh>

      {/* task hand-offs from planner to agents */}
      <points ref={taskRef} geometry={taskGeometry}>
        <pointsMaterial
          size={0.12}
          sizeAttenuation
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

/* ============================================================= beat 1 ==== */
/* Déjà Query — the cold lane detours through the LLM compiler and burns
   tokens; the warm lane goes straight through the template cache for free.  */

const COLD_ROUTE = [
  [-5.15, 0.35, 0],
  [-4.75, 1.9, 0.25],
  [-3.3, 2.85, 0.1],
  [-1.3, 3.0, 0],
  [0.6, 2.9, 0],
  [1.95, 2.35, -0.1],
  [2.55, 1.5, 0],
  [2.45, 1.05, 0],
  [3.35, 0.35, 0],
  [4.7, 0.1, 0],
];
const WARM_ROUTE = [
  [-5.15, 0.35, 0],
  [-1.4, 0.15, 0],
  [2.45, 0.05, 0],
  [3.35, 0.35, 0],
  [4.7, 0.1, 0],
];
const COMPILER_AT = [-0.35, 2.95, 0];
const SHELF_AT = [2.45, 0.3, 0];
const SLOT_COUNT = 4;
const COST_STEPS = 10;
const COLD_PERIOD = 5.4;
const WARM_PERIOD = 1.6;
// Arc-length landmarks: where the shelf sits on each route, and the stretch of
// the cold route that runs through the compiler block.
const DEPOSIT_U = 0.803;
const MATCH_U = 0.765;
const COMPILER_IN = 0.394;
const COMPILER_OUT = 0.597;

function DejaQueryScene({ progressRef, beatRef }) {
  const groupRef = useRef();
  const weight = useRef(0);

  const coldCurve = useMemo(() => curveFrom(COLD_ROUTE), []);
  const warmCurve = useMemo(() => curveFrom(WARM_ROUTE), []);
  const coldTrack = useMemo(() => curveSegments(coldCurve, 140), [coldCurve]);
  const warmTrack = useMemo(() => curveSegments(warmCurve, 90), [warmCurve]);
  const compilerEdges = useMemo(() => boxEdges(2.6, 1.7, 1.3), []);
  const shelfFrame = useMemo(() => rectEdges(1.15, 2.25), []);

  const warmCount = quality(4, 3);
  const tokenCount = quality(150, 70);

  const tokens = useMemo(() => {
    const rand = makeRandom(53);
    const scratchVec = new THREE.Vector3();
    return Array.from({ length: tokenCount }, () => {
      // Most tokens burn inside the compiler; the rest trickle along the route.
      const u =
        rand() < 0.55
          ? COMPILER_IN + rand() * (COMPILER_OUT - COMPILER_IN)
          : 0.08 + rand() * 0.64;
      coldCurve.getPointAt(u, scratchVec);
      return {
        u,
        origin: scratchVec.clone(),
        drift: new THREE.Vector3((rand() - 0.5) * 1.5, 0.45 + rand() * 1.15, (rand() - 0.5) * 1.1),
        life: 0.15 + rand() * 0.12,
        spin: rand() * 10,
      };
    });
  }, [tokenCount, coldCurve]);

  const tokenGeometry = useMemo(() => emptyPoints(tokenCount), [tokenCount]);

  const coldTrackRef = useRef();
  const warmTrackRef = useRef();
  const compilerRef = useRef();
  const compilerCoreRef = useRef();
  const compilerEdgeRef = useRef();
  const entryRef = useRef();
  const packetRef = useRef();
  const crystalRef = useRef();
  const warmRef = useRef();
  const shelfRef = useRef();
  const slotRefs = useRef([]);
  const answerRef = useRef();
  const costRef = useRef();
  const tokenRef = useRef();

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const amber = useMemo(() => new THREE.Color(palette.amber), []);
  const coral = useMemo(() => new THREE.Color(palette.coral), []);
  const teal = useMemo(() => new THREE.Color(palette.teal), []);
  const slate = useMemo(() => new THREE.Color(palette.slate), []);
  const scratch = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    const f = stepWeight(groupRef, weight, beatRef.current === 1, delta);
    if (!f) return;
    applyBaseFade(groupRef.current, f);

    const t = state.clock.elapsedTime;
    const lp = range(progressRef.current, 0.25, 0.5);

    const compilerOn = easeOut(range(lp, 0.04, 0.3));
    const shelfOn = easeOut(range(lp, 0.18, 0.44));
    const warmOn = easeOut(range(lp, 0.48, 0.68));
    const coldOn = range(lp, 0.02, 0.14) * lerp(1, 0.14, range(lp, 0.55, 0.78));
    const costLevel = lerp(1, 0.08, easeInOut(range(lp, 0.5, 0.8)));

    const coldU = (t / COLD_PERIOD) % 1;
    // Compiled template pops out after the compiler, drops into a shelf slot.
    const crystal =
      range(coldU, COMPILER_OUT - 0.05, COMPILER_OUT + 0.06) *
      (1 - range(coldU, DEPOSIT_U, DEPOSIT_U + 0.05));
    const deposit =
      range(coldU, DEPOSIT_U - 0.03, DEPOSIT_U) * (1 - range(coldU, DEPOSIT_U, DEPOSIT_U + 0.14));

    if (coldTrackRef.current) coldTrackRef.current.material.opacity = (0.12 + coldOn * 0.22) * f;
    if (warmTrackRef.current) warmTrackRef.current.material.opacity = (0.08 + warmOn * 0.7) * f;

    if (entryRef.current) {
      entryRef.current.rotation.y = t * 0.8;
      entryRef.current.scale.setScalar(0.34 * easeOut(range(lp, 0, 0.14)));
      entryRef.current.material.opacity = f;
    }

    if (compilerRef.current) {
      const burn =
        coldOn *
        (0.5 + 0.5 * Math.sin(t * 5.5)) *
        range(coldU, COMPILER_IN - 0.04, COMPILER_IN + 0.04) *
        (1 - range(coldU, COMPILER_OUT - 0.03, COMPILER_OUT + 0.05));
      compilerRef.current.material.opacity = (0.06 + compilerOn * 0.1 + burn * 0.22) * f;
      compilerRef.current.scale.setScalar(0.7 + compilerOn * 0.3 + burn * 0.05);
    }
    if (compilerEdgeRef.current) compilerEdgeRef.current.material.opacity = compilerOn * 0.55 * f;
    if (compilerCoreRef.current) {
      compilerCoreRef.current.rotation.set(t * 0.5, t * 0.9, 0);
      compilerCoreRef.current.scale.setScalar(compilerOn * (0.55 + Math.sin(t * 3) * 0.04));
      compilerCoreRef.current.material.opacity = compilerOn * 0.75 * f;
    }

    if (packetRef.current) {
      coldCurve.getPointAt(coldU, pos);
      packetRef.current.position.copy(pos);
      packetRef.current.scale.setScalar(0.2 * (1 - crystal));
      packetRef.current.material.opacity = coldOn * f;
    }
    if (crystalRef.current) {
      coldCurve.getPointAt(coldU, pos);
      crystalRef.current.position.copy(pos);
      crystalRef.current.rotation.set(t * 1.1, t * 1.6, 0);
      crystalRef.current.scale.setScalar(0.3 * crystal);
      crystalRef.current.material.opacity = coldOn * f;
    }

    // Warm lane: a burst of repeat queries, each slot-filled at the cache.
    let matchFlash = 0;
    if (warmRef.current) {
      for (let i = 0; i < warmCount; i += 1) {
        const u = (t / WARM_PERIOD + i / warmCount) % 1;
        const hit = range(u, MATCH_U - 0.04, MATCH_U) * (1 - range(u, MATCH_U, MATCH_U + 0.06));
        matchFlash = Math.max(matchFlash, hit);
        warmCurve.getPointAt(u, pos);
        dummy.position.copy(pos);
        dummy.rotation.set(0, t * 2 + i, t * 1.4);
        dummy.scale.setScalar((0.17 + hit * 0.12) * warmOn);
        dummy.updateMatrix();
        warmRef.current.setMatrixAt(i, dummy.matrix);
      }
      warmRef.current.instanceMatrix.needsUpdate = true;
      warmRef.current.material.opacity = warmOn * f;
    }

    if (shelfRef.current) shelfRef.current.material.opacity = shelfOn * 0.5 * f;
    slotRefs.current.forEach((slot, i) => {
      if (!slot) return;
      const fill = easeOut(range(lp, 0.2 + i * 0.07, 0.2 + i * 0.07 + 0.2));
      // Top slot takes cold deposits, slot 1 is the one the warm path matches.
      const flash = i === SLOT_COUNT - 1 ? deposit : i === 1 ? matchFlash : 0;
      slot.scale.set(1, lerp(0.2, 1, fill) * (1 + flash * 0.25), 1);
      slot.material.opacity = (0.12 + fill * 0.45 + flash * 0.5) * f;
      slot.material.color.copy(slate).lerp(teal, clamp(fill * 0.7 + flash));
    });

    if (answerRef.current) {
      const arrival = Math.max(
        range(coldU, 0.95, 1) * coldOn,
        matchFlash * warmOn
      );
      answerRef.current.rotation.y = t * 0.6;
      answerRef.current.scale.setScalar(easeOut(range(lp, 0.1, 0.35)) * (0.4 + arrival * 0.1));
      answerRef.current.material.emissiveIntensity = 0.6 + arrival * 2.2 + warmOn * 0.5;
    }

    if (costRef.current) {
      for (let i = 0; i < COST_STEPS; i += 1) {
        const lit = clamp(costLevel * COST_STEPS - i);
        dummy.position.set(4.7, -0.68 - i * 0.26, 0);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(0.62, 0.15, 0.28);
        dummy.updateMatrix();
        costRef.current.setMatrixAt(i, dummy.matrix);
        scratch.copy(teal).lerp(amber, i / (COST_STEPS - 1));
        scratch.multiplyScalar(0.1 + lit * 0.9);
        costRef.current.setColorAt(i, scratch);
      }
      costRef.current.instanceMatrix.needsUpdate = true;
      if (costRef.current.instanceColor) costRef.current.instanceColor.needsUpdate = true;
      costRef.current.material.opacity = easeOut(range(lp, 0.12, 0.34)) * f;
    }

    if (tokenRef.current) {
      const parr = tokenGeometry.attributes.position.array;
      const carr = tokenGeometry.attributes.color.array;
      for (let i = 0; i < tokens.length; i += 1) {
        const tk = tokens[i];
        // Tokens combust as the cold packet sweeps past their emission point.
        let d = coldU - tk.u;
        if (d < 0) d += 1;
        const age = d / tk.life;
        const alive = age < 1 ? 1 - age : 0;
        const a = alive * alive * coldOn * f;
        parr[i * 3] = tk.origin.x + tk.drift.x * age * 1.2 + Math.sin(t * 2.4 + tk.spin) * 0.05;
        parr[i * 3 + 1] = tk.origin.y + tk.drift.y * age * 1.2;
        parr[i * 3 + 2] = tk.origin.z + tk.drift.z * age * 1.2;
        scratch.copy(amber).lerp(coral, age).multiplyScalar(a);
        carr[i * 3] = scratch.r;
        carr[i * 3 + 1] = scratch.g;
        carr[i * 3 + 2] = scratch.b;
      }
      tokenGeometry.attributes.position.needsUpdate = true;
      tokenGeometry.attributes.color.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments ref={coldTrackRef} geometry={coldTrack}>
        <lineBasicMaterial color={palette.slate} transparent opacity={0} />
      </lineSegments>
      <lineSegments ref={warmTrackRef} geometry={warmTrack}>
        <lineBasicMaterial
          color={palette.cyan}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* incoming question */}
      <mesh ref={entryRef} position={[-5.15, 0.35, 0]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={palette.cyan}
          emissive={palette.cyan}
          emissiveIntensity={1.1}
          roughness={0.3}
          transparent
          opacity={0}
        />
      </mesh>

      {/* LLM compiler — the expensive part of the cold path */}
      <group position={COMPILER_AT}>
        <mesh ref={compilerRef}>
          <boxGeometry args={[2.6, 1.7, 1.3]} />
          <meshBasicMaterial
            color={palette.violet}
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <lineSegments ref={compilerEdgeRef} geometry={compilerEdges}>
          <lineBasicMaterial color={palette.cyan} transparent opacity={0} />
        </lineSegments>
        <mesh ref={compilerCoreRef}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color={palette.violet} wireframe transparent opacity={0} />
        </mesh>
      </group>

      {/* cold packet, then the template it compiles into */}
      <mesh ref={packetRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={palette.cyan}
          emissive={palette.cyan}
          emissiveIntensity={1.3}
          roughness={0.25}
          transparent
          opacity={0}
        />
      </mesh>
      <mesh ref={crystalRef}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={palette.teal}
          emissive={palette.teal}
          emissiveIntensity={1.4}
          roughness={0.15}
          metalness={0.5}
          transparent
          opacity={0}
        />
      </mesh>

      {/* warm queries */}
      <instancedMesh ref={warmRef} args={[null, null, warmCount]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={palette.cyan}
          emissive={palette.cyan}
          emissiveIntensity={1.6}
          roughness={0.2}
          transparent
          opacity={0}
        />
      </instancedMesh>

      {/* template cache */}
      <group position={SHELF_AT}>
        <lineSegments ref={shelfRef} geometry={shelfFrame}>
          <lineBasicMaterial color={palette.cyan} transparent opacity={0} />
        </lineSegments>
        {Array.from({ length: SLOT_COUNT }).map((_, i) => (
          <mesh
            key={i}
            position={[0, (i - (SLOT_COUNT - 1) / 2) * 0.5, 0]}
            ref={(el) => {
              slotRefs.current[i] = el;
            }}
          >
            <boxGeometry args={[0.78, 0.34, 0.34]} />
            <meshBasicMaterial color={palette.slate} transparent opacity={0} />
          </mesh>
        ))}
      </group>

      {/* answer */}
      <mesh ref={answerRef} position={[4.7, 0.1, 0]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={palette.teal}
          emissive={palette.teal}
          emissiveIntensity={1}
          roughness={0.2}
          metalness={0.4}
          transparent
          userData={{ base: 1 }}
        />
      </mesh>

      {/* token cost gauge, collapsing as the warm path takes over */}
      <instancedMesh ref={costRef} args={[null, null, COST_STEPS]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </instancedMesh>

      {/* tokens burnt on the cold path */}
      <points ref={tokenRef} geometry={tokenGeometry}>
        <pointsMaterial
          size={0.1}
          sizeAttenuation
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

/* ============================================================= beat 2 ==== */
/* Signal Room — persistent graph memory, agents traversing it, an event bus
   underneath, and a human approval gate that visibly holds traffic.         */

const GATE_X = 3.55;
const GATE_Y = 0.15;
const OUTPUT_AT = [5.25, 0.15, 0];
const GATE_PERIOD = 5.6;
const SR_AGENTS = 3;

function SignalRoomScene({ progressRef, beatRef }) {
  const nodeCount = quality(22, 14);
  const intakeCount = quality(60, 30);
  const busCount = quality(16, 10);
  const packetCount = quality(5, 4);

  const graph = useMemo(() => {
    const rand = makeRandom(97);
    const nodes = Array.from({ length: nodeCount }, () => {
      const a = rand() * Math.PI * 2;
      const r = 0.55 + Math.sqrt(rand()) * 2.55;
      return new THREE.Vector3(
        -2.2 + Math.cos(a) * r * 1.15,
        0.7 + Math.sin(a) * r * 0.85,
        (rand() - 0.5) * 1.8
      );
    });

    const edges = [];
    nodes.forEach((node, i) => {
      nodes
        .map((other, j) => ({ j, d: node.distanceTo(other) }))
        .filter((n) => n.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2)
        .forEach(({ j }) => {
          if (j > i) edges.push([i, j]);
        });
    });

    const adjacency = nodes.map(() => []);
    edges.forEach(([a, b]) => {
      adjacency[a].push(b);
      adjacency[b].push(a);
    });

    // Ping-pong walks so an agent always travels along a real edge, including
    // when the loop wraps.
    const walks = Array.from({ length: SR_AGENTS }, (_, k) => {
      const walkRand = makeRandom(131 + k * 29);
      let cur = Math.floor(walkRand() * nodes.length) % nodes.length;
      let prev = -1;
      const walk = [cur];
      for (let s = 0; s < 9; s += 1) {
        const all = adjacency[cur];
        if (!all.length) break;
        // Avoid immediate backtracking so agents cover more of the graph.
        const nb = all.length > 1 ? all.filter((n) => n !== prev) : all;
        const next = nb[Math.floor(walkRand() * nb.length) % nb.length];
        prev = cur;
        cur = next;
        walk.push(cur);
      }
      if (walk.length < 2) walk.push((walk[0] + 1) % nodes.length);
      return walk.concat(walk.slice(0, -1).reverse());
    });

    let exit = 0;
    nodes.forEach((n, i) => {
      if (n.x > nodes[exit].x) exit = i;
    });

    return { nodes, edges, walks, exit };
  }, [nodeCount]);

  const intake = useMemo(() => {
    const rand = makeRandom(211);
    return Array.from({ length: intakeCount }, () => ({
      origin: new THREE.Vector3(-6.2 + rand() * 8.4, 5.4 + rand() * 1.6, (rand() - 0.5) * 2.4),
      target: Math.floor(rand() * nodeCount) % nodeCount,
      offset: rand(),
      speed: 0.18 + rand() * 0.22,
    }));
  }, [intakeCount, nodeCount]);

  const groupRef = useRef();
  const weight = useRef(0);
  const nodeRef = useRef();
  const edgeRef = useRef();
  const agentRef = useRef();
  const intakeRef = useRef();
  const busRef = useRef();
  const railRef = useRef();
  const linkRef = useRef();
  const frameRef = useRef();
  const barrierRef = useRef();
  const approvalRef = useRef();
  const pulseRef = useRef();
  const packetRef = useRef();
  const outputRef = useRef();

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const amber = useMemo(() => new THREE.Color(palette.amber), []);
  const lime = useMemo(() => new THREE.Color(palette.lime), []);
  const slate = useMemo(() => new THREE.Color(palette.slate), []);
  const scratch = useMemo(() => new THREE.Color(), []);
  const reveal = useMemo(() => new Float32Array(nodeCount), [nodeCount]);

  const edgeGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(graph.edges.length * 6);
    graph.edges.forEach(([a, b], i) => {
      const na = graph.nodes[a];
      const nb = graph.nodes[b];
      positions.set([na.x, na.y, na.z, nb.x, nb.y, nb.z], i * 6);
    });
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(graph.edges.length * 6), 3));
    return geo;
  }, [graph]);

  const intakeGeometry = useMemo(() => emptyPoints(intakeCount), [intakeCount]);

  const railGeometry = useMemo(() => {
    const positions = new Float32Array([
      -5.4, -2.44, 0, 2.95, -2.44, 0,
      -5.4, -2.74, 0, 2.95, -2.74, 0,
    ]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  const linkGeometry = useMemo(() => {
    const rand = makeRandom(313);
    const picks = Array.from({ length: 3 }, () => Math.floor(rand() * graph.nodes.length));
    const positions = new Float32Array((picks.length + 1) * 6);
    picks.forEach((p, i) => {
      const n = graph.nodes[p];
      positions.set([n.x, n.y, n.z, n.x, -2.44, 0], i * 6);
    });
    positions.set([2.95, -2.59, 0, GATE_X - 0.6, GATE_Y - 1.05, 0], picks.length * 6);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [graph]);

  const gateFrame = useMemo(() => rectEdges(1.3, 2.4), []);

  useFrame((state, delta) => {
    const f = stepWeight(groupRef, weight, beatRef.current === 2, delta);
    if (!f) return;
    applyBaseFade(groupRef.current, f);

    const t = state.clock.elapsedTime;
    const lp = range(progressRef.current, 0.5, 0.75);

    const build = range(lp, 0, 0.5);
    const edgeOn = range(lp, 0.1, 0.55);
    const agentOn = easeOut(range(lp, 0.2, 0.5));
    const intakeOn = range(lp, 0.14, 0.5);
    const busOn = range(lp, 0.3, 0.62);
    const gateOn = easeOut(range(lp, 0.42, 0.74));

    // Memory accumulates: nodes latch on one after another and stay.
    for (let i = 0; i < nodeCount; i += 1) {
      const start = (i / nodeCount) * 0.72;
      reveal[i] = easeOut(range(build, start, start + 0.3));
    }

    if (nodeRef.current) {
      graph.nodes.forEach((n, i) => {
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.6 + i * 0.9);
        dummy.position.copy(n);
        dummy.position.y += Math.sin(t * 0.5 + i) * 0.05;
        dummy.scale.setScalar((0.15 + pulse * 0.03) * reveal[i]);
        dummy.rotation.set(0, t * 0.25 + i, 0);
        dummy.updateMatrix();
        nodeRef.current.setMatrixAt(i, dummy.matrix);
        scratch.copy(slate).lerp(amber, 0.35 + pulse * 0.4);
        nodeRef.current.setColorAt(i, scratch);
      });
      nodeRef.current.instanceMatrix.needsUpdate = true;
      if (nodeRef.current.instanceColor) nodeRef.current.instanceColor.needsUpdate = true;
    }

    if (edgeRef.current) {
      const carr = edgeGeometry.attributes.color.array;
      graph.edges.forEach(([a, b], i) => {
        const alpha = Math.min(reveal[a], reveal[b]) * edgeOn * 0.5 * f;
        scratch.copy(amber).multiplyScalar(alpha);
        for (let v = 0; v < 2; v += 1) {
          carr[i * 6 + v * 3] = scratch.r;
          carr[i * 6 + v * 3 + 1] = scratch.g;
          carr[i * 6 + v * 3 + 2] = scratch.b;
        }
      });
      edgeGeometry.attributes.color.needsUpdate = true;
    }

    if (agentRef.current) {
      graph.walks.forEach((walk, k) => {
        const steps = walk.length - 1;
        const cycle = (t * 0.16 + k * 0.31) % 1;
        const seg = Math.min(steps - 1, Math.floor(cycle * steps));
        const kk = easeInOut(cycle * steps - seg);
        const a = graph.nodes[walk[seg]];
        const b = graph.nodes[walk[seg + 1]];
        dummy.position.set(lerp(a.x, b.x, kk), lerp(a.y, b.y, kk), lerp(a.z, b.z, kk) + 0.25);
        dummy.rotation.set(t * 0.9 + k, t * 1.3, 0);
        dummy.scale.setScalar(0.27 * agentOn);
        dummy.updateMatrix();
        agentRef.current.setMatrixAt(k, dummy.matrix);
      });
      agentRef.current.instanceMatrix.needsUpdate = true;
    }

    if (intakeRef.current) {
      const parr = intakeGeometry.attributes.position.array;
      const carr = intakeGeometry.attributes.color.array;
      for (let i = 0; i < intake.length; i += 1) {
        const item = intake[i];
        const travel = (t * item.speed + item.offset) % 1;
        const node = graph.nodes[item.target];
        const e = easeInOut(travel);
        parr[i * 3] = lerp(item.origin.x, node.x, e);
        parr[i * 3 + 1] = lerp(item.origin.y, node.y, e);
        parr[i * 3 + 2] = lerp(item.origin.z, node.z, e);
        const a = Math.sin(travel * Math.PI) * intakeOn * reveal[item.target] * f;
        carr[i * 3] = amber.r * a;
        carr[i * 3 + 1] = amber.g * a;
        carr[i * 3 + 2] = amber.b * a;
      }
      intakeGeometry.attributes.position.needsUpdate = true;
      intakeGeometry.attributes.color.needsUpdate = true;
    }

    if (railRef.current) railRef.current.material.opacity = busOn * 0.3 * f;
    if (linkRef.current) linkRef.current.material.opacity = busOn * 0.16 * f;

    if (busRef.current) {
      for (let i = 0; i < busCount; i += 1) {
        const travel = (t * 0.22 + i / busCount) % 1;
        dummy.position.set(-5.4 + travel * 8.35, -2.59 + (i % 2 ? 0.07 : -0.07), 0);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(busOn);
        dummy.updateMatrix();
        busRef.current.setMatrixAt(i, dummy.matrix);
      }
      busRef.current.instanceMatrix.needsUpdate = true;
      busRef.current.material.opacity = busOn * 0.9 * f;
    }

    // The gate cycle: approach, hold for review, approval pulse, release.
    const gu = (t / GATE_PERIOD) % 1;
    const lift = easeOut(range(gu, 0.58, 0.7)) * (1 - range(gu, 0.9, 0.99));
    const approve = range(gu, 0.58, 0.86);
    const waiting = range(gu, 0.28, 0.34) * (1 - range(gu, 0.56, 0.6));

    if (frameRef.current) frameRef.current.material.opacity = gateOn * 0.55 * f;
    if (barrierRef.current) {
      barrierRef.current.position.y = GATE_Y - 0.15 + lift * 1.2;
      barrierRef.current.material.opacity = gateOn * (0.75 - lift * 0.35) * f;
      barrierRef.current.material.color.copy(amber).lerp(lime, lift);
    }
    if (approvalRef.current) {
      const blink = 0.5 + 0.5 * Math.sin(t * 6);
      approvalRef.current.rotation.set(t * 0.6, t * 0.9, 0);
      approvalRef.current.scale.setScalar(gateOn * (0.26 + waiting * blink * 0.08 + lift * 0.1));
      approvalRef.current.material.color.copy(amber).lerp(lime, lift);
      approvalRef.current.material.opacity =
        gateOn * (0.35 + waiting * blink * 0.45 + lift * 0.6) * f;
    }
    if (pulseRef.current) {
      pulseRef.current.scale.setScalar(0.35 + approve * 2.6);
      pulseRef.current.material.opacity =
        (1 - approve) * range(gu, 0.58, 0.62) * 0.7 * gateOn * f;
    }

    if (packetRef.current) {
      const source = graph.nodes[graph.exit];
      for (let i = 0; i < packetCount; i += 1) {
        const queueX = GATE_X - 0.55 - i * 0.34;
        const queueY = GATE_Y + (i % 2 ? 0.14 : -0.14);
        let x;
        let y;
        let z = 0;
        let scale = 0.19;
        if (gu < 0.3) {
          const k = easeInOut(range(gu, 0.02 + i * 0.02, 0.3));
          x = lerp(source.x, queueX, k);
          y = lerp(source.y, queueY, k);
          z = lerp(source.z, 0, k);
          scale *= k;
        } else if (gu < 0.6) {
          // Held at the gate — the human-in-the-loop pause.
          x = queueX;
          y = queueY + Math.sin(t * 3 + i) * 0.04;
          scale *= 1 + Math.sin(t * 3 + i * 1.3) * 0.06;
        } else {
          const k = easeOut(range(gu, 0.62 + i * 0.035, 0.92));
          x = lerp(queueX, OUTPUT_AT[0], k);
          y = lerp(queueY, OUTPUT_AT[1], k);
          scale *= 1 - range(gu, 0.88, 0.99);
        }
        dummy.position.set(x, y, z);
        dummy.rotation.set(t * 0.8 + i, t * 0.5, 0);
        dummy.scale.setScalar(scale * gateOn);
        dummy.updateMatrix();
        packetRef.current.setMatrixAt(i, dummy.matrix);
      }
      packetRef.current.instanceMatrix.needsUpdate = true;
      packetRef.current.material.opacity = gateOn * f;
    }

    if (outputRef.current) {
      const delivered = range(gu, 0.8, 0.95) * (1 - range(gu, 0.95, 1));
      outputRef.current.rotation.y = t * 0.5;
      outputRef.current.scale.setScalar(gateOn * (0.42 + delivered * 0.12));
      outputRef.current.material.emissiveIntensity = 0.5 + delivered * 2.4;
    }

    groupRef.current.rotation.y = Math.sin(t * 0.12) * 0.05;
  });

  return (
    <group ref={groupRef}>
      {/* graph memory */}
      <instancedMesh ref={nodeRef} args={[null, null, nodeCount]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          roughness={0.35}
          metalness={0.25}
          transparent
          userData={{ base: 1 }}
        />
      </instancedMesh>
      <lineSegments ref={edgeRef} geometry={edgeGeometry}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* agents traversing memory */}
      <instancedMesh ref={agentRef} args={[null, null, SR_AGENTS]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={palette.amber}
          emissive={palette.amber}
          emissiveIntensity={1.1}
          roughness={0.25}
          transparent
          userData={{ base: 1 }}
        />
      </instancedMesh>

      {/* live retrieval falling in from outside the frame */}
      <points ref={intakeRef} geometry={intakeGeometry}>
        <pointsMaterial
          size={0.11}
          sizeAttenuation
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* event bus */}
      <lineSegments ref={railRef} geometry={railGeometry}>
        <lineBasicMaterial color={palette.amber} transparent opacity={0} />
      </lineSegments>
      <lineSegments ref={linkRef} geometry={linkGeometry}>
        <lineBasicMaterial color={palette.slate} transparent opacity={0} />
      </lineSegments>
      <instancedMesh ref={busRef} args={[null, null, busCount]}>
        <boxGeometry args={[0.3, 0.08, 0.08]} />
        <meshBasicMaterial
          color={palette.amber}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>

      {/* approval gate */}
      <group position={[GATE_X, GATE_Y, 0]}>
        <lineSegments ref={frameRef} geometry={gateFrame}>
          <lineBasicMaterial color={palette.amber} transparent opacity={0} />
        </lineSegments>
        <mesh ref={pulseRef}>
          <ringGeometry args={[0.78, 1, 40]} />
          <meshBasicMaterial
            color={palette.lime}
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh ref={approvalRef} position={[0, 1.55, 0]}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color={palette.amber} transparent opacity={0} />
        </mesh>
      </group>
      <mesh ref={barrierRef} position={[GATE_X, GATE_Y - 0.15, 0]}>
        <boxGeometry args={[1.22, 0.16, 0.4]} />
        <meshBasicMaterial color={palette.amber} transparent opacity={0} />
      </mesh>

      {/* qualified leads waiting on a human */}
      <instancedMesh ref={packetRef} args={[null, null, packetCount]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={palette.amber}
          emissive={palette.amber}
          emissiveIntensity={0.9}
          roughness={0.3}
          transparent
          opacity={0}
        />
      </instancedMesh>

      <mesh ref={outputRef} position={OUTPUT_AT}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={palette.lime}
          emissive={palette.lime}
          emissiveIntensity={0.6}
          roughness={0.25}
          metalness={0.35}
          transparent
          userData={{ base: 1 }}
        />
      </mesh>
    </group>
  );
}

/* ============================================================= beat 3 ==== */
/* ChatBook — course documents shatter into chunks, chunks become vectors, a
   query lands in the space and its neighbourhood composes the answer.       */

const PAGES = [
  { pos: [-4.75, 2.05, -0.25], rot: [0, 0.3, 0.05] },
  { pos: [-5.1, -0.15, 0.25], rot: [0, 0.36, -0.04] },
  { pos: [-4.55, -2.35, -0.1], rot: [0, 0.24, 0.03] },
];
const TILE_W = 0.36;
const TILE_H = 0.15;
const QUERY_AT = [0.55, -0.35, 0.55];
const ANSWER_AT = [4.55, 0.05, 0];

function ChatBookScene({ progressRef, beatRef }) {
  const tileCount = quality(72, 42);
  const neighbours = quality(10, 7);

  const tiles = useMemo(() => {
    const rand = makeRandom(67);
    const pages = PAGES.map((p) => ({
      position: new THREE.Vector3(...p.pos),
      euler: new THREE.Euler(...p.rot),
    }));
    const perPage = Math.ceil(tileCount / pages.length);
    const rows = Math.ceil(perPage / 4);
    const sphere = fibonacciSphere(tileCount, 1);
    const query = new THREE.Vector3(...QUERY_AT);

    const list = Array.from({ length: tileCount }, (_, i) => {
      const page = i % pages.length;
      const slot = Math.floor(i / pages.length);
      const col = slot % 4;
      const row = Math.floor(slot / 4);
      const local = new THREE.Vector3(
        (col - 1.5) * 0.44,
        ((rows - 1) / 2 - row) * 0.28,
        0.04
      ).applyEuler(pages[page].euler);

      const [sx, sy, sz] = sphere[i];
      const r = 0.42 + 0.58 * Math.cbrt(rand());
      const cloud = new THREE.Vector3(
        0.75 + sx * 2.55 * r,
        0.15 + sy * 2.2 * r,
        sz * 1.7 * r
      );

      return {
        page: pages[page].position.clone().add(local),
        cloud,
        dist: cloud.distanceTo(query),
        spin: rand() * 6,
        rank: -1,
        answer: new THREE.Vector3(),
      };
    });

    // Nearest chunks are the ones the query retrieves and reassembles.
    const ranked = list
      .map((tile, i) => ({ i, d: tile.dist }))
      .sort((a, b) => a.d - b.d)
      .slice(0, neighbours);
    ranked.forEach(({ i }, k) => {
      const col = k % 2;
      const row = Math.floor(k / 2);
      list[i].rank = k;
      list[i].answer.set(
        ANSWER_AT[0] + (col - 0.5) * 0.48,
        ANSWER_AT[1] + (Math.ceil(neighbours / 2) / 2 - row - 0.5) * 0.32,
        ANSWER_AT[2]
      );
    });

    return { list, retrieved: ranked.map((r) => r.i) };
  }, [tileCount, neighbours]);

  const groupRef = useRef();
  const weight = useRef(0);
  const tileRef = useRef();
  const pageRefs = useRef([]);
  const queryRef = useRef();
  const hullRef = useRef();
  const ringRef = useRef();
  const linkRef = useRef();
  const cardRef = useRef();

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const cursor = useMemo(() => new THREE.Vector3(), []);
  const queryPos = useMemo(() => new THREE.Vector3(), []);
  const teal = useMemo(() => new THREE.Color(palette.teal), []);
  const slate = useMemo(() => new THREE.Color(palette.slate), []);
  const scratch = useMemo(() => new THREE.Color(), []);

  const linkGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(neighbours * 6), 3));
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(neighbours * 6), 3));
    return geo;
  }, [neighbours]);

  const cardGeometry = useMemo(() => rectEdges(1.45, 2.05), []);

  useFrame((state, delta) => {
    const f = stepWeight(groupRef, weight, beatRef.current === 3, delta);
    if (!f) return;

    const t = state.clock.elapsedTime;
    const lp = range(progressRef.current, 0.75, 1);

    const pageFade = 1 - range(lp, 0.06, 0.34);
    const queryPhase = easeInOut(range(lp, 0.3, 0.54));
    const neighPhase = range(lp, 0.46, 0.7);
    const cardPhase = range(lp, 0.7, 0.95);

    pageRefs.current.forEach((page, i) => {
      if (!page) return;
      page.material.opacity = pageFade * 0.3 * f;
      page.position.z = PAGES[i].pos[2] + Math.sin(t * 0.5 + i) * 0.05;
    });

    // Query vector flies in from below-left and parks inside the cloud.
    queryPos.set(
      lerp(-2.6, QUERY_AT[0], queryPhase),
      lerp(-4.4, QUERY_AT[1], queryPhase) + Math.sin(t * 0.9) * 0.05 * queryPhase,
      lerp(2.8, QUERY_AT[2], queryPhase)
    );
    if (queryRef.current) {
      queryRef.current.position.copy(queryPos);
      queryRef.current.rotation.set(t * 0.7, t * 1.4, 0);
      queryRef.current.scale.set(0.2 * queryPhase, 0.5 * queryPhase, 0.2 * queryPhase);
      queryRef.current.material.opacity = queryPhase * f;
    }
    if (hullRef.current) {
      hullRef.current.position.copy(queryPos);
      hullRef.current.rotation.y = t * 0.2;
      // Sized to the retrieved set, so the hull reads as the match radius.
      hullRef.current.scale.setScalar(easeOut(neighPhase) * 1.5);
      hullRef.current.material.opacity = neighPhase * 0.22 * (1 - cardPhase * 0.5) * f;
    }
    if (ringRef.current) {
      const beatPulse = (t * 0.5) % 1;
      ringRef.current.position.copy(queryPos);
      ringRef.current.rotation.z = t * 0.4;
      ringRef.current.scale.setScalar(0.4 + beatPulse * 1.8);
      ringRef.current.material.opacity = (1 - beatPulse) * neighPhase * 0.5 * f;
    }

    if (tileRef.current) {
      tiles.list.forEach((tile, i) => {
        const start = (i / tiles.list.length) * 0.2;
        const frag = easeInOut(range(lp, 0.02 + start, 0.02 + start + 0.26));
        const isNear = tile.rank >= 0;
        const pull = isNear
          ? easeInOut(
              range(cardPhase, (tile.rank / neighbours) * 0.35, (tile.rank / neighbours) * 0.35 + 0.5)
            )
          : 0;

        cursor.copy(tile.cloud);
        cursor.x += Math.sin(t * 0.5 + tile.spin) * 0.09;
        cursor.y += Math.cos(t * 0.42 + tile.spin) * 0.09;
        if (isNear) {
          // Retrieved chunks lean toward the query before they fly out.
          const lean = neighPhase * (1 - pull) * 0.18;
          cursor.lerp(queryPos, lean);
          cursor.lerp(tile.answer, pull);
        }
        cursor.lerp(tile.page, 1 - frag);

        const tumble = frag * (1 - pull);
        dummy.position.copy(cursor);
        dummy.rotation.set(
          tumble * Math.sin(t * 0.4 + tile.spin) * 1.4,
          tumble * (t * 0.25 + tile.spin),
          tumble * Math.cos(t * 0.3 + tile.spin) * 0.6
        );
        dummy.scale.setScalar(lerp(1, 1.18, pull));
        dummy.updateMatrix();
        tileRef.current.setMatrixAt(i, dummy.matrix);

        const heat = isNear ? clamp(neighPhase * 0.8 + pull * 0.6) : 0;
        scratch
          .copy(slate)
          .lerp(teal, 0.25 + heat * 0.75)
          .multiplyScalar(0.35 + heat * 0.85 - (isNear ? 0 : neighPhase * 0.12));
        tileRef.current.setColorAt(i, scratch);
      });
      tileRef.current.instanceMatrix.needsUpdate = true;
      if (tileRef.current.instanceColor) tileRef.current.instanceColor.needsUpdate = true;
      tileRef.current.material.opacity = f;
    }

    if (linkRef.current && tileRef.current) {
      const parr = linkGeometry.attributes.position.array;
      const carr = linkGeometry.attributes.color.array;
      tiles.retrieved.forEach((index, k) => {
        tileRef.current.getMatrixAt(index, dummy.matrix);
        cursor.setFromMatrixPosition(dummy.matrix);
        parr.set([queryPos.x, queryPos.y, queryPos.z, cursor.x, cursor.y, cursor.z], k * 6);
        const a = neighPhase * (1 - cardPhase * 0.7) * 0.8 * f;
        scratch.copy(teal).multiplyScalar(a);
        for (let v = 0; v < 2; v += 1) {
          carr[k * 6 + v * 3] = scratch.r;
          carr[k * 6 + v * 3 + 1] = scratch.g;
          carr[k * 6 + v * 3 + 2] = scratch.b;
        }
      });
      linkGeometry.attributes.position.needsUpdate = true;
      linkGeometry.attributes.color.needsUpdate = true;
    }

    if (cardRef.current) {
      const glow = easeOut(range(cardPhase, 0.3, 1));
      cardRef.current.material.opacity = glow * 0.8 * f;
      cardRef.current.scale.setScalar(0.9 + glow * 0.1 + Math.sin(t * 1.4) * 0.008);
    }

    groupRef.current.rotation.y = Math.sin(t * 0.13) * 0.06;
  });

  return (
    <group ref={groupRef}>
      {/* source documents */}
      {PAGES.map((page, i) => (
        <mesh
          key={i}
          position={page.pos}
          rotation={page.rot}
          ref={(el) => {
            pageRefs.current[i] = el;
          }}
        >
          <planeGeometry args={[1.95, 2.05]} />
          <meshBasicMaterial
            color={palette.paper}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* chunks — page tiles that become vectors */}
      <instancedMesh ref={tileRef} args={[null, null, tiles.list.length]}>
        <planeGeometry args={[TILE_W, TILE_H]} />
        <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
      </instancedMesh>

      {/* the query vector and its similarity neighbourhood */}
      <mesh ref={queryRef}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={palette.teal}
          emissive={palette.teal}
          emissiveIntensity={1.6}
          roughness={0.2}
          transparent
          opacity={0}
        />
      </mesh>
      <mesh ref={hullRef}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color={palette.teal} wireframe transparent opacity={0} />
      </mesh>
      <mesh ref={ringRef}>
        <ringGeometry args={[0.9, 1, 48]} />
        <meshBasicMaterial
          color={palette.teal}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <lineSegments ref={linkRef} geometry={linkGeometry}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* composed answer */}
      <lineSegments ref={cardRef} position={ANSWER_AT} geometry={cardGeometry}>
        <lineBasicMaterial
          color={palette.teal}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

/* ================================================================= stage == */

function LightRig({ beatRef }) {
  const keyRef = useRef();
  const accents = useMemo(() => ACCENTS.map((c) => new THREE.Color(c)), []);
  const current = useMemo(() => new THREE.Color(palette.rose), []);

  useFrame((_, delta) => {
    const target = accents[beatRef.current] ?? accents[0];
    current.lerp(target, 1 - Math.exp(-3 * delta));
    if (keyRef.current) keyRef.current.color.copy(current);
  });

  return (
    <>
      <ambientLight intensity={0.75} />
      <pointLight ref={keyRef} position={[0, 0, 9]} intensity={40} />
      <pointLight position={[-8, 5, 6]} intensity={18} color={palette.violet} />
      <pointLight position={[8, -4, 5]} intensity={16} color={palette.cyan} />
    </>
  );
}

function AgentsStage({ progressRef, activeBeat }) {
  const beatRef = useRef(activeBeat);
  beatRef.current = activeBeat;

  const rootRef = useRef();

  useFrame((state) => {
    const g = rootRef.current;
    if (!g) return;
    // The chapter column is narrow on desktop and very narrow on phones, so
    // the whole composition is fitted rather than authored per breakpoint.
    const fit = Math.min(
      state.viewport.width / DESIGN_W,
      state.viewport.height / DESIGN_H,
      1
    );
    g.scale.setScalar(fit);
  });

  return (
    <>
      <LightRig beatRef={beatRef} />
      <group ref={rootRef}>
        <MockMouseScene progressRef={progressRef} beatRef={beatRef} />
        <DejaQueryScene progressRef={progressRef} beatRef={beatRef} />
        <SignalRoomScene progressRef={progressRef} beatRef={beatRef} />
        <ChatBookScene progressRef={progressRef} beatRef={beatRef} />
      </group>
    </>
  );
}

const AgentsScene = () => {
  const { progressRef, activeBeat } = useSceneProgress();
  return (
    <SceneCanvas camera={{ position: [0, 0, 14], fov: 46 }}>
      <AgentsStage progressRef={progressRef} activeBeat={activeBeat} />
    </SceneCanvas>
  );
};

export default AgentsScene;
