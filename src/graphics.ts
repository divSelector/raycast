import bg0 from './assets/bg/0.png';
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


export const backgrounds: HTMLImageElement[] = [];
export const walls: HTMLImageElement[] = [];

const bgSources = [bg0];

bgSources.forEach(src => {
    const img = new Image();
    img.src = src;
    backgrounds.push(img);
});

const wallSources = [
  wall1, wall2, wall3, wall4, 
  wall5, wall6, wall7, wall8, 
  wall9, wall10, wall11, wall12,
  wall13
];

wallSources.forEach(src => {
  const img = new Image();
  img.src = src;
  walls.push(img);
});

