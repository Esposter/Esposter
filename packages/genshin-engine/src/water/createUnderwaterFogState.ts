import type { UnderwaterFogState } from "#src/models/water/UnderwaterFogState";

export const createUnderwaterFogState = (): UnderwaterFogState => ({
  aboveDensity: 0,
  aboveHeightFalloff: 0,
  aboveStartDistance: 0,
  isUnderwater: false,
});
