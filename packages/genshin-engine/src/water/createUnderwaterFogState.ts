import type { UnderwaterFogState } from "#src/water/UnderwaterFogState";

export const createUnderwaterFogState = (): UnderwaterFogState => ({
  aboveDensity: 0,
  aboveHeightFalloff: 0,
  aboveStartDistance: 0,
  isUnderwater: false,
});
