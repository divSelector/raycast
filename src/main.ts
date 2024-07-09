import './style.css'
import { renderFPS, updateFPS } from './display';
import { drawGame } from './canvas';
import { movePlayer } from './player';
import { loadMapToState } from './map';
import { mazeLevel } from './levels';

loadMapToState(mazeLevel);

function gameLoop() {

  updateFPS();

  drawGame();

  movePlayer();

  renderFPS();

  requestAnimationFrame(gameLoop);
  
} 

window.onload = gameLoop;