import { player } from "./player";
import { defaultBarrelSprite, DestructableSprite, Sprite } from "./sprites";
import { WIDTH, FOV, STEP_ANGLE, MAP_SCALE } from "./constants";
import { map } from "./map";
import { normalizeSprite2PlayerAngle } from "./math";
import { barrelTextures } from "./graphics";
import { getState } from "./state";


const TEXTURED_WALLS_ENABLED = true;
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
    spriteId?: number,                    // For sprites
    
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
    const mapRange = MAP_SCALE * map.size;

    let directionX = sinAngle > 0 ? 1 : -1;
    let initialX = directionX > 0
        ? Math.floor(player.x / MAP_SCALE) * MAP_SCALE + MAP_SCALE
        : Math.floor(player.x / MAP_SCALE) * MAP_SCALE;

    for (let offset = 0; offset < mapRange; offset += MAP_SCALE) {
        depth = (initialX - player.x) / sinAngle;
        rayEndY = player.y + depth * cosAngle;
        rayEndX = initialX;
        
        let mapTargetX = Math.floor(rayEndX / MAP_SCALE);
        let mapTargetY = Math.floor(rayEndY / MAP_SCALE);
        if (directionX < 0) mapTargetX += directionX;
        
        let targetSquare = mapTargetY * map.size + mapTargetX;
        if (targetSquare < 0 || targetSquare >= map.level.length) break;
        if (map.level[targetSquare] !== 0) {
            texture = map.level[targetSquare];
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
    const mapRange = MAP_SCALE * map.size;

    let directionY = cosAngle > 0 ? 1 : -1;
    let initialY = directionY > 0
        ? Math.floor(player.y / MAP_SCALE) * MAP_SCALE + MAP_SCALE
        : Math.floor(player.y / MAP_SCALE) * MAP_SCALE;

    for (let offset = 0; offset < mapRange; offset += MAP_SCALE) {
        depth = (initialY - player.y) / cosAngle;
        rayEndX = player.x + depth * sinAngle;
        rayEndY = initialY;

        let mapTargetX = Math.floor(rayEndX / MAP_SCALE);
        let mapTargetY = Math.floor(rayEndY / MAP_SCALE);
        if (directionY < 0) mapTargetY += directionY;

        let targetSquare = mapTargetY * map.size + mapTargetX;
        if (targetSquare < 0 || targetSquare >= map.level.length) break;
        if (map.level[targetSquare] !== 0) {
            texture = map.level[targetSquare];
            break;
        }

        initialY += directionY * MAP_SCALE;
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

    depthBuffer = addSpritesToDepthBuffer(getState().barrels, depthBuffer);

    return depthBuffer;
}


export function addSpritesToDepthBuffer(spritesData: {[id: number ]: DestructableSprite}, depthBuffer: DepthBufferItem[]): DepthBufferItem[] {

    const state = getState();

    Object.values(spritesData).forEach(sprite => {

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
        const spriteHeight = MAP_SCALE * 300 / spriteDistance;
        const spriteTexture = barrelTextures[sprite.texture];

        switch (sprite.type) {
            case "barrel":
                state.storeBarrel(sprite.id, sprite as DestructableSprite) 
            
                break;
        }

        depthBuffer.push({
            spriteId: sprite.id,
            type: 'sprite',
            depth: spriteDistance,
            ray: Math.floor(spriteRay),
            spriteTexture: spriteTexture,
            spriteX: spriteX,
            spriteY: spriteY,
            spriteHeight: spriteHeight
        });


    });

    return depthBuffer;
}
