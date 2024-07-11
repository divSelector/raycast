import { barrelTextures } from "./graphics";
import { DEFAULT_SPRITE_SIZE, MAP_SCALE } from "./constants";

export interface Sprite {
    id: number,
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
    invincible: boolean;
    lastTimeHit: number;
}

export const defaultBarrelSprite: DestructableSprite = {
    id: 0,
    type: 'barrel', 
    x: MAP_SCALE * 5, 
    y: MAP_SCALE * 5, 
    texture: 0, 
    textures: barrelTextures,
    width: DEFAULT_SPRITE_SIZE, 
    height: DEFAULT_SPRITE_SIZE,
    hitPoints: 3,
    maxHitPoints: 3,
    invincible: false,
    lastTimeHit: 0,
}

export const barrelSpritesForLevel: DestructableSprite[] = [
    { ...defaultBarrelSprite, 
        x: MAP_SCALE * 5, 
        y: MAP_SCALE * 5,
        id: 1
    }
];
