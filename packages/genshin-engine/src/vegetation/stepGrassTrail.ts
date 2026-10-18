import type { GrassTrail } from "#src/models/vegetation/GrassTrail";
import type { Vector2 } from "three";

import { computeGrassTrailCell, computeGrassTrailTexel } from "#src/vegetation/computeGrassTrailTexel";
import {
  GRASS_TRAIL_EXTENT,
  GRASS_TRAIL_FADE_SECONDS,
  GRASS_TRAIL_STAMP_RADIUS,
  GRASS_TRAIL_TEXELS,
} from "#src/vegetation/constants";

const TEXEL_SIZE = GRASS_TRAIL_EXTENT / GRASS_TRAIL_TEXELS;
// Each bend encoded in a byte, from [-1, 1] across [0, 255]
const encodeBend = (bend: number): number => Math.round((Math.min(Math.max(bend, -1), 1) * 0.5 + 0.5) * 255);

// Advances the trail by a frame: every bend fades, the texels the square has moved off are cleared for the cells it
// now covers, the character's footing is stamped with its direction of travel when it moves, and the texture takes the
// result. The square is centred on the character's cell, so the cells that enter it are the ones it has left behind
export const stepGrassTrail = (trail: GrassTrail, position: Vector2, velocity: Vector2, delta: number): void => {
  const { bends, cells, data, texture } = trail;
  const decay = Math.exp(-delta / GRASS_TRAIL_FADE_SECONDS);
  for (let index = 0; index < bends.length; index++) bends[index] *= decay;
  const centreCellX = computeGrassTrailCell(position.x, TEXEL_SIZE);
  const centreCellZ = computeGrassTrailCell(position.y, TEXEL_SIZE);
  trail.center.value.set((centreCellX + 0.5) * TEXEL_SIZE, (centreCellZ + 0.5) * TEXEL_SIZE);
  const firstCellOffset = -GRASS_TRAIL_TEXELS / 2;
  for (let row = 0; row < GRASS_TRAIL_TEXELS; row++)
    for (let column = 0; column < GRASS_TRAIL_TEXELS; column++) {
      const cellX = centreCellX + firstCellOffset + column;
      const cellZ = centreCellZ + firstCellOffset + row;
      const texelIndex = computeGrassTrailTexel(cellZ) * GRASS_TRAIL_TEXELS + computeGrassTrailTexel(cellX);
      if (cells[texelIndex * 2] === cellX && cells[texelIndex * 2 + 1] === cellZ) continue;
      cells[texelIndex * 2] = cellX;
      cells[texelIndex * 2 + 1] = cellZ;
      bends[texelIndex * 2] = 0;
      bends[texelIndex * 2 + 1] = 0;
    }
  const speed = Math.hypot(velocity.x, velocity.y);
  if (speed > 0) {
    const stampCellRadius = Math.ceil(GRASS_TRAIL_STAMP_RADIUS / TEXEL_SIZE);
    for (let offsetZ = -stampCellRadius; offsetZ <= stampCellRadius; offsetZ++)
      for (let offsetX = -stampCellRadius; offsetX <= stampCellRadius; offsetX++) {
        const cellX = centreCellX + offsetX;
        const cellZ = centreCellZ + offsetZ;
        const distance = Math.hypot((cellX + 0.5) * TEXEL_SIZE - position.x, (cellZ + 0.5) * TEXEL_SIZE - position.y);
        if (distance > GRASS_TRAIL_STAMP_RADIUS) continue;
        const texelIndex = computeGrassTrailTexel(cellZ) * GRASS_TRAIL_TEXELS + computeGrassTrailTexel(cellX);
        bends[texelIndex * 2] = velocity.x / speed;
        bends[texelIndex * 2 + 1] = velocity.y / speed;
      }
  }
  for (let index = 0; index < bends.length / 2; index++) {
    data[index * 4] = encodeBend(bends[index * 2]);
    data[index * 4 + 1] = encodeBend(bends[index * 2 + 1]);
  }
  texture.needsUpdate = true;
};
