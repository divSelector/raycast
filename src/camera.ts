import { WIDTH, HEIGHT, context } from "./canvas";
import { walls } from "./graphics";
import { MAP_SCALE, MAP_SIZE, MAP_RANGE, map } from "./map";
import { player } from "./player";
import { level } from "./map";
import { drawSprite, addSpritesToDepthBuffer } from "./sprite";

export const DOUBLE_PI = Math.PI * 2;
export const FOV = Math.PI / 3;

export const STEP_ANGLE = FOV / WIDTH;
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

export interface DepthBufferItem {
    type: 'textureWall' | 'colorWall' | 'sprite';
    depth: number;
    ray: number;
    wallHeight?: number;                  // For walls
    closestIntersection?: RayIntersection // for walls
    textureIndex?: number;                // For texture walls
    textureOffset?: number;               // For texture walls
    color?: string;                       // For color walls
    spriteTexture?: HTMLImageElement;     // For sprites
    spriteX?: number;                     // For sprites
    spriteY?: number;                     // For sprites
    spriteHeight?: number;                // For sprites
    
}

function isDepthBufferItemTextureWall(item: DepthBufferItem): item is DepthBufferItem & { textureIndex: number; textureOffset: number; wallHeight: number; closestIntersection: RayIntersection; } {
    return item.type === 'textureWall' && item.textureIndex !== undefined && item.textureOffset !== undefined && item.wallHeight !== undefined && item.closestIntersection !== undefined;
}

function isDepthBufferItemColorWall(item: DepthBufferItem): item is DepthBufferItem & { color: string; wallHeight: number; closestIntersection: RayIntersection } {
    return item.type === 'colorWall' && item.color !== undefined && item.wallHeight !== undefined && item.closestIntersection !== undefined;
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

function drawColorWall(item: DepthBufferItem) {
    if (isDepthBufferItemColorWall(item)) {
        context.fillStyle = item.color;
        context.fillRect(
            map.offsetX + item.ray, 
            map.offsetY + (HEIGHT / 2 - item.wallHeight / 2), 
            1, 
            item.wallHeight
        );
        drawDistantWallLighting(item);
    }
}

function drawTextureWall(item: DepthBufferItem) {
    if (isDepthBufferItemTextureWall(item)) {
        context.drawImage(
            walls[item.textureIndex - 1],
            item.textureOffset,
            0,
            1,
            MAP_SCALE,
            map.offsetX + item.ray,
            map.offsetY + HEIGHT / 2 - item.wallHeight / 2,
            1,
            item.wallHeight
        );
        drawDistantWallLighting(item);
    }
}

function drawDistantWallLighting(item: DepthBufferItem) {
    if (isDepthBufferItemColorWall(item) || isDepthBufferItemTextureWall(item)) {
        const normalizedDistance = Math.min(item.closestIntersection.depth / torchRange, 1);
        const attenuationFactor = 1 - normalizedDistance;
        const lightLevel = torchIntensity * attenuationFactor;
        
        context.fillStyle = `rgba(0, 0, 0, ${1-lightLevel})`;
        context.fillRect(map.offsetX + item.ray, map.offsetY + (HEIGHT / 2 - item.wallHeight / 2), 1, item.wallHeight);
    }
}

function drawLightingCanvasOverlay(alpha: number) {
    context.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    context.fillRect(map.offsetX, map.offsetY, WIDTH, HEIGHT);
}

function getDepthBufferFromRayCast(): DepthBufferItem[] {
    let currentAngle = player.angle + (FOV / 2);

    let depthBuffer: DepthBufferItem[] = [];

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

            depthBuffer.push({
                type: 'textureWall',
                depth: depth,
                ray: ray,
                wallHeight: wallHeight,
                textureIndex: textureIndex,
                textureOffset: textureOffset,
                closestIntersection: closestIntersection
            });

        } else {

            const wallColor = verticalIntersection.depth < horizontalIntersection.depth 
                ? '#aaa'
                : '#555';

            depthBuffer.push({
                type: 'colorWall',
                depth: depth,
                ray: ray,
                wallHeight: wallHeight,
                color: wallColor,
                closestIntersection: closestIntersection
            });
        }

        currentAngle -= STEP_ANGLE;
    }

    depthBuffer = addSpritesToDepthBuffer(depthBuffer);

    return depthBuffer;
}

export function drawCamera() {

    const depthBuffer = getDepthBufferFromRayCast();

    depthBuffer.sort((a, b) => b.depth - a.depth);

    for (const item of depthBuffer) {

        switch (item.type) {

            case 'textureWall':
                drawTextureWall(item);
                break;

            case 'colorWall':
                drawColorWall(item);
                break;

            case 'sprite': 
                drawSprite(item)
                break;

        }
    }

    drawLightingCanvasOverlay(LIGHTING_OVERLAY_ALPHA);
}