import { DestructableSprite } from "./sprites";

interface GameState {
  barrels: { [id: number]: DestructableSprite };
  storeBarrel: (id: number, updatedFields: Partial<DestructableSprite>) => void;
}

export const getState = () => state;

const storeBarrel = (id: number, updatedFields: Partial<DestructableSprite>) => {
  const existingBarrel = state.barrels[id];
  
  if (existingBarrel) {
    // console.log(`Updating barrel ${id} with`, updatedFields);
    state.barrels[id] = { ...existingBarrel, ...updatedFields };
  } else {
    // console.log(`Creating new barrel ${id} with`, updatedFields);
    state.barrels[id] = {
      id: id,
      type: 'barrel',
      x: updatedFields.x || 0,
      y: updatedFields.y || 0,
      width: updatedFields.width || 1,
      height: updatedFields.height || 1,
      texture: updatedFields.texture || 0,
      hitPoints: updatedFields.hitPoints || 100,
      maxHitPoints: updatedFields.maxHitPoints || 100,
      textures: updatedFields.textures || [],
      invincible: updatedFields.invincible || false,
      lastTimeHit: updatedFields.lastTimeHit || 0,
      moveX: updatedFields.moveX || 0,
      moveY: updatedFields.moveY || 0,
      distanceMoved: updatedFields.distanceMoved || 0
    };
  }
};


const state: GameState = {
  barrels: [],
  storeBarrel
}