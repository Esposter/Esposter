export interface SunLightOptions {
  cascadeCount: number;
  // How far from the eye the last cascade reaches, past which nothing casts
  maxFar: number;
  shadowMapSize: number;
}
