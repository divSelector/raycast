import { context } from "./canvas";

const FPS = 60;

interface DisplayIface {
    lastTime: number;
    cycleCount: number;
    fpsRate: number;
}

const display: DisplayIface = {
    lastTime: 0,
    cycleCount: 0,
    fpsRate: 0
};

function calculateFPS({ lastTime, cycleCount, fpsRate }: DisplayIface) {

    const thisTime = Date.now();
    const cycleTime = thisTime - lastTime;
    lastTime = thisTime;

    cycleCount++;

    if (cycleCount >= FPS) {
        cycleCount = 0;
        fpsRate = Math.floor(1000 / cycleTime);
    }

    return { lastTime, cycleCount, fpsRate };
}

export function renderFPS() {
    context.fillStyle = '#FF0000';
    context.font = '12px Monospace';
    context.fillText(display.fpsRate.toString(), 10, 20);
}

export function updateFPS () {
    Object.assign(display, calculateFPS(display));
}