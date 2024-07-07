import './style.css'
import { renderFPS, updateFPS } from './display';
import { resizeCanvas, drawBackground, drawCanvasClamp, drawCamera } from './canvas';
import { drawMiniMap } from './map';
import { drawMiniMapPlayer, movePlayer } from './player';

function gameLoop() {

  resizeCanvas();

  updateFPS();

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