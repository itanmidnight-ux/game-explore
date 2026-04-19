/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, useEffect, useState, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PointerLockControls, Stars, Environment, Float, Sky } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { Physics } from '@react-three/cannon';
import { Player } from './Player';
import { WorldMap } from './WorldMap';
import { SpellManager } from './Spells';
import { HUD } from '../ui/HUD';
import { LevelUpOverlay } from '../ui/LevelUpOverlay';
import { MainMenu } from '../ui/MainMenu';
import { SettingsMenu } from '../ui/SettingsMenu';
import { CharacterCreation } from '../character/CharacterCreation';
import { Embers, VoidDust } from './VFX';
import { Enemy } from './Enemy';
import { WeatherSystem } from './WeatherVFX';
import { SoundSystem } from './SoundSystem';
import { CinematicDirector } from './CinematicDirector';
import { LootDrop } from './LootDrop';
import { CraftingMenu } from './CraftingMenu';
import { useGameStore } from '../../store';
import { WeatherType } from '../../types';
import { Vector3, Euler } from 'three';

import { CombatParticles } from './CombatParticles';
import { DamagePopups } from './DamagePopups';
import { WorldMarkers } from './WorldMarkers';

const CelestialBodies = ({ gameTime }: { gameTime: number }) => {
  const { camera } = useThree();
  const sunRef = useRef<THREE.Group>(null);
  const moonRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const angle = (gameTime - 6) * Math.PI / 12;
    const distance = 3000; // Place them far away but within clipping

    if (sunRef.current) {
      sunRef.current.position.set(
        camera.position.x + Math.cos(angle) * distance,
        camera.position.y + Math.sin(angle) * distance,
        camera.position.z - 1000
      );
      // Small rotation for the sun sphere
      sunRef.current.rotation.y += 0.001; 
    }

    if (moonRef.current) {
      const moonAngle = angle + Math.PI;
      moonRef.current.position.set(
        camera.position.x + Math.cos(moonAngle) * distance,
        camera.position.y + Math.sin(moonAngle) * distance,
        camera.position.z - 1000
      );
      moonRef.current.rotation.y += 0.001;
    }
  });

  return (
    <>
      <group ref={sunRef}>
        <mesh>
          <sphereGeometry args={[120, 32, 32]} />
          <meshBasicMaterial color="#fff5b4" />
        </mesh>
        {/* The sun itself is a glow structure */}
        <pointLight intensity={2000000} distance={8000} color="#fff5b4" />
      </group>
      <group ref={moonRef}>
        <mesh>
          <sphereGeometry args={[80, 32, 32]} />
          <meshBasicMaterial color="#d0e5ff" />
        </mesh>
        <pointLight intensity={500000} distance={8000} color="#b4c8ff" />
      </group>
    </>
  );
};

const Sun = ({ gameTime, isNight, shadows, isMobile }: { gameTime: number, isNight: boolean, shadows: boolean, isMobile: boolean }) => {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const { camera } = useThree();
  
  // Real time math for positioning - sun moves in a large arc
  const sunIntensity = Math.max(0, Math.sin((gameTime - 6) * Math.PI / 12) * 1.5);
  const moonIntensity = Math.max(0, Math.sin((gameTime - 18) * Math.PI / 12) * 0.8);

  useFrame(() => {
    if (lightRef.current) {
      const angle = (gameTime - 6) * Math.PI / 12;
      const dist = 500;
      const x = dist * Math.cos(angle);
      const y = dist * Math.sin(angle);
      
      lightRef.current.position.set(
          camera.position.x + x,
          camera.position.y + y,
          camera.position.z - 200
      );
      
      lightRef.current.target.position.set(camera.position.x, camera.position.y, camera.position.z);
      lightRef.current.target.updateMatrixWorld();
    }
  });

  return (
    <>
      {sunIntensity > 0 && (
        <directionalLight 
          ref={lightRef}
          intensity={1.8 * sunIntensity} 
          castShadow={shadows && sunIntensity > 0.05}
          shadow-camera-left={-120}
          shadow-camera-right={120}
          shadow-camera-top={120}
          shadow-camera-bottom={120}
          shadow-camera-near={0.1}
          shadow-camera-far={1500}
          shadow-bias={-0.0001}
          shadow-mapSize={isMobile ? [1024, 1024] : [2048, 2048]}
          color="#fffaf0"
        />
      )}
      {moonIntensity > 0 && (
        <directionalLight 
          position={[-100, 200, 100]} 
          intensity={0.4 * moonIntensity} 
          color="#d0dfff" 
        />
      )}
      <ambientLight intensity={0.5 + sunIntensity * 0.6 + moonIntensity * 0.15} />
    </>
  );
};

export default function Game() {
  const enemies = useGameStore(s => s.enemies);
  const setMobile = useGameStore(s => s.setMobile);
  const isMobile = useGameStore(s => s.isMobile);
  const gameTime = useGameStore(s => s.gameTime);
  const advanceTime = useGameStore(s => s.advanceTime);
  const updateEnemies = useGameStore(s => s.updateEnemies);
  const gamePhase = useGameStore(s => s.gamePhase);
  const spawnPosition = useGameStore(s => s.spawnPosition);
  const isCraftingOpen = useGameStore(s => s.isCraftingOpen);
  const isTerrainReady = useGameStore(s => s.isTerrainReady);
  const [isLandscape, setIsLandscape] = useState(true);

  const setSettingsOpen = useGameStore(s => s.setSettingsOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSettingsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSettingsOpen]);

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', checkOrientation);
    checkOrientation();
    
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setMobile(isTouch);
    
    return () => window.removeEventListener('resize', checkOrientation);
  }, [setMobile]);

  const isNight = gameTime < 5 || gameTime > 19;
  const isGoldenHour = (gameTime >= 17 && gameTime <= 19) || (gameTime >= 5 && gameTime <= 7);
  const weather = useGameStore(s => s.weather);
  
  const sunIntensity = Math.min(1.5, Math.max(0, Math.sin((gameTime - 5.5) * Math.PI / 13) * 2));
  const moonIntensity = Math.min(0.8, Math.max(0, Math.sin((gameTime - 18) * Math.PI / 10)));
  
  let fogColor = '#90caf9'; // Stronger clear day blue
  if (isNight) fogColor = '#010208'; // Deeper night
  else if (isGoldenHour) fogColor = '#ffb347'; // Vivid orange

  let ambientIntensity = isNight ? 0.02 : 0.8;
  let finalFogFar = isMobile ? 350 : 1200;

  // Weather overrides
  if (weather === 'void_storm') {
    fogColor = isNight ? '#050015' : '#1a0035';
    ambientIntensity *= 0.4;
    finalFogFar = isMobile ? 100 : 300;
  } else if (weather === 'ash_fall') {
    fogColor = '#2a2a2a';
    ambientIntensity *= 0.7;
    finalFogFar = isMobile ? 80 : 200;
  }

  const settings = useGameStore(s => s.settings);

  const activeEnemies = useMemo(() => 
    enemies.filter(e => e.state !== 'dead').slice(0, isMobile ? 8 : 24),
  [enemies, isMobile]);

  return (
    <div className="fixed inset-0 w-full h-full bg-black overflow-hidden font-sans select-none touch-none">
      {/* Landscape Warning for Mobile */}
      {!isLandscape && isMobile && (
        <div className="absolute inset-0 z-[110] bg-black flex flex-col items-center justify-center p-8 text-center animate-pulse">
           <svg className="w-24 h-24 text-accent-neon mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
           </svg>
           <h2 className="text-3xl font-display font-black text-accent-neon uppercase tracking-widest mb-4">ROTATE DEVICE</h2>
           <p className="text-white/60 text-xs tracking-[0.3em] uppercase">Eldritch Sovereignty requires landscape mode for full immersion.</p>
        </div>
      )}

      {/* Anime-Style Boot Sequence Overlay */}
      {gamePhase === 'playing' && <LoadingScreen />}
      
      {/* Switching Phases */}
      {gamePhase === 'menu' && <MainMenu />}
      {gamePhase === 'creation' && <CharacterCreation />}
      <SettingsMenu />

      {gamePhase === 'playing' && (
        <>
          <Canvas 
            shadows={settings.dynamicShadows} 
            dpr={settings.quality === 'low' ? [0.8, 1] : settings.quality === 'medium' ? [1, 1.5] : [1, 2]}
            gl={{ antialias: settings.quality !== 'low' }}
            camera={{ fov: 45, position: [0, 5, 10], far: 10000 }}
          >
            <CameraWatcher />
            <TouchLookController />
            <GameLoopHandler advanceTime={advanceTime} updateEnemies={updateEnemies} />
            <color attach="background" args={[fogColor]} />
            <fog attach="fog" args={[fogColor, 100, isMobile ? 600 : 1200]} />
            
            <Sky 
              distance={450000}
              sunPosition={[
                Math.cos((gameTime - 6) * Math.PI / 12),
                Math.sin((gameTime - 6) * Math.PI / 12),
                -0.2
              ]} 
              turbidity={0.05}
              rayleigh={0.5}
              mieCoefficient={0.001}
              mieDirectionalG={0.95}
            />

            {isNight && (
               <Stars radius={400} depth={80} count={isMobile ? 1000 : 5000} factor={10} saturation={0.8} fade speed={1.5} />
            )}
            
            <CelestialBodies gameTime={gameTime} />
            <Sun gameTime={gameTime} isNight={isNight} shadows={settings.dynamicShadows} isMobile={isMobile} />
            
            <Suspense fallback={null}>
              <Physics gravity={[0, -9.81, 0]} allowSleep stepSize={1/60} maxSubSteps={10}>
                {isTerrainReady && (
                   <>
                     <Player position={spawnPosition} />
                     <Suspense fallback={null}>
                       {activeEnemies.map(enemy => (
                         <Enemy key={enemy.id} data={enemy} />
                       ))}
                     </Suspense>
                   </>
                )}
                <WorldMap />
                <SpellManager />
                <WeatherSystem />
                <Embers />
                <VoidDust />
                <CombatParticles />
                <DamagePopups />
                <WorldMarkers />
                <GroundEffectsRenderer />
            </Physics>
              <Environment preset={isNight ? "night" : "forest"} />
            </Suspense>
            <SoundSystem />
            <CinematicDirector />
            <LootSystem />

            {/* NO FILTERS as requested */}

            <PointerLockControls enabled={!isCraftingOpen} />
          </Canvas>
          <LevelUpOverlay />
          <HUD />
          <CraftingMenu />
        </>
      )}
    </div>
  );
}



function LoadingScreen() {
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(true);
    const [status, setStatus] = useState('DECRYPTING SHADOW ASSETS...');
    const isTerrainReady = useGameStore(s => s.isTerrainReady);

    useEffect(() => {
        const statuses = [
            'INITIALIZING NEURAL LINK...',
            'STABILIZING VOID CHANNELS...',
            'LINKING SOUL DATA...',
            'SYNCHRONIZING WITH REYNUN...',
            'SYSTEM BOOT COMPLETE.'
        ];
        
        let i = 0;
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90 && !isTerrainReady) {
                    setStatus('WAITING FOR WORLD SHARDS TO STABILIZE...');
                    return 90; // Wait at 90% until terrain is ready
                }
                
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setVisible(false), 800);
                    return 100;
                }
                const next = prev + Math.random() * 15;
                if (next > (i + 1) * 20 && i < statuses.length - 1) {
                    i++;
                    setStatus(statuses[i]);
                }
                return Math.min(100, next);
            });
        }, 300);
        return () => clearInterval(interval);
    }, [isTerrainReady]);

    if (!visible) return null;

    return (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center font-mono pointer-events-auto"
        >
            <div className="w-64 h-1 bg-white/10 overflow-hidden relative mb-4">
                <motion.div 
                  className="h-full bg-accent-neon shadow-[0_0_15px_#00f2ff]"
                  animate={{ width: `${progress}%` }}
                />
            </div>
            <div className="text-[10px] text-accent-neon tracking-[0.5em] uppercase animate-pulse mb-10">{status}</div>
            
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
                <div className="text-[8px] text-white tracking-[0.8em] font-black uppercase">Eldritch Sovereignty // v0.9.4a</div>
                <div className="w-1 h-32 bg-gradient-to-b from-transparent via-white to-transparent" />
            </div>
        </motion.div>
    );
}

function LootSystem() {
    const lootDrops = useGameStore(s => s.lootDrops);
    const collectLoot = useGameStore(s => s.collectLoot);
    const { camera } = useThree();
    
    useFrame(() => {
        const playerPos = camera.position;
        lootDrops.forEach(drop => {
            const dropPos = new Vector3(...drop.position);
            const dist = playerPos.distanceTo(dropPos);
            if (dist < 3) {
                collectLoot(drop.id);
            }
        });
    });

    return (
        <group>
            {lootDrops.map(drop => (
                <LootDrop key={drop.id} drop={drop} />
            ))}
        </group>
    );
}

function GameLoopHandler({ advanceTime, updateEnemies }: { advanceTime: (d: number) => void, updateEnemies: (d: number) => void }) {
  const setWeather = useGameStore(s => s.setWeather);
  const isCraftingOpen = useGameStore(s => s.isCraftingOpen);
  const setCraftingOpen = useGameStore(s => s.setCraftingOpen);
  const nextWeatherChange = useRef(30); // Start check in 30s
  
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'c') {
        setCraftingOpen(!isCraftingOpen);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isCraftingOpen, setCraftingOpen]);

  useFrame((_, delta) => {
    const isHitStop = useGameStore.getState().isHitStop;
    const effectiveDelta = isHitStop ? delta * 0.05 : delta;

    // 1 real second = 0.01333 game hours (1 game day = 30 minutes)
    advanceTime(effectiveDelta * 0.01333);
    // Handle enemy respawns and modifiers
    updateEnemies(effectiveDelta);

    // Periodically tick ground effects
    if (Math.random() < 0.1) {
       useGameStore.getState().tickGroundEffects(Date.now());
    }

    // Weather shifting logic
    nextWeatherChange.current -= delta; // Weather logic doesn't care about hitstop
    if (nextWeatherChange.current <= 0) {
      // Periodic Auto-save feedback
      useGameStore.getState().addLog('SYSTEM: Snapshot synced to local soul-nexus.', 'info');
      
      const weathers: WeatherType[] = ['clear', 'void_storm', 'ash_fall'];
      const next = weathers[Math.floor(Math.random() * weathers.length)];
      
      const currentState = useGameStore.getState();
      if (next !== currentState.weather) {
        setWeather(next);
      }
      
      nextWeatherChange.current = 120 + Math.random() * 240; // Change every 2-4 minutes
    }
  });
  return null;
}

function CameraWatcher() {
  const { camera } = useThree();
  const setCameraHeading = useGameStore(s => s.setCameraHeading);
  
  useFrame(() => {
    const euler = new Euler().setFromQuaternion(camera.quaternion, 'YXZ');
    setCameraHeading(euler.y);
  });
  
  return null;
}

function TouchLookController() {
  const { camera } = useThree();
  const touchLook = useGameStore(s => s.touchLook);
  const setTouchLook = useGameStore(s => s.setTouchLook);
  const pitch = useRef(0);
  const yaw = useRef(0);

  useFrame(() => {
    if (touchLook.x !== 0 || touchLook.y !== 0) {
      // Sensitivity factor
      const sensitivity = 0.005;
      
      yaw.current -= touchLook.x * sensitivity;
      pitch.current -= touchLook.y * sensitivity;
      
      // Limit pitch to prevent flipping
      pitch.current = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, pitch.current));
      
      camera.quaternion.setFromEuler(new Euler(pitch.current, yaw.current, 0, 'YXZ'));
      
      // Reset delta after applying
      setTouchLook({ x: 0, y: 0 });
    } else {
        // Sync internal refs if modified by PointerLockControls
        const euler = new Euler().setFromQuaternion(camera.quaternion, 'YXZ');
        yaw.current = euler.y;
        pitch.current = euler.x;
    }
  });

  return null;
}

function GroundEffectsRenderer() {
    const effects = useGameStore(s => s.groundEffects);
    
    return (
        <group>
            {effects.map(effect => (
                <mesh key={effect.id} position={[effect.position[0], 0.05, effect.position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[effect.radius, 16]} />
                    <meshBasicMaterial 
                        color={effect.type === 'slime_trail' ? '#00ffcc' : '#ff0000'} 
                        transparent 
                        opacity={effect.type === 'slime_trail' ? 0.3 : 0.4} 
                    />
                </mesh>
            ))}
        </group>
    );
}




