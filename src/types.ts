/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Attribute = 'strength' | 'dexterity' | 'intelligence' | 'vitality';

export interface Skill {
  id: string;
  name: string;
  description: string;
  path: 'Warrior' | 'Mage' | 'Rogue';
  cost: number;
  unlocked: boolean;
  requiredSkillId?: string;
  level: number;
  xp: number;
}

export interface ResourceItem {
  id: string;
  name: string;
  type: 'mineral' | 'herb' | 'skin';
  count: number;
}

export interface CraftedItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'potion';
  stats?: Partial<Record<Attribute, number>>;
}

export type InventoryItem = ResourceItem | CraftedItem;

export interface Recipe {
  id: string;
  name: string;
  result: CraftedItem;
  ingredients: { itemId: string; count: number }[];
}

export type EnemyType = 'stalker' | 'behemoth' | 'shade' | 'dragon' | 'golem' | 'lich' | 'wraith' | 'slime' | 'horned_rabbit' | 'demon' | 'borer' | 'cultist' | 'crystal_golem' | 'vulture' | 'rabbit';

export type EnemyState = 'idle' | 'patrol' | 'chase' | 'attack' | 'dead' | 'sleep' | 'eat' | 'investigate' | 'flee';
export type EnemyFaction = 'undead' | 'slime' | 'beast' | 'demon' | 'construct';

export interface EnemyData {
  id: string;
  type: EnemyType;
  race: string;
  level: number;
  position: [number, number, number];
  health: number;
  maxHealth: number;
  state: EnemyState;
  xpReward: number;
  hitFlash: number;
  respawnTime?: number;
  isPhasing?: boolean;
  isBurrowed?: boolean;
  isBoss?: boolean;
  faction: EnemyFaction;
  targetId?: string | 'player' | null;
  alertness?: number;
}

export interface SystemLog {
  id: string;
  message: string;
  type: 'info' | 'critical' | 'quest' | 'level';
  timestamp: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed';
  xpReward: number;
}

export interface SpellData {
  id: string;
  type: 'fireball' | 'void_bolt';
  position: [number, number, number];
  direction: [number, number, number];
  damage: number;
  speed: number;
  isEnemySpell?: boolean;
}

export interface LootDrop {
  id: string;
  itemId: string;
  count: number;
  position: [number, number, number];
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export type GamePhase = 'menu' | 'creation' | 'playing';

export type WeatherType = 'clear' | 'void_storm' | 'ash_fall';
export type ElementType = 'void' | 'solar' | 'lunar' | 'chaos' | 'none';

export interface InteractionEvent {
  id: string;
  type: 'collect' | 'open' | 'pray' | 'talk' | 'inspect';
  label: string;
  position: [number, number, number];
  distance: number;
}

export interface DamagePopup {
  id: string;
  amount: number;
  position: [number, number, number];
  timestamp: number;
}

export interface GroundEffect {
  id: string;
  type: 'slime_trail' | 'corruption';
  position: [number, number, number];
  radius: number;
  duration: number;
  timestamp: number;
  faction: EnemyFaction;
}

export interface GameState {
  // Navigation
  gamePhase: GamePhase;
  spawnPosition: [number, number, number];
  
  // Environment Dynamics
  groundEffects: GroundEffect[];

  // Progression
  level: number;
  xp: number;
  xpToNextLevel: number;
  attributePoints: number;
  skillPoints: number;
  attributes: Record<Attribute, number>;
  skills: Skill[];

  // Resources & Inventory
  inventory: InventoryItem[];
  
  // Stamina, Health & Mana
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  mana: number;
  maxMana: number;
  isInvulnerable: boolean;
  lastDamageTime: number;
  
  // Attack State
  activeSpells: SpellData[];
  currentSpell: 'fireball' | 'void_bolt';
  isBlocking: boolean;
  isDodging: boolean;
  isCrouching: boolean;
  hotbarIndex: number;
  hotbarSlots: (string | null)[]; // Skill IDs or Item IDs
  enemies: EnemyData[];
  lootDrops: LootDrop[];
  isMobile: boolean;
  gameTime: number; // 0 to 24
  moveSpeedMultiplier: number;
  weather: WeatherType;
  audioEnabled: boolean;
  screenShake: number;
  isCinematic: boolean;
  isHitStop: boolean;
  isLevelingUp: boolean;
  isCraftingOpen: boolean;
  isSettingsOpen: boolean;
  cameraHeading: number;
  recipes: Recipe[];
  
  // Genshin-inspired mechanics
  activeElement: ElementType;
  elementalEnergy: number;
  maxElementalEnergy: number;
  isGliding: boolean;
  interactionEvents: InteractionEvent[];
  nearestInteractionId: string | null;

  // System Mechanics
  comboCount: number;
  comboMultiplier: number;
  lastHitTime: number;
  lastHitPosition: [number, number, number] | null;
  systemLogs: SystemLog[];
  activeQuests: Quest[];
  mobileMovement: { x: number, y: number } | null;
  touchLook: { x: number, y: number };
  damageHistory: DamagePopup[];
  mobileActions: {
    jump: boolean;
    dash: boolean;
    attack: boolean;
    block: boolean;
  };
  settings: GraphicsSettings;
  craters: TerrainCrater[];
  isTerrainReady: boolean;
}

export interface TerrainCrater {
  id: string;
  position: [number, number, number];
  radius: number;
}

export interface GraphicsSettings {
  quality: 'low' | 'medium' | 'high';
  showBillboards: boolean;
  dynamicShadows: boolean;
  aiThrottling: boolean;
  maxFps: number;
}
