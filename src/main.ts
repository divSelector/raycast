import './style.css'
import { renderFPS, updateFPS } from './display';
import { drawGame, drawCanvasClamp } from './canvas';
import { movePlayer } from './player';
import { loadMap } from './map';
import { mazeLevel, level, initialLevel } from './levels';

loadMap(initialLevel);

function gameLoop() {

  updateFPS();

  drawGame();

  movePlayer();

  drawCanvasClamp();

  renderFPS();

  requestAnimationFrame(gameLoop);
  
} 

window.onload = gameLoop;