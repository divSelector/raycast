import { DestructableSprite } from "./sprites";


interface GameState {
  barrels: DestructableSprite[];
  addBarrel: (sprite: DestructableSprite) => void;
  updateBarrel: (index: number, newProps: Partial<DestructableSprite>) => void;
}

export const getState = () => state;

const addBarrel = (sprite: DestructableSprite) => {
  state.barrels.push({
    type: sprite.type,
    x: sprite.x,
    y: sprite.y,
    width: sprite.width,
    height: sprite.height,
    texture: sprite.texture,
    hitPoints: sprite.hitPoints,
    maxHitPoints: sprite.maxHitPoints,
    textures: sprite.textures
  });
};

const updateBarrel = (index: number, newProps: Partial<DestructableSprite>) => {
  const barrel = state.barrels[index];
  if (barrel) {
    state.barrels[index] = { ...barrel, ...newProps };
  }
};


const state: GameState = {
  barrels: [],
  addBarrel,
  updateBarrel
}