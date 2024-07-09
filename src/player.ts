import { isKeyPressed, getMouseDeltaX, requestPointerLock } from "./input";
import { map } from "./map";
import { normalizePlayerAngle } from "./math";


const MAP_SPEED = (map.scale / 2) / 18;
const PIVOT_SPEED = 0.05;

document.addEventListener('click', requestPointerLock);

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

export const player: Player = {
    x: map.scale + 10,
    y: map.scale + 10,
    angle: Math.PI / 3,
    mapX: 0,
    mapY: 0,
    moveX: 0,
    moveY: 0,
    moveAngle: 0,
    strafeX: 0
};


function updatePlayerMovement() {
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

export function movePlayer() {

    updatePlayerMovement();

    const playerOffsetX = Math.sin(player.angle) * MAP_SPEED;
    const playerOffsetY = Math.cos(player.angle) * MAP_SPEED;

    const strafeOffsetX = Math.sin(player.angle + Math.PI / 2) * MAP_SPEED;
    const strafeOffsetY = Math.cos(player.angle + Math.PI / 2) * MAP_SPEED;

    const proximityLimit = 10;

    const targetX = Math.floor(player.y / map.scale) * map.size + Math.floor((player.x + playerOffsetX * player.moveX * proximityLimit) / map.scale);
    const targetY = Math.floor((player.y + playerOffsetY * player.moveY * proximityLimit) / map.scale) * map.size + Math.floor(player.x / map.scale);

    const strafeTargetX = Math.floor((player.y + strafeOffsetY * player.strafeX * proximityLimit) / map.scale) * map.size + Math.floor(player.x / map.scale);
    const strafeTargetY = Math.floor(player.y / map.scale) * map.size + Math.floor((player.x + strafeOffsetX * player.strafeX * proximityLimit) / map.scale);

    if (!map.level) return;

    if (player.moveX && map.level[targetX] == 0) {
        player.x += playerOffsetX * player.moveX;
    }
    
    if (player.moveY && map.level[targetY] == 0) {
        player.y += playerOffsetY * player.moveY;
    }

    if (player.strafeX && map.level[strafeTargetX] == 0) {
        player.y += strafeOffsetY * player.strafeX;
    }

    if (player.strafeX && map.level[strafeTargetY] == 0) {
        player.x += strafeOffsetX * player.strafeX;
    }

    if (player.moveAngle) {
        player.angle = normalizePlayerAngle(player.angle + PIVOT_SPEED * player.moveAngle);
    }
}
