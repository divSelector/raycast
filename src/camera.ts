import { WIDTH, HEIGHT, context } from "./canvas";
import { walls } from "./graphics";
import { MAP_SCALE, MAP_SIZE, MAP_RANGE, MINIMAP_SCALE, map } from "./map";
import { player } from "./player";
import { level } from "./dungeon";

export const DOUBLE_PI = Math.PI * 2;
export const FOV = Math.PI / 3;

const STEP_ANGLE = FOV / WIDTH;
const TEXTURED_WALLS_ENABLED = true;

const torchRange = 600;
const torchIntensity = 0.9; 
const LIGHTING_OVERLAY_ALPHA = 0.4;

interface RayIntersection {
    x: number;
    y: number;
    depth: number;
    texture: number;
}

function calculateVerticalIntersection(sinAngle: number, cosAngle: number): RayIntersection {
    let rayEndX: number = 0; 
    let rayEndY: number = 0;
    let depth = Infinity;
    let texture: number = 0;

    let directionX = sinAngle > 0 ? 1 : -1;
    let initialX = directionX > 0
        ? Math.floor(player.x / MAP_SCALE) * MAP_SCALE + MAP_SCALE
        : Math.floor(player.x / MAP_SCALE) * MAP_SCALE;

    for (let offset = 0; offset < MAP_RANGE; offset += MAP_SCALE) {
        depth = (initialX - player.x) / sinAngle;
        rayEndY = player.y + depth * cosAngle;
        rayEndX = initialX;
        
        let mapTargetX = Math.floor(rayEndX / MAP_SCALE);
        let mapTargetY = Math.floor(rayEndY / MAP_SCALE);
        if (directionX < 0) mapTargetX += directionX;
        
        let targetSquare = mapTargetY * MAP_SIZE + mapTargetX;
        if (targetSquare < 0 || targetSquare >= level.length) break;
        if (level[targetSquare] !== 0) {
            texture = level[targetSquare];
            break;
        }

        initialX += directionX * MAP_SCALE;
    }

    return { x: rayEndX, y: rayEndY, depth, texture };
}

function calculateHorizontalIntersection(sinAngle: number, cosAngle: number): RayIntersection {
    let rayEndX: number = 0; 
    let rayEndY: number = 0;
    let depth = Infinity;
    let texture: number = 0;

    let directionY = cosAngle > 0 ? 1 : -1;
    let initialY = directionY > 0
        ? Math.floor(player.y / MAP_SCALE) * MAP_SCALE + MAP_SCALE
        : Math.floor(player.y / MAP_SCALE) * MAP_SCALE;

    for (let offset = 0; offset < MAP_RANGE; offset += MAP_SCALE) {
        depth = (initialY - player.y) / cosAngle;
        rayEndX = player.x + depth * sinAngle;
        rayEndY = initialY;

        let mapTargetX = Math.floor(rayEndX / MAP_SCALE);
        let mapTargetY = Math.floor(rayEndY / MAP_SCALE);
        if (directionY < 0) mapTargetY += directionY;

        let targetSquare = mapTargetY * MAP_SIZE + mapTargetX;
        if (targetSquare < 0 || targetSquare >= level.length) break;
        if (level[targetSquare] !== 0) {
            texture = level[targetSquare];
            break;
        }

        initialY += directionY * MAP_SCALE;
    }

    return { x: rayEndX, y: rayEndY, depth, texture };
}

function drawRectangleWalls(vI: RayIntersection, hI: RayIntersection, ray: number, wallHeight: number) {
    context.fillStyle = vI.depth < hI.depth
        ? '#aaa'
        : '#555';
    context.fillRect(
        map.offsetX + ray, 
        map.offsetY + (HEIGHT / 2 - wallHeight / 2), 
        1, 
        wallHeight
    );
}

function drawTextureWalls(textureIndex: number, textureOffset: number, ray: number, wallHeight: number) {
    context.drawImage(
        walls[textureIndex - 1],
        textureOffset,
        0,
        1,
        MAP_SCALE,
        map.offsetX + ray,
        map.offsetY + HEIGHT / 2 - wallHeight / 2,
        1,
        wallHeight
    );
}


function drawDistantWallLighting(intersection: RayIntersection, ray: number, wallHeight: number) {

    const normalizedDistance = Math.min(intersection.depth / torchRange, 1);
    const attenuationFactor = 1 - normalizedDistance;
    const lightLevel = torchIntensity * attenuationFactor;
    
    context.fillStyle = `rgba(0, 0, 0, ${1-lightLevel})`;
    context.fillRect(map.offsetX + ray, map.offsetY + (HEIGHT / 2 - wallHeight / 2), 1, wallHeight);

}

function drawLightingCanvasOverlay(alpha: number) {
    context.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    context.fillRect(map.offsetX, map.offsetY, WIDTH, HEIGHT);
}

export function drawCamera() {

    let currentAngle = player.angle + (FOV / 2);

    for (let ray = 0; ray < WIDTH; ray++) {
        const sinAngle = Math.sin(currentAngle);
        const cosAngle = Math.cos(currentAngle);

        const verticalIntersection = calculateVerticalIntersection(sinAngle, cosAngle);
        const horizontalIntersection = calculateHorizontalIntersection(sinAngle, cosAngle);

        const closestIntersection = verticalIntersection.depth < horizontalIntersection.depth
            ? verticalIntersection
            : horizontalIntersection;

        let depth = closestIntersection.depth * Math.cos(player.angle - currentAngle);
        let wallHeight = MAP_SCALE * 280 / depth;

        if (TEXTURED_WALLS_ENABLED) {
            let textureOffset = verticalIntersection.depth < horizontalIntersection.depth 
                ? verticalIntersection.y 
                : horizontalIntersection.x;

            textureOffset = textureOffset % MAP_SCALE;

            let textureIndex = verticalIntersection.depth < horizontalIntersection.depth 
                ? verticalIntersection.texture 
                : horizontalIntersection.texture;

            drawTextureWalls(textureIndex, textureOffset, ray, wallHeight);

        } else {
            drawRectangleWalls(verticalIntersection, horizontalIntersection, ray, wallHeight);
        }

        drawDistantWallLighting(closestIntersection, ray, wallHeight);

        currentAngle -= STEP_ANGLE;
    }

    drawLightingCanvasOverlay(LIGHTING_OVERLAY_ALPHA);

}
