/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store';

export const InstancedBirds = ({ count = 20 }: { count?: number }) => {
  const birds = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      speed: 1 + Math.random() * 2,
      phase: Math.random() * Math.PI * 2,
      radius: 30 + Math.random() * 50
    }));
  }, [count]);

  const birdRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!birdRef.current) return;
    const time = state.clock.elapsedTime;

    birdRef.current.children.forEach((child, i) => {
      const bird = birds[i];
      const angle = time * 0.2 * bird.speed + bird.phase;
      const x = Math.cos(angle) * bird.radius;
      const z = Math.sin(angle) * bird.radius;
      const y = 20 + Math.sin(time * 0.5 + i) * 5;
      
      child.position.set(x, y, z);
      child.lookAt(new THREE.Vector3(Math.cos(angle + 0.1) * bird.radius, y, Math.sin(angle + 0.1) * bird.radius));
      
      // Wing flap animation
      const leftWing = child.children[1];
      const rightWing = child.children[2];
      if (leftWing && rightWing) {
         const flap = Math.sin(time * 10 * bird.speed) * 0.8;
         leftWing.rotation.z = -flap;
         rightWing.rotation.z = flap;
      }
    });
  });

  return (
    <group ref={birdRef}>
      {birds.map((b) => (
        <group key={b.id}>
           {/* Body */}
           <mesh>
              <coneGeometry args={[0.2, 0.8, 4]} />
              <meshStandardMaterial color="#000" />
           </mesh>
           {/* Left Wing */}
           <mesh position={[-0.4, 0, 0]}>
              <boxGeometry args={[0.8, 0.05, 0.4]} />
              <meshStandardMaterial color="#222" />
           </mesh>
           {/* Right Wing */}
           <mesh position={[0.4, 0, 0]}>
              <boxGeometry args={[0.8, 0.05, 0.4]} />
              <meshStandardMaterial color="#222" />
           </mesh>
        </group>
      ))}
    </group>
  );
};

export const WeatherSystem = () => {
  const weather = useGameStore(s => s.weather);
  const isNight = useGameStore(s => (s.gameTime < 6 || s.gameTime > 18));
  const ashCount = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(ashCount * 3);
    for (let i = 0; i < ashCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = Math.random() * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return pos;
  }, []);

  const ashRef = useRef<THREE.Points>(null);
  const stormRef = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    if (ashRef.current) {
      ashRef.current.position.set(state.camera.position.x, 0, state.camera.position.z);
      const geom = ashRef.current.geometry;
      const posAttr = geom.getAttribute('position');
      for (let i = 0; i < ashCount; i++) {
        let y = posAttr.getY(i);
        y -= delta * 2;
        if (y < 0) y = 50;
        posAttr.setY(i, y);
        
        let x = posAttr.getX(i);
        x += Math.sin(time * 0.5 + i) * 0.02;
        posAttr.setX(i, x);
      }
      posAttr.needsUpdate = true;
    }

    if (stormRef.current) {
        stormRef.current.position.set(state.camera.position.x, 0, state.camera.position.z);
        stormRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group>
      {/* Life - Birds fly in daytime clear weather */}
      {!isNight && weather === 'clear' && <InstancedBirds />}

      {/* Ash Fall Effect */}
      {weather === 'ash_fall' && (
        <Points ref={ashRef as any} positions={positions} stride={3}>
          <PointMaterial
            transparent
            opacity={0.6}
            size={0.15}
            sizeAttenuation={true}
            color="#555"
            depthWrite={false}
          />
        </Points>
      )}

      {/* Void Storm Effect */}
      {weather === 'void_storm' && (
        <group>
           <Points ref={stormRef as any} positions={positions} stride={3}>
            <PointMaterial
                transparent
                opacity={0.4}
                size={0.1}
                sizeAttenuation={true}
                color="#4400ff"
                depthWrite={false}
            />
            </Points>
            <LightningSubsystem />
        </group>
      )}
    </group>
  );
};

const LightningSubsystem = () => {
    const [visible, setVisible] = React.useState(false);
    
    useFrame((state) => {
        if (Math.random() > 0.99) {
            setVisible(true);
            setTimeout(() => setVisible(false), 100 + Math.random() * 200);
        }
    });

    if (!visible) return null;

    return (
        <group>
            {/* <directionalLight intensity={10} color="#00f2ff" /> */}
        </group>
    );
};
