import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import SceneCanvas, { useSceneProgress } from '../core/SceneCanvas';
import {
  palette, range, easeInOut, easeOut, clamp, lerp, damp, makeRandom, quality,
} from './sceneUtils';

/**
 * Education — California State University, Chico's Kendall Hall (the signature
 * brick administration building with the clock tower) rises for the master's
 * beat, then the camera settles so the engineering foundation course beneath
 * it reads as the load-bearing layer the tower has always stood on.
 */

const BRICK = '#8b3a2b';
const STONE = '#c9b79a';
const ROOF = '#2a2420';
const GLASS = '#7ec8e3';
const CLOCK = '#f2e8d5';

const dummy = new THREE.Object3D();
const color = new THREE.Color();

/** Procedural massing that reads as Kendall Hall: wide brick wing, central
 * pediment, and the clock tower with cupola that dominates campus photos. */
function useKendallHall() {
  return useMemo(() => {
    const rand = makeRandom(88);
    const parts = [];

    const box = (x, y, z, sx, sy, sz, tone, delay = 0) => {
      parts.push({
        pos: new THREE.Vector3(x, y, z),
        scale: new THREE.Vector3(sx, sy, sz),
        tone,
        delay,
      });
    };

    // Plinth / lawn terrace
    box(0, -0.15, 0, 14.5, 0.3, 7.2, STONE, 0);

    // Main brick wing
    box(0, 1.35, 0, 12.2, 2.7, 5.4, BRICK, 0.05);

    // Stone base course under the brick
    box(0, 0.18, 0.05, 12.4, 0.36, 5.55, STONE, 0.02);

    // Central projecting bay / pediment mass
    box(0, 1.55, 2.15, 3.6, 3.1, 1.4, BRICK, 0.12);
    box(0, 3.35, 2.15, 4.0, 0.55, 1.55, STONE, 0.18);

    // Side pavilions
    box(-5.4, 1.55, 0.4, 2.2, 3.1, 4.6, BRICK, 0.1);
    box(5.4, 1.55, 0.4, 2.2, 3.1, 4.6, BRICK, 0.1);
    box(-5.4, 3.25, 0.4, 2.35, 0.35, 4.75, STONE, 0.16);
    box(5.4, 3.25, 0.4, 2.35, 0.35, 4.75, STONE, 0.16);

    // Roof slabs
    box(0, 2.85, 0, 12.6, 0.28, 5.7, ROOF, 0.2);
    box(0, 3.55, 2.15, 4.2, 0.22, 1.7, ROOF, 0.22);

    // Clock tower shaft
    box(0, 5.05, -0.35, 2.05, 4.0, 2.05, BRICK, 0.28);
    box(0, 3.15, -0.35, 2.3, 0.35, 2.3, STONE, 0.24);
    box(0, 7.15, -0.35, 2.25, 0.28, 2.25, STONE, 0.34);

    // Cupola / lantern
    box(0, 7.7, -0.35, 1.35, 0.85, 1.35, STONE, 0.4);
    box(0, 8.35, -0.35, 0.95, 0.45, 0.95, ROOF, 0.45);
    box(0, 8.75, -0.35, 0.18, 0.55, 0.18, STONE, 0.5);

    // Clock faces (four sides)
    [[0, 1.08], [0, -1.08], [1.08, 0], [-1.08, 0]].forEach(([dx, dz], i) => {
      box(dx * 0.95, 6.05, -0.35 + dz * 0.95, dx === 0 ? 0.95 : 0.08, 0.95, dz === 0 ? 0.95 : 0.08, CLOCK, 0.38 + i * 0.02);
    });

    // Window punches across the facade
    const windowTone = GLASS;
    const cols = quality(9, 6);
    for (let row = 0; row < 2; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const x = -5.2 + (col / (cols - 1)) * 10.4;
        if (Math.abs(x) < 1.5) continue; // leave the center bay clear
        const y = 0.85 + row * 1.15;
        box(x, y, 2.72, 0.55, 0.85, 0.08, windowTone, 0.15 + rand() * 0.2);
      }
    }

    // Tower windows
    for (let level = 0; level < 3; level += 1) {
      box(0, 4.15 + level * 0.95, 0.7, 0.7, 0.7, 0.08, windowTone, 0.32 + level * 0.04);
      box(0, 4.15 + level * 0.95, -1.4, 0.7, 0.7, 0.08, windowTone, 0.32 + level * 0.04);
    }

    // Columns flanking the central entrance
    [-1.15, 1.15].forEach((x, i) => {
      box(x, 1.1, 2.85, 0.28, 2.2, 0.28, STONE, 0.14 + i * 0.02);
    });
    box(0, 0.55, 2.9, 1.6, 1.1, 0.12, ROOF, 0.16);

    // Lawn trees as simple vertical markers (campus context, not a map)
    const trees = [];
    const treeCount = quality(8, 5);
    for (let i = 0; i < treeCount; i += 1) {
      const side = i % 2 === 0 ? -1 : 1;
      trees.push({
        pos: new THREE.Vector3(
          side * (6.8 + rand() * 2.4),
          0.9 + rand() * 0.4,
          -2.2 + rand() * 5.5
        ),
        scale: 0.7 + rand() * 0.55,
        delay: 0.08 + rand() * 0.25,
      });
    }

    return { parts, trees };
  }, []);
}

function KendallCampus({ progressRef }) {
  const { parts, trees } = useKendallHall();
  const rootRef = useRef();
  const hallRef = useRef();
  const treeRef = useRef();
  const groundRef = useRef();
  const foundationRef = useRef();
  const smoothed = useRef(0);

  useFrame((state, delta) => {
    smoothed.current = damp(smoothed.current, progressRef.current, 4.2, delta);
    const prog = smoothed.current;
    const t = state.clock.elapsedTime;

    // Beat 0: hall rises. Beat 1: camera settles and foundation course glows.
    const rise = easeOut(range(prog, 0, 0.42));
    const settle = easeInOut(range(prog, 0.35, 0.72));
    const foundation = easeInOut(range(prog, 0.48, 0.88));

    if (rootRef.current) {
      rootRef.current.rotation.y = -0.22 + Math.sin(t * 0.12) * 0.04 + settle * 0.18;
      rootRef.current.position.y = lerp(-0.6, 0.15, rise) - foundation * 0.55;
      rootRef.current.scale.setScalar(clamp(state.viewport.width / 18, 0.55, 1));
    }

    if (hallRef.current) {
      parts.forEach((part, i) => {
        const local = clamp((rise - part.delay) / 0.55, 0, 1);
        const reveal = easeOut(local);
        dummy.position.set(
          part.pos.x,
          part.pos.y * reveal - (1 - reveal) * 1.8,
          part.pos.z
        );
        dummy.scale.set(
          part.scale.x * reveal,
          part.scale.y * Math.max(reveal, 0.001),
          part.scale.z * reveal
        );
        dummy.updateMatrix();
        hallRef.current.setMatrixAt(i, dummy.matrix);
        color.set(part.tone);
        // Warm the brick as the master's beat settles.
        if (part.tone === BRICK) {
          color.lerp(new THREE.Color(palette.coral), settle * 0.12);
        }
        if (part.tone === CLOCK) {
          color.lerp(new THREE.Color(palette.amber), 0.35 + Math.sin(t * 2.2) * 0.15);
        }
        hallRef.current.setColorAt(i, color);
      });
      hallRef.current.instanceMatrix.needsUpdate = true;
      if (hallRef.current.instanceColor) hallRef.current.instanceColor.needsUpdate = true;
    }

    if (treeRef.current) {
      trees.forEach((tree, i) => {
        const local = clamp((rise - tree.delay) / 0.5, 0, 1);
        const reveal = easeOut(local);
        dummy.position.copy(tree.pos);
        dummy.position.y *= reveal;
        dummy.scale.setScalar(tree.scale * reveal);
        dummy.updateMatrix();
        treeRef.current.setMatrixAt(i, dummy.matrix);
      });
      treeRef.current.instanceMatrix.needsUpdate = true;
    }

    if (groundRef.current) {
      groundRef.current.material.opacity = 0.35 + rise * 0.35;
      groundRef.current.scale.setScalar(0.7 + rise * 0.35);
    }

    if (foundationRef.current) {
      foundationRef.current.visible = foundation > 0.02;
      foundationRef.current.material.opacity = foundation * 0.55;
      foundationRef.current.scale.set(1 + foundation * 0.15, 1, 1 + foundation * 0.15);
      foundationRef.current.position.y = -1.35;
    }
  });

  return (
    <group ref={rootRef}>
      <ambientLight intensity={0.55} />
      <pointLight position={[4, 10, 8]} intensity={28} color={palette.amber} />
      <pointLight position={[-6, 4, 4]} intensity={16} color={palette.cyan} />
      <pointLight position={[0, 12, -4]} intensity={18} color={palette.paper} />

      <mesh ref={groundRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.32, 0]}>
        <circleGeometry args={[11, 48]} />
        <meshBasicMaterial
          color="#1a2a1f"
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>

      <instancedMesh ref={hallRef} args={[null, null, parts.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          roughness={0.55}
          metalness={0.12}
          flatShading
        />
      </instancedMesh>

      <instancedMesh ref={treeRef} args={[null, null, trees.length]}>
        <coneGeometry args={[0.55, 1.8, 6]} />
        <meshStandardMaterial
          color="#2f6b4f"
          emissive="#1a3d2c"
          emissiveIntensity={0.25}
          roughness={0.7}
          flatShading
        />
      </instancedMesh>

      {/* Engineering foundation course — revealed under the hall for beat two */}
      <mesh ref={foundationRef} visible={false}>
        <torusGeometry args={[5.8, 0.08, 8, 48]} />
        <meshBasicMaterial
          color={palette.cyan}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

const EducationScene = () => {
  const { progressRef } = useSceneProgress();
  return (
    <SceneCanvas camera={{ position: [7.5, 5.5, 14], fov: 42 }}>
      <KendallCampus progressRef={progressRef} />
    </SceneCanvas>
  );
};

export default EducationScene;
