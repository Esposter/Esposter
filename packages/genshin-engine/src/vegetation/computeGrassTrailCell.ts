// The world cell a coordinate falls in, cells a texel's size across
export const computeGrassTrailCell = (coordinate: number, texelSize: number): number =>
  Math.floor(coordinate / texelSize);
