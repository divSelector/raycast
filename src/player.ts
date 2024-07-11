import { isKeyPressed, isKeyJustPressed, getMouseDeltaX } from "./input";
import { game } from "./game";
import { normalizePlayerAngle } from "./math";
import { INVINCIBILITY_DURATION, MAP_SCALE } from "./constants";
import { getState } from "./state";
import { DestructableSprite, LaunchableSprite, Sprite } from "./sprites";
import { crowbar, Weapon } from "./weapon";

const MAP_SPEED = (MAP_SCALE / 2) / 18;
const PIVOT_SPEED = 0.05;

const state = getState();

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

export interface MovementVectors {
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
        let hitSprite = checkForHit(barrels);
        if (hitSprite) {
            switch (hitSprite.type) {
                case "barrel":
                    let damagedSprite = hitSprite as DestructableSprite;
                    const currentTime = Date.now();
                    console.log(damagedSprite)
                    if (!damagedSprite.invincible && currentTime - damagedSprite.lastTimeHit > INVINCIBILITY_DURATION) {
                        if (damagedSprite.hitPoints > 1) {
                            damagedSprite.hitPoints -= player.equippedWeapon.damage;
                            damagedSprite.texture += 1;
                        }
                        const dx = damagedSprite.x - player.x;
                        const dy = damagedSprite.y - player.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const force = 12;
                        damagedSprite.moveX = (dx / distance) * force;
                        damagedSprite.moveY = (dy / distance) * force;
                        damagedSprite.distanceMoved = 0;
                        damagedSprite.invincible = true;
                        damagedSprite.lastTimeHit = currentTime;
                        setTimeout(() => {
                            damagedSprite.invincible = false;
                            state.storeBarrel(damagedSprite.id, { invincible: damagedSprite.invincible });
                        }, INVINCIBILITY_DURATION);
                        state.storeBarrel(damagedSprite.id, damagedSprite);
                    }
                    break;
            }
        }
    } else {
        player.equippedWeapon.draw();
    }
}


export function calculateMovementOffset(angle: number = player.angle, multiplier: number = MAP_SPEED): MovementVectors {
    return {
        x: Math.sin(angle) * multiplier,
        y: Math.cos(angle) * multiplier,
        strafeX: Math.sin(angle + Math.PI / 2) * multiplier,
        strafeY: Math.cos(angle + Math.PI / 2) * multiplier,
    };
}

export function calculateTargetForWallCollision(offsets: MovementVectors): MovementVectors {
    const proximityLimit = 10;

    const targetX = Math.floor(player.y / MAP_SCALE) * game.size + Math.floor((player.x + offsets.x * player.moveX * proximityLimit) / MAP_SCALE);
    const targetY = Math.floor((player.y + offsets.y * player.moveY * proximityLimit) / MAP_SCALE) * game.size + Math.floor(player.x / MAP_SCALE);



    const strafeTargetX = Math.floor((player.y + offsets.strafeY * player.strafeX * proximityLimit) / MAP_SCALE) * game.size + Math.floor(player.x / MAP_SCALE);
    const strafeTargetY = Math.floor(player.y / MAP_SCALE) * game.size + Math.floor((player.x + offsets.strafeX * player.strafeX * proximityLimit) / MAP_SCALE);
    

    return { x: targetX, y: targetY, strafeX: strafeTargetX, strafeY: strafeTargetY };
}


export function calculateTargetForSpriteCollision(offsets: MovementVectors): MovementVectors {
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

export function checkCollision(movePos: number, wallTarget: number, targetX: number, targetY: number, sprites: Sprite[], excludeSprite?: Sprite): boolean {
    // console.log(`Checking collision for movePos: ${movePos}, wallTarget: ${wallTarget}, targetX: ${targetX}, targetY: ${targetY}`);

    if (excludeSprite) {
        sprites = sprites.filter(sprite => sprite.id !== excludeSprite.id);
    }

    const sprite = getSpriteAtPosition(targetX, targetY, sprites) as DestructableSprite;
    if (sprite && sprite.hitPoints <= 1 && sprite.type == 'barrel') {
        console.log("Collision with destructible sprite");
        return true;
    }

    if (movePos && game.level[wallTarget] === 0 && !sprite) {
        console.log("Collision with wall or empty space");
        return true;
    } else {
        // console.log("Collision blocked");
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
    const BarrelsArray = Object.values(barrels);

    const offsets = calculateMovementOffset();
    const wallTargets = calculateTargetForWallCollision(offsets);
    const spriteTargets = calculateTargetForSpriteCollision(offsets);

    updatePlayerPosition(offsets, wallTargets, spriteTargets, BarrelsArray);
}


function checkForHit(sprites: { [id: number]: DestructableSprite }): Sprite | null {
    const offsets: MovementVectors = calculateMovementOffset(player.angle, player.equippedWeapon.range);

    const targetPositions = calculateTargetForSpriteCollision(offsets);

    const spriteArray = Object.values(sprites);

    const hitSprite = getSpriteAtPosition(targetPositions.x, targetPositions.y, spriteArray) ||
                      getSpriteAtPosition(targetPositions.strafeX, targetPositions.strafeY, spriteArray);

    return hitSprite;
}