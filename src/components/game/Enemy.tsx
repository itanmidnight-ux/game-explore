/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { Vector3, Color } from 'three';
import { Text, Billboard } from '@react-three/drei';
import { useGameStore } from '../../store';
import { EnemyData } from '../../types';

// Pre-allocated vectors for math to avoid GC pressure
const _playerPos = new Vector3();
const _enemyPos = new Vector3();
const _tempDir = new Vector3();
const _flankOffset = new Vector3();
const _ePos = new Vector3();

export const Enemy = ({ data }: { data: EnemyData }) => {
  const meshRef = useRef<any>(null);
  const updateEnemy = useGameStore(s => s.updateEnemy);
  const takeDamage = useGameStore(s => s.takeDamage);
  const gameTime = useGameStore(s => s.gameTime);
  const settings = useGameStore(s => s.settings);
  const lastAttackTime = useRef(0);
  const lastAiUpdate = useRef(0);
  const attributes = useGameStore(s => s.attributes);
  
  const isNight = gameTime < 6 || gameTime > 18;

  // Base configurations per type
  const config = useMemo(() => {
    let base = {
      size: 1.0,
      mass: 1,
      color: '#440000',
      baseSpeed: 3.0,
      detectionRange: isNight ? 25 : 15,
      baseDamage: 10,
      attackCooldown: 1.5,
      label: `UNDEAD ${data.race.toUpperCase()}`,
      resistance: 1.0,
      isRanged: false,
      isGhost: false,
      rangedRange: 0,
      auraColor: '#000000',
      auraIntensity: 0,
      lore: 'Mindless servants resurrected from ancient battlefields.',
      weaknesses: 'Fire, Holy Magic'
    };

    const levelMult = 1 + (data.level - 1) * 0.15; // 15% increase per level

    switch(data.type) {
      case 'dragon':
        base = {
          ...base,
          size: 5.0,
          mass: 20,
          color: '#ff2200', // Vibrant Fire Red
          baseSpeed: 4.0,
          detectionRange: 60,
          baseDamage: 50,
          attackCooldown: 2.0,
          label: `SCARLET DRACORISE`,
          resistance: 0.2,
          lore: 'An ancient calamity that ruled the skies before the fall.',
          weaknesses: 'Dragon-slaying weapons, Ice'
        };
        break;
      case 'golem':
        base = {
          ...base,
          size: 3.5,
          mass: 15,
          color: '#b0b0b0', // Polished Silver/Stone
          baseSpeed: 1.0,
          detectionRange: 15,
          baseDamage: 40,
          attackCooldown: 4.0,
          label: `TITANIC GUARDIAN`,
          resistance: 0.1,
          lore: 'Automaton built to guard the inner sanctums.',
          weaknesses: 'Blunt force, Magic erosion'
        };
        break;
      case 'behemoth':
        base = {
          ...base,
          size: 2.2,
          mass: 5,
          color: '#8b4513', // Tusk Brown
          baseSpeed: 1.5,
          detectionRange: isNight ? 20 : 12,
          baseDamage: 30,
          attackCooldown: 3.0,
          label: `ANCIENT BEHEMOTH`,
          resistance: 0.5,
          lore: 'Mutated beasts grown to unnatural sizes in the dark.',
          weaknesses: 'Slashing damage, Poison'
        };
        break;
      case 'shade':
        base = {
          ...base,
          size: 0.6,
          mass: 0.1,
          color: '#7f00ff', // Vivid Purple
          baseSpeed: 6.0,
          detectionRange: isNight ? 40 : 25,
          baseDamage: 5,
          attackCooldown: 0.5,
          label: `VOID SHADE`,
          resistance: 1.5,
          lore: 'Echoes of those consumed by the void rift.',
          weaknesses: 'Light beams, Holy auras'
        };
        break;
      case 'lich':
        base = {
          ...base,
          size: 1.2,
          mass: 2,
          color: '#00ffcc', // Spectral Teal
          baseSpeed: 2.0,
          detectionRange: 50,
          baseDamage: 25,
          attackCooldown: 2.5,
          label: `LICH SOVEREIGN`,
          resistance: 0.8,
          isRanged: true,
          rangedRange: 30,
          auraColor: '#00ffff',
          auraIntensity: 2,
          lore: 'Sentient undead wielding formidable arcane mastery.',
          weaknesses: 'Melee range combat, Blunt weapons'
        };
        break;
      case 'wraith':
        base = {
          ...base,
          size: 1.0,
          mass: 0.5,
          color: '#ffffff', // Ghostly White
          baseSpeed: 4.5,
          detectionRange: 35,
          baseDamage: 12,
          attackCooldown: 1.2,
          label: `SPECTRAL WRAITH`,
          resistance: 0.05,
          isGhost: true,
          lore: 'A restless spirit unbound by physical matter.',
          weaknesses: 'Pure magical energy, Void spells'
        };
        break;
      case 'slime':
        base = {
          ...base,
          size: 0.8,
          mass: 0.5,
          color: '#3dd15e', // Grass Green Slime
          baseSpeed: 1.5,
          detectionRange: 15,
          baseDamage: 5,
          attackCooldown: 1.5,
          label: `EMERALD SLIME`,
          resistance: 0.8,
          lore: 'A corrosive jelly that consumes and multiplies.',
          weaknesses: 'Area of Effect (AoE) magic, Freezing'
        };
        break;
      case 'horned_rabbit':
        base = {
          ...base,
          size: 0.5,
          mass: 0.3,
          color: '#ffeb5e', // Golden Rabbit
          baseSpeed: 8.0,
          detectionRange: 20,
          baseDamage: 15, 
          attackCooldown: 0.8,
          label: `GOLDEN HOPPER`,
          resistance: 0.3, 
          lore: 'Deceptively cute, incredibly dangerous horned leapers.',
          weaknesses: 'Magic bolts, Traps'
        };
        break;
      case 'demon':
        base = {
          ...base,
          size: 1.8,
          mass: 5,
          color: '#ff2200',
          baseSpeed: 5.0,
          detectionRange: 40,
          baseDamage: 35,
          attackCooldown: 1.5,
          label: `VOIDSLAUGHTER DEMON`,
          resistance: 0.5,
          auraColor: '#ff2200',
          auraIntensity: 2,
          lore: 'Malevolent entities summoned from infernal planes.',
          weaknesses: 'Holy enchantments, Cold steel'
        };
        break;
      case 'vulture':
        base = {
            ...base,
            size: 1.2,
            mass: 0.5,
            color: '#5e4b3b', // Feather Brown
            baseSpeed: 7.0,
            detectionRange: 45,
            baseDamage: 12,
            attackCooldown: 1.5,
            label: `VOID VULTURE`,
            lore: 'Aerial scavengers that thrive on the necrotic energy.',
            weaknesses: 'Ranged attacks, Grounding magic'
        };
        break;
      case 'cultist':
        base = {
          ...base,
          size: 0.9,
          mass: 1,
          color: '#aa00ff',
          baseSpeed: 2.5,
          detectionRange: 45,
          baseDamage: 10,
          attackCooldown: 3.0,
          label: `VOID HYDRAULIC`,
          resistance: 1.0,
          isRanged: true,
          rangedRange: 25,
          lore: 'Zealots who surrendered their minds to the Void.',
          weaknesses: 'Physical interruptions, Slashing weapons'
        };
        break;
      case 'crystal_golem':
        base = {
          ...base,
          size: 2.5,
          mass: 12,
          color: '#00ffff',
          baseSpeed: 1.5,
          detectionRange: 20,
          baseDamage: 30,
          attackCooldown: 3.5,
          label: `CRYSTAL GOLEM`,
          resistance: 0.8, // actually completely immune to magic in store
          lore: 'A construct of pristine resonant crystal, completely absorbing mana.',
          weaknesses: 'Immune to Magic. Requires heavy blunt physical damage.'
        };
        break;
      default: // stalker
        break;
    }

    const fullLabel = `${base.label} (LVL ${data.level})`;

    if (data.isBoss) {
      base.size *= 2.5;
      base.baseDamage *= 3.0;
      base.color = '#ff00ff';
      base.auraColor = '#ff00ff';
      base.auraIntensity = 10;
      base.label = `[BOSS] ${fullLabel}`;
      base.detectionRange *= 2.0;
    } else {
      base.label = fullLabel;
    }

    return base;
  }, [data.type, data.level, data.race, isNight, data.isBoss]);

  const levelMult = 1 + (data.level - 1) * 0.15;
  const damage = (config as any).baseDamage * levelMult;
  const speed = config.baseSpeed * (isNight ? 1.5 : 1.0);
  
  const [ref, api] = useSphere(() => ({
    mass: config.mass,
    type: 'Dynamic',
    position: data.position,
    args: [config.size],
  }));

  const pos = useRef(data.position);
  useEffect(() => api.position.subscribe(p => pos.current = p), [api.position]);

  const velocity = useRef([0, 0, 0]);
  useEffect(() => api.velocity.subscribe(v => velocity.current = v), [api.velocity]);

  const phaseTimer = useRef(0);
  const auraRef = useRef<any>(null);

  useFrame((state, delta) => {
    if (auraRef.current) {
        auraRef.current.rotation.y += delta * 0.5;
        auraRef.current.rotation.z += delta * 0.2;
    }

    if (data.health <= 0) {
      api.velocity.set(0, velocity.current[1], 0);
      return;
    }

    // AI Throttling optimization
    const now = state.clock.elapsedTime;
    const aiInterval = settings.aiThrottling ? 0.15 : 0.05; // 6fps or 20fps AI
    if (now - lastAiUpdate.current < aiInterval) return;
    lastAiUpdate.current = now;

    const playerPos = state.camera.position;
    _enemyPos.set(...pos.current);
    
    // Wraith Phasing Logic
    if (data.type === 'wraith') {
      phaseTimer.current += delta;
      const isCurrentlyPhasing = phaseTimer.current % 8 > 5; 
      if (isCurrentlyPhasing !== !!data.isPhasing) {
        updateEnemy(data.id, { isPhasing: isCurrentlyPhasing });
      }
    }

    const currentSpeed = (data.type === 'wraith' && data.isPhasing) ? speed * 2.0 : speed;
    
    const allEnemies = useGameStore.getState().enemies;
    let closestCorpse: EnemyData | null = null;
    let closestHostile: EnemyData | null = null;
    let minHostileDist = Infinity;
    let minCorpseDist = Infinity;

    // Optimized scan with early outs
    for (let i = 0; i < allEnemies.length; i++) {
        const e = allEnemies[i];
        if (e.id === data.id) continue;
        
        _ePos.set(...e.position);
        const dSqr = _enemyPos.distanceToSquared(_ePos);
        const maxD = config.detectionRange * config.detectionRange;
        
        if (e.state === 'dead') {
           if (dSqr < 100 && dSqr < minCorpseDist) { 
               minCorpseDist = dSqr; 
               closestCorpse = e; 
           }
        } else if (dSqr < maxD) {
           const isEnemyFaction = e.faction !== data.faction;
           if (isEnemyFaction && dSqr < minHostileDist) {
              minHostileDist = dSqr; 
              closestHostile = e;
           }
        }
    }
    
    minHostileDist = Math.sqrt(minHostileDist);
    minCorpseDist = Math.sqrt(minCorpseDist);

    const distToPlayer = playerPos.distanceTo(_enemyPos);
    
    let targetPos = playerPos;
    let targetDist = distToPlayer;
    let isTargetingPlayer = true;

    if (closestHostile && minHostileDist < distToPlayer && data.faction !== 'slime') {
        targetPos = _tempDir.set(...closestHostile.position);
        targetDist = minHostileDist;
        isTargetingPlayer = false;
    }

    let nextState = data.state;
    _tempDir.subVectors(targetPos, _enemyPos);
    
    // Coordinated Flanking System 
    const activeAlliesCount = allEnemies.filter(e => e.faction === data.faction && e.id !== data.id && e.state === 'chase').length;
    _flankOffset.set(0, 0, 0);
    
    if (activeAlliesCount > 0 && targetDist > (config.size + 1.5) && targetDist < config.detectionRange) {
        const flankSeed = data.id.charCodeAt(data.id.length - 1) % 3; 
        if (flankSeed === 1) { 
            _flankOffset.set(-_tempDir.z, 0, _tempDir.x).normalize().multiplyScalar(1.5);
        } else if (flankSeed === 2) { 
            _flankOffset.set(_tempDir.z, 0, -_tempDir.x).normalize().multiplyScalar(1.5);
        }
    }

    const dir = _tempDir.add(_flankOffset);
    dir.y = 0; 
    dir.normalize();

    // Environment Hazards: Trail dropping logic
    if (data.type === 'slime' && nextState !== 'sleep' && targetDist < config.detectionRange) {
        if (Math.random() < 0.1) {
             useGameStore.getState().addGroundEffect({
                 type: 'slime_trail',
                 position: [_enemyPos.x, 0.1, _enemyPos.z],
                 radius: 2 + (data.level * 0.1),
                 duration: 4000,
                 faction: 'slime'
             });
        }
    }

    // Sleep System
    if (data.state === 'sleep') {
        if (data.health < data.maxHealth || targetDist < 8) {
            nextState = 'investigate';
            useGameStore.getState().addLog(`SYSTEM: ${config.label} abruptly woke up!`, 'info');
            api.velocity.set(0, 4, 0); 
        } else {
            api.velocity.set(0, velocity.current[1], 0);
            if (data.health < data.maxHealth) {
                updateEnemy(data.id, { health: Math.min(data.maxHealth, data.health + 2) });
            }
            return;
        }
    } else if (isNight && data.state === 'patrol' && Math.random() < 0.001) {
        nextState = 'sleep';
    }

    // Eat / Scavenge
    if ((data.faction === 'slime' || data.faction === 'beast' || data.faction === 'demon') && closestCorpse && minCorpseDist < config.detectionRange && targetDist > 10) {
        if (minCorpseDist < config.size + 1.5) {
            nextState = 'eat';
            api.velocity.set(0, velocity.current[1], 0);
            if (now - lastAttackTime.current > 2.0) {
                useGameStore.getState().addLog(`SYSTEM: ${config.label} consumed a corpse and grew stronger!`, 'level');
                const xpGain = closestCorpse.xpReward;
                const newMax = data.maxHealth + xpGain;
                updateEnemy(data.id, { maxHealth: newMax, health: newMax, level: data.level + 1, hitFlash: 1.0 });
                useGameStore.getState().updateEnemy(closestCorpse.id, { position: [0, -100, 0] });
                lastAttackTime.current = now;
            }
        } else {
            nextState = 'chase';
            const corpseDir = _tempDir.set(...closestCorpse.position).sub(_enemyPos);
            corpseDir.y = 0;
            corpseDir.normalize();
            api.velocity.set(corpseDir.x * speed, velocity.current[1], corpseDir.z * speed);
        }
    } else if (targetDist < config.detectionRange) {
      const isTooClose = targetDist < (config.isRanged ? 12 : config.size + 1.5);
      const isTooFar = targetDist > (config.isRanged ? config.rangedRange : config.size + 1);

      if (isTooFar) {
        nextState = 'chase';
        api.velocity.set(dir.x * currentSpeed, velocity.current[1], dir.z * currentSpeed);
        if (data.type === 'borer' && targetDist > 8 && !data.isBurrowed) {
             updateEnemy(data.id, { isBurrowed: true });
        }
        if (Math.abs(velocity.current[0]) < 0.1 && Math.abs(velocity.current[2]) < 0.1 && Math.random() < 0.05 && Math.abs(velocity.current[1]) < 0.1) {
             api.velocity.set(dir.x * currentSpeed, (data.type === 'horned_rabbit' || data.type === 'slime') ? 6 : 4, dir.z * currentSpeed);
        }
      } else {
        nextState = 'attack';
        if (data.type === 'borer' && data.isBurrowed) {
             updateEnemy(data.id, { isBurrowed: false });
             api.velocity.set(dir.x * currentSpeed, 8, dir.z * currentSpeed); 
             useGameStore.getState().addLog(`SYSTEM: ${config.label} breached the surface!`, 'critical');
        }

        if (config.isRanged) {
           if (targetDist < 10) {
              api.velocity.set(-dir.x * currentSpeed, velocity.current[1], -dir.z * currentSpeed);
           } else {
              api.velocity.set(0, velocity.current[1], 0);
           }
        } else if (data.type === 'behemoth') {
           api.velocity.set(dir.x * speed * 0.5, velocity.current[1], dir.z * speed * 0.5);
        } else if (data.type === 'wraith' && data.isPhasing) {
           api.velocity.set(dir.x * currentSpeed, velocity.current[1], dir.z * currentSpeed);
        } else {
           api.velocity.set(0, velocity.current[1], 0);
        }
        
        const currentCooldown = isNight ? config.attackCooldown * 0.7 : config.attackCooldown;
        if (now - lastAttackTime.current > currentCooldown) {
          let finalDamage = isNight ? damage * 1.5 : damage;
          if (isTargetingPlayer) {
              if (data.type === 'cultist') {
                 useGameStore.getState().castEnemySpell('void_bolt', [_enemyPos.x, _enemyPos.y + 1, _enemyPos.z], [dir.x, dir.y, dir.z], finalDamage);
              } else {
                  if (data.type === 'behemoth') {
                     finalDamage *= 1.2;
                     useGameStore.getState().addLog(`SYSTEM: ${config.label} performs Earth Shatter!`, 'critical');
                  } else if (data.type === 'lich') {
                     useGameStore.getState().addLog(`SYSTEM: ${config.label} casts Void Pulse!`, 'critical');
                  } else if (data.type === 'dragon') {
                     finalDamage *= 2.0;
                     useGameStore.getState().addLog(`CRITICAL: DRAGON BREATH INCOMING!`, 'critical');
                  } else if (data.type === 'wraith') {
                     useGameStore.getState().applyChill();
                  }
                  takeDamage(finalDamage);
              }
          } else if (closestHostile) {
              useGameStore.getState().damageEnemy(closestHostile.id, finalDamage, 'physical');
          }
          lastAttackTime.current = now;
          if (data.type === 'horned_rabbit') {
               api.velocity.set(dir.x * speed * 6, 1, dir.z * speed * 6);
               useGameStore.getState().addLog(`SYSTEM: ${config.label} charges rapidly!`, 'critical');
          } else if (data.type === 'slime') {
               api.velocity.set(dir.x * speed * 2, 3, dir.z * speed * 2);
          }
          if (data.type === 'demon') {
               useGameStore.getState().addGroundEffect({
                   type: 'corruption',
                   position: [_enemyPos.x, 0.1, _enemyPos.z],
                   radius: 5 + (data.level * 0.2),
                   duration: 8000,
                   faction: 'demon'
               });
          }
        }
      }
    } else {
      nextState = 'patrol';
      const time = state.clock.elapsedTime;
      const vx = Math.sin(time * 0.3 + (data.id.length % 5)) * 1.5;
      const vz = Math.cos(time * 0.2 + (data.id.length % 3)) * 1.5;
      api.velocity.set(vx, velocity.current[1], vz);
      if (data.type === 'slime' && Math.abs(velocity.current[1]) < 0.1 && Math.random() < 0.02) {
          api.velocity.set(vx, 3, vz);
      }
    }

    if (nextState !== data.state) {
      updateEnemy(data.id, { state: nextState });
    }
  });

  const hasAppraisal = useGameStore(s => s.skills.find(sk => sk.id === 'appraisal')?.unlocked);
  const [inRange, setInRange] = useState(false);
  const skipCounter = useRef(0);

  useFrame((state) => {
    // Check distance for UI rendering every 10 frames
    skipCounter.current++;
    if (skipCounter.current > 10) {
      _playerPos.copy(state.camera.position);
      _enemyPos.set(...pos.current);
      const d = _playerPos.distanceTo(_enemyPos);
      const nextInRange = d < (data.isBoss ? 150 : 40);
      if (nextInRange !== inRange) setInRange(nextInRange);
      skipCounter.current = 0;
    }
  });

  if (data.state === 'dead') return null;

  const showBillboards = settings.showBillboards && inRange;

  return (
    <group>
      {/* Merged UI Billboard */}
      {showBillboards && (
        <Billboard position={[pos.current[0], pos.current[1] + (data.isBurrowed ? 0.5 : config.size * 2) + 0.5, pos.current[2]]}>
          {/* Status Text (Sleep/Eating) */}
          {data.state === 'sleep' && (
            <Text fontSize={0.3} color="#aaa" position={[0, 1.2, 0]} font="/fonts/Inter-Black.woff">Zzz...</Text>
          )}
          {data.state === 'eat' && (
            <Text fontSize={0.2} color="#00ff00" position={[0, 1.2, 0]}>CONSUMING...</Text>
          )}

          {/* Name & Level */}
          <Text
              fontSize={0.3}
              color={data.isBoss ? '#ff00ff' : '#ff5555'}
              outlineWidth={0.02}
              outlineColor="#000000"
              anchorX="center"
              anchorY="bottom"
              position={[0, 0.4, 0]}
          >
              {config.label}
          </Text>

          {/* Health Bar */}
          <group position={[0, 0.2, 0]}>
            <mesh>
              <planeGeometry args={[1.5, 0.08]} />
              <meshBasicMaterial color="#222" />
            </mesh>
            <mesh position={[-(1.5 - (data.health/data.maxHealth) * 1.5)/2, 0, 0.01]}>
              <planeGeometry args={[(data.health/data.maxHealth) * 1.5, 0.06]} />
              <meshBasicMaterial color={data.hitFlash > 0.5 ? '#ffffff' : (data.isBoss ? '#ff00ff' : '#aa0000')} />
            </mesh>
          </group>

          {/* Appraisal Lore & Weakness */}
          {hasAppraisal && (
              <group position={[0, -0.1, 0]}>
                  <Text
                      position={[0, -0.1, 0]}
                      fontSize={0.14}
                      color="#00ffcc"
                      outlineWidth={0.01}
                      outlineColor="#000000"
                      anchorX="center"
                      anchorY="top"
                      maxWidth={3}
                      textAlign="center"
                  >
                      {config.lore}
                  </Text>
                  <Text
                      position={[0, -0.45, 0]}
                      fontSize={0.12}
                      color="#ffaa00"
                      outlineWidth={0.01}
                      outlineColor="#000000"
                      anchorX="center"
                      anchorY="top"
                  >
                      Wk: {config.weaknesses}
                  </Text>
              </group>
          )}
        </Billboard>
      )}

      {/* Burrowed Logic */}

      {!data.isBurrowed ? (
          <mesh 
            ref={ref as any} 
            castShadow 
            scale={data.state === 'attack' && (data.type === 'behemoth' || data.type === 'golem') ? [1.1, 0.9, 1.1] : (data.type === 'slime' ? [1 + data.level * 0.1, 1 + data.level * 0.1, 1 + data.level * 0.1] : [1, 1, 1])}
          >
            {data.type === 'behemoth' ? (
              <boxGeometry args={[config.size * 2, config.size * 2, config.size * 2]} />
            ) : data.type === 'crystal_golem' ? (
              <octahedronGeometry args={[config.size * 1.2, 0]} />
            ) : data.type === 'borer' ? (
              <cylinderGeometry args={[config.size * 0.5, config.size, config.size * 3, 16]} />
            ) : data.type === 'lich' || data.type === 'demon' || data.type === 'cultist' ? (
              <capsuleGeometry args={[config.size * 0.5, config.size * 2, 8, 16]} />
            ) : data.type === 'wraith' ? (
              <torusKnotGeometry args={[config.size * 0.7, 0.2, 64, 16]} />
            ) : data.type === 'horned_rabbit' ? (
              <capsuleGeometry args={[config.size * 0.4, config.size * 0.8, 8, 8]} />
            ) : (
              <sphereGeometry args={[config.size, 16, 16]} /> // default / slime / stalker
            )}
            <meshStandardMaterial 
                color={data.hitFlash > 0.5 ? '#ffffff' : (data.state === 'attack' ? '#ff0000' : config.color)} 
                emissive={data.hitFlash > 0.1 ? '#ffffff' : (data.state === 'attack' ? '#ff0000' : (data.type === 'lich' || data.type === 'wraith' || data.type === 'cultist' || data.type === 'crystal_golem') ? config.color : data.isBoss ? '#ff00ff' : config.color)}
                emissiveIntensity={data.hitFlash * 15.0 + (data.isPhasing ? 8.0 : (data.type === 'lich' || data.type === 'wraith' || data.type === 'crystal_golem' || data.isBoss ? 4.0 : 1.5))}
                transparent={data.type === 'shade' || data.type === 'lich' || data.type === 'wraith' || data.type === 'slime' || data.type === 'crystal_golem'}
                opacity={data.isPhasing ? 0.2 : (data.type === 'shade' ? 0.4 : data.type === 'wraith' ? 0.6 : data.type === 'slime' ? 0.85 : data.type === 'crystal_golem' ? 0.6 : 1.0)}
                roughness={data.type === 'slime' || data.type === 'crystal_golem' ? 0.0 : 0.1}
                metalness={data.type === 'slime' ? 0.1 : data.type === 'crystal_golem' ? 1.0 : 0.8}
            />
          </mesh>
      ) : (
         <mesh position={[pos.current[0], 0.1, pos.current[2]]} rotation={[-Math.PI/2, 0, 0]}>
             <circleGeometry args={[config.size * 1.5, 16]} />
             <meshStandardMaterial color="#3b2f2f" roughness={1} />
         </mesh>
      )}

      {/* Crystal Golem Shards */}
      {data.type === 'crystal_golem' && !data.isBurrowed && (
         <group position={[pos.current[0], pos.current[1] + config.size * 1.5, pos.current[2]]}>
            <mesh rotation={[0.5, Math.PI / 4, 0]} position={[0, 0.5, 0]}>
               <coneGeometry args={[0.3, 1, 4]} />
               <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={5} transparent opacity={0.6}/>
            </mesh>
         </group>
      )}

      {/* Cultist Void Orb */}
      {data.type === 'cultist' && !data.isBurrowed && (
         <group position={[pos.current[0], pos.current[1] + config.size + 1, pos.current[2]]}>
            <mesh>
               <sphereGeometry args={[0.3, 16, 16]} />
               <meshStandardMaterial color="#aa00ff" emissive="#aa00ff" emissiveIntensity={10} />
            </mesh>
         </group>
      )}

      {/* Horned Rabbit Ears */}
      {data.type === 'horned_rabbit' && (
         <group position={[0, config.size * 0.5, 0]}>
            <mesh position={[-0.15, 0.4, 0]} rotation={[0, 0, 0.2]}>
               <coneGeometry args={[0.05, 0.6, 8]} />
               <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0.15, 0.4, 0]} rotation={[0, 0, -0.2]}>
               <coneGeometry args={[0.05, 0.6, 8]} />
               <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0, 0.2, 0.2]} rotation={[1.5, 0, 0]}>
               <coneGeometry args={[0.1, 0.5, 8]} />
               <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" />
            </mesh>
         </group>
      )}

      {/* Demon Horns */}
      {data.type === 'demon' && (
         <group position={[0, config.size, 0]}>
            <mesh position={[-0.3, 0.3, 0]} rotation={[0, 0, 0.5]}>
               <coneGeometry args={[0.15, 0.8, 8]} />
               <meshStandardMaterial color="#222" />
            </mesh>
            <mesh position={[0.3, 0.3, 0]} rotation={[0, 0, -0.5]}>
               <coneGeometry args={[0.15, 0.8, 8]} />
               <meshStandardMaterial color="#222" />
            </mesh>
         </group>
      )}
      
      {/* Boss/Lich Aura Rings */}
      {(data.type === 'lich' || data.isBoss) && (
        <group position={[pos.current[0], pos.current[1], pos.current[2]]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
             <torusGeometry args={[config.size * 1.5, 0.05, 16, 32]} />
             <meshStandardMaterial color={config.auraColor} emissive={config.auraColor} emissiveIntensity={config.auraIntensity} transparent opacity={0.5} />
          </mesh>
          <mesh rotation={[Math.PI / 2, Math.PI / 4, 0]} scale={0.8}>
             <torusGeometry args={[config.size * 1.8, 0.03, 16, 32]} />
             <meshStandardMaterial color={config.auraColor} emissive={config.auraColor} emissiveIntensity={config.auraIntensity} transparent opacity={0.3} />
          </mesh>
          {data.isBoss && (
            <mesh ref={auraRef}>
              <torusKnotGeometry args={[config.size * 2.2, 0.1, 128, 32]} />
              <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={5} transparent opacity={0.2} />
            </mesh>
          )}
        </group>
      )}
    </group>
  );
};

// Supporting hooks for enemy spawning/listing
import { useEffect } from 'react';
