// An edge is the strongest share of an image's gradients, a tenth unless told, so a darker or softer image still has as
// Many, and never a gradient weaker than a faint line's, so a frame of flat sky has no edges rather than its noise
const EDGE_SHARE = 0.1;
const EDGE_MAGNITUDE_FLOOR = 24;
// The gradient magnitude an edge of this image reaches
export const readEdgeThreshold = (magnitudes: Float32Array, share: number = EDGE_SHARE): number => {
  const sorted = magnitudes.toSorted();
  return Math.max(sorted[Math.floor(sorted.length * (1 - share))] ?? 0, EDGE_MAGNITUDE_FLOOR);
};
