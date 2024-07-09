import { player } from "./player";
import { level } from "./map";
import { barrelSpritesForLevel, Sprite } from "./sprite";
import { WIDTH, FOV, STEP_ANGLE } from "./constants";
import { map } from "./map";
import { normalizeSprite2PlayerAngle } from "./math";
import { barrelTextures } from "./graphics";


const TEXTURED_WALLS_ENABLED = true;
const MAP_RANGE = map.scale * map.size;
const CENTRAL_RAY = WIDTH / 2 - 1;


export interface RayIntersection {
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
    spriteType?: string;                  // For specialized sprites
    
}


export const depthBufferTypeGuard = {
    isTextureWall(item: DepthBufferItem): item is DepthBufferItem & { textureIndex: number; textureOffset: number; wallHeight: number; closestIntersection: RayIntersection; } {
        return item.type === 'textureWall' && item.textureIndex !== undefined && item.textureOffset !== undefined && item.wallHeight !== undefined && item.closestIntersection !== undefined;
    },

    isColorWall(item: DepthBufferItem): item is DepthBufferItem & { color: string; wallHeight: number; closestIntersection: RayIntersection } {
        return item.type === 'colorWall' && item.color !== undefined && item.wallHeight !== undefined && item.closestIntersection !== undefined;
    },

    isSprite(item: DepthBufferItem): item is DepthBufferItem & { spriteTexture: HTMLImageElement; spriteHeight: number } {
        return item.type === 'sprite' && item.spriteTexture !== undefined && item.spriteHeight !== undefined;
    }
};


function calculateVerticalIntersection(sinAngle: number, cosAngle: number): RayIntersection {
    let rayEndX: number = 0; 
    let rayEndY: number = 0;
    let depth = Infinity;
    let texture: number = 0;

    let directionX = sinAngle > 0 ? 1 : -1;
    let initialX = directionX > 0
        ? Math.floor(player.x / map.scale) * map.scale + map.scale
        : Math.floor(player.x / map.scale) * map.scale;

    for (let offset = 0; offset < MAP_RANGE; offset += map.scale) {
        depth = (initialX - player.x) / sinAngle;
        rayEndY = player.y + depth * cosAngle;
        rayEndX = initialX;
        
        let mapTargetX = Math.floor(rayEndX / map.scale);
        let mapTargetY = Math.floor(rayEndY / map.scale);
        if (directionX < 0) mapTargetX += directionX;
        
        let targetSquare = mapTargetY * map.size + mapTargetX;
        if (targetSquare < 0 || targetSquare >= level.length) break;
        if (level[targetSquare] !== 0) {
            texture = level[targetSquare];
            break;
        }

        initialX += directionX * map.scale;
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
        ? Math.floor(player.y / map.scale) * map.scale + map.scale
        : Math.floor(player.y / map.scale) * map.scale;

    for (let offset = 0; offset < MAP_RANGE; offset += map.scale) {
        depth = (initialY - player.y) / cosAngle;
        rayEndX = player.x + depth * sinAngle;
        rayEndY = initialY;

        let mapTargetX = Math.floor(rayEndX / map.scale);
        let mapTargetY = Math.floor(rayEndY / map.scale);
        if (directionY < 0) mapTargetY += directionY;

        let targetSquare = mapTargetY * map.size + mapTargetX;
        if (targetSquare < 0 || targetSquare >= level.length) break;
        if (level[targetSquare] !== 0) {
            texture = level[targetSquare];
            break;
        }

        initialY += directionY * map.scale;
    }

    return { x: rayEndX, y: rayEndY, depth, texture };
}


export function getDepthBufferByRayCast(): DepthBufferItem[] {
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
        let wallHeight = map.scale * 280 / depth;

        if (TEXTURED_WALLS_ENABLED) {
            let textureOffset = verticalIntersection.depth < horizontalIntersection.depth 
                ? verticalIntersection.y 
                : horizontalIntersection.x;

            textureOffset = textureOffset % map.scale;

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

    depthBuffer = addSpritesToDepthBuffer(barrelSpritesForLevel, depthBuffer);

    return depthBuffer;
}


export function addSpritesToDepthBuffer(spritesData: Sprite[], depthBuffer: DepthBufferItem[]): DepthBufferItem[] {

    spritesData.forEach(sprite => {

        const spriteX = sprite.x - player.x;
        const spriteY = sprite.y - player.y;

        const spriteDistance = Math.sqrt(spriteX * spriteX + spriteY * spriteY);

        let sprite2playerAngle = normalizeSprite2PlayerAngle(
            Math.atan2(spriteX, spriteY) - player.angle
        );

        const spriteIsOutOfView = Math.abs(sprite2playerAngle) > ((FOV / 2)) + 20;
        if (spriteIsOutOfView) {
            return;
        }

        const shiftRays = sprite2playerAngle / STEP_ANGLE;
        const spriteRay = CENTRAL_RAY - shiftRays;
        const spriteHeight = map.scale * 300 / spriteDistance;
        const spriteTexture = barrelTextures[sprite.texture];

        depthBuffer.push({
            type: 'sprite',
            depth: spriteDistance,
            ray: Math.floor(spriteRay),
            spriteTexture: spriteTexture,
            spriteX: spriteX,
            spriteY: spriteY,
            spriteHeight: spriteHeight
        });

        // if (addSpriteToState) {
        //     addSpriteToState({...defaultBarrelSprite, ...sprite})
        // }

    });

    return depthBuffer;
}
