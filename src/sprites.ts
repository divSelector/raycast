import { barrelTextures } from "./graphics";
import { DEFAULT_SPRITE_SIZE, MAP_SCALE } from "./constants";


export interface Sprite {
    type: string | null;
    x: number;
    y: number;
    width: number;
    height: number;
    texture: number;
}

export interface DestructableSprite extends Sprite {
    hitPoints: number;
    maxHitPoints: number;
    textures: HTMLImageElement[];
}

const defaultBarrelSprite: DestructableSprite = {
    type: 'barrel', 
    x: MAP_SCALE * 5, 
    y: MAP_SCALE * 5, 
    texture: 0, 
    textures: barrelTextures,
    width: DEFAULT_SPRITE_SIZE, 
    height: DEFAULT_SPRITE_SIZE,
    hitPoints: 3,
    maxHitPoints: 3,
}

export const barrelSpritesForLevel: DestructableSprite[] = [
    { ...defaultBarrelSprite, x: MAP_SCALE * 5, y: MAP_SCALE * 5 }
];
