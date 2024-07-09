// import { map } from "./map";
// import { Sprite } from "./sprite";


// const WIDTH = 32; // Width of the maze
// const HEIGHT = 32; // Height of the maze
// const WALL_TYPES = [4,5]; // Different wall types
// const EMPTY_SPACE = 0;
// const PLAYER_START_INDEX = 34; // Index for the player's starting position

// function generateMaze(width: number, height: number): number[] {
//     // Initialize the maze grid with walls
//     let maze = Array(width * height).fill(WALL_TYPES[0]);

//     // Helper function to get the index in the maze array
//     const index = (x: number, y: number) => y * width + x;

//     // Mark all cells as unvisited
//     let visited = Array(width * height).fill(false);

//     // Directions: up, right, down, left
//     const directions = [
//         { x: 0, y: -2 },
//         { x: 2, y: 0 },
//         { x: 0, y: 2 },
//         { x: -2, y: 0 }
//     ];

//     // Stack to hold the path
//     let stack: { x: number, y: number }[] = [];

//     // Start at a random point within the grid but ensure it's within bounds
//     let startX = Math.floor(Math.random() * (width / 2)) * 2 + 1;
//     let startY = Math.floor(Math.random() * (height / 2)) * 2 + 1;
//     stack.push({ x: startX, y: startY });
//     visited[index(startX, startY)] = true;
//     maze[index(startX, startY)] = EMPTY_SPACE;

//     while (stack.length > 0) {
//         let current = stack[stack.length - 1];
//         let { x, y } = current;

//         // Get unvisited neighbors
//         let neighbors = directions
//             .map(d => ({ x: x + d.x, y: y + d.y }))
//             .filter(n => n.x > 0 && n.x < width - 1 && n.y > 0 && n.y < height - 1)
//             .filter(n => !visited[index(n.x, n.y)]);

//         if (neighbors.length > 0) {
//             // Choose a random neighbor
//             let next = neighbors[Math.floor(Math.random() * neighbors.length)];

//             // Remove the wall between the current cell and the chosen cell
//             maze[index((x + next.x) / 2, (y + next.y) / 2)] = EMPTY_SPACE;

//             // Mark the chosen cell as visited and move to it
//             visited[index(next.x, next.y)] = true;
//             maze[index(next.x, next.y)] = EMPTY_SPACE;
//             stack.push(next);
//         } else {
//             // Backtrack if no unvisited neighbors
//             stack.pop();
//         }
//     }

//     // Ensure the outer boundaries are walls
//     for (let x = 0; x < width; x++) {
//         maze[index(x, 0)] = WALL_TYPES[Math.floor(Math.random() * WALL_TYPES.length)];
//         maze[index(x, height - 1)] = WALL_TYPES[Math.floor(Math.random() * WALL_TYPES.length)];
//     }
//     for (let y = 0; y < height; y++) {
//         maze[index(0, y)] = WALL_TYPES[Math.floor(Math.random() * WALL_TYPES.length)];
//         maze[index(width - 1, y)] = WALL_TYPES[Math.floor(Math.random() * WALL_TYPES.length)];
//     }

//     // Ensure player start position at index 34 is empty
//     maze[PLAYER_START_INDEX] = EMPTY_SPACE;

//     return maze;
// }

// const DEFAULT_SPRITE_SIZE = 64;

// // export const dungeonSprites: Sprite[] = [
// //     { x: MAP_SCALE * 5, y: MAP_SCALE * 5, texture: 0, width: DEFAULT_SPRITE_SIZE, height: DEFAULT_SPRITE_SIZE }
// // ];


// function placeBarrelsInMaze(maze: number[], width: number, height: number): Sprite[] {
//     const sprites: Sprite[] = [];
//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             let idx = y * width + x;
//             if (maze[idx] === EMPTY_SPACE) {
//                 if (Math.random() < 0.5) {
//                     sprites.push({
//                         x: x * MAP_SCALE,
//                         y: y * MAP_SCALE,
//                         texture: 0, // Replace with actual texture index
//                         width: DEFAULT_SPRITE_SIZE,
//                         height: DEFAULT_SPRITE_SIZE
//                     });
//                 }
//             }
//         }
//     }
//     return sprites;
// }


// export const level = generateMaze(WIDTH, HEIGHT);
// export const dungeonSprites = placeBarrelsInMaze(level, WIDTH, HEIGHT, );
