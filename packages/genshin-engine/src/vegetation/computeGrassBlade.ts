import type { GrassBlade } from "#src/vegetation/GrassBlade";

// A blade as pairs of vertices up its length, each pair narrower than the one below, and one vertex at the tip, so
// It bends smoothly along its segments and ends in a point. Wound counter-clockwise from the front; the material
// Draws both sides
export const computeGrassBlade = (segmentCount: number): GrassBlade => {
  const positions = new Float32Array((segmentCount * 2 + 1) * 3);
  for (let segment = 0; segment < segmentCount; segment++) {
    const height = segment / segmentCount;
    const halfWidth = (1 - height) / 2;
    const offset = segment * 6;
    positions[offset] = -halfWidth;
    positions[offset + 1] = height;
    positions[offset + 3] = halfWidth;
    positions[offset + 4] = height;
  }
  positions[segmentCount * 6 + 1] = 1;

  const indices = new Uint16Array((segmentCount - 1) * 6 + 3);
  let cursor = 0;
  for (let segment = 0; segment < segmentCount - 1; segment++) {
    const left = segment * 2;
    indices[cursor++] = left;
    indices[cursor++] = left + 1;
    indices[cursor++] = left + 2;
    indices[cursor++] = left + 2;
    indices[cursor++] = left + 1;
    indices[cursor++] = left + 3;
  }
  const lastLeft = (segmentCount - 1) * 2;
  indices[cursor++] = lastLeft;
  indices[cursor++] = lastLeft + 1;
  indices[cursor] = segmentCount * 2;
  return { indices, positions };
};
