import { DestructableSprite } from "./sprites";

interface GameState {
  barrels: { [id: number]: DestructableSprite };
  addBarrel: (id: number, sprite: DestructableSprite) => void;
}

export const getState = () => state;

const addBarrel = (id: number, sprite: Partial<DestructableSprite>) => {
  const existingBarrel = state.barrels[id];
  if (existingBarrel) {
    state.barrels[id] = { ...existingBarrel, ...sprite };
  } else {
    state.barrels[id] = {
      id: id,
      type: 'barrel',
      x: sprite.x || 0,
      y: sprite.y || 0,
      width: sprite.width || 1,
      height: sprite.height || 1,
      texture: sprite.texture || 0,
      hitPoints: sprite.hitPoints || 100,
      maxHitPoints: sprite.maxHitPoints || 100,
      textures: sprite.textures || [],
    };
  }
};

const state: GameState = {
  barrels: [],
  addBarrel
}