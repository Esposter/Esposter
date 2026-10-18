// The distance from a point to a line in two or three dimensions, or between two points of one dimension, as mathjs
// Measures it. A line in two dimensions is its coefficients a, b and c, and a line in three is a point on it followed by
// Its direction
export const computePointToLine2D = (point: number[], line: number[]): number => {
  const [x = Number.NaN, y = Number.NaN] = point;
  const [a = Number.NaN, b = Number.NaN, c = Number.NaN] = line;
  return Math.abs(a * x + b * y + c) / Math.hypot(a, b);
};
