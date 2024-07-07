import { map } from "./map";
import { player } from "./player";
import { context, canvas } from "./canvas";
import { spriteTextures } from "./graphics";
import { DepthBufferItem, depthBufferTypeGuard } from "./raycaster";
import { MAP_SCALE, WIDTH, STEP_ANGLE, FOV, HEIGHT } from "./constants";

const DEFAULT_SPRITE_SIZE = 64;
const CENTRAL_RAY = Math.floor(WIDTH / 2) - 1;

interface Sprite {
    x: number;
    y: number;
    width: number;
    height: number;
    texture: number;
}

const spritesData: Sprite[] = [
    { x: MAP_SCALE * 5, y: MAP_SCALE * 5, texture: 0, width: DEFAULT_SPRITE_SIZE, height: DEFAULT_SPRITE_SIZE }
];


export function addSpritesToDepthBuffer(depthBuffer: DepthBufferItem[]): DepthBufferItem[] {

    spritesData.forEach(sprite => {

        const spriteX = sprite.x - player.x;
        const spriteY = sprite.y - player.y;

        const spriteDistance = Math.sqrt(spriteX * spriteX + spriteY * spriteY);

        let sprite2playerAngle = Math.atan2(spriteX, spriteY) - player.angle;

        if (sprite2playerAngle > Math.PI) {
            sprite2playerAngle -= 2 * Math.PI;
        } else if (sprite2playerAngle <= -Math.PI) {
            sprite2playerAngle += 2 * Math.PI;
        }

        if (Math.abs(sprite2playerAngle) > ((FOV / 2))) {
            return;
        }

        const shiftRays = sprite2playerAngle / STEP_ANGLE;

        const spriteRay = CENTRAL_RAY - shiftRays;
        
        const spriteHeight = MAP_SCALE * 300 / spriteDistance;

        const spriteTexture = spriteTextures[sprite.texture];

        depthBuffer.push({
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


export function drawSprite(item: DepthBufferItem) {
    if (depthBufferTypeGuard.isSprite(item)) {
        context.drawImage(
            item.spriteTexture, 
            map.offsetX + item.ray - Math.floor(item.spriteHeight / 2), 
            map.offsetY + (HEIGHT / 2) - (item.spriteHeight / 2) + 10, 
            item.spriteHeight, 
            item.spriteHeight
        );
    }
}