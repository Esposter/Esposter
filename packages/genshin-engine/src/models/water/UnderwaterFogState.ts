// Whether the eye is under the water, the fog it had above, to give back on surfacing, and the density the water last
// Wrote under it
export interface UnderwaterFogState {
  aboveDensity: number;
  aboveHeightFalloff: number;
  aboveMaxOpacity: number;
  aboveStartDistance: number;
  isUnderwater: boolean;
  underwaterDensity: number;
}
