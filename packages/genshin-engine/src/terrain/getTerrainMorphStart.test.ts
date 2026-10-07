import type { TerrainOptions } from "#src/models/terrain/TerrainOptions";
import type { Vector3Like } from "three";

import { createTerrainSelection } from "#src/terrain/createTerrainSelection";
import { getTerrainMorphStart } from "#src/terrain/getTerrainMorphStart";
import { getTerrainTileColumn } from "#src/terrain/getTerrainTileColumn";
import { getTerrainTileKey } from "#src/terrain/getTerrainTileKey";
import { getTerrainTileLevel } from "#src/terrain/getTerrainTileLevel";
import { getTerrainTileRow } from "#src/terrain/getTerrainTileRow";
import { selectTerrainTiles } from "#src/terrain/selectTerrainTiles";
import { describe, expect, test } from "vitest";

// Each vertex's morph onto the next level's grid as the ground material measures it, over a tile's whole grid
const getTileMorphs = (terrainOptions: TerrainOptions, key: number, eye: Vector3Like): number[] => {
  const { cellsPerSide, finestRange, finestTileSize, maxHeight, minHeight } = terrainOptions;
  const levelScale = 2 ** getTerrainTileLevel(key);
  const size = finestTileSize * levelScale;
  const morphStart = getTerrainMorphStart(terrainOptions) * levelScale;
  const morphEnd = finestRange * levelScale;
  const eyeLift = Math.max(eye.y - maxHeight, minHeight - eye.y, 0);
  return Array.from({ length: (cellsPerSide + 1) ** 2 }, (_value, index) => {
    const x = (getTerrainTileColumn(key) + (index % (cellsPerSide + 1)) / cellsPerSide) * size;
    const z = (getTerrainTileRow(key) + Math.floor(index / (cellsPerSide + 1)) / cellsPerSide) * size;
    const distance = Math.hypot(x - eye.x, eyeLift, z - eye.z);
    return Math.min(Math.max((distance - morphStart) / (morphEnd - morphStart), 0), 1);
  });
};

// A finest tile has none
const getChildKeys = (key: number): number[] => {
  const level = getTerrainTileLevel(key) - 1;
  if (level < 0) return [];
  const column = getTerrainTileColumn(key) * 2;
  const row = getTerrainTileRow(key) * 2;
  return [
    getTerrainTileKey(level, column, row),
    getTerrainTileKey(level, column + 1, row),
    getTerrainTileKey(level, column, row + 1),
    getTerrainTileKey(level, column + 1, row + 1),
  ];
};

describe(getTerrainMorphStart, () => {
  const terrainOptions: TerrainOptions = {
    cellsPerSide: 2,
    finestRange: 4,
    finestTileSize: 1,
    levelCount: 2,
    maxHeight: 0,
    minHeight: 0,
  };
  const stepCount = 1000;
  const selectionCapacity = 256;

  test("leaves a tile splitting into its children wholly at its level, and them wholly morphed onto its grid", () => {
    expect.hasAssertions();

    // The eye walks in from past the coarsest range and back out, so every tile it passes splits and then rejoins
    const eyes = Array.from({ length: stepCount * 2 + 1 }, (_value, step) => ({
      x: (8 * Math.abs(step - stepCount)) / stepCount,
      y: 1,
      z: 0.5,
    }));
    const frames = eyes.map((eye) => {
      const { count, keys } = selectTerrainTiles(
        terrainOptions,
        eye,
        undefined,
        createTerrainSelection(selectionCapacity),
      );
      return { count, drawn: new Set(keys.subarray(0, count)), eye };
    });
    // Each tile is read where its replacement is drawn: a parent at its children's eye and they at its, whether it
    // Splits or rejoins between two steps
    const parentMorphs: number[] = [];
    const childMorphs: number[] = [];
    for (const [step, frame] of frames.entries()) {
      const previousFrame = frames[step - 1];
      if (!previousFrame) continue;
      for (const [parentFrame, childFrame] of [
        [previousFrame, frame],
        [frame, previousFrame],
      ] as const)
        for (const key of parentFrame.drawn) {
          const childKeys = getChildKeys(key);
          if (childKeys.length === 0 || !childKeys.every((childKey) => childFrame.drawn.has(childKey))) continue;
          parentMorphs.push(...getTileMorphs(terrainOptions, key, childFrame.eye));
          for (const childKey of childKeys)
            childMorphs.push(...getTileMorphs(terrainOptions, childKey, parentFrame.eye));
        }
    }

    expect({
      // A full selection may have dropped tiles, and with them the splits they would show
      hasFullSelection: frames.some(({ count }) => count === selectionCapacity),
      hasSplit: parentMorphs.length > 0,
      maxParentMorph: Math.max(...parentMorphs),
      minChildMorph: Math.min(...childMorphs),
    }).toStrictEqual({ hasFullSelection: false, hasSplit: true, maxParentMorph: 0, minChildMorph: 1 });
  });
});
