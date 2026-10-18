export const computePointToLine3D = (point: number[], line: number[]): number => {
  const [x = Number.NaN, y = Number.NaN, z = Number.NaN] = point;
  const [x0 = Number.NaN, y0 = Number.NaN, z0 = Number.NaN, a = Number.NaN, b = Number.NaN, c = Number.NaN] = line;
  const first = (y0 - y) * c - (z0 - z) * b;
  const second = (z0 - z) * a - (x0 - x) * c;
  const third = (x0 - x) * b - (y0 - y) * a;
  return Math.hypot(first, second, third) / Math.hypot(a, b, c);
};
