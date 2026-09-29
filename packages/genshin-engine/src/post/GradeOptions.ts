// A grade in display space, each value neutral at its identity: contrast and saturation at one, the tints at zero.
// A tint is added to each channel, weighted toward the shadows or toward the highlights by the colour's luminance
export interface GradeOptions {
  contrast: number;
  highlightTint: readonly [number, number, number];
  saturation: number;
  shadowTint: readonly [number, number, number];
  // Texels along each side of the cube, a whole number of at least two, so both ends of every channel are a texel
  size: number;
}
