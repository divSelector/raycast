import { player } from "./player";
import { game } from "./game";
import { context, canvas } from "./canvas";
import { isKeyJustPressed } from "./input";
import { WIDTH, HEIGHT, MAP_SCALE } from "./constants";


function updateMiniMapOffsets() {
    game.offsetX = Math.floor(canvas.width / 2) - WIDTH / 2;
    game.offsetY = Math.floor(canvas.height / 2) - HEIGHT / 2;
}


function updatePlayerMapOffsets() {
    player.mapX = (player.x / MAP_SCALE) * game.minimapScale + game.offsetX;
    player.mapY = (player.y / MAP_SCALE) * game.minimapScale + game.offsetY;
}


function updateShowMiniMap() {
    if (isKeyJustPressed('minimap')) {
        if (game.showMinimap) {
            game.showMinimap = false;
        } else {
            game.showMinimap = true;
        }
    }
}

export function drawMiniMap() {

    updateShowMiniMap();
    updateMiniMapOffsets();

    if (game.showMinimap) {
        for (let row = 0; row < game.size; row++) {
            for (let col = 0; col < game.size; col++) {
                const square = row * game.size + col;
                if (!game.level) return;
                if (game.level[square]) {
                    context.fillStyle = '#555';
                } else {
                    context.fillStyle = '#aaa';
                }
                context.fillRect(
                    game.offsetX + col * game.minimapScale, 
                    game.offsetY + row * game.minimapScale, 
                    game.minimapScale, game.minimapScale
                )
            }
        }
    }

    drawMiniMapPlayer();
}


export function drawMiniMapPlayer() {
    updatePlayerMapOffsets();

    if (game.showMinimap) {
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