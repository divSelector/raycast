import './style.css'
import { renderFPS, updateFPS } from './display';
import { resizeCanvas, drawBackground, drawCanvasClamp } from './canvas';
import { drawMiniMap } from './map';
import { drawMiniMapPlayer, movePlayer } from './player';
import { drawCamera } from './camera';


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