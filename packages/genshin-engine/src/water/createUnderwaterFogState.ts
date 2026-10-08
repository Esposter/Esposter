import type { UnderwaterFogState } from "#src/models/water/UnderwaterFogState";

export const createUnderwaterFogState = (): UnderwaterFogState => ({
  aboveDensity: 0,
  aboveHeightFalloff: 0,
  aboveMaxOpacity: 1,
  aboveStartDistance: 0,
  isUnderwater: false,
  underwaterDensity: 0,
});
