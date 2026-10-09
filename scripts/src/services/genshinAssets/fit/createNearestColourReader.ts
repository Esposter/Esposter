import type { Vector } from "#src/models/shared/Vector";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { Color } from "three";

// The side of the cells the points are hashed into, five centimetres, a statue's section apart
const CELL_METRES = 0.05;
const toCellKey = (x: number, y: number, z: number): string => `${x},${y},${z}`;
// The colour a surface takes at any point near it, read off coloured points spread over it: the mean, in linear light,
// Of the `nearestCount` points nearest, returned as a packed sRGB hex. The points are hashed into a grid and the cells
// Round a point searched a shell at a time, until the nearest found lies within every shell searched
export const createNearestColourReader = (
  points: readonly Vector[],
  colours: readonly Vector[],
  nearestCount: number,
): ((point: Readonly<Vector>) => number) => {
  if (points.length < nearestCount)
    throw new InvalidOperationError(
      Operation.Read,
      "nearest colour",
      `needs ${nearestCount} points, has ${points.length}`,
    );
  const cellIndicesMap = new Map<string, number[]>();
  for (const [index, [x, y, z]] of points.entries()) {
    const key = toCellKey(Math.floor(x / CELL_METRES), Math.floor(y / CELL_METRES), Math.floor(z / CELL_METRES));
    const indices = cellIndicesMap.get(key) ?? [];
    indices.push(index);
    cellIndicesMap.set(key, indices);
  }
  const mean = new Color();
  return ([x, y, z]) => {
    const [cellX = 0, cellY = 0, cellZ = 0] = [x, y, z].map((value) => Math.floor(value / CELL_METRES));
    const found: { distance: number; index: number }[] = [];
    // A shell's cells are those whose largest step from the point's own cell is its reach, so each is searched once
    for (let reach = 0; ; reach++) {
      for (let stepX = -reach; stepX <= reach; stepX++)
        for (let stepY = -reach; stepY <= reach; stepY++)
          for (let stepZ = -reach; stepZ <= reach; stepZ++) {
            if (Math.max(Math.abs(stepX), Math.abs(stepY), Math.abs(stepZ)) !== reach) continue;
            for (const index of cellIndicesMap.get(toCellKey(cellX + stepX, cellY + stepY, cellZ + stepZ)) ?? []) {
              const [pointX, pointY, pointZ] = points[index] ?? [0, 0, 0];
              found.push({ distance: Math.hypot(pointX - x, pointY - y, pointZ - z), index });
            }
          }
      const nearest = found
        .toSorted((firstFound, secondFound) => firstFound.distance - secondFound.distance)
        .slice(0, nearestCount);
      // Every point past `reach` cells of the point's own lies at least this far from it, so the nearest found within
      // That stand nearer than anything a wider shell can hold
      if (nearest.length < nearestCount || (nearest.at(-1)?.distance ?? Infinity) > reach * CELL_METRES) continue;
      const [red = 0, green = 0, blue = 0] = [0, 1, 2].map(
        (channel) => nearest.reduce((sum, { index }) => sum + (colours[index]?.[channel] ?? 0), 0) / nearest.length,
      );
      return mean.setRGB(red, green, blue).getHex();
    }
  };
};
