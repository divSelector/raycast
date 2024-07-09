import { backgrounds } from "./graphics";
import { walls } from "./graphics";
import { map } from "./map";
import { DepthBufferItem, getDepthBufferByRayCast, depthBufferTypeGuard } from "./raycaster";
import { HEIGHT, WIDTH, torchIntensity, torchRange  } from "./constants";
import { debugCrowbar } from "./weapon";

export const canvas = document.querySelector('canvas') as HTMLCanvasElement;
export const context = canvas.getContext('2d') as CanvasRenderingContext2D;


const SCALE = 0.23;
const LIGHTING_OVERLAY_ALPHA = 0.4;


export function resizeCanvas() {
    canvas.width = window.innerWidth * SCALE;
    canvas.height = window.innerHeight * SCALE;
}


export function drawBackground() {
    context.drawImage(
        backgrounds[0], 
        canvas.width / 2 - Math.floor(WIDTH / 2),
        canvas.height / 2 - Math.floor(HEIGHT / 2)
    )
}


export function drawCanvasClamp() {
    context.fillStyle = '#242424';
    // Prevents Wall Height From Extending Outside Canvas
    context.fillRect(0, 0, canvas.width, map.offsetY);
    context.fillRect(0, map.offsetY + HEIGHT, canvas.width, canvas.width - map.offsetY + 200);

    // Prevent Sprites from Extending Outside Canvas
    context.fillRect(0, 0, map.offsetX, canvas.height);
    context.fillRect(map.offsetX + WIDTH, 0, map.offsetX + 1, canvas.height);
}


function drawColorWall(item: DepthBufferItem) {
    if (depthBufferTypeGuard.isColorWall(item)) {
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
    if (depthBufferTypeGuard.isTextureWall(item)) {
        context.drawImage(
            walls[item.textureIndex - 1],
            item.textureOffset,
            0,
            1,
            map.scale,
            map.offsetX + item.ray,
            map.offsetY + HEIGHT / 2 - item.wallHeight / 2,
            1,
            item.wallHeight
        );
        drawDistantWallLighting(item);
    }
}


function drawDistantWallLighting(item: DepthBufferItem) {
    if (depthBufferTypeGuard.isTextureWall(item) || depthBufferTypeGuard.isColorWall(item)) {
        const normalizedDistance = Math.min(item.closestIntersection.depth / torchRange, 1);
        const attenuationFactor = 1 - normalizedDistance;
        const lightLevel = torchIntensity * attenuationFactor;
        
        context.fillStyle = `rgba(0, 0, 0, ${1-lightLevel})`;
        context.fillRect(map.offsetX + item.ray, map.offsetY + (HEIGHT / 2 - item.wallHeight / 2), 1, item.wallHeight);
    }
}


function drawLightingCanvasOverlay(alpha: number) {
    context.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    context.fillRect(map.offsetX, map.offsetY, WIDTH + 1, HEIGHT);
}


export function drawCamera() {
    const depthBuffer = getDepthBufferByRayCast();
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

    debugCrowbar();

    drawLightingCanvasOverlay(LIGHTING_OVERLAY_ALPHA);
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
