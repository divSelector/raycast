import { map } from "./map";
import { player } from "./player";
import { context } from "./canvas";
import { spriteTextures } from "./graphics";
import { DepthBufferItem, depthBufferTypeGuard } from "./raycaster";
import { MAP_SCALE, WIDTH, STEP_ANGLE, FOV, HEIGHT, torchIntensity, torchRange } from "./constants";
import { normalizeAngle } from "./math";

const DEFAULT_SPRITE_SIZE = 64;
const CENTRAL_RAY = WIDTH / 2 - 1;

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

        let sprite2playerAngle = normalizeAngle(Math.atan2(spriteX, spriteY) - player.angle);

        const shiftRays = sprite2playerAngle / STEP_ANGLE;
        const spriteRay = CENTRAL_RAY - shiftRays;
        
        const perpendicularDistance = spriteDistance * Math.cos(sprite2playerAngle);
        const spriteHeight = MAP_SCALE * 280 / perpendicularDistance;
        const spriteScreenX = (WIDTH / 2) * (1 + Math.tan(sprite2playerAngle) / Math.tan(FOV / 2));

        const spriteTexture = spriteTextures[sprite.texture];

        depthBuffer.push({
            type: 'sprite',
            depth: perpendicularDistance,
            ray: Math.floor(spriteRay),
            spriteTexture: spriteTexture,
            spriteX: spriteScreenX,
            spriteY: spriteY,
            spriteHeight: spriteHeight
        });

    });

    return depthBuffer;
}


export function drawSprite(item: DepthBufferItem) {
    if (depthBufferTypeGuard.isSprite(item)) {
        const normalizedDistance = Math.min(item.depth / torchRange, 1);
        const attenuationFactor = 1 - normalizedDistance;
        const lightLevel = 2.4 * attenuationFactor;

        context.save();

        const opacityPercentage = (1 - lightLevel) * 100;
        if (opacityPercentage > 60) {
            context.filter = `opacity(${opacityPercentage}%)`;
        }

        context.globalAlpha = lightLevel;

        if (opacityPercentage <= 99) {
            context.drawImage(
                item.spriteTexture, 
                map.offsetX + item.ray - Math.floor(item.spriteHeight / 2), 
                map.offsetY + (HEIGHT / 2) - (item.spriteHeight / 2) + 10, 
                item.spriteHeight, 
                item.spriteHeight
            );
        }

        context.restore();
        context.filter = 'none';
    }
}
