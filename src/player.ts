import { isKeyPressed, getMouseDeltaX } from "./input";
import { map } from "./map";
import { normalizePlayerAngle } from "./math";
import { MAP_SCALE } from "./constants";
import { getState } from "./state";
import { Sprite } from "./sprites";


const MAP_SPEED = (MAP_SCALE / 2) / 18;
const PIVOT_SPEED = 0.05;


interface Player {
    x: number;
    y: number;
    angle: number;
    mapX: number;
    mapY: number;
    moveX: number;
    moveY: number;
    moveAngle: number;
    strafeX: number;
}

interface MovementVectors {
    x: number;
    y: number;
    strafeX: number;
    strafeY: number;
}


export const player: Player = {
    x: MAP_SCALE + 10,
    y: MAP_SCALE + 10,
    angle: Math.PI / 3,
    mapX: 0,
    mapY: 0,
    moveX: 0,
    moveY: 0,
    moveAngle: 0,
    strafeX: 0
};


function handlePlayerInput() {
    player.moveX = 0;
    player.moveY = 0;
    player.moveAngle = 0;
    player.strafeX = 0;

    if (isKeyPressed('up')) {
        player.moveX = 1;
        player.moveY = 1;
    } else if (isKeyPressed('down')) {
        player.moveX = -1;
        player.moveY = -1;
    }

    if (isKeyPressed('left')) {
        player.strafeX = 1;
    } else if (isKeyPressed('right')) {
        player.strafeX = -1;
    }

    const deltaX = getMouseDeltaX();
    const rotationSpeed = 0.045;
    player.moveAngle = -deltaX * rotationSpeed;
}


function calculateMovementOffsets(): MovementVectors {
    return {
        x: Math.sin(player.angle) * MAP_SPEED,
        y: Math.cos(player.angle) * MAP_SPEED,
        strafeX: Math.sin(player.angle + Math.PI / 2) * MAP_SPEED,
        strafeY: Math.cos(player.angle + Math.PI / 2) * MAP_SPEED,
    };
}


function calculateTargetForWallCollision(offsets: MovementVectors): MovementVectors {
    const proximityLimit = 10;

    const targetX = Math.floor(player.y / MAP_SCALE) * map.size + Math.floor((player.x + offsets.x * player.moveX * proximityLimit) / MAP_SCALE);
    const targetY = Math.floor((player.y + offsets.y * player.moveY * proximityLimit) / MAP_SCALE) * map.size + Math.floor(player.x / MAP_SCALE);

    const strafeTargetX = Math.floor((player.y + offsets.strafeY * player.strafeX * proximityLimit) / MAP_SCALE) * map.size + Math.floor(player.x / MAP_SCALE);
    const strafeTargetY = Math.floor(player.y / MAP_SCALE) * map.size + Math.floor((player.x + offsets.strafeX * player.strafeX * proximityLimit) / MAP_SCALE);

    return { x: targetX, y: targetY, strafeX: strafeTargetX, strafeY: strafeTargetY };
}


function calculateTargetForSpriteCollision(offsets: MovementVectors): MovementVectors {
    const x = player.x + offsets.x * player.moveX;
    const y = player.y + offsets.y * player.moveY;
    const strafeX = player.x + offsets.strafeX * player.strafeX;
    const strafeY = player.y + offsets.strafeY * player.strafeX;
    return { x, y, strafeX, strafeY }
}


function isPositionOccupiedBySprite(x: number, y: number, sprites: Sprite[]): boolean {
    const proximityThreshold = 32;

    for (const sprite of sprites) {
        const distance = Math.sqrt((sprite.x - x) ** 2 + (sprite.y - y) ** 2);
        if (distance < proximityThreshold) {
            return true;
        }
    }
    return false;
}


function checkCollisionAndDoVectorMovement(
    movePos: number, wallTarget: number, 
    targetX: number, targetY: number, sprites: Sprite[], 
    playerPos: number, offsetPos: number
): number {

    if (movePos && map.level[wallTarget] === 0 && !isPositionOccupiedBySprite(targetX, targetY, sprites)) {
        playerPos += offsetPos * movePos;
    }
    return playerPos;
}


function updatePlayerPosition(offsets: MovementVectors, wallTargets: MovementVectors, spriteTargets: MovementVectors, sprites: Sprite[]): void {
    
    player.x = checkCollisionAndDoVectorMovement(player.moveX, wallTargets.x, spriteTargets.x, player.y, sprites, player.x, offsets.x);
    player.y = checkCollisionAndDoVectorMovement(player.moveY, wallTargets.y, player.x, spriteTargets.y, sprites, player.y, offsets.y);

    player.y = checkCollisionAndDoVectorMovement(player.strafeX, wallTargets.strafeX, player.x, spriteTargets.strafeY, sprites, player.y, offsets.strafeY);
    player.x = checkCollisionAndDoVectorMovement(player.strafeX, wallTargets.strafeY, spriteTargets.strafeX, player.y, sprites, player.x, offsets.strafeX);

    if (player.moveAngle) {
        player.angle = normalizePlayerAngle(player.angle + PIVOT_SPEED * player.moveAngle);
    }
}


export function movePlayer() {
    handlePlayerInput();

    const barrels = getState().barrels

    const offsets = calculateMovementOffsets();
    const wallTargets = calculateTargetForWallCollision(offsets);
    const spriteTargets = calculateTargetForSpriteCollision(offsets);

    updatePlayerPosition(offsets, wallTargets, spriteTargets, barrels);
}
