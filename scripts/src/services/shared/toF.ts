// The CIELab knee's delta, 6/29: below the cube it is raised to, the cube root gives way to a line
const CIELAB_DELTA = 6 / 29;
// The standard's cube root, joined near black to a linear segment
export const toF = (value: number): number =>
  value > CIELAB_DELTA ** 3 ? Math.cbrt(value) : value / (3 * CIELAB_DELTA ** 2) + 4 / 29;
