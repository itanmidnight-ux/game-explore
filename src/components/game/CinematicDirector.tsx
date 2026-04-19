/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useGameStore } from '../../store';
import { useRef } from 'react';

export const CinematicDirector = () => {
    const isCinematic = useGameStore(s => s.isCinematic);
    const enemies = useGameStore(s => s.enemies);
    const { camera } = useThree();
    const pivot = useRef(new Vector3());
    const lerpPos = useRef(new Vector3());

    useFrame((state, delta) => {
        if (!isCinematic) return;

        // Find the most recently dead enemy (the one that triggered this)
        const ghost = enemies.find(e => e.state === 'dead' && e.respawnTime > 25);
        if (ghost) {
            pivot.current.set(...ghost.position);
        }

        const time = state.clock.elapsedTime;
        const radius = 10;
        const targetX = pivot.current.x + Math.sin(time) * radius;
        const targetY = pivot.current.y + 5;
        const targetZ = pivot.current.z + Math.cos(time) * radius;

        lerpPos.current.set(targetX, targetY, targetZ);
        camera.position.lerp(lerpPos.current, 0.1);
        camera.lookAt(pivot.current);

        // Slow down time effect simulation (visual only as delta is physical)
        // We could theoretically slow down the game delta but that affects physics
    });

    return null;
};
