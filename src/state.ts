import { DestructableSprite } from "./sprites";

interface GameState {
  barrels: { [id: number]: DestructableSprite };
  addBarrel: (id: number, sprite: DestructableSprite) => void;
  // updateBarrel: (index: number, newProps: Partial<DestructableSprite>) => void;
}

export const getState = () => state;

// const addBarrel = (id: number, sprite: DestructableSprite) => {
//   state.barrels[id] = {
//     id: id,
//     type: sprite.type,
//     x: sprite.x,
//     y: sprite.y,
//     width: sprite.width,
//     height: sprite.height,
//     texture: sprite.texture,
//     hitPoints: sprite.hitPoints,
//     maxHitPoints: sprite.maxHitPoints,
//     textures: sprite.textures,
//   };
// };

// const updateBarrel = (id: number, newProps: Partial<DestructableSprite>) => {
//   const barrel = state.barrels[id];
//   if (barrel) {
//     state.barrels[id] = { ...barrel, ...newProps };
//   }
// };

const addBarrel = (id: number, sprite: Partial<DestructableSprite>) => {
  const existingBarrel = state.barrels[id];
  if (existingBarrel) {
    // Update existing barrel
    state.barrels[id] = { ...existingBarrel, ...sprite };
  } else {
    // Add new barrel
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