import './style.css'
import { renderFPS, updateFPS } from './display';
import { drawGame, drawCanvasClamp } from './canvas';
import { movePlayer } from './player';
import { loadMap } from './game';
import { mazeLevel, } from './levels';


loadMap(mazeLevel);

function gameLoop() {

  updateFPS();

  drawGame();

  movePlayer();

  // moveSprites();

  drawCanvasClamp();

  renderFPS();

  requestAnimationFrame(gameLoop);
  
} 

window.onload = gameLoop;