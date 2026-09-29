import type { ColorRepresentation } from "three";

export interface SunLightOptions {
  cascadeCount: number;
  color: ColorRepresentation;
  intensity: number;
  // How far from the eye the last cascade reaches, past which nothing casts
  maxFar: number;
  shadowMapSize: number;
}
