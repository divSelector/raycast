import { Sprite, defaultBarrelSprite } from "./sprites";
import { MAP_SCALE, DEFAULT_SPRITE_SIZE } from "./constants";
import { LevelArea } from "./levels";

const WIDTH = 32;               // Width of the maze
const HEIGHT = 32;              // Height of the maze
const WALL_TYPES = [4,5];       // Different wall types
const EMPTY_SPACE = 0;
const PLAYER_START_INDEX = 34;  // Index for the player's starting position

function generateMaze(width: number, height: number): LevelArea {

    let maze = Array(width * height).fill(WALL_TYPES[0]);

    const index = (x: number, y: number) => y * width + x;

    let visited = Array(width * height).fill(false);

    const directions = [
        { x: 0, y: -2 },
        { x: 2, y: 0 },
        { x: 0, y: 2 },
        { x: -2, y: 0 }
    ];

    let stack: { x: number, y: number }[] = [];

    let startX = Math.floor(Math.random() * (width / 2)) * 2 + 1;
    let startY = Math.floor(Math.random() * (height / 2)) * 2 + 1;
    stack.push({ x: startX, y: startY });
    visited[index(startX, startY)] = true;
    maze[index(startX, startY)] = EMPTY_SPACE;

    while (stack.length > 0) {
        let current = stack[stack.length - 1];
        let { x, y } = current;

        let neighbors = directions
            .map(d => ({ x: x + d.x, y: y + d.y }))
            .filter(n => n.x > 0 && n.x < width - 1 && n.y > 0 && n.y < height - 1)
            .filter(n => !visited[index(n.x, n.y)]);

        if (neighbors.length > 0) {
            let next = neighbors[Math.floor(Math.random() * neighbors.length)];

            // Remove the wall between the current cell and the chosen cell
            maze[index((x + next.x) / 2, (y + next.y) / 2)] = EMPTY_SPACE;

            // Mark the chosen cell as visited and move to it
            visited[index(next.x, next.y)] = true;
            maze[index(next.x, next.y)] = EMPTY_SPACE;
            stack.push(next);
        } else {
            // Backtrack if no unvisited neighbors
            stack.pop();
        }
    }

    // Ensure the outer boundaries are walls
    for (let x = 0; x < width; x++) {
        maze[index(x, 0)] = WALL_TYPES[Math.floor(Math.random() * WALL_TYPES.length)];
        maze[index(x, height - 1)] = WALL_TYPES[Math.floor(Math.random() * WALL_TYPES.length)];
    }

    for (let y = 0; y < height; y++) {
        maze[index(0, y)] = WALL_TYPES[Math.floor(Math.random() * WALL_TYPES.length)];
        maze[index(width - 1, y)] = WALL_TYPES[Math.floor(Math.random() * WALL_TYPES.length)];
    }

    // Ensure player start position is empty
    maze[PLAYER_START_INDEX] = EMPTY_SPACE;

    return maze;
}


function generateBarrelsForMaze(maze: LevelArea, width: number, height: number): Sprite[] {
        const margin = MAP_SCALE * 0.30;
        let sprites: Sprite[] = [];
        let currentId = 0;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let idx = y * width + x;
                if (maze[idx] === EMPTY_SPACE) {
                    if (Math.random() < 0.162) {
                        let offsetX = 0;
                        let offsetY = 0;
    
                        switch (Math.floor(Math.random() * 4)) {
                            case 0: // Top-left
                                offsetX = margin;
                                offsetY = margin;
                                break;
                            case 1: // Top-right
                                offsetX = MAP_SCALE - margin - DEFAULT_SPRITE_SIZE;
                                offsetY = margin;
                                break;
                            case 2: // Bottom-left
                                offsetX = margin;
                                offsetY = MAP_SCALE - margin - DEFAULT_SPRITE_SIZE;
                                break;
                            case 3: // Bottom-right
                                offsetX = MAP_SCALE - margin - DEFAULT_SPRITE_SIZE;
                                offsetY = MAP_SCALE - margin - DEFAULT_SPRITE_SIZE;
                                break;
                        }
    
                        sprites.push({
                            ...defaultBarrelSprite,
                            x: x * MAP_SCALE + offsetX,
                            y: y * MAP_SCALE + offsetY,
                        });

                        currentId++;
                    }
                }
            }
        }
        
        return sprites;
    }


export const maze = generateMaze(WIDTH, HEIGHT);
export const mazeBarrels = generateBarrelsForMaze(maze, WIDTH, HEIGHT, );
