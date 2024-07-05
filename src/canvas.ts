import { backgrounds } from "./graphics";
import { map } from "./map";

export const canvas = document.querySelector('canvas') as HTMLCanvasElement;
export const context = canvas.getContext('2d') as CanvasRenderingContext2D;

export const WIDTH = 300
export const HEIGHT = 200
const SCALE = 0.23;

export function resizeCanvas() {
    canvas.width = window.innerWidth * SCALE;
    canvas.height = window.innerHeight * SCALE;
}

export function drawBackground() {
    context.drawImage(
        backgrounds[0], 
        canvas.width / 2 - Math.floor(WIDTH / 2),
        canvas.height / 2 - Math.floor(HEIGHT / 2)
    )
}

export function drawCanvasClamp() {
    // Prevents Wall Height From Extending Outside Canvas
    context.fillStyle = '#242424';
    context.fillRect(0, 0, canvas.width, map.offsetY);
    context.fillRect(0, map.offsetY + HEIGHT, canvas.width, canvas.width - map.offsetY + 200);
}