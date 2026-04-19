/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Html } from '@react-three/drei';
import { motion } from 'motion/react';
import { useThree } from '@react-three/fiber';

const markers = [
  { name: 'Sovereign Throne', position: [0, 60, -1500], icon: '👑', color: 'border-amber-400 text-amber-400' },
  { name: 'Zenith Spire', position: [-1500, 80, -1500], icon: '🏙️', color: 'border-cyan-400 text-cyan-400' },
  { name: 'Citadel of Shadows', position: [1500, 50, 1500], icon: '🏛️', color: 'border-purple-400 text-purple-400' },
  { name: 'The Boss Arena', position: [0, 40, -500], icon: '💀', color: 'border-red-500 text-red-500' },
  { name: 'Hidden Village', position: [400, 20, 400], icon: '🏡', color: 'border-emerald-400 text-emerald-400' },
];

export const WorldMarkers = () => {
  const { camera } = useThree();
  
  return (
    <>
      {markers.map((m) => {
        // Calculate distance to hide markers that are too close (occlude user view)
        // or show them differently
        return (
          <Html
            key={m.name}
            position={m.position as [number, number, number]}
            center
            distanceFactor={15}
            occlude="blending"
          >
             <motion.div
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 0.6, scale: 1 }}
               whileHover={{ opacity: 1, scale: 1.1 }}
               className={`flex flex-col items-center gap-2 p-3 border-t-2 bg-black/40 backdrop-blur-md pointer-events-auto cursor-help ${m.color.split(' ')[0]}`}
             >
                <div className="text-2xl filter drop-shadow-md">{m.icon}</div>
                <div className={`text-[10px] whitespace-nowrap font-black uppercase tracking-[0.4em] ${m.color.split(' ')[1]}`}>
                  {m.name}
                </div>
                <div className="w-full h-[1px] bg-white/10" />
             </motion.div>
          </Html>
        );
      })}
    </>
  );
};
