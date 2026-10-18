import type { ElementalSight } from "#src/models/sight/ElementalSight";
import type { SightTrailRibbon } from "#src/models/sight/SightTrailRibbon";
import type { GroundPoint } from "genshin-engine";
import type { Vector3Like } from "three";

import { computeGroundRun } from "#src/services/elementalSight/computeGroundRun";
import { computeSightTrail } from "#src/services/elementalSight/computeSightTrail";
import {
  SIGHT_TRAIL_CAPACITY,
  SIGHT_TRAIL_FADE,
  SIGHT_TRAIL_LIFT,
  SIGHT_TRAIL_WIDTH,
} from "#src/services/elementalSight/constants";

// A trail's points as a strip of two vertices each, the pair across the trail at its width and as bright as the trail's
// Fade leaves it there, from the vertex and index it starts at. Each segment between two pairs is two triangles
const writeTrail = (
  { colors, indices, positions }: SightTrailRibbon,
  points: readonly Vector3Like[],
  acrossX: number,
  acrossZ: number,
  vertexStart: number,
  indexStart: number,
): void => {
  for (const [index, { x, y, z }] of points.entries()) {
    const left = (vertexStart + index * 2) * 3;
    const right = left + 3;
    const brightness = 1 - SIGHT_TRAIL_FADE * (index / (points.length - 1));
    positions[left] = x + acrossX;
    positions[left + 1] = y + SIGHT_TRAIL_LIFT;
    positions[left + 2] = z + acrossZ;
    positions[right] = x - acrossX;
    positions[right + 1] = y + SIGHT_TRAIL_LIFT;
    positions[right + 2] = z - acrossZ;
    colors.fill(brightness, left, left + 3);
    colors.fill(brightness, right, right + 3);
  }
  for (let segment = 0; segment < points.length - 1; segment++) {
    const first = vertexStart + segment * 2;
    const offset = indexStart + segment * 6;
    indices[offset] = first;
    indices[offset + 1] = first + 2;
    indices[offset + 2] = first + 1;
    indices[offset + 3] = first + 1;
    indices[offset + 4] = first + 2;
    indices[offset + 5] = first + 3;
  }
};

// The trails the sight draws from the character's position to each end while it is on, written into the ribbon. Returns
// The number of the ribbon's indices written, which is none while the sight is off or no character stands
export const writeSightTrails = (
  ribbon: SightTrailRibbon,
  elementalSight: ElementalSight | undefined,
  character: GroundPoint | undefined,
  ends: readonly GroundPoint[],
  getGroundHeight: (x: number, z: number) => number,
): number => {
  if (!elementalSight?.isOn || !character) return 0;
  const halfWidth = SIGHT_TRAIL_WIDTH / 2;
  let trailCount = 0;
  let vertexCount = 0;
  let indexCount = 0;
  for (const end of ends) {
    if (trailCount === SIGHT_TRAIL_CAPACITY) break;
    const points = computeSightTrail(character, end, getGroundHeight);
    if (points.length === 0) continue;
    const { directionX, directionZ } = computeGroundRun(character, end);
    writeTrail(ribbon, points, -directionZ * halfWidth, directionX * halfWidth, vertexCount, indexCount);
    trailCount++;
    vertexCount += points.length * 2;
    indexCount += (points.length - 1) * 6;
  }
  return indexCount;
};
