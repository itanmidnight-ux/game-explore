/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, Vector3, Color } from 'three';
import { useGameStore } from '../../store';

const PARTICLE_COUNT = 30;

export const CombatParticles = () => {
  const pointsRef = useRef<Points>(null);
  const lastHitTime = useGameStore((s) => s.lastHitTime);
  const lastHitPosition = useGameStore((s) => s.lastHitPosition);
  
  const particles = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT * 3);
    const life = new Float32Array(PARTICLE_COUNT);
    
    return { pos, vel, life };
  }, []);

  const triggerParticles = () => {
    if (!lastHitPosition) return;
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Set to impact position with small random offset
      particles.pos[i * 3] = lastHitPosition[0] + (Math.random() - 0.5) * 0.5;
      particles.pos[i * 3 + 1] = lastHitPosition[1] + 1.0 + (Math.random() - 0.5) * 0.5;
      particles.pos[i * 3 + 2] = lastHitPosition[2] + (Math.random() - 0.5) * 0.5;
      
      // Random velocity
      particles.vel[i * 3] = (Math.random() - 0.5) * 8;
      particles.vel[i * 3 + 1] = (Math.random() - 0.2) * 8;
      particles.vel[i * 3 + 2] = (Math.random() - 0.5) * 8;
      
      particles.life[i] = 1.0;
    }
  };

  useEffect(() => {
    if (lastHitTime > 0) {
      triggerParticles();
    }
  }, [lastHitTime]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      if (particles.life[i] > 0) {
        // Update physics
        positions[i * 3] += particles.vel[i * 3] * delta;
        positions[i * 3 + 1] += particles.vel[i * 3 + 1] * delta;
        positions[i * 3 + 2] += particles.vel[i * 3 + 2] * delta;
        
        // Gravity
        particles.vel[i * 3 + 1] -= 9.8 * delta;
        
        // Decay
        particles.life[i] -= delta * 2.5;
        
        if (particles.life[i] <= 0) {
           // Move far away when dead
           positions[i * 3 + 1] = -1000;
        }
      }
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={particles.pos}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.15} 
        color="#00f2ff" 
        transparent 
        opacity={0.8}
        blending={2} // AdditiveBlending
        sizeAttenuation
      />
    </points>
  );
};
