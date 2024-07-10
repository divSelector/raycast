import './style.css'
import { renderFPS, updateFPS } from './display';
import { drawGame, drawCanvasClamp } from './canvas';
import { movePlayer } from './player';
import { loadMapToState } from './map';
import { mazeLevel } from './levels';

loadMapToState(mazeLevel);

function gameLoop() {

  updateFPS();

  drawGame();

  movePlayer();

  drawCanvasClamp();

  renderFPS();

  requestAnimationFrame(gameLoop);
  
} 

window.onload = gameLoop;