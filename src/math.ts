export function normalizeAngle(angle: number): number {
    angle = (angle + Math.PI) % (2 * Math.PI) - Math.PI;
    if (angle > Math.PI) {
        angle -= 2 * Math.PI;
    } else if (angle <= -Math.PI) {
        angle += 2 * Math.PI;
    }
    return angle;
}