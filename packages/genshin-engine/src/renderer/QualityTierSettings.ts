import type { AntialiasingMode } from "#src/renderer/AntialiasingMode";

export interface QualityTierSettings {
  antialiasingMode: AntialiasingMode;
  cascadeCount: number;
  // Zero draws no god rays at all
  godraysStepCount: number;
  // The share of grass blades grown, the first thing a tier lowers
  grassDensity: number;
  isBloomEnabled: boolean;
  maxPixelRatio: number;
  shadowMapSize: number;
}
