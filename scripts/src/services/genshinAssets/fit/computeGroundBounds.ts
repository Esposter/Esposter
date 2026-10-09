// The lowest and highest the ground stands within a fit, to the metre outward, which bound every tile's box. A height
// Not reached is not finite and bounds nothing
export const computeGroundBounds = (heights: Iterable<number>): { maxHeight: number; minHeight: number } => {
  let minHeight = Infinity;
  let maxHeight = -Infinity;
  for (const height of heights) {
    if (!Number.isFinite(height)) continue;
    minHeight = Math.min(minHeight, height);
    maxHeight = Math.max(maxHeight, height);
  }
  return { maxHeight: Math.ceil(maxHeight), minHeight: Math.floor(minHeight) };
};
