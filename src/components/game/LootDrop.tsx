/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Float, Text, Billboard } from '@react-three/drei';
import { LootDrop as LootDropType } from '../../types';

const RARITY_CONFIG = {
  common: { color: '#ffffff', emissive: '#888888', intensity: 0.5, scale: 0.4 },
  rare: { color: '#0088ff', emissive: '#0044ff', intensity: 1, scale: 0.5 },
  epic: { color: '#aa00ff', emissive: '#6600ff', intensity: 2, scale: 0.6 },
  legendary: { color: '#ffaa00', emissive: '#ff6600', intensity: 3, scale: 0.8 },
};

export const LootDrop = ({ drop }: { drop: LootDropType }) => {
  const config = RARITY_CONFIG[drop.rarity] || RARITY_CONFIG.common;

  return (
    <group position={drop.position}>
      <Float speed={3} rotationIntensity={2} floatIntensity={1.5}>
        <mesh castShadow>
          <octahedronGeometry args={[config.scale, 0]} />
          <meshStandardMaterial 
            color={config.color} 
            emissive={config.emissive} 
            emissiveIntensity={config.intensity} 
          />
        </mesh>
        
        <pointLight color={config.color} intensity={config.intensity} distance={5} />
      </Float>

      <Billboard position={[0, 0.8, 0]}>
        <Text
          fontSize={0.15}
          color={config.color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000"
        >
          {drop.itemId.split('_').map(w => w.toUpperCase()).join(' ')}
        </Text>
      </Billboard>
    </group>
  );
};
