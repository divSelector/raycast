import { crowbarTextures } from "./graphics";
import { context, canvas } from "./canvas";

interface AnimationState {
    currentFrame: number;
    animationDirection: number;
    totalFrames: number;
    frameDelay: number;
    lastFrameTime: number;
    frameInterval: number;
}

const crowbarState: AnimationState = {
    currentFrame: 0,
    animationDirection: 1,
    totalFrames: crowbarTextures.length - 1,
    frameDelay: 600, // Number of animation frames to wait before changing the texture frame
    lastFrameTime: 0, // Timestamp of the last frame update
    frameInterval: 1000 / 25, // Target frame interval (60 FPS)
};


export function drawWeapon(state: AnimationState): void {
    if (state.currentFrame >= 0 && state.currentFrame < state.totalFrames) {
        const weaponWidth = crowbarTextures[state.currentFrame].width;
        const weaponHeight = crowbarTextures[state.currentFrame].height;

        context.drawImage(
            crowbarTextures[state.currentFrame], 
            canvas.width / 2 - weaponWidth / 2,
            canvas.height - weaponHeight
        );
    }
}

function animateWeapon(timestamp: number, state: AnimationState): void {
    const elapsed = timestamp - state.lastFrameTime;

    if (elapsed > state.frameInterval) {
        state.lastFrameTime = timestamp - (elapsed % state.frameInterval);

        state.currentFrame += state.animationDirection;

        if (state.currentFrame >= state.totalFrames || state.currentFrame < 0) {
            state.animationDirection *= -1; // Reverse the direction
            state.currentFrame += state.animationDirection; // Ensure it doesn't get stuck at the boundaries
        }
    }

    drawWeapon(state);
    requestAnimationFrame((ts) => animateWeapon(ts, state));
}



export const debugCrowbar = () => animateWeapon(0, crowbarState);