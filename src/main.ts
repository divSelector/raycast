import './style.css'
import { renderFPS, updateFPS } from './display';
import { resizeCanvas, drawBackground, drawCanvasClamp, drawCamera } from './canvas';
import { movePlayer, drawMiniMapPlayer } from './player';
import { drawMiniMap } from './map';

function gameLoop() {

  updateFPS();

  resizeCanvas();

  drawBackground();

  drawCamera();

  drawMiniMap();

  drawMiniMapPlayer();

  drawCanvasClamp();

  movePlayer();

  renderFPS();

  requestAnimationFrame(gameLoop);
} 

window.onload = gameLoop;