import { isKeyPressed, isKeyJustPressed, getMouseDeltaX } from "./input";
import { map } from "./map";
import { normalizePlayerAngle } from "./math";
import { MAP_SCALE } from "./constants";
import { getState } from "./state";
import { Sprite } from "./sprites";
import { crowbar, Weapon } from "./weapon";

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
    equippedWeapon: Weapon;
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
    strafeX: 0,
    equippedWeapon: crowbar,
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

    if (isKeyJustPressed('fire')) {
        player.equippedWeapon.animate();
        const barrels = getState().barrels
        const hitSprite = checkForHit(barrels);
        if (hitSprite) {
            // Handle what happens when the crowbar hits a sprite
            console.log('Hit sprite:', hitSprite);
            // Example: reduce sprite's health, destroy it, etc.
        }
    } else {
        player.equippedWeapon.draw();
    }
}


function calculatePlayerOffsets(multiplier: number = MAP_SPEED): MovementVectors {
    return {
        x: Math.sin(player.angle) * multiplier,
        y: Math.cos(player.angle) * multiplier,
        strafeX: Math.sin(player.angle + Math.PI / 2) * multiplier,
        strafeY: Math.cos(player.angle + Math.PI / 2) * multiplier,
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


function getSpriteAtPosition(x: number, y: number, sprites: Sprite[], proximityThreshold: number = 32): Sprite | null {

    for (const sprite of sprites) {
        const distance = Math.sqrt((sprite.x - x) ** 2 + (sprite.y - y) ** 2);
        if (distance < proximityThreshold) {
            return sprite;
        }
    }
    return null;
}


function checkCollision(movePos: number, wallTarget: number, targetX: number, targetY: number, sprites: Sprite[], ): boolean {
    if (movePos && map.level[wallTarget] === 0 && !getSpriteAtPosition(targetX, targetY, sprites)) {
        return true;
    } else {
        return false;
    }
}


function updatePlayerPosition(offsets: MovementVectors, wallTargets: MovementVectors, spriteTargets: MovementVectors, sprites: Sprite[]): void {
    
    const playerCanMoveX = () => checkCollision(player.moveX, wallTargets.x, spriteTargets.x, player.y, sprites);
    const playerCanMoveY = () => checkCollision(player.moveY, wallTargets.y, player.x, spriteTargets.y, sprites);
    const playerCanStrafeY = () =>  checkCollision(player.strafeX, wallTargets.strafeX, player.x, spriteTargets.strafeY, sprites);
    const playerCanStrafeX = () => checkCollision(player.strafeX, wallTargets.strafeY, spriteTargets.strafeX, player.y, sprites);

    if (playerCanMoveX()) {
        player.x += offsets.x * player.moveX;
    }
    if (playerCanMoveY()) {
        player.y += offsets.y * player.moveY;
    }
    if (playerCanStrafeY()) {
        player.y += offsets.strafeY * player.strafeX;
    }
    if (playerCanStrafeX()) {
        player.x += offsets.strafeX * player.strafeX;
    }
    if (player.moveAngle) {
        player.angle = normalizePlayerAngle(player.angle + PIVOT_SPEED * player.moveAngle);
    }
}


export function movePlayer() {
    handlePlayerInput();

    const barrels = getState().barrels

    const offsets = calculatePlayerOffsets();
    const wallTargets = calculateTargetForWallCollision(offsets);
    const spriteTargets = calculateTargetForSpriteCollision(offsets);

    updatePlayerPosition(offsets, wallTargets, spriteTargets, barrels);
}


function checkForHit(sprites: Sprite[]): Sprite | null {
    const offsets: MovementVectors = calculatePlayerOffsets(player.equippedWeapon.range);

    const targetPositions = calculateTargetForSpriteCollision(offsets);

    const hitSprite = getSpriteAtPosition(targetPositions.x, targetPositions.y, sprites) ||
                      getSpriteAtPosition(targetPositions.strafeX, targetPositions.strafeY, sprites);

    return hitSprite;
}