/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { Vector3, Vector2 } from 'three';
import { Weapon } from './Weapon';
import { useGameStore } from '../../store';
import { getTerrainHeight } from '../../lib/terrainUtils';

const VoidWings = ({ active }: { active: boolean }) => {
  if (!active) return null;
  return (
    <group position={[0, 0, 0.5]}>
      <mesh position={[-1.2, 0.5, 0]} rotation={[0, -0.4, 0.2]}>
        <planeGeometry args={[2, 0.8]} />
        <meshStandardMaterial color="#00f2ff" transparent opacity={0.4} emissive="#00f2ff" emissiveIntensity={2} side={2} />
      </mesh>
      <mesh position={[1.2, 0.5, 0]} rotation={[0, 0.4, -0.2]}>
        <planeGeometry args={[2, 0.8]} />
        <meshStandardMaterial color="#00f2ff" transparent opacity={0.4} emissive="#00f2ff" emissiveIntensity={2} side={2} />
      </mesh>
    </group>
  );
};

const useKeyboard = () => {
  const [actions, setActions] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    shift: false,
    crouch: false,
    digit1: false,
    digit2: false,
    digit3: false,
    digit4: false,
    digit5: false,
    digit6: false,
    digit7: false,
    digit8: false,
    digit9: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': setActions((prev) => ({ ...prev, forward: true })); break;
        case 'KeyS': setActions((prev) => ({ ...prev, backward: true })); break;
        case 'KeyA': setActions((prev) => ({ ...prev, left: true })); break;
        case 'KeyD': setActions((prev) => ({ ...prev, right: true })); break;
        case 'Space': setActions((prev) => ({ ...prev, jump: true })); break;
        case 'ShiftLeft': setActions((prev) => ({ ...prev, shift: true })); break;
        case 'KeyC': setActions((prev) => ({ ...prev, crouch: true })); break;
        case 'Digit1': setActions((prev) => ({ ...prev, digit1: true })); break;
        case 'Digit2': setActions((prev) => ({ ...prev, digit2: true })); break;
        case 'Digit3': setActions((prev) => ({ ...prev, digit3: true })); break;
        case 'Digit4': setActions((prev) => ({ ...prev, digit4: true })); break;
        case 'Digit5': setActions((prev) => ({ ...prev, digit5: true })); break;
        case 'Digit6': setActions((prev) => ({ ...prev, digit6: true })); break;
        case 'Digit7': setActions((prev) => ({ ...prev, digit7: true })); break;
        case 'Digit8': setActions((prev) => ({ ...prev, digit8: true })); break;
        case 'Digit9': setActions((prev) => ({ ...prev, digit9: true })); break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': setActions((prev) => ({ ...prev, forward: false })); break;
        case 'KeyS': setActions((prev) => ({ ...prev, backward: false })); break;
        case 'KeyA': setActions((prev) => ({ ...prev, left: false })); break;
        case 'KeyD': setActions((prev) => ({ ...prev, right: false })); break;
        case 'Space': setActions((prev) => ({ ...prev, jump: false })); break;
        case 'ShiftLeft': setActions((prev) => ({ ...prev, shift: false })); break;
        case 'KeyC': setActions((prev) => ({ ...prev, crouch: false })); break;
        case 'Digit1': setActions((prev) => ({ ...prev, digit1: false })); break;
        case 'Digit2': setActions((prev) => ({ ...prev, digit2: false })); break;
        case 'Digit3': setActions((prev) => ({ ...prev, digit3: false })); break;
        case 'Digit4': setActions((prev) => ({ ...prev, digit4: false })); break;
        case 'Digit5': setActions((prev) => ({ ...prev, digit5: false })); break;
        case 'Digit6': setActions((prev) => ({ ...prev, digit6: false })); break;
        case 'Digit7': setActions((prev) => ({ ...prev, digit7: false })); break;
        case 'Digit8': setActions((prev) => ({ ...prev, digit8: false })); break;
        case 'Digit9': setActions((prev) => ({ ...prev, digit9: false })); break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return actions;
};

export const Player = ({ position = [0, 5, 0] }: { position?: [number, number, number] }) => {
  const { 
    forward, backward, left, right, jump, shift, crouch,
    digit1, digit2, digit3, digit4, digit5, digit6, digit7, digit8, digit9 
  } = useKeyboard();
  const { camera } = useThree();
  const useStamina = useGameStore((s) => s.useStamina);
  const regenerateStamina = useGameStore((s) => s.regenerateStamina);
  const regenerateMana = useGameStore((s) => s.regenerateMana);
  const castSpell = useGameStore((s) => s.castSpell);
  const currentSpell = useGameStore((s) => s.currentSpell);
  const setCurrentSpell = useGameStore((s) => s.setCurrentSpell);
  const moveSpeedMultiplier = useGameStore((s) => s.moveSpeedMultiplier);
  const mobileMovement = useGameStore((s) => s.mobileMovement);
  const screenShake = useGameStore((s) => s.screenShake);
  const isCinematic = useGameStore((s) => s.isCinematic);
  const attributes = useGameStore((s) => s.attributes);
  const setBlocking = useGameStore((s) => s.setBlocking);
  const isGliding = useGameStore((s) => s.isGliding);
  const setGliding = useGameStore((s) => s.setGliding);
  const updateNearestInteraction = useGameStore((s) => s.updateNearestInteraction);
  const setHotbarIndex = useGameStore((s) => s.setHotbarIndex);
  const hotbarIndex = useGameStore((s) => s.hotbarIndex);
  const hotbarSlots = useGameStore((s) => s.hotbarSlots);
  const setCrouching = useGameStore((s) => s.setCrouching);
  const isCrouching = useGameStore((s) => s.isCrouching);
  
  const [ref, api] = useSphere(() => ({
    mass: 1,
    type: 'Dynamic',
    position: position,
    args: [0.6],
    fixedRotation: true,
    linearDamping: 0.1, // Prevent excessive sliding
    material: {
      friction: 0.1,
      restitution: 0
    }
  }));

  const velocity = useRef([0, 0, 0]);
  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity]);

  const pos = useRef([0, 0, 0]);
  useEffect(() => api.position.subscribe((p) => (pos.current = p)), [api.position]);

  const prevJump = useRef(false);
  const dashCooldown = useRef(0);
  const castCooldown = useRef(0);

  useEffect(() => {
    const handleRightClick = (e: MouseEvent) => {
      e.preventDefault();
      // Blocking is old logic, let's use it if hotbar is empty? 
      // Actually user says Right click triggers ability.
      const currentSlot = useGameStore.getState().hotbarSlots[useGameStore.getState().hotbarIndex];
      if (currentSlot === 'bash' || currentSlot === 'iron_guard') {
         setBlocking(true);
      } else if (currentSlot === 'spark') {
         // Trigger magic attack
         const direction = new Vector3();
         camera.getWorldDirection(direction);
         const spawnPos: [number, number, number] = [
           pos.current[0] + direction.x * 1,
           pos.current[1] + 1.2 + direction.y * 1,
           pos.current[2] + direction.z * 1
         ];
         castSpell('fireball', spawnPos, [direction.x, direction.y, direction.z]);
      } else if (currentSlot === 'dash') {
         // Trigger dash
         const direction = new Vector3();
         camera.getWorldDirection(direction);
         if (useStamina(30)) {
            api.velocity.set(direction.x * 20, direction.y * 5, direction.z * 20);
            useGameStore.getState().addLog('SYSTEM: [DASH] logic synchronized.', 'info');
         }
      }
    };
    const handleRightUp = () => setBlocking(false);

    window.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('mousedown', (e) => e.button === 2 && handleRightClick(e));
    window.addEventListener('mouseup', (e) => e.button === 2 && handleRightUp());
    
    return () => {
      window.removeEventListener('mousedown', (e) => e.button === 2 && handleRightClick(e));
      window.removeEventListener('mouseup', (e) => e.button === 2 && handleRightUp());
    };
  }, [setBlocking, castSpell, useStamina, api.velocity, camera]);

  const headBob = useRef(0);
  const _hazPPos = new Vector3();
  const _hazHPos = new Vector3();

  useFrame((state, delta) => {
    if (isCinematic) return;
    regenerateStamina(delta * 10);
    regenerateMana(delta * (5 + attributes.intelligence * 0.5));

    // Fall protection - ensures player stays above ground
    const craters = useGameStore.getState().craters;
    const groundY = getTerrainHeight(pos.current[0], pos.current[2], craters);
    
    // Deeper check: If player is stuck inside or just below the terrain
    if (pos.current[1] < groundY + 0.3) {
       // Push up slightly and reset vertical velocity
       api.position.set(pos.current[0], groundY + 0.8, pos.current[2]);
       if (velocity.current[1] < 0) api.velocity.set(velocity.current[0], 0, velocity.current[2]);
    }

    if (pos.current[1] < groundY - 10) {
       api.position.set(pos.current[0], groundY + 5, pos.current[2]);
       api.velocity.set(0, 0, 0);
    }
    
    // Hotbar Selection
    if (digit1) setHotbarIndex(0);
    else if (digit2) setHotbarIndex(1);
    else if (digit3) setHotbarIndex(2);
    else if (digit4) setHotbarIndex(3);
    else if (digit5) setHotbarIndex(4);
    else if (digit6) setHotbarIndex(5);
    else if (digit7) setHotbarIndex(6);
    else if (digit8) setHotbarIndex(7);
    else if (digit9) setHotbarIndex(8);

    // Crouching logic - guarded to prevent unnecessary state updates
    if (isCrouching !== crouch) {
        setCrouching(crouch);
    }
    const targetHeight = isCrouching ? 0.8 : 1.6;

    const currentPos = [pos.current[0], pos.current[1], pos.current[2]] as [number, number, number];
    
    // Natural Movement - Head Bob
    const currentVelocity = new Vector3(...velocity.current);
    const vMag = new Vector2(currentVelocity.x, currentVelocity.z).length();
    
    if (vMag > 1 && !isGliding) {
       headBob.current += delta * vMag * (isCrouching ? 0.6 : 1);
       const bobOffset = Math.sin(headBob.current * 2) * 0.05 * (isCrouching ? 0.5 : 1);
       camera.position.set(currentPos[0], currentPos[1] + targetHeight + bobOffset, currentPos[2]);
    } else {
       camera.position.set(currentPos[0], currentPos[1] + targetHeight, currentPos[2]);
       headBob.current = 0;
    }

    if (state.clock.elapsedTime % 0.5 < 0.1) {
       updateNearestInteraction(currentPos);
    }

    // Hazard effects
    const hazards = useGameStore.getState().groundEffects;

    // Hazard Damage check - Optimized
    if (state.clock.elapsedTime % 1 < 0.2) {
       _hazPPos.set(...currentPos);
       for (const hazard of hazards) {
           _hazHPos.set(...hazard.position);
           if (_hazPPos.distanceToSquared(_hazHPos) <= hazard.radius * hazard.radius) {
               if (hazard.type === 'corruption') {
                   useGameStore.getState().takeDamage(5);
               } else if (hazard.type === 'slime_trail') {
                   useGameStore.getState().useStamina(2);
               }
           }
       }
    }

    if (screenShake > 0) {
      camera.position.x += (Math.random() - 0.5) * screenShake;
      camera.position.y += (Math.random() - 0.5) * screenShake;
      camera.position.z += (Math.random() - 0.5) * screenShake;
    }


    // Movement logic (Unity of Keyboard and Joystick)
    const direction = new Vector3();
    let front = Number(backward) - Number(forward);
    let side = Number(left) - Number(right);

    // If mobile joystick is active, normalize correctly
    if (mobileMovement) {
      // Joystick returns absolute pixels (up to 60ish radius), normalize to -1..1
      side = -mobileMovement.x / 60; 
      front = -mobileMovement.y / 60;
      // Clamp for safety
      side = Math.max(-1, Math.min(1, side));
      front = Math.max(-1, Math.min(1, front));
    }

    const frontVector = new Vector3(0, 0, front);
    const sideVector = new Vector3(side, 0, 0);

    const mobileActions = useGameStore.getState().mobileActions;
    const activeJump = jump || mobileActions.jump;
    const activeShift = shift || mobileActions.dash;

    let hazardSlow = 1.0;
    for (const hazard of hazards) {
        if (hazard.type === 'slime_trail' && new Vector3(...hazard.position).distanceTo(new Vector3(...currentPos)) <= hazard.radius) {
            hazardSlow = 0.5; // 50% slow
        }
    }

    let speed = (activeShift ? 8 : (isCrouching ? 2 : 4)) * moveSpeedMultiplier * hazardSlow;
    
    // Sprint costs stamina
    if (activeShift && !isCrouching && (Math.abs(front) > 0.1 || Math.abs(side) > 0.1)) {
      if (!useStamina(delta * 20)) {
        speed = (isCrouching ? 2 : 4) * moveSpeedMultiplier * hazardSlow;
      }
    }

    // Free Movement: Normalize diagonal and joystick input
    const movementVector = new Vector3(side, 0, front);
    if (movementVector.length() > 1) movementVector.normalize();

    direction
      .copy(movementVector)
      .multiplyScalar(speed)
      .applyQuaternion(camera.quaternion);

    api.velocity.set(direction.x, velocity.current[1], direction.z);
    
    // Gliding Physics
    if (isGliding) {
        if (!useStamina(delta * 15) || Math.abs(velocity.current[1]) < 0.1) {
            setGliding(false);
        } else {
            // Slow fall
            api.velocity.set(velocity.current[0], -1.5, velocity.current[2]);
        }
    }

    // Add pulsing player light base for constant world reference
    if (camera) {
        // Player's personal abyssal lantern
        // Using a point light that follows the camera position
    }

    const jumpJustPressed = activeJump && !prevJump.current;
    if (jumpJustPressed) {
      const isFalling = velocity.current[1] < -1;
      if (isFalling) {
          setGliding(!isGliding);
      } else if (Math.abs(velocity.current[1]) < 0.2) {
          if (useStamina(15)) {
            api.velocity.set(velocity.current[0], 5, velocity.current[2]);
          }
      }
    }
    prevJump.current = activeJump;

    // Dodge (Double tap or specific key could be used, let's use a dash cooldown)
    if (activeShift && dashCooldown.current <= 0 && (front || side)) {
       // Just a simple boost for now
       // dashCooldown.current = 1.0;
    }
    dashCooldown.current -= delta;
  });

  return (
    <>
      <mesh ref={ref as any} />
      <Weapon />
      <VoidWings active={isGliding} />
      <pointLight position={[0, 2, 0]} intensity={1.5} distance={15} color="#00f2ff" />
      <spotLight position={[0, 2, 0]} intensity={2} distance={20} angle={0.8} penumbra={1} color="#ffffff" shadow-mapSize={[1024, 1024]} castShadow />
    </>
  );
};

