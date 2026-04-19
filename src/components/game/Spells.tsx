import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useGameStore } from '../../store';
import { SpellData } from '../../types';

export const SpellProjectile = ({ data }: { data: SpellData }) => {
  const meshRef = useRef<any>(null);
  const { enemies, damageEnemy, removeSpell } = useGameStore.getState();
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Collision check with enemies
    const direction = new Vector3(...data.direction);
    const spellPos = new Vector3(...data.position);
    
    if (meshRef.current) {
      meshRef.current.lookAt(spellPos.clone().add(direction));
      // Cone geometry by default points up (Y), so we might need to rotate it once to align with Z
      if (data.type === 'void_bolt' && !data.isEnemySpell) {
        meshRef.current.rotateX(Math.PI / 2);
      } else if (data.isEnemySpell && data.type === 'void_bolt') {
        meshRef.current.rotateZ(state.clock.elapsedTime * 10);
        meshRef.current.rotateX(state.clock.elapsedTime * 5);
      }
    }
    
    if (data.isEnemySpell) {
       const playerPos = state.camera.position;
       if (spellPos.distanceTo(playerPos) < 2) {
           useGameStore.getState().takeDamage(data.damage);
           useGameStore.getState().addLog(`SYSTEM: Hit by enemy ${data.type}!`, 'critical');
           removeSpell(data.id);
       }
    } else {
       const activeEnemies = useGameStore.getState().enemies.filter(e => e.state !== 'dead');
       
       for (const enemy of activeEnemies) {
         const enemyPos = new Vector3(...enemy.position);
         if (spellPos.distanceTo(enemyPos) < 2) {
           damageEnemy(enemy.id, data.damage, 'magic');
           removeSpell(data.id);
           break;
         }
       }
    }
  });

  const color = data.type === 'fireball' ? (data.isEnemySpell ? '#ff00aa' : '#ff4400') : (data.isEnemySpell ? '#8a2be2' : '#00f2ff');
  const emissive = data.type === 'fireball' ? (data.isEnemySpell ? '#ff00aa' : '#ff0000') : (data.isEnemySpell ? '#5500aa' : '#00f2ff');

  // Cultist specific orb renderer
  if (data.type === 'void_bolt' && data.isEnemySpell) {
     return (
        <group position={data.position}>
           <mesh ref={meshRef}>
              <torusKnotGeometry args={[0.2, 0.05, 32, 8]} />
              <meshStandardMaterial 
                color={color} 
                emissive={emissive} 
                emissiveIntensity={12} 
                toneMapped={false}
              />
              <mesh scale={1.5}>
                  <sphereGeometry args={[0.25, 12, 12]} />
                  <meshStandardMaterial color={color} transparent opacity={0.4} emissive={emissive} emissiveIntensity={4} />
              </mesh>
           </mesh>
           <pointLight color={color} intensity={4} distance={8} />
        </group>
     )
  }

  return (
    <group position={data.position}>
      <mesh ref={meshRef}>
        {data.type === 'fireball' ? (
          <>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial 
              color={color} 
              emissive={emissive} 
              emissiveIntensity={15} 
              toneMapped={false}
            />
            {/* Outer Glow */}
            <mesh scale={1.4}>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial color={color} transparent opacity={0.3} emissive={emissive} emissiveIntensity={5} />
            </mesh>
          </>
        ) : (
          <group>
            <coneGeometry args={[0.15, 0.8, 8]} />
            <meshStandardMaterial 
              color={color} 
              emissive={emissive} 
              emissiveIntensity={20} 
              toneMapped={false}
            />
            {/* Energy Streak */}
            <mesh position={[0, -0.4, 0]}>
              <cylinderGeometry args={[0.05, 0.2, 1.5, 8]} />
              <meshStandardMaterial color={color} transparent opacity={0.2} emissive={emissive} emissiveIntensity={10} />
            </mesh>
          </group>
        )}
        <pointLight color={color} intensity={5} distance={10} />
      </mesh>
    </group>
  );
};

export const SpellManager = () => {
  const activeSpells = useGameStore(s => s.activeSpells);
  const updateSpells = useGameStore(s => s.updateSpells);

  useFrame((_, delta) => {
    updateSpells(delta);
  });

  return (
    <group>
      {activeSpells.map(spell => (
        <SpellProjectile key={spell.id} data={spell} />
      ))}
    </group>
  );
};
