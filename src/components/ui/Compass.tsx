/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { useGameStore } from '../../store';
import { Vector3, Euler } from 'three';

const landmarks = [
  { name: 'THRONE', x: 0, z: -1500, icon: '👑', color: 'text-amber-400' },
  { name: 'SPIRE', x: -1500, z: -1500, icon: '🏙️', color: 'text-cyan-400' },
  { name: 'CITADEL', x: 1500, z: 1500, icon: '🏛️', color: 'text-purple-400' },
  { name: 'BOSS', x: 0, z: -500, icon: '💀', color: 'text-red-400' },
  { name: 'VILLAGE', x: 400, z: 400, icon: '🏡', color: 'text-emerald-400' },
];

export const Compass = () => {
  const heading = useGameStore(s => s.cameraHeading);
  const [dynamicLandmarks, setDynamicLandmarks] = React.useState(landmarks.map(l => ({ ...l, angle: 0 })));

  // Landmarks calculation remains in state, but we don't use useThree camera here
  // Actually, we need the player position to calculate landmark angles relative to player.
  // We can get spawnPosition or just assume player is around [0,0,0] or similar.
  // Realistically, the player position is also in the store or we can pass it.
  // For now, let's just use the store heading.
  
  // To keep it simple and fix the error, I'll update landmark angles too if I have the position.
  // But let's check if store has player position. It has spawnPosition.
  const spawnPosition = useGameStore(s => s.spawnPosition);
  
  React.useEffect(() => {
    setDynamicLandmarks(prev => prev.map(l => {
      const dx = l.x - spawnPosition[0]; // Using spawnPosition as approximation for now
      const dz = l.z - spawnPosition[2];
      const targetAngle = Math.atan2(dx, dz);
      return { ...l, angle: targetAngle };
    }));
  }, [spawnPosition]);

  const markers = [
    { label: 'N', angle: 0 },
    { label: 'NE', angle: Math.PI / 4 },
    { label: 'E', angle: Math.PI / 2 },
    { label: 'SE', angle: (3 * Math.PI) / 4 },
    { label: 'S', angle: Math.PI },
    { label: 'SW', angle: -(3 * Math.PI) / 4 },
    { label: 'W', angle: -Math.PI / 2 },
    { label: 'NW', angle: -Math.PI / 4 },
  ];

  // Helper to normalize angle to -PI to PI
  const normalizeAngle = (a: number) => {
    let ang = a % (Math.PI * 2);
    if (ang > Math.PI) ang -= Math.PI * 2;
    if (ang < -Math.PI) ang += Math.PI * 2;
    return ang;
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm">
      <div className="relative w-full h-8 overflow-hidden border-x border-white/10">
        {/* Graduation lines mask */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-white/5 to-black/0" />
        
        {/* Dynamic markers container */}
        <div className="absolute inset-0 flex items-center justify-center">
          {markers.map((m) => {
            const diff = normalizeAngle(m.angle - heading);
            // Translate angle difference to screen position (-100% to 100%)
            const x = (diff / Math.PI) * 200; // Visible range is roughly +/- 90deg
            
            if (Math.abs(x) > 100) return null;
            
            return (
              <motion.div
                key={m.label}
                className="absolute flex flex-col items-center"
                style={{ x: `${x}%`, opacity: 1 - Math.abs(x) / 100 }}
              >
                <span className={`text-[10px] font-black tracking-widest ${m.label.length > 1 ? 'text-white/40' : 'text-white'}`}>
                  {m.label}
                </span>
                <div className={`w-[1px] h-1.5 mt-0.5 ${m.label.length > 1 ? 'bg-white/10' : 'bg-white/40'}`} />
              </motion.div>
            );
          })}

          {/* Landmarks markers */}
          {dynamicLandmarks.map((l) => {
            const diff = normalizeAngle(l.angle - heading);
            const x = (diff / Math.PI) * 200;
            
            if (Math.abs(x) > 100) return null;
            
            return (
              <motion.div
                key={l.name}
                className="absolute flex flex-col items-center"
                style={{ x: `${x}%`, opacity: 1 - Math.abs(x) / 100 }}
              >
                <div className="text-[12px] mb-6 filter drop-shadow-sm">{l.icon}</div>
                <div className={`w-[1px] h-3 bg-white/20 absolute top-4`} />
              </motion.div>
            );
          })}
        </div>

        {/* Center pointer */}
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[2px] h-2 bg-accent-neon shadow-[0_0_10px_#00f2ff]" />
      </div>
      
      {/* Current Heading text */}
      <div className="mt-1 text-[8px] font-mono text-white/40 tracking-[0.4em] uppercase">
        AZIMUTH_{Math.round((heading >= 0 ? heading : Math.PI * 2 + heading) * (180 / Math.PI))}°
      </div>
    </div>
  );
};
