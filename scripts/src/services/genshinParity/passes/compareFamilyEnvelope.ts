import type { FamilyEnvelope } from "#src/services/genshinParity/passes/computeFamilyEnvelope";

// Two families' envelopes compared at their common frame: the pixels the closed masks hold apart over the first's
// Closed outline, the depth's gap as a share of the first's and the normals' angle in degrees, each on average where
// Both envelopes draw the pixel
export const compareFamilyEnvelope = (
  first: FamilyEnvelope,
  second: FamilyEnvelope,
  width: number,
  height: number,
): { depth?: number; normal?: number; outline: number } => {
  let apart = 0;
  let outlineLength = 0;
  let depthGap = 0;
  let depthCount = 0;
  let normalAngle = 0;
  let normalCount = 0;
  for (let pixel = 0; pixel < width * height; pixel++) {
    const [column, row] = [pixel % width, Math.floor(pixel / width)];
    const isFirst = first.mask[pixel] === 1;
    const isSecond = second.mask[pixel] === 1;
    if (isFirst !== isSecond) apart++;
    if (!isFirst) continue;
    const isEdge =
      (column > 0 && first.mask[pixel - 1] !== 1) ||
      (column < width - 1 && first.mask[pixel + 1] !== 1) ||
      (row > 0 && first.mask[pixel - width] !== 1) ||
      (row < height - 1 && first.mask[pixel + width] !== 1);
    if (isEdge) outlineLength++;
    if (!isSecond) continue;
    const firstDepth = first.depth[pixel] ?? 0;
    const secondDepth = second.depth[pixel] ?? 0;
    if (firstDepth > 0 && secondDepth > 0) {
      depthGap += Math.abs(secondDepth - firstDepth) / firstDepth;
      depthCount++;
    }
    const dot = [0, 1, 2].reduce(
      (sum, axis) => sum + (first.normal[pixel * 3 + axis] ?? 0) * (second.normal[pixel * 3 + axis] ?? 0),
      0,
    );
    if (dot !== 0) {
      normalAngle += (Math.acos(Math.min(Math.max(dot, -1), 1)) * 180) / Math.PI;
      normalCount++;
    }
  }
  return {
    depth: depthCount > 0 ? depthGap / depthCount : undefined,
    normal: normalCount > 0 ? normalAngle / normalCount : undefined,
    outline: apart / outlineLength,
  };
};
