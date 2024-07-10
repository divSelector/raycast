import { crowbarTextures } from "./graphics";
import { context, canvas } from "./canvas";

type WeaponType = "melee" | "ranged";

export interface Weapon {
    type: WeaponType;
    damage: number;
    animate: () => void;
    draw: () => void;
}

interface AnimationState {
    currentFrame: number;
    animationDirection: number;
    lastFrameTime: number;
    frameInterval: number;
    isAnimating: boolean;
}

const crowbarState: AnimationState = {
    currentFrame: 0,
    animationDirection: 1,
    lastFrameTime: 0,
    frameInterval: 1000 / 25,
    isAnimating: false
};


function drawWeapon(state: AnimationState, weaponTextures: HTMLImageElement[]): void {
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
        if (state.currentFrame == 0) {
            state.isAnimating = false;
        }

        if (state.currentFrame >= totalFrames || state.currentFrame < 0) {
            state.animationDirection *= -1;
            state.currentFrame += state.animationDirection;
        }
    }
    
    if (state.isAnimating) {
        requestAnimationFrame((ts) => animateWeapon(ts, crowbarState, crowbarTextures));
    }
}


export const crowbar: Weapon = {
    type: "melee",
    damage: 1,
    animate: () => {
        crowbarState.isAnimating = true;
        animateWeapon(0, crowbarState, crowbarTextures);
    },
    draw: () => drawWeapon(crowbarState, crowbarTextures)
}