/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { usePlane, useBox, useHeightfield } from '@react-three/cannon';
import { Text, Float, useTexture, Torus, Instances, Instance } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '../../store';
import * as THREE from 'three';
import { Vector3, RepeatWrapping, MeshStandardMaterial, Color, Object3D } from 'three';
import { InteractionEvent } from '../../types';

// Optimized Nature using Instances
const WaterPool = ({ position, radius = 10 }: { position: [number, number, number], radius?: number }) => (
  <mesh position={[position[0], 0.05, position[2]]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <circleGeometry args={[radius, 32]} />
    <meshStandardMaterial 
      color="#0066ff" 
      transparent 
      opacity={0.6} 
      metalness={0.9} 
      roughness={0.1} 
      emissive="#00f2ff"
      emissiveIntensity={0.2}
    />
  </mesh>
);

// Optimized Nature using raw instancedMesh for maximum performance
const InstancedGrass = ({ count = 2000 }: { count?: number }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const isMobile = useGameStore(s => s.isMobile);
  const adjustedCount = isMobile ? count / 2 : count;

  useEffect(() => {
    const temp = new Object3D();
    for (let i = 0; i < adjustedCount; i++) {
        const x = (Math.random() - 0.5) * 3000;
        const z = (Math.random() - 0.5) * 3000;
        const { height, biome } = getTerrainData(x, z);
        
        if (biome > -0.1 && biome < 0.6) {
            temp.position.set(x, height + 0.2, z);
            temp.rotation.y = Math.random() * Math.PI;
            temp.scale.setScalar(0.8 + Math.random() * 0.4);
        } else {
            temp.scale.setScalar(0);
        }
        temp.updateMatrix();
        meshRef.current.setMatrixAt(i, temp.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [adjustedCount]);

  return (
    <instancedMesh ref={meshRef} args={[null as any, null as any, adjustedCount]} receiveShadow>
      <planeGeometry args={[0.3, 0.5]} />
      <meshStandardMaterial color="#3dd15e" side={2} alphaTest={0.5} />
    </instancedMesh>
  );
};

const InstancedBushes = ({ count = 300 }: { count?: number }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const isMobile = useGameStore(s => s.isMobile);
  const adjustedCount = isMobile ? count / 2 : count;

  useEffect(() => {
    const temp = new Object3D();
    for (let i = 0; i < adjustedCount; i++) {
        const x = (Math.random() - 0.5) * 3000;
        const z = (Math.random() - 0.5) * 3000;
        const { height, biome } = getTerrainData(x, z);
        
        if (biome > 0.1 && biome < 0.7) {
            temp.position.set(x, height + 0.5, z);
            temp.rotation.y = Math.random() * Math.PI;
            temp.scale.setScalar(1 + Math.random() * 1.5);
        } else {
            temp.scale.setScalar(0);
        }
        temp.updateMatrix();
        meshRef.current.setMatrixAt(i, temp.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [adjustedCount]);

  return (
    <instancedMesh ref={meshRef} args={[null as any, null as any, adjustedCount]} castShadow receiveShadow>
      <sphereGeometry args={[0.6, 8, 8]} />
      <meshStandardMaterial color="#1a4d1a" roughness={1} />
    </instancedMesh>
  );
};

const InstancedTrees = ({ count = 400 }: { count?: number }) => {
  const trunkRef = useRef<THREE.InstancedMesh>(null!);
  const leavesRef = useRef<THREE.InstancedMesh>(null!);
  const isMobile = useGameStore(s => s.isMobile);
  const adjustedCount = isMobile ? count / 2 : count;

  useEffect(() => {
    const temp = new Object3D();
    for (let i = 0; i < adjustedCount; i++) {
        const x = (Math.random() - 0.5) * 3000;
        const z = (Math.random() - 0.5) * 3000;
        const { height, biome } = getTerrainData(x, z);
        
        if (biome > 0 && biome < 0.8 && height < 50) {
            temp.position.set(x, height + 2.5, z);
            temp.scale.setScalar(0.8 + Math.random() * 0.5);
            temp.rotation.y = Math.random() * Math.PI;
            temp.updateMatrix();
            trunkRef.current.setMatrixAt(i, temp.matrix);
            
            temp.position.set(x, height + 6, z);
            temp.updateMatrix();
            leavesRef.current.setMatrixAt(i, temp.matrix);
        } else {
            temp.scale.setScalar(0);
            temp.updateMatrix();
            trunkRef.current.setMatrixAt(i, temp.matrix);
            leavesRef.current.setMatrixAt(i, temp.matrix);
        }
    }
    trunkRef.current.instanceMatrix.needsUpdate = true;
    leavesRef.current.instanceMatrix.needsUpdate = true;
  }, [adjustedCount]);

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[null as any, null as any, adjustedCount]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.4, 5]} />
        <meshStandardMaterial color="#4a2c1d" />
      </instancedMesh>
      <instancedMesh ref={leavesRef} args={[null as any, null as any, adjustedCount]} castShadow>
        <coneGeometry args={[2.5, 7, 5]} />
        <meshStandardMaterial color="#143d14" />
      </instancedMesh>
    </group>
  );
};

const InstancedRocks = ({ count = 200 }: { count?: number }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  useEffect(() => {
    const temp = new Object3D();
    for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        const { height, biome } = getTerrainData(x, z);
        
        if (biome < -0.2 || height > 40) {
            temp.position.set(x, height, z);
            temp.rotation.set(Math.random(), Math.random(), Math.random());
            temp.scale.setScalar(0.5 + Math.random() * 2);
        } else {
            temp.scale.setScalar(0);
        }
        temp.updateMatrix();
        meshRef.current.setMatrixAt(i, temp.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count]);

  return (
    <instancedMesh ref={meshRef} args={[null as any, null as any, count]} castShadow receiveShadow>
      <icosahedronGeometry args={[1]} />
      <meshStandardMaterial color="#333" roughness={1} />
    </instancedMesh>
  );
};

const AmbientBirds = ({ count = 20 }: { count?: number }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const birds = useMemo(() => Array.from({ length: count }).map(() => ({
    phase: Math.random() * Math.PI * 2,
    speed: 0.5 + Math.random() * 1.5,
    radius: 50 + Math.random() * 100,
    height: 100 + Math.random() * 50
  })), [count]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const temp = new Object3D();
    birds.forEach((bird, i) => {
      const angle = time * bird.speed + bird.phase;
      temp.position.set(
        Math.cos(angle) * bird.radius,
        bird.height + Math.sin(time + bird.phase) * 5,
        Math.sin(angle) * bird.radius
      );
      temp.rotation.y = -angle; // Face forward
      temp.rotation.z = Math.sin(time * 5) * 0.5; // wing flap
      temp.scale.setScalar(0.5);
      temp.updateMatrix();
      meshRef.current.setMatrixAt(i, temp.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null as any, null as any, count]}>
      <coneGeometry args={[0.2, 1, 3]} />
      <meshStandardMaterial color="#000" />
    </instancedMesh>
  );
};

// Helper component for interactive objects
const Interactive = ({ 
  id, 
  type, 
  label, 
  position, 
  distance = 5 
}: { 
  id: string, 
  type: InteractionEvent['type'], 
  label: string, 
  position: [number, number, number], 
  distance?: number 
}) => {
  const register = useGameStore(s => s.registerInteraction);
  const unregister = useGameStore(s => s.unregisterInteraction);

  React.useEffect(() => {
    register({ id, type, label, position, distance });
    return () => unregister(id);
  }, [id, type, label, position, distance, register, unregister]);

  return null;
};

// Procedural Abyssal Texture Hook/Helper
const DetailedAbyssMaterial = ({ color = "#222", emissive = "#000", emissiveIntensity = 0.5, roughness = 0.7, metalness = 0.3 }: any) => {
  return (
    <meshStandardMaterial
      color={color}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
      roughness={roughness}
      metalness={metalness}
    />
  );
};

import { getTerrainHeight, getTerrainData, WATER_LEVEL } from '../../lib/terrainUtils';

// Optimized Water using a single large plane following the camera
const WorldWater = () => {
  const { camera } = useThree();
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (waterRef.current) {
      waterRef.current.position.x = Math.round(camera.position.x / 50) * 50;
      waterRef.current.position.z = Math.round(camera.position.z / 50) * 50;
    }
  });

  return (
    <mesh ref={waterRef} position={[0, WATER_LEVEL, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[2000, 2000]} />
      <meshStandardMaterial 
        color="#003366" 
        transparent 
        opacity={0.8} 
        metalness={0.9} 
        roughness={0.05} 
        emissive="#001133"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
};

// Nature following the camera for optimal performance
const FollowNature = ({ count = 500, type = 'grass' }: { count?: number, type: 'grass' | 'rocks' | 'trees' }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const { camera } = useThree();
  const craters = useGameStore(s => s.craters);

  useEffect(() => {
    const temp = new Object3D();
    const range = type === 'grass' ? 80 : type === 'rocks' ? 200 : 300;
    
    for (let i = 0; i < count; i++) {
        // Deterministic randomness based on index or position? 
        // For simplicity now, just scatter once around [0,0] but we'll offset the mesh
        const rx = (Math.random() - 0.5) * 1500; 
        const rz = (Math.random() - 0.5) * 1500;
        
        const { height, biome } = getTerrainData(rx, rz, craters);
        
        let valid = false;
        if (type === 'grass' && biome > -0.1 && biome < 0.6 && height > WATER_LEVEL + 1) {
            temp.position.set(rx, height + 0.1, rz);
            temp.scale.setScalar(0.5 + Math.random() * 0.5);
            valid = true;
        } else if (type === 'rocks' && (biome < -0.2 || height > 40) && height > WATER_LEVEL) {
            temp.position.set(rx, height, rz);
            temp.scale.setScalar(0.5 + Math.random() * 2);
            valid = true;
        } else if (type === 'trees' && biome > 0 && biome < 0.8 && height > WATER_LEVEL + 2 && height < 50) {
            temp.position.set(rx, height, rz);
            temp.scale.setScalar(0.8 + Math.random() * 0.6);
            valid = true;
        }

        if (!valid) temp.scale.setScalar(0);
        temp.rotation.y = Math.random() * Math.PI;
        temp.updateMatrix();
        meshRef.current.setMatrixAt(i, temp.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count, type, craters]);

  const geo = useMemo(() => {
    if (type === 'grass') return new THREE.PlaneGeometry(0.3, 0.5);
    if (type === 'rocks') return new THREE.IcosahedronGeometry(1);
    return new THREE.CylinderGeometry(0.2, 0.4, 5); 
  }, [type]);

  const mat = useMemo(() => {
    if (type === 'grass') return new THREE.MeshStandardMaterial({ color: "#2d5a27", side: 2, alphaTest: 0.5 });
    if (type === 'rocks') return new THREE.MeshStandardMaterial({ color: "#333", roughness: 1 });
    return new THREE.MeshStandardMaterial({ color: "#3d2b1f" });
  }, [type]);

  return <instancedMesh ref={meshRef} args={[geo, mat, count]} castShadow receiveShadow />;
};

const TerrainChunk = ({ offset, res, size, craters }: { offset: [number, number], res: number, size: number, craters: any[] }) => {
  const startX = offset[0] * size;
  const startZ = offset[1] * size;

  // Optimize: Only use craters that are actually near this chunk
  const relevantCraters = useMemo(() => {
    return craters.filter(c => {
      const dx = Math.abs(c.position[0] - startX);
      const dz = Math.abs(c.position[2] - startZ);
      // Chunk reach is size/2. Crater reach is c.radius * 2 (with rim).
      const reach = (size / 2) + (c.radius * 2);
      return dx < reach && dz < reach;
    });
  }, [craters, startX, startZ, size]);

  const { positions, colors, indices, heightMatrix } = useMemo(() => {
    const pos = [];
    const col = [];
    const ind = [];
    
    const grid = res + 1;
    // Cannon Heightfield expects matrix[x][y]
    const hts: number[][] = Array.from({ length: grid }, () => new Array(grid).fill(0));
    
    for (let j = 0; j <= res; j++) {
        for (let i = 0; i <= res; i++) {
            const worldX = startX + (i / res - 0.5) * size;
            const worldZ = startZ + (j / res - 0.5) * size;
            const { height, color } = getTerrainData(worldX, worldZ, relevantCraters);
            
            pos.push((i / res - 0.5) * size, height, (j / res - 0.5) * size);
            col.push(color.r, color.g, color.b);
            
            // Map to [i][j] for matrix[x][y] orientation
            hts[i][j] = height;
        }
    }

    for (let j = 0; j < res; j++) {
        for (let i = 0; i < res; i++) {
            const a = i + grid * j;
            const b = i + grid * (j + 1);
            const c = (i + 1) + grid * (j + 1);
            const d = (i + 1) + grid * j;
            ind.push(a, b, d);
            ind.push(b, c, d);
        }
    }

    return { 
      positions: new Float32Array(pos), 
      colors: new Float32Array(col), 
      indices: new Uint32Array(ind),
      heightMatrix: hts 
    };
  }, [res, size, startX, startZ, relevantCraters]);

  const elementSize = size / res;
  const [hfRef] = useHeightfield(() => ({
    args: [heightMatrix, { elementSize }],
    // Position offset to align the corner of heightfield with visual mesh corner
    position: [startX - size / 2, 0, startZ + size / 2],
    rotation: [-Math.PI / 2, 0, 0],
  }), useRef<THREE.Mesh>(null));

  return (
    <group position={[startX, 0, startZ]}>
      <mesh receiveShadow>
        <bufferGeometry>
           <bufferAttribute 
              attach="attributes-position" 
              count={positions.length / 3} 
              array={positions} 
              itemSize={3} 
           />
           <bufferAttribute 
              attach="attributes-color" 
              count={colors.length / 3} 
              array={colors} 
              itemSize={3} 
           />
           <bufferAttribute
              attach="index"
              count={indices.length}
              array={indices}
              itemSize={1}
           />
        </bufferGeometry>
        <meshStandardMaterial vertexColors roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh ref={hfRef as any} visible={false}>
         <planeGeometry args={[size, size]} />
      </mesh>
    </group>
  );
};

const InfiniteTerrain = () => {
  const { camera } = useThree();
  const chunkVisibleSize = 512;
  const isMobile = useGameStore(s => s.isMobile);
  const res = isMobile ? 16 : 32;
  const craters = useGameStore(s => s.craters);
  const setTerrainReady = useGameStore(s => s.setTerrainReady);

  // Track centered chunk
  const [center, setCenter] = React.useState<[number, number]>([0, 0]);

  useEffect(() => {
    // Small delay to ensure heightfields are actually injected into physics world
    const timer = setTimeout(() => {
      setTerrainReady(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [setTerrainReady]);

  useFrame(() => {
    const cx = Math.floor((camera.position.x + chunkVisibleSize / 2) / chunkVisibleSize);
    const cz = Math.floor((camera.position.z + chunkVisibleSize / 2) / chunkVisibleSize);
    if (cx !== center[0] || cz !== center[1]) {
      setCenter([cx, cz]);
    }
  });

  const chunks = useMemo(() => {
    const list = [];
    const dist = isMobile ? 1 : 2; // 3x3 for mobile, 5x5 for desktop
    for (let x = -dist; x <= dist; x++) {
      for (let z = -dist; z <= dist; z++) {
        list.push([center[0] + x, center[1] + z] as [number, number]);
      }
    }
    return list;
  }, [center, isMobile]);

  return (
    <group>
      {chunks.map(offset => (
        <TerrainChunk 
          key={`${offset[0]}_${offset[1]}`} 
          offset={offset} 
          res={res} 
          size={chunkVisibleSize} 
          craters={craters} 
        />
      ))}
    </group>
  );
};

// Enhanced Environment Components
const Crystal = ({ position, color = "#00f2ff" }: any) => (
  <Float speed={5} rotationIntensity={2} floatIntensity={1} position={position}>
    <mesh castShadow>
      <octahedronGeometry args={[0.8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={5} />
    </mesh>
  </Float>
);

const FloatingRock = ({ position, scale = 1, rotationSpeed = 0.5 }: any) => (
  <Float speed={1.5} rotationIntensity={rotationSpeed} floatIntensity={2} position={position}>
    <mesh castShadow receiveShadow scale={scale}>
      <dodecahedronGeometry args={[3]} />
      <DetailedAbyssMaterial color="#0c0c0c" roughness={1} />
    </mesh>
  </Float>
);

const AbyssMonolithArea = ({ position, label = "VOID_MONOLITH" }: any) => (
  <group position={position}>
     <mesh castShadow receiveShadow>
        <boxGeometry args={[12, 120, 12]} />
        <meshStandardMaterial 
          color="#050510" 
          roughness={0.1} 
          metalness={1} 
          emissive="#4400ff" 
          emissiveIntensity={2} 
        />
     </mesh>
     {/* Rotating Rings */}
     <Float speed={3} rotationIntensity={5} floatIntensity={0}>
        <mesh position={[0, 50, 0]} rotation={[Math.PI/2, 0, 0]}>
            <torusGeometry args={[18, 0.6, 16, 100]} />
            <meshStandardMaterial color="#00f2ff" emissive="#00f2ff" emissiveIntensity={8} transparent opacity={0.7} />
        </mesh>
        <mesh position={[0, 50, 0]} rotation={[0, Math.PI/2, 0]}>
            <torusGeometry args={[22, 0.3, 16, 100]} />
            <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={12} transparent opacity={0.4} />
        </mesh>
     </Float>
     <mesh position={[0, 65, 0]}>
        <octahedronGeometry args={[15]} />
        <meshStandardMaterial color="#000" emissive="#00f2ff" emissiveIntensity={15} metalness={1} roughness={0} />
     </mesh>
     <Text position={[0, 85, 0]} fontSize={6} color="#00f2ff" outlineWidth={0.2} outlineColor="#000000">{label}</Text>
  </group>
);

const SovereignThrone = ({ position }: any) => (
  <group position={position}>
    <mesh position={[0, 0, 0]} receiveShadow>
       <boxGeometry args={[40, 2, 40]} />
       <meshStandardMaterial color="#050510" metalness={1} roughness={0.1} />
    </mesh>
    <mesh position={[0, 10, -15]} castShadow>
       <boxGeometry args={[20, 20, 5]} />
       <meshStandardMaterial color="#020202" metalness={1} roughness={0} emissive="#ff00ff" emissiveIntensity={0.5} />
    </mesh>
    {/* Floating Shards around throne */}
    {[...Array(6)].map((_, i) => (
      <Float key={i} speed={4} rotationIntensity={2} floatIntensity={5} position={[Math.sin(i) * 25, 10 + Math.cos(i) * 5, Math.cos(i) * 25]}>
         <mesh>
            <coneGeometry args={[2, 10, 3]} />
            <meshStandardMaterial color="#00f2ff" emissive="#00f2ff" emissiveIntensity={10} />
         </mesh>
      </Float>
    ))}
    <pointLight position={[0, 5, 0]} color="#ff00ff" intensity={20} distance={100} />
    <Text position={[0, 25, -15]} fontSize={8} color="#ff00ff">THRONE OF THE MONARCH</Text>
  </group>
);

const ZenithSpire = ({ position }: any) => (
  <group position={position}>
    <mesh position={[0, 150, 0]} castShadow>
      <cylinderGeometry args={[2, 20, 300, 4]} />
      <meshStandardMaterial color="#050510" metalness={1} roughness={0} emissive="#6600ff" emissiveIntensity={0.5} />
    </mesh>
    {/* Concentric Halo */}
    {[1, 2, 3].map((i) => (
      <Float key={i} speed={2} rotationIntensity={i} floatIntensity={1} position={[0, 100 + i * 40, 0]}>
        <mesh rotation={[Math.PI/2, 0, 0]}>
           <torusGeometry args={[30 + i * 10, 1, 16, 100]} />
           <meshStandardMaterial color="#00f2ff" emissive="#00f2ff" emissiveIntensity={5} transparent opacity={0.2} />
        </mesh>
      </Float>
    ))}
    <pointLight position={[0, 200, 0]} color="#00f2ff" intensity={50} distance={1000} />
    <Text position={[0, 310, 0]} fontSize={20} color="#00f2ff">AINCRAD SPIRE</Text>
  </group>
);

const Tree = ({ position, seed }: { position: [number, number, number], seed: number }) => (
  <group position={position} rotation={[0, seed * Math.PI, 0]}>
    <mesh position={[0, 2, 0]} castShadow>
      <cylinderGeometry args={[0.05, 0.2, 4]} />
      <DetailedAbyssMaterial color="#0a0a0a" />
    </mesh>
    <mesh position={[0, 4, 0]} castShadow scale={[1 + Math.sin(seed)*0.2, 1 + Math.cos(seed)*0.3, 1]}>
      <coneGeometry args={[2, 5, 3]} />
      <DetailedAbyssMaterial color={seed % 2 === 0 ? "#001a00" : "#00051a"} emissive={seed % 2 === 0 ? "#00ff44" : "#00f2ff"} emissiveIntensity={0.5} />
    </mesh>
  </group>
);

const House = ({ position, rotation = 0 }: { position: [number, number, number], rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
      <boxGeometry args={[4, 3, 4]} />
      <DetailedAbyssMaterial color="#5e3a24" />
    </mesh>
    <mesh position={[0, 3.5, 0]} castShadow rotation={[0, Math.PI / 4, 0]}>
      <coneGeometry args={[3.5, 2, 4]} />
      <DetailedAbyssMaterial color="#8b0000" />
    </mesh>
    <mesh position={[0, 0.75, 2.01]}>
      <planeGeometry args={[1, 1.5]} />
      <DetailedAbyssMaterial color="#222" />
    </mesh>
  </group>
);

const GroundRock = ({ position, seed }: { position: [number, number, number], seed: number }) => (
  <mesh position={position} rotation={[Math.random(), Math.random(), Math.random()]} scale={0.2 + Math.random() * 0.5} castShadow receiveShadow>
    <icosahedronGeometry args={[1]} />
    <DetailedAbyssMaterial color={seed % 3 === 0 ? "#111" : "#050505"} roughness={1} />
  </mesh>
);

const DungeonEntrance = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh position={[0, 1, 0]} castShadow>
      <boxGeometry args={[6, 2, 6]} />
      <meshStandardMaterial color="#0a0a0a" metalness={1} roughness={0} emissive="#00f2ff" emissiveIntensity={1} />
    </mesh>
    <mesh position={[0, 0, 0]}>
       <boxGeometry args={[4, 0.1, 4]} />
       <meshStandardMaterial color="#000" emissive="#4400ff" emissiveIntensity={10} />
    </mesh>
    <Text position={[0, 3, 0]} fontSize={0.8} color="#00f2ff">ABYSSAL GATE</Text>
  </group>
);


const ResourceNode = ({ position, type }: { position: [number, number, number], type: 'mineral' | 'herb' | 'skin' }) => {
  const addItem = useGameStore(s => s.addItem);
  const nodeRef = useRef<any>(null);
  
  const colors = { mineral: '#333', herb: '#2d5a27', skin: '#6e4b3b' };

  useFrame((state) => {
    // Proximity check to player (player at camera pos roughly)
    const dist = state.camera.position.distanceTo(new Vector3(...position));
    if (dist < 3 && nodeRef.current && nodeRef.current.visible) {
       // Harvest
       nodeRef.current.visible = false;
       addItem({ id: `${type}_1`, name: type.toUpperCase(), type, count: 5 });
       // Logic to respawn after some time could be here
       setTimeout(() => { if (nodeRef.current) nodeRef.current.visible = true; }, 10000);
    }
  });

  return (
    <group position={position} ref={nodeRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh castShadow>
          <icosahedronGeometry args={[0.5, 1]} />
          <DetailedAbyssMaterial color={colors[type]} emissive={colors[type]} emissiveIntensity={0.2} />
        </mesh>
        <Text position={[0, 1, 0]} fontSize={0.2} color="white">[PROXIMITY HARVEST]</Text>
      </Float>
    </group>
  );
};

const CraftingStation = ({ position, label }: { position: [number, number, number], label: string }) => {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[2, 1, 1.5]} />
        <DetailedAbyssMaterial color="#0a0a0a" metalness={0.8} />
      </mesh>
      <Text position={[0, 1.5, 0]} fontSize={0.5}>{label}</Text>
      <Text position={[0, 1.2, 0]} fontSize={0.2} color="#8b0000">Press [E] to Craft</Text>
    </group>
  );
};

const Tower = ({ position, height = 15 }: { position: [number, number, number], height?: number }) => {
  const [ref] = useBox(() => ({ position: [position[0], height/2, position[2]], args: [4, height, 4] }));
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, height/2, 0]}>
        <boxGeometry args={[4, height, 4]} />
        <DetailedAbyssMaterial color="#080808" metalness={0.5} roughness={0} />
      </mesh>
      <mesh castShadow position={[0, height + 1, 0]}>
        <boxGeometry args={[5, 2, 5]} />
        <DetailedAbyssMaterial color="#050510" metalness={1} />
      </mesh>
      <mesh castShadow position={[0, height + 3, 0]}>
        <coneGeometry args={[2.5, 5, 4]} />
        <DetailedAbyssMaterial color="#020202" />
      </mesh>
    </group>
  );
};

const DamageZone = ({ position }: { position: [number, number, number] }) => {
  const takeDamage = useGameStore(s => s.takeDamage);
  const addXP = useGameStore(s => s.addXP);

  useFrame((state, delta) => {
    const dist = state.camera.position.distanceTo(new Vector3(...position));
    if (dist < 3) {
      takeDamage(delta * 20);
      // Give some tiny XP for surviving?
      addXP(delta * 2);
    }
  });

  return (
    <group position={position}>
       <mesh rotation={[-Math.PI/2, 0, 0]}>
          <circleGeometry args={[3, 32]} />
          <DetailedAbyssMaterial color="#8b0000" emissive="#ff0000" emissiveIntensity={0.5} />
       </mesh>
       <Text position={[0, 0.1, 0]} fontSize={0.3} color="#8b0000" rotation={[-Math.PI/2, 0, 0]}>VOID POOL - DANGER</Text>
    </group>
  );
};

const DungeonWall = ({ position, rotation = [0, 0, 0], scale = [10, 15, 2] }: any) => {
  const [ref] = useBox(() => ({ position, rotation, args: scale }));
  return (
    <mesh ref={ref as any} castShadow receiveShadow>
      <boxGeometry args={scale} />
      <DetailedAbyssMaterial color="#050510" metalness={0.9} roughness={0.1} emissive="#4400ff" emissiveIntensity={0.05} />
    </mesh>
  );
};

const DungeonCorridor = ({ position, rotation = 0 }: any) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <DungeonWall position={[-10, 7.5, 0]} scale={[2, 15, 40]} />
    <DungeonWall position={[10, 7.5, 0]} scale={[2, 15, 40]} />
    <mesh position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]}>
       <planeGeometry args={[20, 40]} />
       <DetailedAbyssMaterial color="#08081a" emissive="#4400ff" emissiveIntensity={0.1} />
    </mesh>
  </group>
);


const StatueOfSovereign = ({ position = [0, 0, 0] as [number, number, number] }) => {
    return (
        <group position={position}>
            <Interactive id="statue_1" type="pray" label="Statue of the Sovereign" position={position} distance={8} />
            <mesh castShadow position={[0, 10, 0]}>
                <cylinderGeometry args={[2, 3, 20, 8]} />
                <meshStandardMaterial color="#333" metalness={0.8} />
            </mesh>
            <Float speed={1.5} floatingRange={[0, 2]}>
               <mesh position={[0, 25, 0]}>
                   <sphereGeometry args={[2, 32, 32]} />
                   <meshStandardMaterial color="#00f2ff" emissive="#00f2ff" emissiveIntensity={10} />
               </mesh>
               <pointLight intensity={30} color="#00f2ff" distance={100} />
            </Float>
            {/* Energy Ring */}
            <group position={[0, 25, 0]} rotation={[Math.PI/2.5, 0, 0]}>
                 <Torus args={[5, 0.05, 16, 100]}>
                    <meshStandardMaterial color="#00f2ff" emissive="#00f2ff" emissiveIntensity={2} />
                 </Torus>
            </group>
            <mesh rotation={[-Math.PI/2, 0, 0]}>
                <circleGeometry args={[10, 32]} />
                <meshStandardMaterial color="#111" metalness={1} />
            </mesh>
        </group>
    );
}

const AbyssalChest = ({ position = [0, 0, 0] as [number, number, number], id }: { position: [number, number, number], id: string }) => {
    return (
        <group position={position}>
            <Interactive id={id} type="open" label="Abyssal Remnant" position={position} />
            <mesh castShadow>
                <boxGeometry args={[1.5, 1, 1]} />
                <meshStandardMaterial color="#442200" metalness={0.5} roughness={0.3} emissive="#ffaa00" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0, 0.4, 0]}>
                <boxGeometry args={[1.6, 0.2, 1.1]} />
                <meshStandardMaterial color="#aa8800" metalness={0.9} />
            </mesh>
        </group>
    );
}

const DomainEntrance = ({ position = [0, 0, 0] as [number, number, number] }) => {
    return (
        <group position={position}>
            <Interactive id="domain_1" type="open" label="The Void Domain" position={position} distance={10} />
            <mesh position={[-8, 15, 0]} castShadow>
                <boxGeometry args={[4, 30, 4]} />
                <meshStandardMaterial color="#222" />
            </mesh>
            <mesh position={[8, 15, 0]} castShadow>
                <boxGeometry args={[4, 30, 4]} />
                <meshStandardMaterial color="#222" />
            </mesh>
            <mesh position={[0, 30, 0]} castShadow>
                <boxGeometry args={[20, 4, 4]} />
                <meshStandardMaterial color="#222" />
            </mesh>
            <mesh position={[0, 15, -0.5]}>
                <planeGeometry args={[12, 26]} />
                <meshBasicMaterial color="#050015" />
            </mesh>
            <pointLight position={[0, 15, 2]} color="#6600ff" intensity={5} distance={20} />
        </group>
    );
}

export const WorldMap = () => {
  const isMobile = useGameStore(s => s.isMobile);
  const craters = useGameStore(s => s.craters);
  
  const landmarkPositions = useMemo(() => {
    const lx = [-200, 400, 0, 0, 50, 0];
    const lz = [-200, -400, -800, -500, 50, -300];
    const hts = lx.map((x, i) => getTerrainHeight(x, lz[i], craters));
    
    return {
      statue: [-200, Math.max(WATER_LEVEL, hts[0]), -200] as [number, number, number],
      domain: [400, Math.max(WATER_LEVEL, hts[1]), -400] as [number, number, number],
      throne: [0, Math.max(WATER_LEVEL, hts[2]), -800] as [number, number, number],
      spire: [0, Math.max(WATER_LEVEL, hts[3]) + 50, -500] as [number, number, number],
      dungeon: [50, Math.max(WATER_LEVEL, hts[4]), 50] as [number, number, number],
      text: [0, Math.max(WATER_LEVEL, hts[5]) + 150, -300] as [number, number, number]
    };
  }, [craters]);

  return (
    <group>
      <InfiniteTerrain />
      <WorldWater />
      
      {/* Nature */}
      <FollowNature type="grass" count={isMobile ? 1000 : 3000} />
      <FollowNature type="rocks" count={isMobile ? 100 : 300} />
      <FollowNature type="trees" count={isMobile ? 150 : 400} />
      
      <AmbientBirds count={isMobile ? 10 : 30} />

      {/* Strategic Landmarks - Adjusted to terrain */}
      <StatueOfSovereign position={landmarkPositions.statue} />
      <DomainEntrance position={landmarkPositions.domain} />
      <SovereignThrone position={landmarkPositions.throne} />
      <ZenithSpire position={landmarkPositions.spire} />
      <DungeonEntrance position={landmarkPositions.dungeon} />
      
      {/* Floating Rocks / Monoliths are already handled by other components but keeping the main label */}
      <group position={landmarkPositions.text}>
         <Text fontSize={40} color="#00f2ff" textAlign="center" maxWidth={800}>
            THE ABYSSAL REALM: SOVEREIGN LINK
         </Text>
      </group>
    </group>
  );
};


