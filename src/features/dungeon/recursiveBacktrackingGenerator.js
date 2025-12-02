const TILE_WALL = 1;
const TILE_FLOOR = 0;
const MIN_CORRIDOR_WIDTH = 4;
const MAX_CORRIDOR_WIDTH = 6;
const MIN_ROOM_SIZE = 8;
const MAX_ROOM_SIZE = 14;

function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function createGrid(width, height) {
  return Array.from({ length: height }, () => Array(width).fill(TILE_WALL));
}

function carveRectangle(grid, x, y, width, height) {
  const gridHeight = grid.length;
  const gridWidth = grid[0].length;

  for (let row = y; row < y + height; row++) {
    if (row <= 0 || row >= gridHeight - 1) {
      continue;
    }

    for (let col = x; col < x + width; col++) {
      if (col <= 0 || col >= gridWidth - 1) {
        continue;
      }

      grid[row][col] = TILE_FLOOR;
    }
  }
}

function carveRoom(grid, center, roomSize) {
  const halfWidth = Math.floor(roomSize.width / 2);
  const halfHeight = Math.floor(roomSize.height / 2);
  const startX = center.x - halfWidth;
  const startY = center.y - halfHeight;

  carveRectangle(grid, startX, startY, roomSize.width, roomSize.height);
}

function carveHorizontalCorridor(grid, y, x1, x2, corridorWidth) {
  const [start, end] = x1 < x2 ? [x1, x2] : [x2, x1];
  const offsetStart = -Math.floor((corridorWidth - 1) / 2);
  const offsetEnd = offsetStart + corridorWidth - 1;

  for (let rowOffset = offsetStart; rowOffset <= offsetEnd; rowOffset++) {
    const row = y + rowOffset;
    if (row <= 0 || row >= grid.length - 1) {
      continue;
    }

    for (let col = start; col <= end; col++) {
      if (col <= 0 || col >= grid[0].length - 1) {
        continue;
      }

      grid[row][col] = TILE_FLOOR;
    }
  }
}

function carveVerticalCorridor(grid, x, y1, y2, corridorWidth) {
  const [start, end] = y1 < y2 ? [y1, y2] : [y2, y1];
  const offsetStart = -Math.floor((corridorWidth - 1) / 2);
  const offsetEnd = offsetStart + corridorWidth - 1;

  for (let colOffset = offsetStart; colOffset <= offsetEnd; colOffset++) {
    const col = x + colOffset;
    if (col <= 0 || col >= grid[0].length - 1) {
      continue;
    }

    for (let row = start; row <= end; row++) {
      if (row <= 0 || row >= grid.length - 1) {
        continue;
      }

      grid[row][col] = TILE_FLOOR;
    }
  }
}

function carveCorridor(grid, start, end, corridorWidth) {
  const horizontalFirst = Math.random() > 0.5;
  const clampedWidth = clamp(
    corridorWidth,
    MIN_CORRIDOR_WIDTH,
    Math.min(MAX_CORRIDOR_WIDTH, grid[0].length - 2, grid.length - 2)
  );

  if (horizontalFirst) {
    carveHorizontalCorridor(grid, start.y, start.x, end.x, clampedWidth);
    carveVerticalCorridor(grid, end.x, start.y, end.y, clampedWidth);
  } else {
    carveVerticalCorridor(grid, start.x, start.y, end.y, clampedWidth);
    carveHorizontalCorridor(grid, end.y, start.x, end.x, clampedWidth);
  }
}

function clampRoomCenter(center, roomSize, gridWidth, gridHeight) {
  const halfWidth = Math.floor(roomSize.width / 2);
  const halfHeight = Math.floor(roomSize.height / 2);

  return {
    x: clamp(center.x, halfWidth + 1, gridWidth - halfWidth - 2),
    y: clamp(center.y, halfHeight + 1, gridHeight - halfHeight - 2),
  };
}

function buildNextCenter(currentCenter, stepIndex, gridWidth, gridHeight) {
  const isHorizontal = stepIndex % 2 === 0;
  const sign = Math.random() > 0.5 ? 1 : -1;
  const majorStep = randomInRange(14, 22) * sign;
  const minorStep = randomInRange(-6, 6);
  const nextCenter = {
    x: currentCenter.x + (isHorizontal ? majorStep : minorStep),
    y: currentCenter.y + (isHorizontal ? minorStep : majorStep),
  };

  const margin = MAX_ROOM_SIZE + MAX_CORRIDOR_WIDTH;
  return {
    x: clamp(nextCenter.x, margin, gridWidth - margin),
    y: clamp(nextCenter.y, margin, gridHeight - margin),
  };
}

function createBranchCenter(anchor, stepIndex, gridWidth, gridHeight) {
  const perpendicular = stepIndex % 2 !== 0;
  const sign = Math.random() > 0.5 ? 1 : -1;
  const majorStep = randomInRange(10, 18) * sign;
  const minorStep = randomInRange(-4, 4);

  const branchCenter = {
    x: anchor.x + (perpendicular ? majorStep : minorStep),
    y: anchor.y + (perpendicular ? minorStep : majorStep),
  };

  const margin = MAX_ROOM_SIZE + MAX_CORRIDOR_WIDTH;
  return {
    x: clamp(branchCenter.x, margin, gridWidth - margin),
    y: clamp(branchCenter.y, margin, gridHeight - margin),
  };
}

export function generateDungeon(width, height) {
  const mapWidth = Math.max(width, MIN_ROOM_SIZE * 3);
  const mapHeight = Math.max(height, MIN_ROOM_SIZE * 3);
  const grid = createGrid(mapWidth, mapHeight);

  const roomCount = 5;
  const rooms = [];
  let currentCenter = {
    x: Math.floor(mapWidth / 2),
    y: Math.floor(mapHeight / 2),
  };

  for (let i = 0; i < roomCount; i++) {
    const roomSize = {
      width: randomInRange(MIN_ROOM_SIZE, MAX_ROOM_SIZE),
      height: randomInRange(MIN_ROOM_SIZE - 2, MAX_ROOM_SIZE),
    };
    currentCenter = clampRoomCenter(currentCenter, roomSize, mapWidth, mapHeight);
    carveRoom(grid, currentCenter, roomSize);
    rooms.push({ center: currentCenter, size: roomSize });

    if (i === roomCount - 1) {
      break;
    }

    const corridorWidth = randomInRange(MIN_CORRIDOR_WIDTH, MAX_CORRIDOR_WIDTH);
    const nextCenter = buildNextCenter(currentCenter, i, mapWidth, mapHeight);
    carveCorridor(grid, currentCenter, nextCenter, corridorWidth);

    if (Math.random() > 0.55) {
      const branchCenter = createBranchCenter(currentCenter, i, mapWidth, mapHeight);
      const branchRoomSize = {
        width: randomInRange(MIN_ROOM_SIZE - 2, MIN_ROOM_SIZE + 4),
        height: randomInRange(MIN_ROOM_SIZE - 2, MIN_ROOM_SIZE + 4),
      };
      const clampedBranchCenter = clampRoomCenter(
        branchCenter,
        branchRoomSize,
        mapWidth,
        mapHeight
      );
      carveCorridor(grid, currentCenter, clampedBranchCenter, corridorWidth);
      carveRoom(grid, clampedBranchCenter, branchRoomSize);
      rooms.push({ center: clampedBranchCenter, size: branchRoomSize });
    }

    currentCenter = nextCenter;
  }

  if (rooms.length > 2) {
    const loopRoom = rooms[rooms.length - 1];
    const anchorRoom = rooms[Math.floor(rooms.length / 2)];
    carveCorridor(
      grid,
      loopRoom.center,
      anchorRoom.center,
      randomInRange(MIN_CORRIDOR_WIDTH, MAX_CORRIDOR_WIDTH)
    );
  }

  return grid;
}
