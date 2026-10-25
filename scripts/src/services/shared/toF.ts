import { CIELAB_DELTA } from "#src/services/shared/constants";

// The standard's cube root, joined near black to a linear segment
export const toF = (value: number): number =>
  value > CIELAB_DELTA ** 3 ? Math.cbrt(value) : value / (3 * CIELAB_DELTA ** 2) + 4 / 29;
