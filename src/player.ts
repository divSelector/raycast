import { MAP_SCALE, MINIMAP_SCALE, MAP_SIZE, map, showMap } from "./map";
import { context } from "./canvas";
import { DOUBLE_PI } from "./camera";
import { isKeyPressed, getMouseDeltaX, requestPointerLock } from "./input";
import { level } from "./dungeon";

const MAP_SPEED = (MAP_SCALE / 2) / 18;
const PIVOT_SPEED = 0.05;

document.addEventListener('click', requestPointerLock);

interface PlayerIface {
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

export const player: PlayerIface = {
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

function updatePlayerMapOffsets() {
    player.mapX = (player.x / MAP_SCALE) * MINIMAP_SCALE + map.offsetX;
    player.mapY = (player.y / MAP_SCALE) * MINIMAP_SCALE + map.offsetY;
}

export function drawMiniMapPlayer() {
    updatePlayerMapOffsets();

    if (showMap) {
        context.fillStyle = 'Blue';
        context.beginPath();
        context.arc(player.mapX, player.mapY, 2, 0, DOUBLE_PI);
        context.fill();

        context.strokeStyle = 'Blue';
        context.lineWidth = 1;
        const lineLength = 5;
        context.beginPath();
        context.moveTo(player.mapX, player.mapY);
        context.lineTo(
            player.mapX + Math.sin(player.angle) * lineLength,
            player.mapY + Math.cos(player.angle) * lineLength
        );
        context.stroke();
    }
}

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

    const targetX = Math.floor(player.y / MAP_SCALE) * MAP_SIZE + Math.floor((player.x + playerOffsetX * player.moveX * proximityLimit) / MAP_SCALE);
    const targetY = Math.floor((player.y + playerOffsetY * player.moveY * proximityLimit) / MAP_SCALE) * MAP_SIZE + Math.floor(player.x / MAP_SCALE);

    const strafeTargetX = Math.floor((player.y + strafeOffsetY * player.strafeX * proximityLimit) / MAP_SCALE) * MAP_SIZE + Math.floor(player.x / MAP_SCALE);
    const strafeTargetY = Math.floor(player.y / MAP_SCALE) * MAP_SIZE + Math.floor((player.x + strafeOffsetX * player.strafeX * proximityLimit) / MAP_SCALE);


    if (player.moveX && level[targetX] == 0) {
        player.x += playerOffsetX * player.moveX;
    }
    
    if (player.moveY && level[targetY] == 0) {
        player.y += playerOffsetY * player.moveY;
    }

    if (player.strafeX && level[strafeTargetX] == 0) {
        player.y += strafeOffsetY * player.strafeX;
    }

    if (player.strafeX && level[strafeTargetY] == 0) {
        player.x += strafeOffsetX * player.strafeX;
    }

    if (player.moveAngle) {
        player.angle += PIVOT_SPEED * player.moveAngle;
    }
}
