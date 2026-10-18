// The distance from a point to a line in two or three dimensions, or between two points of one dimension, as mathjs
// Measures it. A line in two dimensions is its coefficients a, b and c, and a line in three is a point on it followed by
// Its direction
const computePointToLine2D = (point: number[], line: number[]): number => {
  const [x = Number.NaN, y = Number.NaN] = point;
  const [a = Number.NaN, b = Number.NaN, c = Number.NaN] = line;
  return Math.abs(a * x + b * y + c) / Math.hypot(a, b);
};
const computePointToLine3D = (point: number[], line: number[]): number => {
  const [x = Number.NaN, y = Number.NaN, z = Number.NaN] = point;
  const [x0 = Number.NaN, y0 = Number.NaN, z0 = Number.NaN, a = Number.NaN, b = Number.NaN, c = Number.NaN] = line;
  const first = (y0 - y) * c - (z0 - z) * b;
  const second = (z0 - z) * a - (x0 - x) * c;
  const third = (x0 - x) * b - (y0 - y) * a;
  return Math.hypot(first, second, third) / Math.hypot(a, b, c);
};

export const computeDistance = (point: number[], other: number[]): null | number => {
  if (point.length === 2 && other.length === 3) return computePointToLine2D(point, other);
  if (point.length === 3 && other.length === 6) return computePointToLine3D(point, other);
  if (point.length !== other.length || point.length === 0) return null;

  let total = 0;
  for (const [index, value] of point.entries()) {
    const difference = value - (other[index] ?? Number.NaN);
    total = difference * difference + total;
  }
  return Math.sqrt(total);
};
