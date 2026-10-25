import { MIN_MAGNITUDE } from "#src/services/genshinAssets/scene/constants";

const MAX_MAGNITUDE = 1e7;

export const checkIsPlausible = (value: number): boolean =>
  value === 0 || (Number.isFinite(value) && Math.abs(value) >= MIN_MAGNITUDE && Math.abs(value) <= MAX_MAGNITUDE);
