import type { AntialiasingMode } from "#src/renderer/AntialiasingMode";

export interface QualityTierSettings {
  antialiasingMode: AntialiasingMode;
  cascadeCount: number;
  // Zero draws no god rays at all
  godraysStepCount: number;
  isBloomEnabled: boolean;
  maxPixelRatio: number;
  shadowMapSize: number;
}
