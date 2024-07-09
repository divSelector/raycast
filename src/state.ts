import { DestructableSprite } from "./sprite";


interface GameState {
  barrels: DestructableSprite[];
}

const state: GameState = {
  barrels: []
};

export const getState = () => state;

export const addBarrel = (sprite: DestructableSprite) => {
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

export const updateBarrel = (index: number, newProps: Partial<DestructableSprite>) => {
  const barrel = state.barrels[index];
  if (barrel) {
    state.barrels[index] = { ...barrel, ...newProps };
  }
};
