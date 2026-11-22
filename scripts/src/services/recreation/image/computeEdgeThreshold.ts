// The gradient magnitude an edge of this image reaches. An edge is the strongest share of an image's gradients, a tenth
// Unless told, so a darker or softer image still has as many, and never a gradient weaker than a faint line's (24), so
// A frame of flat sky has no edges rather than its noise
export const computeEdgeThreshold = (magnitudes: Float32Array, share = 0.1) => {
  const sorted = magnitudes.toSorted();
  return Math.max(sorted[Math.floor(sorted.length * (1 - share))] ?? 0, 24);
};
