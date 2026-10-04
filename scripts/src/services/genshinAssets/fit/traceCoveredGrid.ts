import { simplifyPath } from "#src/services/genshinAssets/fit/simplifyPath";

// Four sides of a cell, each as the neighbour across it and the side's two corners, in order round the cell
// Counterclockwise, so a side walked from its first corner to its second has the cell on its left
const CELL_SIDES = [
  {
    corners: [
      [0, 0],
      [1, 0],
    ],
    neighbour: [0, -1],
  },
  {
    corners: [
      [1, 0],
      [1, 1],
    ],
    neighbour: [1, 0],
  },
  {
    corners: [
      [1, 1],
      [0, 1],
    ],
    neighbour: [0, 1],
  },
  {
    corners: [
      [0, 1],
      [0, 0],
    ],
    neighbour: [-1, 0],
  },
] as const;
// A loop smaller than this many cells is a sliver of the source's own edges, not a part of its shape
const MIN_LOOP_CELLS = 4;
// Every loop round the covered cells of a grid of `width` columns and `height` rows, in cell units: each loop walked
// Along their edges with the covered side on its left, so an outer ring runs counterclockwise and a hole clockwise,
// Then simplified by Douglas-Peucker to within `tolerance` cells
export const traceCoveredGrid = (
  covered: Uint8Array,
  { height, tolerance, width }: { height: number; tolerance: number; width: number },
): [number, number][][] => {
  const checkIsCovered = (column: number, row: number): boolean =>
    column >= 0 && row >= 0 && column < width && row < height && covered[row * width + column] === 1;
  // Every side between a covered cell and an uncovered one, keyed by the corner it starts from
  const cornerKey = (column: number, row: number): number => row * (width + 1) + column;
  const startSideMap = new Map<number, [number, number][]>();
  for (let row = 0; row < height; row++)
    for (let column = 0; column < width; column++) {
      if (!checkIsCovered(column, row)) continue;
      for (const { corners, neighbour } of CELL_SIDES) {
        if (checkIsCovered(column + neighbour[0], row + neighbour[1])) continue;
        const [[startX, startY], [endX, endY]] = corners;
        const key = cornerKey(column + startX, row + startY);
        startSideMap.set(key, [...(startSideMap.get(key) ?? []), [column + endX, row + endY]]);
      }
    }
  const loops: [number, number][][] = [];
  for (const startKey of startSideMap.keys())
    while ((startSideMap.get(startKey)?.length ?? 0) > 0) {
      const start: [number, number] = [startKey % (width + 1), Math.floor(startKey / (width + 1))];
      const loop: [number, number][] = [start];
      let [previousX, previousY] = start;
      const [firstEnd, ...remainingEnds] = startSideMap.get(startKey) ?? [];
      startSideMap.set(startKey, remainingEnds);
      let current = firstEnd;
      while (current && cornerKey(...current) !== startKey) {
        loop.push(current);
        const [currentX, currentY] = current;
        const currentKey = cornerKey(currentX, currentY);
        const outgoing = startSideMap.get(currentKey) ?? [];
        // Where two covered cells meet at a corner only, the loop turns left, keeping each cell's own ring apart
        const [directionX, directionY] = [currentX - previousX, currentY - previousY];
        const turn = ([nextX, nextY]: [number, number]): number =>
          directionX * (nextY - currentY) - directionY * (nextX - currentX);
        const nextIndex = outgoing.reduce(
          (best, next, index) => (turn(next) > turn(outgoing[best] ?? next) ? index : best),
          0,
        );
        [previousX, previousY] = current;
        current = outgoing[nextIndex];
        startSideMap.set(currentKey, outgoing.toSpliced(nextIndex, 1));
      }
      if (loop.length >= MIN_LOOP_CELLS) loops.push(loop);
    }

  return loops.flatMap((loop) => {
    const signedArea = loop.reduce((sum, [x, y], index) => {
      const [nextX, nextY] = loop[(index + 1) % loop.length] ?? [x, y];
      return sum + x * nextY - nextX * y;
    }, 0);
    if (Math.abs(signedArea) / 2 < MIN_LOOP_CELLS) return [];
    // A closed loop is simplified as two open halves, split at the corner farthest from its first
    const [originX, originY] = loop[0] ?? [0, 0];
    const farthestIndex = loop.reduce(
      (best, [x, y], index) =>
        Math.hypot(x - originX, y - originY) >
        Math.hypot((loop[best]?.[0] ?? 0) - originX, (loop[best]?.[1] ?? 0) - originY)
          ? index
          : best,
      0,
    );
    const halves = [
      ...simplifyPath(loop.slice(0, farthestIndex + 1), tolerance).slice(0, -1),
      ...simplifyPath([...loop.slice(farthestIndex), loop[0] ?? [0, 0]], tolerance).slice(0, -1),
    ];
    // The split corners are kept by both halves, so one lying on the line through its neighbours is dropped
    const simplified = halves.filter(([x, y], index) => {
      const [previousX, previousY] = halves.at(index - 1) ?? [x, y];
      const [nextX, nextY] = halves[(index + 1) % halves.length] ?? [x, y];
      const chord = Math.hypot(nextX - previousX, nextY - previousY) || 1;
      return (
        Math.abs((nextX - previousX) * (previousY - y) - (previousX - x) * (nextY - previousY)) / chord > tolerance
      );
    });
    return [simplified];
  });
};
