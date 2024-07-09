import './style.css'
import { renderFPS, updateFPS } from './display';
import { resizeCanvas, drawBackground, drawCanvasClamp, drawCamera } from './canvas';
import { movePlayer } from './player';
import { drawMiniMap } from './minimap';
import { loadMap } from './map';
import { mazeLevel } from './levels';

loadMap(mazeLevel);

function gameLoop() {

  updateFPS();

  resizeCanvas();

  drawBackground();

  drawCamera();

  drawMiniMap();

  drawCanvasClamp();

  movePlayer();

  renderFPS();

  requestAnimationFrame(gameLoop);
} 

window.onload = gameLoop;