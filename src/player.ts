import { isKeyPressed, getMouseDeltaX } from "./input";
import { map } from "./map";
import { normalizePlayerAngle } from "./math";
import { MAP_SCALE } from "./constants";


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


function calculateTargetPositions(offsets: MovementVectors): MovementVectors {
    const proximityLimit = 10;
    const mapSize = map.size;

    const targetX = Math.floor(player.y / MAP_SCALE) * mapSize + Math.floor((player.x + offsets.x * player.moveX * proximityLimit) / MAP_SCALE);
    const targetY = Math.floor((player.y + offsets.y * player.moveY * proximityLimit) / MAP_SCALE) * mapSize + Math.floor(player.x / MAP_SCALE);

    const strafeTargetX = Math.floor((player.y + offsets.strafeY * player.strafeX * proximityLimit) / MAP_SCALE) * mapSize + Math.floor(player.x / MAP_SCALE);
    const strafeTargetY = Math.floor(player.y / MAP_SCALE) * mapSize + Math.floor((player.x + offsets.strafeX * player.strafeX * proximityLimit) / MAP_SCALE);

    return { x: targetX, y: targetY, strafeX: strafeTargetX, strafeY: strafeTargetY };
}


function updatePlayerPosition(offsets: MovementVectors, targets: MovementVectors): void {
    if (player.moveX && map.level[targets.x] === 0) {
        player.x += offsets.x * player.moveX;
    }

    if (player.moveY && map.level[targets.y] === 0) {
        player.y += offsets.y * player.moveY;
    }

    if (player.strafeX && map.level[targets.strafeX] === 0) {
        player.y += offsets.strafeY * player.strafeX;
    }

    if (player.strafeX && map.level[targets.strafeY] === 0) {
        player.x += offsets.strafeX * player.strafeX;
    }

    if (player.moveAngle) {
        player.angle = normalizePlayerAngle(player.angle + PIVOT_SPEED * player.moveAngle);
    }
}


export function movePlayer() {
    handlePlayerInput();

    const offsets = calculateMovementOffsets();
    const targets = calculateTargetPositions(offsets);

    updatePlayerPosition(offsets, targets);
}
