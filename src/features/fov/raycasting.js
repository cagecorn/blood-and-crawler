import { bresenhamLine } from '../../utils/bresenham.js';

export const raycastFOV = (map, origin, radius) => {
  const visible = new Set();
  const { x: ox, y: oy } = origin;
  const height = map.length;
  const width = map[0].length;

  for (let y = oy - radius; y <= oy + radius; y++) {
    for (let x = ox - radius; x <= ox + radius; x++) {
      if (x < 0 || y < 0 || x >= width || y >= height) continue;
      const line = bresenhamLine(ox, oy, x, y);
      for (const [lx, ly] of line) {
        visible.add(`${lx},${ly}`);
        if (map[ly][lx] === 1 && !(lx === x && ly === y)) {
          break;
        }
      }
    }
  }

  return visible;
};
