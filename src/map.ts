import { Sprite } from "./sprites";
import { LevelArea, Level, initialLevelArea } from "./levels";
import { player } from "./player";

export interface Map {
    offsetX: number;
    offsetY: number;
    scale: number;
    size: number;
    showMinimap: boolean;
    minimapScale: number;
    level: LevelArea;
    sprites: Sprite[];
}

export const map: Map = {
    offsetX: 0,
    offsetY: 0,
    scale: 63,
    size: 9,
    showMinimap: false,
    minimapScale: 5,
    level: initialLevelArea,
    sprites: []
};


export function loadMap(level: Level) {
    map.level = level.area;
    map.size = level.size;
    map.sprites = level.sprites;
    player.x = level.playerStartX;
    player.y = level.playerStartY;
}