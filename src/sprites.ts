import { barrelTextures } from "./graphics";
import { DEFAULT_SPRITE_SIZE, MAP_SCALE } from "./constants";
import { getState } from "./state";
import { calculateMovementOffset, calculateTargetForSpriteCollision, calculateTargetForWallCollision, checkCollision, MovementVectors } from "./player";

export interface Sprite {
    id: number,
    type: string | null;
    x: number;
    y: number;
    width: number;
    height: number;
    texture: number;
}

export interface LaunchableSprite extends Sprite {
    moveX: number;
    moveY: number;
    distanceMoved: number;
}

export interface DestructableSprite extends Sprite, LaunchableSprite {
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
    moveX: 0,
    moveY: 0,
    distanceMoved: 0
}

export const barrelSpritesForLevel: DestructableSprite[] = [
    {
        ...defaultBarrelSprite,
        x: MAP_SCALE * 5,
        y: MAP_SCALE * 5,
        id: 1
    }
];

function updateSpritesPosition(offsets: MovementVectors, wallTargets: MovementVectors, spriteTargets: MovementVectors, sprites: Sprite[]): void {
    const barrels = getState().barrels;
    const barrelsArray = Object.values(barrels);

    for (let id in barrels) {
        let sprite = barrels[id] as DestructableSprite;
        if (sprite.moveX || sprite.moveY) {

            // console.log(`Sprite ${id} should move. Current position: (${sprite.x}, ${sprite.y}), moveX: ${sprite.moveX}, moveY: ${sprite.moveY}`);

            const nextX = sprite.x + sprite.moveX;
            const nextY = sprite.y + sprite.moveY;

            // Check for collisions with walls or other sprites
            // const canMoveX = true; // Simplified collision check for testing
            // const canMoveY = true; // Simplified collision check for testing

            const canMoveX = () => checkCollision(sprite.moveX, wallTargets.x, spriteTargets.x, sprite.y, sprites, sprite);
            const canMoveY = () => checkCollision(sprite.moveY, wallTargets.y, sprite.x, spriteTargets.y, sprites, sprite);

            if (canMoveX() || canMoveY()) {
                // console.log(`Sprite ${id} collision passed. Moving to: (${nextX}, ${nextY})`);
                sprite.x = nextX;
                sprite.y = nextY;
                sprite.distanceMoved += Math.sqrt(sprite.moveX * sprite.moveX + sprite.moveY * sprite.moveY);
                
                // Reduce velocity (friction) and stop if max distance is reached
                sprite.moveX *= 0.95;
                sprite.moveY *= 0.95;
                
                if (sprite.distanceMoved >= 1000 || (Math.abs(sprite.moveX) < 0.1 && Math.abs(sprite.moveY) < 0.1)) {
                    // console.log(`Sprite ${id} has stopped moving.`);
                    sprite.moveX = 0;
                    sprite.moveY = 0;
                }

                getState().storeBarrel(sprite.id, sprite);
            } else {
                // Stop sprite if collision detected
                // console.log(`Sprite ${id} collision detected. Stopping.`);
                sprite.moveX = 0;
                sprite.moveY = 0;
                getState().storeBarrel(sprite.id, sprite);
            }
        }
    }
}


export function moveSprites() {

    const barrels = getState().barrels
    const BarrelsArray = Object.values(barrels);

    const offsets = calculateMovementOffset();
    const wallTargets = calculateTargetForWallCollision(offsets);
    const spriteTargets = calculateTargetForSpriteCollision(offsets);

    updateSpritesPosition(offsets, wallTargets, spriteTargets, BarrelsArray);
}
