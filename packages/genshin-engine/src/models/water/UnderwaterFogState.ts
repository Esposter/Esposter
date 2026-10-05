// Whether the eye is under the water, and the fog it had above, to give back on surfacing
export interface UnderwaterFogState {
  aboveDensity: number;
  aboveHeightFalloff: number;
  aboveStartDistance: number;
  isUnderwater: boolean;
}
