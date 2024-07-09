import { player } from "./player";
import { map } from "./map";
import { context, canvas } from "./canvas";
import { isKeyJustPressed } from "./input";
import { WIDTH, HEIGHT, MAP_SCALE } from "./constants";


function updateMiniMapOffsets() {
    map.offsetX = Math.floor(canvas.width / 2) - WIDTH / 2;
    map.offsetY = Math.floor(canvas.height / 2) - HEIGHT / 2;
}


function updatePlayerMapOffsets() {
    player.mapX = (player.x / MAP_SCALE) * map.minimapScale + map.offsetX;
    player.mapY = (player.y / MAP_SCALE) * map.minimapScale + map.offsetY;
}


function updateShowMiniMap() {
    if (isKeyJustPressed('minimap')) {
        if (map.showMinimap) {
            map.showMinimap = false;
        } else {
            map.showMinimap = true;
        }
    }
}

export function drawMiniMap() {

    updateShowMiniMap();
    updateMiniMapOffsets();

    if (map.showMinimap) {
        for (let row = 0; row < map.size; row++) {
            for (let col = 0; col < map.size; col++) {
                const square = row * map.size + col;
                if (!map.level) return;
                if (map.level[square]) {
                    context.fillStyle = '#555';
                } else {
                    context.fillStyle = '#aaa';
                }
                context.fillRect(
                    map.offsetX + col * map.minimapScale, 
                    map.offsetY + row * map.minimapScale, 
                    map.minimapScale, map.minimapScale
                )
            }
        }
    }

    drawMiniMapPlayer();
}


export function drawMiniMapPlayer() {
    updatePlayerMapOffsets();

    if (map.showMinimap) {
        context.fillStyle = 'Blue';
        context.beginPath();
        context.arc(player.mapX, player.mapY, 2, 0, Math.PI * 2);
        context.fill();

        context.strokeStyle = 'Blue';
        context.lineWidth = 1;
        const lineLength = 5;
        context.beginPath();
        context.moveTo(player.mapX, player.mapY);
        context.lineTo(
            player.mapX + Math.sin(player.angle) * lineLength,
            player.mapY + Math.cos(player.angle) * lineLength
        );
        context.stroke();
    }
}