export function generateDungeon(width, height) {
  const mazeWidth = width % 2 === 0 ? width + 1 : width;
  const mazeHeight = height % 2 === 0 ? height + 1 : height;
  const grid = Array.from({ length: mazeHeight }, () => Array(mazeWidth).fill(1));

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function carve(x, y) {
    grid[y][x] = 0;
    const directions = shuffle([
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]);
    for (const [dx, dy] of directions) {
      const nx = x + dx * 2;
      const ny = y + dy * 2;
      if (ny <= 0 || ny >= mazeHeight - 1 || nx <= 0 || nx >= mazeWidth - 1) {
        continue;
      }
      if (grid[ny][nx] === 1) {
        grid[y + dy][x + dx] = 0;
        carve(nx, ny);
      }
    }
  }

  carve(1, 1);
  return grid;
}
