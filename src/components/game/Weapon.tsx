/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Euler, Mesh } from 'three';
import { useGameStore } from '../../store';

export const Weapon = () => {
  const meshRef = useRef<Mesh>(null);
  const { camera } = useThree();
  const [swinging, setSwinging] = useState(false);
  const swingTime = useRef(0);
  
  const isBlocking = useGameStore((s) => s.isBlocking);
  const activeElement = useGameStore((s) => s.activeElement);
  const useStamina = useGameStore((s) => s.useStamina);
  const enemies = useGameStore((s) => s.enemies);
  const damageEnemy = useGameStore((s) => s.damageEnemy);

  useEffect(() => {
    const handleAttack = () => {
      if (!swinging && !isBlocking && useStamina(20)) {
        setSwinging(true);
        
        // Hit detection
        const raycaster = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        enemies.forEach(enemy => {
           const enemyPos = new Vector3(...enemy.position);
           const dist = camera.position.distanceTo(enemyPos);
           
           // Check if enemy is in front and close
           const toEnemy = new Vector3().subVectors(enemyPos, camera.position).normalize();
           const angle = raycaster.dot(toEnemy);
           
           if (dist < 5 && angle > 0.7 && enemy.state !== 'dead') {
              // Apply damage modified by enemy resistance
              let baseDamage = 25;
              if (enemy.type === 'behemoth') baseDamage *= 0.5;
              if (enemy.type === 'shade') baseDamage *= 1.5;
              
              // Elemental bonus
              if (activeElement !== 'none') baseDamage *= 1.4;
              
              damageEnemy(enemy.id, baseDamage);
           }
        });
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) handleAttack();
    };

    window.addEventListener('mousedown', handleMouseDown);
    // Also attach to window to support custom triggers from UI
    window.addEventListener('mobileAttack', handleAttack);
    
    return () => {
       window.removeEventListener('mousedown', handleMouseDown);
       window.removeEventListener('mobileAttack', handleAttack);
    };
  }, [swinging, isBlocking, useStamina, enemies, damageEnemy, camera, activeElement]);

  // Using useFrame for continuous swinging logic
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Check mobile state if missing from custom event
    const mobileActions = useGameStore.getState().mobileActions;
    if (mobileActions.attack && !swinging) {
       // Quick proxy fix, could dispatch event too. Rely on event for cleaner once-per-tap.
    }

    // Fixed position relative to camera
    const weaponPos = new Vector3(0.5, -0.4, -0.8);
    
    // Adjust if blocking
    if (isBlocking) {
      weaponPos.set(0, -0.2, -0.5);
    }

    weaponPos.applyQuaternion(camera.quaternion);
    weaponPos.add(camera.position);
    meshRef.current.position.copy(weaponPos);

    // Initial rotation
    const weaponRot = new Euler().copy(camera.rotation);
    
    if (isBlocking) {
      weaponRot.x += 1.5;
      weaponRot.y += 0.5;
      weaponRot.z += 1.5;
    } else if (swinging) {
      swingTime.current += delta * 15;
      const swingOffset = Math.sin(swingTime.current) * 0.8;
      weaponRot.x -= swingOffset;
      weaponRot.y += swingOffset * 2.0;

      if (swingTime.current > Math.PI) {
        setSwinging(false);
        swingTime.current = 0;
      }
    } else {
      // Idle bobbing
      const bob = Math.sin(state.clock.elapsedTime * 2) * 0.02;
      meshRef.current.position.y += bob;
      weaponRot.z += 0.5;
    }

    meshRef.current.rotation.copy(weaponRot);
  });

  const getElementColor = (el: string) => {
    switch(el) {
      case 'void': return '#00f2ff';
      case 'solar': return '#ffaa00';
      case 'lunar': return '#ffffff';
      case 'chaos': return '#bb00ff';
      default: return '#444444';
    }
  };

  const elementColor = getElementColor(activeElement);

  return (
    <group>
      <mesh ref={meshRef} castShadow>
        {/* Blade */}
        <boxGeometry args={[0.08, 1.2, 0.02]} />
        <meshStandardMaterial 
          color={activeElement !== 'none' ? elementColor : "#888888"} 
          metalness={0.8} 
          roughness={0.2} 
          emissive={isBlocking ? "#00f2ff" : elementColor}
          emissiveIntensity={activeElement !== 'none' || isBlocking ? 3 : 0.5}
        />
        {/* Elemental Aura Glow */}
        {activeElement !== 'none' && (
          <mesh scale={[1.2, 1.1, 1.5]}>
            <boxGeometry args={[0.08, 1.2, 0.01]} />
            <meshStandardMaterial color={elementColor} transparent opacity={0.2} emissive={elementColor} emissiveIntensity={5} />
          </mesh>
        )}
        {/* Crossguard */}
        <mesh position={[0, -0.4, 0]}>
          <boxGeometry args={[0.3, 0.05, 0.05]} />
          <meshStandardMaterial color="#444444" metalness={0.5} />
        </mesh>
        {/* Handle */}
        <mesh position={[0, -0.6, 0]}>
          <boxGeometry args={[0.05, 0.4, 0.05]} />
          <meshStandardMaterial color="#221100" />
        </mesh>
      </mesh>
    </group>
  );
};

