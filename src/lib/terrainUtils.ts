import { createNoise2D } from 'simplex-noise';
import { Color } from 'three';

const noise2D = createNoise2D();

export const WATER_LEVEL = -5;

export const BIOMES = {
  FOREST: { color: '#2d5a27', height: 12, frequency: 0.015 }, // Lighter forest green
  DESERT: { color: '#edc9af', height: 4, frequency: 0.008 }, // Soft sand
  SNOW: { color: '#f8fafc', height: 40, frequency: 0.025 }, // Bright white
};

export const getTerrainHeight = (x: number, z: number, craters: any[] = []) => {
  // Sea level logic - deep noise
  const seaBase = noise2D(x * 0.001, z * 0.001) * 20;

  // Biome noise
  const bn = noise2D(x * 0.0003, z * 0.0003);
  let biome = BIOMES.FOREST;
  if (bn < -0.25) biome = BIOMES.DESERT;
  else if (bn > 0.35) biome = BIOMES.SNOW;

  // Detail noise layers
  const h1 = noise2D(x * biome.frequency, z * biome.frequency) * biome.height;
  const h2 = noise2D(x * 0.05, z * 0.05) * 2;
  const h3 = noise2D(x * 0.15, z * 0.15) * 0.5;
  
  // Dramatic Mountains
  const mNoise = noise2D(x * 0.0006, z * 0.0006);
  const mountainNoise = Math.pow(Math.max(0, mNoise + 0.3), 3.8) * 350;
  
  // Cliffs and peaks
  const peaks = noise2D(x * 0.01, z * 0.01) * 20 * Math.max(0, mNoise);
  
  // River Valleys - persistent paths carved into the land
  const riverNoise = Math.abs(noise2D(x * 0.002, z * 0.002));
  const riverPath = Math.max(0, 1 - riverNoise * 20); // Sharp narrow path
  const riverCarve = riverPath * 25;
  
  let height = h1 + h2 + h3 + mountainNoise + peaks + seaBase - riverCarve;

  // Solid base floor
  height = Math.max(-100, height);

  // Apply craters
  if (craters && craters.length > 0) {
    for (let i = 0; i < craters.length; i++) {
        const c = craters[i];
        const dx = x - c.position[0];
        const dz = z - c.position[2];
        const distSq = dx * dx + dz * dz;
        const radSq = c.radius * c.radius;
        
        if (distSq < radSq) {
          const dist = Math.sqrt(distSq);
          const intensity = 1 - (dist / c.radius);
          const smoothIntensity = intensity * intensity * (3 - 2 * intensity);
          height -= smoothIntensity * c.radius * 2.5;
        } else if (distSq < radSq * 1.8) {
          const dist = Math.sqrt(distSq);
          const rimIntensity = 1 - (Math.abs(dist - c.radius * 1.3) / (c.radius * 0.5));
          if (rimIntensity > 0) {
             height += rimIntensity * c.radius * 0.4;
          }
        }
    }
  }
  
  return height;
};

export const getTerrainData = (x: number, z: number, craters: any[] = []) => {
  const height = getTerrainHeight(x, z, craters);
  
  const bn = noise2D(x * 0.0003, z * 0.0003);
  let biomeColor = new Color(BIOMES.FOREST.color);
  if (bn < -0.25) biomeColor = new Color(BIOMES.DESERT.color);
  else if (bn > 0.35) biomeColor = new Color(BIOMES.SNOW.color);
  
  const finalColor = biomeColor.clone();
  
  if (height < WATER_LEVEL + 2) {
    finalColor.lerp(new Color('#8b7355'), 0.3); // Sand/Wet earth near water
  }
  
  if (height > 50) finalColor.lerp(new Color('#555'), 0.5); // Rocky
  if (height > 120) finalColor.lerp(new Color('#fff'), 0.8); // Snow caps
  
  return { height, color: finalColor, biome: bn };
};
