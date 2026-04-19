/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../../store';

export const DamagePopups = () => {
  const damageHistory = useGameStore((s) => s.damageHistory);
  
  // Filter history to only show things from the last 2 seconds
  const activePopups = damageHistory.filter(p => Date.now() - p.timestamp < 1500);

  return (
    <>
      {activePopups.map((p) => (
        <Html
          key={p.id}
          position={[p.position[0], p.position[1] + 2, p.position[2]]}
          center
          distanceFactor={10}
          zIndexRange={[0, 10]}
          pointerEvents="none"
        >
          <motion.div
            initial={{ y: 0, opacity: 0, scale: 0.5 }}
            animate={{ y: -40, opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center select-none"
          >
            <div className={`text-sm font-display font-black italic tracking-tighter drop-shadow-md ${p.amount > 100 ? 'text-amber-400' : 'text-white/80'}`}>
              {p.amount}
            </div>
            {p.amount > 100 && (
              <div className="text-[5px] font-black uppercase tracking-[0.1em] text-amber-500 -mt-0.5">
                CRIT
              </div>
            )}
          </motion.div>
        </Html>
      ))}
    </>
  );
};
