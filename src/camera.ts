import { WIDTH, HEIGHT, context } from "./canvas";
import { walls } from "./graphics";
import { MAP_SCALE, map } from "./map";
import { drawSprite } from "./sprite";
import { DepthBufferItem, getDepthBufferFromRayCast, depthBufferTypeGuard } from "./raycaster";


const torchRange = 600;
const torchIntensity = 0.9; 
const LIGHTING_OVERLAY_ALPHA = 0.4;


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
    context.fillRect(map.offsetX, map.offsetY, WIDTH, HEIGHT);
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