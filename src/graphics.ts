import bg0 from './assets/bg/3.png';
import wall1 from './assets/walls/1.png';
import wall2 from './assets/walls/2.png';
import wall3 from './assets/walls/3.png';
import wall4 from './assets/walls/4.png';
import wall5 from './assets/walls/5.png';
import wall6 from './assets/walls/6.png';
import wall7 from './assets/walls/7.png';
import wall8 from './assets/walls/8.png';
import wall9 from './assets/walls/9.png';
import wall10 from './assets/walls/10.png';
import wall11 from './assets/walls/11.png';
import wall12 from './assets/walls/12.png';
import wall13 from './assets/walls/13.png';
import barrel0 from './assets/sprite/barrel/0.png';
import barrel1 from './assets/sprite/barrel/1.png';
import barrel2 from './assets/sprite/barrel/2.png';
import crowbar0 from './assets/weapon/crowbar/0.png';
import crowbar1 from './assets/weapon/crowbar/1.png';
import crowbar2 from './assets/weapon/crowbar/2.png';
import crowbar3 from './assets/weapon/crowbar/3.png';
import crowbar4 from './assets/weapon/crowbar/4.png';
import crowbar5 from './assets/weapon/crowbar/5.png';

export const backgrounds: HTMLImageElement[] = [];
export const walls: HTMLImageElement[] = [];
export const barrelTextures: HTMLImageElement[] = [];
export const crowbarTextures: HTMLImageElement[] = [];

const bgSources = [bg0];
const wallSources = [
  wall1, wall2, wall3, wall4, 
  wall5, wall6, wall7, wall8, 
  wall9, wall10, wall11, wall12,
  wall13
];
const barrelSources = [barrel0, barrel1, barrel2];
const crowbarSources = [
  crowbar0, crowbar1, crowbar2, 
  crowbar3, crowbar4, crowbar5
];

function loadTextures(sources: string[], targetArray: HTMLImageElement[]): void {
    sources.forEach(src => {
        const img = new Image();
        img.src = src;
        targetArray.push(img);
    });
}

loadTextures(bgSources, backgrounds);
loadTextures(wallSources, walls);
loadTextures(barrelSources, barrelTextures);
loadTextures(crowbarSources, crowbarTextures);
