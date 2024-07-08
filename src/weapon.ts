import { crowbarTextures } from "./graphics";
import { context, canvas } from "./canvas";

interface AnimationState {
    currentFrame: number;
    animationDirection: number;
    frameDelay: number;
    lastFrameTime: number;
    frameInterval: number;
}

const crowbarState: AnimationState = {
    currentFrame: 0,
    animationDirection: 1,
    frameDelay: 600,
    lastFrameTime: 0,
    frameInterval: 1000 / 25,
};


export function drawWeapon(state: AnimationState, weaponTextures: HTMLImageElement[]): void {
    const totalFrames = weaponTextures.length - 1;
    if (state.currentFrame >= 0 && state.currentFrame < totalFrames) {
        const weaponWidth = weaponTextures[state.currentFrame].width;
        const weaponHeight = weaponTextures[state.currentFrame].height;

        context.drawImage(
            weaponTextures[state.currentFrame], 
            canvas.width / 2 - weaponWidth / 2,
            canvas.height - weaponHeight
        );
    }
}

function animateWeapon(timestamp: number, state: AnimationState, weaponTextures: HTMLImageElement[]): void {
    const elapsed = timestamp - state.lastFrameTime;
    const totalFrames = weaponTextures.length - 1;

    if (elapsed > state.frameInterval) {
        state.lastFrameTime = timestamp - (elapsed % state.frameInterval);

        state.currentFrame += state.animationDirection;

        if (state.currentFrame >= totalFrames || state.currentFrame < 0) {
            state.animationDirection *= -1;
            state.currentFrame += state.animationDirection;
        }
    }

    drawWeapon(state, crowbarTextures);
    requestAnimationFrame((ts) => animateWeapon(ts, state, crowbarTextures));
}



export const debugCrowbar = () => animateWeapon(0, crowbarState, crowbarTextures);