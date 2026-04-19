/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, Attribute, Skill, InventoryItem, Recipe, EnemyData, EnemyType, GamePhase, SpellData, WeatherType, EnemyState } from './types';
import { getTerrainHeight, WATER_LEVEL } from './lib/terrainUtils';

interface StoreActions {
  addXP: (amount: number) => void;
  addSkillXP: (skillId: string, amount: number) => void;
  upgradeAttribute: (attr: Attribute) => void;
  unlockSkill: (skillId: string) => void;
  addItem: (item: InventoryItem) => void;
  removeItem: (itemid: string, count: number) => void;
  craftItem: (recipe: Recipe) => void;
  setBlocking: (blocking: boolean) => void;
  useStamina: (amount: number) => boolean;
  regenerateStamina: (amount: number) => void;
  takeDamage: (amount: number) => void;
  applyChill: (duration?: number) => void;
  updateEnemy: (id: string, data: Partial<EnemyData>) => void;
  damageEnemy: (id: string, amount: number, type?: 'physical' | 'magic') => void;
  updateEnemies: (delta: number) => void;
  useMana: (amount: number) => boolean;
  regenerateMana: (amount: number) => void;
  setCurrentSpell: (type: 'fireball' | 'void_bolt') => void;
  castSpell: (type: 'fireball' | 'void_bolt', position: [number, number, number], direction: [number, number, number]) => void;
  castEnemySpell: (type: 'fireball' | 'void_bolt', position: [number, number, number], direction: [number, number, number], damage: number) => void;
  updateSpells: (delta: number) => void;
  removeSpell: (id: string) => void;
  setMobile: (isMobile: boolean) => void;
  advanceTime: (delta: number) => void;
  rest: () => void;
  addLog: (message: string, type?: 'info' | 'critical' | 'quest' | 'level') => void;
  updateCombo: () => void;
  setGamePhase: (phase: GamePhase) => void;
  setWeather: (weather: WeatherType) => void;
  toggleAudio: () => void;
  triggerSound: (type: 'spell' | 'hit' | 'level' | 'ambient' | 'loot') => void;
  dropLoot: (position: [number, number, number], enemyLevel: number) => void;
  collectLoot: (id: string) => void;
  setCraftingOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setMobileMovement: (vector: { x: number, y: number } | null) => void;
  setTouchLook: (delta: { x: number, y: number }) => void;
  setScreenShake: (amount: number) => void;
  triggerHitStop: (duration?: number) => void;
  setCameraHeading: (heading: number) => void;
  setGliding: (gliding: boolean) => void;
  registerInteraction: (event: InteractionEvent) => void;
  unregisterInteraction: (id: string) => void;
  updateNearestInteraction: (pos: [number, number, number]) => void;
  performInteraction: () => void;
  setElement: (element: ElementType) => void;
  startNewGame: () => void;
  setMobileAction: (action: 'jump' | 'dash' | 'attack' | 'block', active: boolean) => void;
  addGroundEffect: (effect: Omit<GroundEffect, 'id' | 'timestamp'>) => void;
  tickGroundEffects: (now: number) => void;
  setCrouching: (crouching: boolean) => void;
  setHotbarIndex: (index: number) => void;
  updateSettings: (settings: Partial<GraphicsSettings>) => void;
  addCrater: (position: [number, number, number], radius: number) => void;
  setTerrainReady: (ready: boolean) => void;
}

import { ElementType, InteractionEvent, GroundEffect, GraphicsSettings } from './types';

const INITIAL_SKILLS: Skill[] = [
  // Warrior Path
  { id: 'bash', name: 'Heavy Bash', description: 'Powerful strike with increased knockback.', path: 'Warrior', cost: 1, unlocked: false, level: 1, xp: 0 },
  { id: 'defense', name: 'Iron Guard', description: 'Reduces damage while blocking.', path: 'Warrior', cost: 1, unlocked: false, requiredSkillId: 'bash', level: 1, xp: 0 },
  // Mage Path
  { id: 'spark', name: 'Eldritch Spark', description: 'A small burst of magical energy.', path: 'Mage', cost: 1, unlocked: false, level: 1, xp: 0 },
  // Rogue Path
  { id: 'dash', name: 'Quick Dash', description: 'Short range teleport/dash.', path: 'Rogue', cost: 1, unlocked: false, level: 1, xp: 0 },
  // Utility Path
  { id: 'appraisal', name: 'Eye of Truth (Appraisal)', description: 'View enemy stats, lore, and weaknesses from afar. Required level 2.', path: 'Mage', cost: 1, unlocked: true, level: 1, xp: 0 },
];

export const useGameStore = create<GameState & StoreActions>()(
  persist(
    (set, get) => ({
      gamePhase: 'menu',
      spawnPosition: [0, 5, 0],
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  attributePoints: 0,
  skillPoints: 0,
  attributes: {
    strength: 10,
    dexterity: 10,
    intelligence: 10,
    vitality: 10,
  },
  skills: INITIAL_SKILLS,
  inventory: [],
  health: 100,
  maxHealth: 100,
  stamina: 100,
  maxStamina: 100,
  mana: 100,
  maxMana: 100,
  activeSpells: [],
  currentSpell: 'fireball',
  moveSpeedMultiplier: 1.0,
  isInvulnerable: false,
  lastDamageTime: 0,
  isBlocking: false,
  isDodging: false,
  isCrouching: false,
  hotbarIndex: 0,
  hotbarSlots: ['bash', 'spark', 'dash', 'appraisal', null, null, null, null, null],
  enemies: [
    { id: 'e1', type: 'stalker', race: 'Undead', level: 1, position: [10, 0, 10], health: 100, maxHealth: 100, state: 'patrol', xpReward: 50, hitFlash: 0, faction: 'undead' },
    { id: 'e2', type: 'stalker', race: 'Undead', level: 3, position: [-20, 0, 15], health: 150, maxHealth: 150, state: 'patrol', xpReward: 120, hitFlash: 0, faction: 'undead' },
    { id: 'e3', type: 'behemoth', race: 'Goliath of Aincrad', level: 10, position: [0, 0, -50], health: 500, maxHealth: 500, state: 'patrol', xpReward: 1000, hitFlash: 0, faction: 'beast' },
    { id: 'e4', type: 'shade', race: 'Shadow Garden Assassin', level: 5, position: [30, 0, -20], health: 80, maxHealth: 80, state: 'patrol', xpReward: 250, hitFlash: 0, faction: 'undead' },
    { id: 'e5', type: 'golem', race: 'Nazarick Guardian', level: 15, position: [-40, 0, -40], health: 800, maxHealth: 800, state: 'patrol', xpReward: 2500, hitFlash: 0, faction: 'construct' },
    { id: 'e6', type: 'dragon', race: 'Calamity Dragon King', level: 25, position: [100, 20, 100], health: 2500, maxHealth: 2500, state: 'patrol', xpReward: 15000, hitFlash: 0, faction: 'beast' },
    
    // New Anime Dungeon Mobs
    { id: 's1', type: 'slime', race: 'Abyssal Slime', level: 1, position: [15, 0, 25], health: 40, maxHealth: 40, state: 'patrol', xpReward: 20, hitFlash: 0, faction: 'slime' },
    { id: 's2', type: 'slime', race: 'Abyssal Slime', level: 1, position: [18, 0, 28], health: 40, maxHealth: 40, state: 'patrol', xpReward: 20, hitFlash: 0, faction: 'slime' },
    { id: 's3', type: 'slime', race: 'Abyssal Slime', level: 2, position: [12, 0, 22], health: 60, maxHealth: 60, state: 'patrol', xpReward: 35, hitFlash: 0, faction: 'slime' },
    { id: 'r1', type: 'horned_rabbit', race: 'Kick Rabbit', level: 4, position: [-30, 0, 30], health: 70, maxHealth: 70, state: 'patrol', xpReward: 80, hitFlash: 0, faction: 'beast' },
    { id: 'r2', type: 'horned_rabbit', race: 'Kick Rabbit', level: 4, position: [-35, 0, 25], health: 70, maxHealth: 70, state: 'patrol', xpReward: 80, hitFlash: 0, faction: 'beast' },
    { id: 'd1', type: 'demon', race: 'Lesser Demon', level: 8, position: [40, 0, 40], health: 300, maxHealth: 300, state: 'patrol', xpReward: 450, hitFlash: 0, faction: 'demon' },
    { id: 'd2', type: 'demon', race: 'Lesser Demon', level: 8, position: [45, 0, 45], health: 300, maxHealth: 300, state: 'patrol', xpReward: 450, hitFlash: 0, faction: 'demon' },

    { id: 'b1', type: 'borer', race: 'Abyssal Sandworm', level: 6, position: [-60, 0, 60], health: 200, maxHealth: 200, state: 'patrol', xpReward: 300, hitFlash: 0, faction: 'beast', isBurrowed: true },
    { id: 'c1', type: 'cultist', race: 'Void Caller', level: 9, position: [60, 0, -60], health: 150, maxHealth: 150, state: 'patrol', xpReward: 400, hitFlash: 0, faction: 'demon' },
    { id: 'cg1', type: 'crystal_golem', race: 'Magic Nullifier', level: 14, position: [80, 0, -80], health: 1000, maxHealth: 1000, state: 'patrol', xpReward: 2000, hitFlash: 0, faction: 'construct' },

    { id: 'e8', type: 'lich', race: 'Lord of the Tomb', level: 20, position: [-180, 0, -180], health: 1200, maxHealth: 1200, state: 'patrol', xpReward: 8000, hitFlash: 0, faction: 'undead' },
    { id: 'e9', type: 'lich', race: 'Elder Void Weaver', level: 22, position: [180, 0, 180], health: 1400, maxHealth: 1400, state: 'patrol', xpReward: 10000, hitFlash: 0, faction: 'undead' },
    { id: 'e10', type: 'wraith', race: 'Phantom of the Spire', level: 12, position: [0, 0, 150], health: 100, maxHealth: 100, state: 'patrol', xpReward: 1500, hitFlash: 0, faction: 'undead' },
    { id: 'boss_1', type: 'dragon', race: 'THE STORM OF ETERNITY', level: 40, position: [0, 20, -500], health: 10000, maxHealth: 10000, state: 'patrol', xpReward: 50000, hitFlash: 0, isBoss: true, faction: 'beast' },
    
    // Horde around boss
    { id: 'minion_1', type: 'stalker', race: 'Calamity Guard', level: 25, position: [20, 0, -520], health: 800, maxHealth: 800, state: 'patrol', xpReward: 5000, hitFlash: 0, faction: 'undead' },
    { id: 'minion_2', type: 'stalker', race: 'Calamity Guard', level: 25, position: [-20, 0, -520], health: 800, maxHealth: 800, state: 'patrol', xpReward: 5000, hitFlash: 0, faction: 'undead' },
    { id: 'minion_3', type: 'wraith', race: 'Calamity Soul', level: 28, position: [0, 5, -480], health: 500, maxHealth: 500, state: 'patrol', xpReward: 6000, hitFlash: 0, faction: 'undead' },
  ],
  lootDrops: [],
  groundEffects: [],
  isMobile: false,
  gameTime: 12, // Start at noon
  weather: 'clear',
  audioEnabled: false,
  screenShake: 0,
  isCinematic: false,
  isHitStop: false,
  isLevelingUp: false,
  isCraftingOpen: false,
  isSettingsOpen: false,
  damageHistory: [],
  recipes: [
    {
      id: 'r1',
      name: 'Void Slasher',
      result: { id: 'void_slasher', name: 'Void Slasher', type: 'weapon', stats: { strength: 15, dexterity: 5 } },
      ingredients: [{ itemId: 'iron_ore', count: 10 }, { itemId: 'abyss_shard', count: 3 }]
    },
    {
      id: 'r2',
      name: 'Sovereign Plate',
      result: { id: 'sovereign_plate', name: 'Sovereign Plate', type: 'armor', stats: { vitality: 20, strength: 10 } },
      ingredients: [{ itemId: 'dragon_scale', count: 5 }, { itemId: 'sovereign_core', count: 1 }]
    },
    {
       id: 'r3',
       name: 'Abyssal Elixir',
       result: { id: 'abyssal_elixir', name: 'Abyssal Elixir', type: 'potion' },
       ingredients: [{ itemId: 'void_dust', count: 5 }, { itemId: 'shadow_essence', count: 2 }]
    }
  ],
  comboCount: 0,
  comboMultiplier: 1,
  lastHitTime: 0,
  lastHitPosition: null,
  cameraHeading: 0,
  systemLogs: [
    { id: 'initial', message: 'The Shadow System has been initialized.', type: 'info', timestamp: Date.now() }
  ],
  mobileMovement: null,
  touchLook: { x: 0, y: 0 },
  mobileActions: { jump: false, dash: false, attack: false, block: false },
  settings: {
    quality: 'medium',
    showBillboards: true,
    dynamicShadows: true,
    aiThrottling: true,
    maxFps: 60
  },
  craters: [],
  isTerrainReady: false,
  activeQuests: [
    { id: 'q1', title: 'The First Descent', description: 'Defeat 5 Undead Stalkers to prove your worth.', status: 'active', xpReward: 500 }
  ],
  
  // New Genshin Initial State
  activeElement: 'none',
  elementalEnergy: 0,
  maxElementalEnergy: 100,
  isGliding: false,
  interactionEvents: [],
  nearestInteractionId: null,

  addLog: (message, type = 'info') => set((state) => ({
    systemLogs: [{ id: Math.random().toString(), message, type, timestamp: Date.now() }, ...state.systemLogs].slice(0, 5)
  })),

  updateCombo: () => {
    const now = Date.now();
    const { comboCount, lastHitTime } = get();
    if (now - lastHitTime < 2000) {
      set({ 
        comboCount: comboCount + 1, 
        lastHitTime: now,
        comboMultiplier: 1 + (comboCount + 1) * 0.1
      });
    } else {
      set({ comboCount: 1, lastHitTime: now, comboMultiplier: 1.1 });
    }
  },

  advanceTime: (delta) => set((state) => ({
    gameTime: (state.gameTime + delta) % 24
  })),

  rest: () => {
    set((state) => ({
      gameTime: (state.gameTime + 8) % 24,
      health: state.maxHealth,
      stamina: state.maxStamina
    }));
    get().addLog('You have rested. System vitality restored.', 'info');
  },

  setMobile: (isMobile) => set({ isMobile }),

  updateEnemy: (id, data) => set((state) => ({
    enemies: state.enemies.map(e => e.id === id ? { ...e, ...data } : e)
  })),

  damageEnemy: (id, amount, type = 'physical') => {
    const state = get();
    const enemy = state.enemies.find(e => e.id === id);
    if (!enemy || (enemy.isPhasing && type === 'physical') || enemy.state === 'dead') return;

    // Immunitly checks
    if (enemy.isBurrowed) {
        state.addLog(`SYSTEM: Attack deflected by bedrock! The entity is burrowed.`, 'info');
        return; 
    }

    // Type-based resistance mapping
    const resistances: Partial<Record<EnemyType, number>> = {
      stalker: 1.0,
      behemoth: 0.5,
      shade: 1.5,
      dragon: 0.2,
      golem: 0.1,
      lich: 0.4,
      wraith: type === 'magic' ? 2.5 : 0.05,
      crystal_golem: type === 'magic' ? 0.0 : 0.8, // Magic immunity
      cultist: type === 'magic' ? 0.5 : 1.5,
      borer: type === 'physical' ? 0.4 : 1.2,
      demon: type === 'magic' ? 0.3 : 1.0
    };

    const multiplier = resistances[enemy.type] !== undefined ? resistances[enemy.type]! : 1.0;
    
    if (multiplier === 0) {
        set(state => ({
            damageHistory: [...state.damageHistory, {
              id: Math.random().toString(36).substring(2, 9),
              amount: 0,
              position: [...enemy.position] as [number, number, number],
              timestamp: Date.now()
            }].slice(-10)
        }));
        return; // Zero damage popup!
    }

    state.updateCombo();
    const finalAmount = amount * get().comboMultiplier * multiplier;
    const newHealth = Math.max(0, enemy.health - finalAmount);

    // Combat Feedback
    get().triggerSound('hit');
    const hitId = Math.random().toString(36).substring(2, 9);
    set(state => ({ 
      screenShake: enemy.isBoss ? 1.5 : 0.6,
      lastHitPosition: [...enemy.position] as [number, number, number],
      lastHitTime: Date.now(),
      damageHistory: [...state.damageHistory, {
        id: hitId,
        amount: Math.round(finalAmount),
        position: [...enemy.position] as [number, number, number],
        timestamp: Date.now()
      }].slice(-10) // Keep only latest 10
    }));
    get().triggerHitStop(0.08);

    // Training skills on hit
    if (type === 'magic') {
      get().addSkillXP('spark', 5);
    } else {
      get().addSkillXP('bash', 5);
    }

    if (newHealth <= 0) {
      const xpGain = Math.floor((enemy.xpReward || 50) * get().comboMultiplier);
      state.addXP(xpGain);
      state.addLog(`Slayed ${enemy.race} ${enemy.type}. +${xpGain} XP`, 'critical');
      
      let nextEnemies = state.enemies.map(e => e.id === id ? { 
        ...e, 
        health: 0, 
        state: 'dead' as EnemyState,
        respawnTime: 30,
        hitFlash: 0
      } : e);

      // Slime Mitosis (splitting mechanism)
      if (enemy.type === 'slime' && enemy.level > 1) {
          const splitLevel = Math.max(1, enemy.level - 1);
          const splitHealth = Math.floor(enemy.maxHealth / 2.5);
          
          const slimeId1 = Math.random().toString(36).substring(2, 9);
          const slimeId2 = Math.random().toString(36).substring(2, 9);
          
          // Add 2 smaller slimes representing mitosis.
          nextEnemies.push({
              ...enemy,
              id: slimeId1,
              level: splitLevel,
              maxHealth: splitHealth,
              health: splitHealth,
              state: 'chase' as EnemyState,
              position: [enemy.position[0] + 1, enemy.position[1], enemy.position[2] + 1] as [number, number, number]
          });
          nextEnemies.push({
              ...enemy,
              id: slimeId2,
              level: splitLevel,
              maxHealth: splitHealth,
              health: splitHealth,
              state: 'chase' as EnemyState,
              position: [enemy.position[0] - 1, enemy.position[1], enemy.position[2] - 1] as [number, number, number]
          });
          
          state.addLog(`SYSTEM: ${enemy.race} underwent mitosis and split into two forms!`, 'critical');
      }
      
      set({ enemies: nextEnemies });

      // Cinematic Logic: Last enemy?
      const remaining = get().enemies.filter(e => (e.state as string) !== 'dead' && e.id !== id);
      if (remaining.length === 0) {
        set({ isCinematic: true });
        setTimeout(() => set({ isCinematic: false }), 4000);
      }

      // Drop Loot
      get().dropLoot(enemy.position, enemy.level);
    } else {
      set({
        enemies: state.enemies.map(e => e.id === id ? { ...e, health: newHealth, state: 'chase' as EnemyState, hitFlash: 1.0 } : e)
      });
    }
  },

  addXP: (amount) => set((state) => {
    let newXP = state.xp + amount;
    let newLevel = state.level;
    let newAttrPoints = state.attributePoints;
    let newSkillPoints = state.skillPoints;
    let newXPToNext = state.xpToNextLevel;

    const leveledUp = newXP >= newXPToNext;

    while (newXP >= newXPToNext) {
      newXP -= newXPToNext;
      newLevel++;
      newAttrPoints += 3;
      newSkillPoints += 1;
      newXPToNext = Math.floor(newXPToNext * 1.5);
    }

    if (leveledUp) {
        set({ isLevelingUp: true });
        setTimeout(() => set({ isLevelingUp: false }), 4000);
        setTimeout(() => get().addLog(`LEVEL UP! You are now level ${newLevel}.`, 'level'), 0);
        get().triggerSound('level');
        
        // Scale existing enemies to match the new world difficulty
        const currentEnemies = get().enemies;
        const scaledEnemies = currentEnemies.map(e => {
          if (e.state === 'dead') return e;
          // Scale level up to player level + some variance
          const newELevel = Math.max(e.level, newLevel + Math.floor(Math.random() * 3));
          const levelDiff = newELevel - e.level;
          if (levelDiff <= 0) return e;

          const healthBonus = levelDiff * 25;
          return {
            ...e,
            level: newELevel,
            maxHealth: e.maxHealth + healthBonus,
            health: e.health + healthBonus,
            xpReward: Math.floor(e.xpReward * (1 + levelDiff * 0.1))
          };
        });
        set({ enemies: scaledEnemies });
    }

    return { 
      xp: newXP, 
      level: newLevel, 
      attributePoints: newAttrPoints, 
      skillPoints: newSkillPoints,
      xpToNextLevel: newXPToNext 
    };
  }),

  addSkillXP: (skillId, amount) => set((state) => {
    const skill = state.skills.find(s => s.id === skillId);
    if (!skill || !skill.unlocked) return state;

    let newXP = skill.xp + amount;
    let newLevel = skill.level;
    const nextLevelXP = skill.level * 200;

    if (newXP >= nextLevelXP) {
      newXP -= nextLevelXP;
      newLevel++;
      setTimeout(() => get().addLog(`SKILL UP! ${skill.name} reached level ${newLevel}.`, 'level'), 0);
    }

    return {
      skills: state.skills.map(s => s.id === skillId ? { ...s, xp: newXP, level: newLevel } : s)
    };
  }),

  upgradeAttribute: (attr) => set((state) => {
    if (state.attributePoints <= 0) return state;
    return {
      attributePoints: state.attributePoints - 1,
      attributes: { ...state.attributes, [attr]: state.attributes[attr] + 1 },
      maxHealth: attr === 'vitality' ? state.maxHealth + 10 : state.maxHealth,
      maxMana: attr === 'intelligence' ? state.maxMana + 20 : state.maxMana,
    };
  }),

  unlockSkill: (skillId) => set((state) => {
    const skill = state.skills.find(s => s.id === skillId);
    if (!skill || skill.unlocked || state.skillPoints < skill.cost) return state;
    if (skill.requiredSkillId && !state.skills.find(s => s.id === skill.requiredSkillId)?.unlocked) return state;

    return {
      skillPoints: state.skillPoints - skill.cost,
      skills: state.skills.map(s => s.id === skillId ? { ...s, unlocked: true } : s),
    };
  }),

  addItem: (item) => set((state) => {
    const existing = state.inventory.find(i => i.id === item.id);
    if (existing && 'count' in existing) {
      return {
        inventory: state.inventory.map(i => i.id === item.id ? { ...i, count: (i as any).count + (item as any).count } : i)
      };
    }
    return { inventory: [...state.inventory, item] };
  }),

  removeItem: (itemId, count) => set((state) => {
    const existing = state.inventory.find(i => i.id === itemId);
    if (!existing) return state;
    if ('count' in existing) {
       const newCount = (existing as any).count - count;
       if (newCount <= 0) {
         return { inventory: state.inventory.filter(i => i.id !== itemId) };
       }
       return {
         inventory: state.inventory.map(i => i.id === itemId ? { ...i, count: newCount } : i)
       };
    }
    return { inventory: state.inventory.filter(i => i.id !== itemId) };
  }),

  craftItem: (recipe) => {
    const { inventory, addItem, removeItem } = get();
    // Check ingredients
    const canCraft = recipe.ingredients.every(ing => {
      const item = inventory.find(i => i.id === ing.itemId);
      return item && 'count' in item && item.count >= ing.count;
    });

    if (canCraft) {
      recipe.ingredients.forEach(ing => removeItem(ing.itemId, ing.count));
      addItem(recipe.result);
      get().addXP(20);
    }
  },

  setBlocking: (blocking) => set({ isBlocking: blocking }),
  
  useStamina: (amount) => {
    const { stamina } = get();
    if (stamina >= amount) {
      set({ stamina: stamina - amount });
      return true;
    }
    return false;
  },

  regenerateStamina: (amount) => set((state) => ({
    stamina: Math.min(state.maxStamina, state.stamina + amount)
  })),

  updateEnemies: (delta) => set((state) => ({
    screenShake: Math.max(0, state.screenShake - delta * 4),
    enemies: state.enemies.map(e => {
      const nextFlash = Math.max(0, (e.hitFlash || 0) - delta * 5);
      if (e.state === 'dead') {
        const nextTime = (e.respawnTime || 0) - delta;
        if (nextTime <= 0) {
          // Respawn: move to a slightly different position based on origin
          const rx = (Math.random() - 0.5) * 50;
          const rz = (Math.random() - 0.5) * 50;
          return {
            ...e,
            health: e.maxHealth,
            state: 'patrol',
            respawnTime: 0,
            hitFlash: 0,
            position: [e.position[0] + rx, e.position[1], e.position[2] + rz]
          };
        }
        return { ...e, respawnTime: nextTime, hitFlash: 0 };
      }
      return { ...e, hitFlash: nextFlash };
    })
  })),

  useMana: (amount) => {
    const { mana } = get();
    if (mana >= amount) {
      set({ mana: mana - amount });
      return true;
    }
    return false;
  },

  regenerateMana: (amount) => set((state) => ({
    mana: Math.min(state.maxMana, state.mana + amount)
  })),

  setCurrentSpell: (type) => set({ currentSpell: type }),

  castSpell: (type, position, direction) => {
    const { useMana, attributes, addLog } = get();
    
    // Spell configurations
    const configs = {
      fireball: { cost: 20, speed: 18, damageMultiplier: 4, label: 'FIREBALL' },
      void_bolt: { cost: 12, speed: 38, damageMultiplier: 2.2, label: 'VOID_BOLT' }
    };

    const config = configs[type];
    
    if (useMana(config.cost)) {
      const newSpell: SpellData = {
        id: Math.random().toString(),
        type,
        position,
        direction,
        damage: (config.damageMultiplier * 10) + attributes.intelligence * 2.5,
        speed: config.speed
      };
      
      set(state => ({
        activeSpells: [...state.activeSpells, newSpell]
      }));
      
      addLog(`SYSTEM: Linked spell [${config.label}] broadcasted.`, 'info');
    } else {
      addLog(`ERROR: Mana low. Connection bridge failed.`, 'critical');
    }
  },

  castEnemySpell: (type, position, direction, rawDamage) => {
    const configs = {
      fireball: { speed: 12 },
      void_bolt: { speed: 22 }
    };

    const newSpell: SpellData = {
      id: Math.random().toString(),
      type,
      position,
      direction,
      damage: rawDamage,
      speed: configs[type].speed,
      isEnemySpell: true
    };
    
    set(state => ({
      activeSpells: [...state.activeSpells, newSpell]
    }));
  },

  updateSpells: (delta) => set(state => {
    const nextSpells = [];
    
    for (const spell of state.activeSpells) {
      const { position, direction, speed } = spell;
      const nextPos: [number, number, number] = [
        position[0] + direction[0] * speed * delta,
        position[1] + direction[1] * speed * delta,
        position[2] + direction[2] * speed * delta
      ];

      // Ground collision
      const groundY = getTerrainHeight(nextPos[0], nextPos[2], state.craters);
      if (nextPos[1] <= groundY) {
         // IMPACT!
         get().addCrater(nextPos, 15);
         get().triggerSound('hit');
         continue; // Remove spell
      }

      // Basic distance cull
      const distSq = nextPos[0]**2 + nextPos[1]**2 + nextPos[2]**2;
      if (distSq < 4000000) { // 2000 radius squared
         nextSpells.push({ ...spell, position: nextPos });
      }
    }
    
    return { activeSpells: nextSpells };
  }),

  removeSpell: (id) => set(state => ({
    activeSpells: state.activeSpells.filter(s => s.id !== id)
  })),

  takeDamage: (amount) => {
    const now = Date.now();
    const { lastDamageTime, health, isBlocking, addLog } = get();
    // 500ms i-frame
    if (now - lastDamageTime < 500) return;

    const damageTaken = isBlocking ? amount * 0.2 : amount;
    
    // Check for chill effect from specific sources (this is simplified, we'll assume Wraiths apply chill)
    // If damage is high or from Wraith (we'll implement this properly in the Enemy component by calling a specific action if needed, 
    // but for now let's just add the chill logic here)
    
    set({
      health: Math.max(0, health - damageTaken),
      lastDamageTime: now
    });
  },

  applyChill: (duration = 3000) => {
    set({ moveSpeedMultiplier: 0.4 });
    get().addLog('CRITICAL: Status [CHILL] applied. System speed restricted.', 'critical');
    setTimeout(() => {
      set({ moveSpeedMultiplier: 1.0 });
      get().addLog('SYSTEM: Status [CHILL] cleared. Locomotion restored.', 'info');
    }, duration);
  },

  setGamePhase: (phase) => {
    set((state) => {
      if (phase === 'playing') {
        // Safe Random Spawning Logic (avoid structures)
        const landmarks = [
          { x: 0, z: -1500, r: 50 }, // Throne
          { x: 0, z: -800, r: 40 },  // Spire
          { x: 0, z: -100, r: 20 },  // Dungeon
          { x: 1500, z: 1500, r: 60 }, // Citadel
          { x: -1500, z: -1500, r: 60 }, 
          { x: 400, z: 400, r: 30 },  // Villages
          { x: -600, z: 800, r: 30 },
          { x: 800, z: -800, r: 30 },
          { x: 500, z: 500, r: 20 },  // Monoliths
          { x: -500, z: -500, r: 20 },
          { x: 500, z: -500, r: 20 },
          { x: -500, z: 500, r: 20 },
        ];

        let rx, rz, isSafe = false;
        let attempts = 0;
        do {
          rx = (Math.random() - 0.5) * 40; // Narrow range to start near Nexus
          rz = (Math.random() - 0.5) * 40;
          isSafe = landmarks.every(l => {
            const dist = Math.sqrt((rx - l.x) ** 2 + (rz - l.z) ** 2);
            return dist > l.r;
          });
          attempts++;
        } while (!isSafe && attempts < 50);

        const groundY = getTerrainHeight(rx, rz, get().craters);
        return { gamePhase: phase, spawnPosition: [rx, groundY + 5, rz] };
      }
      return { gamePhase: phase };
    });
    
    if (phase === 'playing') {
       setTimeout(() => get().addLog('NEURAL LINK ESTABLISHED // SOUL_ID: REYNUN_001', 'info'), 500);
       setTimeout(() => get().addLog('DECRYPTING WORLD SHARDS...', 'info'), 1000);
       setTimeout(() => get().addLog('SYSTEM SYNC 100% // NO ERRORS DETECTED', 'level'), 2000);
       setTimeout(() => get().addLog('WELCOME TO THE ABYSSAL REALM, SOVEREIGN.', 'critical'), 2500);
    }
  },

  setWeather: (weather) => {
    set({ weather });
    get().addLog(`SYSTEM: Atmospheric conditions shifted to [${weather.toUpperCase()}].`, 'info');
  },

  toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),

  triggerSound: (type) => {
    if ((window as any).triggerAbyssSound) {
        (window as any).triggerAbyssSound(type);
    }
  },

  dropLoot: (position, enemyLevel) => {
    const id = Math.random().toString(36).substring(2, 9);
    let rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common';
    let itemId = 'iron_ore';
    
    const { enemies } = get();
    const sourceEnemy = enemies.find(e => 
      Math.abs(e.position[0] - position[0]) < 1 && 
      Math.abs(e.position[2] - position[2]) < 1
    );

    // Level-based drop logic
    if (enemyLevel >= 35 || sourceEnemy?.isBoss) {
      rarity = 'legendary';
      itemId = Math.random() > 0.5 ? 'void_heart' : 'sovereign_core';
    } else if (enemyLevel >= 20) {
      const roll = Math.random();
      if (roll > 0.8) { rarity = 'legendary'; itemId = 'void_heart'; }
      else { rarity = 'epic'; itemId = 'sovereign_core'; }
    } else if (enemyLevel >= 12) {
      const roll = Math.random();
      if (roll > 0.7) { rarity = 'epic'; itemId = 'dragon_scale'; }
      else { rarity = 'rare'; itemId = 'shadow_essence'; }
    } else if (enemyLevel >= 5) {
      const roll = Math.random();
      if (roll > 0.6) { rarity = 'rare'; itemId = 'abyss_shard'; }
      else { rarity = 'common'; itemId = 'void_dust'; }
    }
    
    const newDrop = {
      id,
      itemId,
      count: 1,
      position: [position[0] + (Math.random() - 0.5) * 2, 0.5, position[2] + (Math.random() - 0.5) * 2] as [number, number, number],
      rarity
    };
    
    set(state => ({ lootDrops: [...state.lootDrops, newDrop] }));
  },

  collectLoot: (id) => {
    const state = get();
    const drop = state.lootDrops.find(d => d.id === id);
    if (!drop) return;
    
    // Add to inventory (simplification: assume name from ID)
    state.addItem({ 
      id: drop.itemId, 
      name: drop.itemId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), 
      count: drop.count, 
      type: 'mineral'
    });
    
    // Remove from world
    set(state => ({ lootDrops: state.lootDrops.filter(d => d.id !== id) }));
    get().addLog(`SYSTEM: Collected ${drop.rarity.toUpperCase()} item: [${drop.itemId}].`, 'info');
    get().triggerSound('loot');
  },

  setCraftingOpen: (open) => set({ isCraftingOpen: open }),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),

  setMobileMovement: (vector) => set({ mobileMovement: vector }),
  
  setTouchLook: (delta) => set({ touchLook: delta }),
  
  setCrouching: (crouching) => set({ isCrouching: crouching }),
  
  setHotbarIndex: (index) => set({ hotbarIndex: index }),
  
  setScreenShake: (amount) => set({ screenShake: amount }),
  
  triggerHitStop: (duration = 0.1) => {
    set({ isHitStop: true });
    setTimeout(() => set({ isHitStop: false }), duration * 1000);
  },

  setCameraHeading: (cameraHeading) => set({ cameraHeading }),

  setGliding: (isGliding) => set({ isGliding }),
  registerInteraction: (event) => set(s => ({ 
    interactionEvents: [...s.interactionEvents.filter(e => e.id !== event.id), event] 
  })),
  unregisterInteraction: (id) => set(s => ({ 
    interactionEvents: s.interactionEvents.filter(e => e.id !== id),
    nearestInteractionId: s.nearestInteractionId === id ? null : s.nearestInteractionId
  })),
  updateNearestInteraction: (pos) => {
    const { interactionEvents } = get();
    if (interactionEvents.length === 0) {
      if (get().nearestInteractionId !== null) set({ nearestInteractionId: null });
      return;
    }
    
    let nearestId = null;
    let minDist = Infinity;
    
    interactionEvents.forEach(e => {
        const dx = e.position[0] - pos[0];
        const dy = e.position[1] - pos[1];
        const dz = e.position[2] - pos[2];
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist < e.distance && dist < minDist) {
            minDist = dist;
            nearestId = e.id;
        }
    });
    
    if (get().nearestInteractionId !== nearestId) {
        set({ nearestInteractionId: nearestId });
    }
  },
  performInteraction: () => {
    const { nearestInteractionId, interactionEvents } = get();
    if (!nearestInteractionId) return;
    const event = interactionEvents.find(e => e.id === nearestInteractionId);
    if (!event) return;
    
    get().addLog(`INTERACTING: [${event.label}] // SYSTEM_EVENT_ID: ${event.id}`, 'info');
    // Global event dispatcher could be here, for now just log
  },
  setElement: (activeElement) => set({ activeElement }),
  setMobileAction: (action, active) => set(state => ({
    mobileActions: { ...state.mobileActions, [action]: active }
  })),

  addGroundEffect: (effect) => set(state => ({
    groundEffects: [...state.groundEffects, {
      ...effect,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now()
    }]
  })),

  tickGroundEffects: (now) => set(state => ({
    groundEffects: state.groundEffects.filter(e => now - e.timestamp < e.duration)
  })),

  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),

  addCrater: (position, radius) => set((state) => ({
    craters: [...state.craters, { id: Math.random().toString(), position, radius }].slice(-50) // Max 50 craters for performance
  })),

  setTerrainReady: (ready) => set({ isTerrainReady: ready }),

  startNewGame: () => {
    // Find a flat spot near center
    let bestX = 0;
    let bestZ = 0;
    let minSlope = Infinity;
    
    // Search a small grid for the flattest area
    for (let x = -20; x <= 20; x += 5) {
      for (let z = -20; z <= 20; z += 5) {
        const h0 = getTerrainHeight(x, z, []);
        const h1 = getTerrainHeight(x + 1, z, []);
        const h2 = getTerrainHeight(x, z + 1, []);
        const slope = Math.abs(h1 - h0) + Math.abs(h2 - h0);
        
        if (slope < minSlope && h0 > WATER_LEVEL + 5) {
            minSlope = slope;
            bestX = x;
            bestZ = z;
        }
      }
    }

    const h = getTerrainHeight(bestX, bestZ, []);
    const hSlime = getTerrainHeight(bestX + 10, bestZ + 10, []);
    
    set({
      gamePhase: 'creation',
      spawnPosition: [bestX, h + 10, bestZ], // Drop from 10 units for safety
      attributePoints: 20, 
      skillPoints: 2,
      attributes: {
        strength: 5,
        dexterity: 5,
        intelligence: 5,
        vitality: 5,
      },
      inventory: [],
      level: 1,
      xp: 0,
      health: 100,
      maxHealth: 100,
      stamina: 100,
      maxStamina: 100,
      mana: 100,
      maxMana: 100,
      activeSpells: [],
      currentSpell: 'fireball',
      weather: 'clear',
      audioEnabled: false,
      moveSpeedMultiplier: 1.0,
      comboCount: 0,
      isTerrainReady: false,
      enemies: [
        { id: 'sb_1', type: 'slime', race: 'Slime', level: 1, position: [10, hSlime + 1, 10], health: 30, maxHealth: 30, state: 'idle', xpReward: 50, hitFlash: 0, faction: 'slime' }
      ],
      systemLogs: [{ id: 'new', message: 'Syncing character with the Shadow System...', type: 'info', timestamp: Date.now() }]
    });
  },
}), {
  name: 'sovereign-reynun-storage',
  partialize: (state) => ({
    level: state.level,
    xp: state.xp,
    xpToNextLevel: state.xpToNextLevel,
    attributePoints: state.attributePoints,
    skillPoints: state.skillPoints,
    attributes: state.attributes,
    skills: state.skills,
    inventory: state.inventory,
    health: state.health,
    maxHealth: state.maxHealth,
    stamina: state.stamina,
    maxStamina: state.maxStamina,
    mana: state.mana,
    maxMana: state.maxMana,
    gameTime: state.gameTime,
    spawnPosition: state.spawnPosition,
  }),
}
));
