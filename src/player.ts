import { MAP_SCALE, MINIMAP_SCALE, MAP_SIZE, map, level, showMap } from "./map";
import { context } from "./canvas";
import { DOUBLE_PI } from "./camera";
import { isKeyPressed } from "./input";

const MAP_SPEED = (MAP_SCALE / 2) / 10;
const PIVOT_SPEED = 0.05;

interface PlayerIface {
    x: number;
    y: number;
    angle: number;
    mapX: number;
    mapY: number;
    moveX: number;
    moveY: number;
    moveAngle: number;
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

    if (isKeyPressed('up')) {
        player.moveX = 1;
        player.moveY = 1;
    } else if (isKeyPressed('down')) {
        player.moveX = -1;
        player.moveY = -1;
    }

    if (isKeyPressed('left')) {
        player.moveAngle = 1;
    } else if (isKeyPressed('right')) {
        player.moveAngle = -1;
    }
}

export function movePlayer() {

    updatePlayerMovement();

    const playerOffsetX = Math.sin(player.angle) * MAP_SPEED;
    const playerOffsetY = Math.cos(player.angle) * MAP_SPEED;

    const proximityLimit = 10;
    const targetX = Math.floor(player.y / MAP_SCALE) * MAP_SIZE + Math.floor((player.x + playerOffsetX * player.moveX * proximityLimit) / MAP_SCALE);
    const targetY = Math.floor((player.y + playerOffsetY * player.moveY * proximityLimit) / MAP_SCALE) * MAP_SIZE + Math.floor(player.x / MAP_SCALE);

    if (player.moveX && level[targetX] == 0) {
        player.x += playerOffsetX * player.moveX;
    }
    
    if (player.moveY && level[targetY] == 0) {
        player.y += playerOffsetY * player.moveY;
    }

    if (player.moveAngle) {
        player.angle += PIVOT_SPEED * player.moveAngle;
    }
}
