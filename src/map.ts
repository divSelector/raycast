import { DestructableSprite } from "./sprites";
import { LevelArea, Level, initialLevelArea } from "./levels";
import { player } from "./player";
import { getState } from "./state";


export interface Map {
    offsetX: number;
    offsetY: number;
    scale: number;
    size: number;
    showMinimap: boolean;
    minimapScale: number;
    level: LevelArea;
}


export const map: Map = {
    offsetX: 0,
    offsetY: 0,
    scale: 63,
    size: 9,
    showMinimap: false,
    minimapScale: 5,
    level: initialLevelArea,
};


export function loadMap(level: Level) {

    const state = getState();

    for (let sprite of level.sprites) {
        switch (sprite.type) {
            case "barrel":
                state.storeBarrel(sprite.id, sprite as DestructableSprite);
        }
    }

    map.level = level.area;
    map.size = level.size;
    player.x = level.playerStartX;
    player.y = level.playerStartY;
}