// A lattice corner's gradient dotted with its offset, the sign and axis chosen by the hash's low bits
export const computeGradient = (hash: number, x: number, y: number, z: number): number => {
  const bits = hash & 15;
  const u = bits < 8 ? x : y;
  const v = bits < 4 ? y : bits === 12 || bits === 14 ? x : z;
  return (bits & 1 ? -u : u) + (bits & 2 ? -v : v);
};
