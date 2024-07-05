interface KeyMapping {
    [action: string]: string;
}

interface KeyState {
    [key: string]: boolean;
}

const keyMappings: KeyMapping = {
    up:       'w',
    down:     's',
    left:     'a',
    right:    'd',
    minimap:  'm'
};

const keyState: KeyState = {};
const keyPressed: KeyState = {};

document.onkeydown = function(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    keyState[key] = true;
}

document.onkeyup = function(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    keyState[key] = false;
    keyPressed[key] = false;
}

export function isKeyPressed(action: string): boolean {
    const key = keyMappings[action];
    return keyState[key] || false;
}

export function isKeyJustPressed(action: string): boolean {
    const key = keyMappings[action];
    if (keyState[key] && !keyPressed[key]) {
        keyPressed[key] = true;
        return true;
    }
    return false;
}
