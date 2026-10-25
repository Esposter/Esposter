import { MIN_MAGNITUDE } from "#src/services/genshinAssets/scene/constants";

export const checkIsChannel = (value: number, max: number): boolean =>
  value === 0 || (value >= MIN_MAGNITUDE && value <= max);
