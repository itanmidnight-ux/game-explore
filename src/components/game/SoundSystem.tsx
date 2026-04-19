/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../store';

export const SoundSystem = () => {
    const audioEnabled = useGameStore(s => s.audioEnabled);
    const weather = useGameStore(s => s.weather);
    const gameTime = useGameStore(s => s.gameTime);
    
    const isNight = gameTime < 6 || gameTime > 18;

    const audioContext = useRef<AudioContext | null>(null);
    const ambientNode = useRef<GainNode | null>(null);
    const filterNode = useRef<BiquadFilterNode | null>(null);
    const droneNode = useRef<{d1: GainNode, d2: GainNode, d3: GainNode} | null>(null);

    useEffect(() => {
        if (!audioEnabled) {
            if (audioContext.current) {
                audioContext.current.close();
                audioContext.current = null;
            }
            return;
        }

        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContext.current = ctx;

        // Base Abyss Drone
        const createDrone = (freq: number, type: OscillatorType) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            g.gain.setValueAtTime(0, ctx.currentTime);
            osc.connect(g);
            g.connect(ctx.destination);
            osc.start();
            return { osc, gain: g };
        };

        // Hit Sound Trigger
        const triggerHit = () => {
            if (ctx.state !== 'running') return;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
            g.gain.setValueAtTime(0.3, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.connect(g);
            g.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        };

        // Loot Collection Sound
        const triggerLoot = () => {
            if (ctx.state !== 'running') return;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
            g.gain.setValueAtTime(0.2, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
            osc.connect(g);
            g.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
        };

        (window as any).triggerAbyssSound = (type: string) => {
            if (type === 'hit') triggerHit();
            if (type === 'loot') triggerLoot();
        };

        const drone1 = createDrone(40, 'sine');
        const drone2 = createDrone(55, 'triangle');
        const drone3 = createDrone(65, 'sawtooth'); // eerie gritty overtone
        
        droneNode.current = {
            d1: drone1.gain,
            d2: drone2.gain,
            d3: drone3.gain
        };
        
        const windG = ctx.createGain();
        windG.gain.setValueAtTime(0, ctx.currentTime);
        
        // Procedural Wind (Pinkish Noise fallback)
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, ctx.currentTime);
        
        whiteNoise.connect(filter);
        filter.connect(windG);
        windG.connect(ctx.destination);
        whiteNoise.start();

        ambientNode.current = windG;
        filterNode.current = filter;

        return () => {
            ctx.close();
        };
    }, [audioEnabled]);

    useEffect(() => {
        if (!audioContext.current || !ambientNode.current || !droneNode.current || !filterNode.current) return;
        const ctx = audioContext.current;
        const now = ctx.currentTime;
        
        // Determine targets based on weather and time of day
        let targetWindGain = 0.3;
        let windFilterFreq = 400;
        
        let targetDrone1Gain = 0.1; // Sine 40
        let targetDrone2Gain = 0.05; // Triangle 55
        let targetDrone3Gain = 0.0; // Sawtooth 65

        // Adjust for night time
        if (isNight) {
            targetDrone1Gain = 0.2; // heavier bass
            targetDrone2Gain = 0.1;
            targetDrone3Gain = 0.02; // eerie gritty overtone
        }

        // Adjust ambient based on weather
        if (weather === 'void_storm') {
            targetWindGain = 0.8;
            windFilterFreq = 1200; // harsher wind
            targetDrone3Gain = 0.1; // extreme grit from void storm
            targetDrone1Gain = 0.3; // intense bass
        } else if (weather === 'ash_fall') {
            targetWindGain = 0.15;
            windFilterFreq = 200; // muffled subtle ash wind
            targetDrone2Gain = 0.08;
            targetDrone3Gain = 0.0; // quiet
        }
        
        // Ensure values are small enough to prevent setTargetAtTime error occasionally
        const epsilon = 0.001;
        
        // Fade to targets smoothly
        ambientNode.current.gain.setTargetAtTime(Math.max(epsilon, targetWindGain), now, 1.0);
        filterNode.current.frequency.setTargetAtTime(Math.max(epsilon, windFilterFreq), now, 1.0);
        
        droneNode.current.d1.gain.setTargetAtTime(Math.max(epsilon, targetDrone1Gain), now, 2.0);
        droneNode.current.d2.gain.setTargetAtTime(Math.max(epsilon, targetDrone2Gain), now, 2.0);
        droneNode.current.d3.gain.setTargetAtTime(Math.max(epsilon, targetDrone3Gain), now, 2.0);
        
    }, [weather, isNight]);

    return null;
};
