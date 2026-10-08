import type { LightningBolt } from "#src/models/atmosphere/LightningBolt";
import type { LightningBoltOptions } from "#src/models/atmosphere/LightningBoltOptions";

import { createSeededRandom } from "#src/random/createSeededRandom";

const VERTICES_PER_SEGMENT = 4;
const INDICES_PER_SEGMENT = 6;
// A branch is a third of the channel's segments, as wide as half the channel, and falls this much of a segment's
// Height for each it reaches out
const BRANCH_SEGMENT_SHARE = 1 / 3;
const BRANCH_WIDTH_SHARE = 0.5;
const BRANCH_FALL = 0.6;
// A lightning bolt from the point it strikes, at the origin, up to the cloud base: a channel climbing in segments that
// Each wander sideways by a seeded jitter of their length, and branches forking from its upper two thirds that reach
// Out and fall away from it. The same options give the same bolt
export const computeLightningBolt = ({
  branchCount,
  height,
  roughness,
  seed,
  segmentCount,
  width,
}: LightningBoltOptions): LightningBolt => {
  const random = createSeededRandom(seed);
  const step = height / segmentCount;
  const branchSegmentCount = Math.max(1, Math.round(segmentCount * BRANCH_SEGMENT_SHARE));
  const totalSegmentCount = segmentCount + branchCount * branchSegmentCount;
  const positions = new Float32Array(totalSegmentCount * VERTICES_PER_SEGMENT * 3);
  const directions = new Float32Array(totalSegmentCount * VERTICES_PER_SEGMENT * 3);
  const sides = new Float32Array(totalSegmentCount * VERTICES_PER_SEGMENT);
  const indices = new Uint32Array(totalSegmentCount * INDICES_PER_SEGMENT);
  const channelPoints = new Float32Array((segmentCount + 1) * 3);
  let segment = 0;
  // Writes one segment's quad, its two vertices at each end spread to either side by the half width there
  const writeSegment = (
    [startX, startY, startZ]: readonly [number, number, number],
    [endX, endY, endZ]: readonly [number, number, number],
    startHalfWidth: number,
    endHalfWidth: number,
  ) => {
    const length = Math.hypot(endX - startX, endY - startY, endZ - startZ) || 1;
    const vertexStart = segment * VERTICES_PER_SEGMENT;
    const ends = [
      [startX, startY, startZ, -startHalfWidth],
      [startX, startY, startZ, startHalfWidth],
      [endX, endY, endZ, endHalfWidth],
      [endX, endY, endZ, -endHalfWidth],
    ] as const;
    for (const [cornerIndex, [x, y, z, side]] of ends.entries()) {
      const vertex = vertexStart + cornerIndex;
      positions[vertex * 3] = x;
      positions[vertex * 3 + 1] = y;
      positions[vertex * 3 + 2] = z;
      directions[vertex * 3] = (endX - startX) / length;
      directions[vertex * 3 + 1] = (endY - startY) / length;
      directions[vertex * 3 + 2] = (endZ - startZ) / length;
      sides[vertex] = side;
    }
    const indexStart = segment * INDICES_PER_SEGMENT;
    indices[indexStart] = vertexStart;
    indices[indexStart + 1] = vertexStart + 1;
    indices[indexStart + 2] = vertexStart + 2;
    indices[indexStart + 3] = vertexStart;
    indices[indexStart + 4] = vertexStart + 2;
    indices[indexStart + 5] = vertexStart + 3;
    segment++;
  };
  // The channel climbs from the strike, narrowing toward the cloud
  for (let index = 1; index <= segmentCount; index++) {
    const offset = index * 3;
    channelPoints[offset] = (channelPoints[offset - 3] ?? 0) + (random() - 0.5) * roughness * step;
    channelPoints[offset + 1] = index * step;
    channelPoints[offset + 2] = (channelPoints[offset - 1] ?? 0) + (random() - 0.5) * roughness * step;
    writeSegment(
      [channelPoints[offset - 3] ?? 0, channelPoints[offset - 2] ?? 0, channelPoints[offset - 1] ?? 0],
      [channelPoints[offset] ?? 0, channelPoints[offset + 1] ?? 0, channelPoints[offset + 2] ?? 0],
      (width / 2) * (1 - (index - 1) / segmentCount / 2),
      (width / 2) * (1 - index / segmentCount / 2),
    );
  }
  // Each branch forks from a point in the channel's upper two thirds and reaches out one way, falling as it goes
  for (let branchIndex = 0; branchIndex < branchCount; branchIndex++) {
    const forkIndex = Math.floor(segmentCount / 3 + random() * ((segmentCount * 2) / 3));
    const angle = random() * Math.PI * 2;
    let x = channelPoints[forkIndex * 3] ?? 0;
    let y = channelPoints[forkIndex * 3 + 1] ?? 0;
    let z = channelPoints[forkIndex * 3 + 2] ?? 0;
    for (let index = 0; index < branchSegmentCount; index++) {
      const nextX = x + Math.cos(angle) * step + (random() - 0.5) * roughness * step;
      const nextY = y - step * BRANCH_FALL;
      const nextZ = z + Math.sin(angle) * step + (random() - 0.5) * roughness * step;
      const halfWidth = (width / 2) * BRANCH_WIDTH_SHARE;
      writeSegment(
        [x, y, z],
        [nextX, nextY, nextZ],
        halfWidth * (1 - index / branchSegmentCount),
        halfWidth * (1 - (index + 1) / branchSegmentCount),
      );
      x = nextX;
      y = nextY;
      z = nextZ;
    }
  }
  return { directions, indices, positions, sides };
};
