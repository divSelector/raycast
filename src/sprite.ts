import { map } from "./map";
import { player } from "./player";
import { context } from "./canvas";
import { barrelTextures } from "./graphics";
import { DepthBufferItem, depthBufferTypeGuard } from "./raycaster";
import { WIDTH, STEP_ANGLE, FOV, HEIGHT, torchRange } from "./constants";
import { normalizeSprite2PlayerAngle } from "./math";


const CENTRAL_RAY = WIDTH / 2 - 1;

export interface Sprite {
    x: number;
    y: number;
    width: number;
    height: number;
    texture: number;
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
                map.offsetY + (HEIGHT / 2) - (item.spriteHeight / 2), 
                item.spriteHeight, 
                item.spriteHeight
            );
        }

        context.restore();
        context.filter = 'none';
    }
}
