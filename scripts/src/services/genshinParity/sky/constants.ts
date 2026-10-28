// The terms the game's sky gradient blends, the top and bottom colours away from the sun and toward it, whose weights
// Sum to one at every ray, so a sky shows darker than the tone curve's black at none only where they stand under none
export const SKY_GRADIENT_TERMS = ["zenithBack", "zenith", "horizonBack", "horizon"] as const;
// The terms of the game's sky a pixel's colour is a sum of, each a colour the fit solves
// (Login/Scene/Index.reference.ts, source `atmosphereShader`): the gradient's, then the horizon halo, the sun's halo
// And the moon's glow, each adding light
export const SKY_TERMS: readonly [...typeof SKY_GRADIENT_TERMS, "halo", "sunHalo", "moonGlow"] = [
  ...SKY_GRADIENT_TERMS,
  "halo",
  "sunHalo",
  "moonGlow",
];

// A solved name that is no setting of its own is a vector setting's component by its index
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const COMPONENT_REGEX: RegExp = /^(?<name>.+)\.(?<index>\d+)$/u;

// Every this many pixels across and down is a sample: the sky changes slowly, and a solve reads it many times
export const SAMPLE_STRIDE = 4;

// The depth bands a haze's pixels are binned by, the edges in metres from 0 up to 640, each band running to the next edge.
// The fog solve and the stone light both bin their pixels by them, each closing the table with its own open top band
export const DEPTH_BANDS: readonly number[] = [0, 10, 20, 40, 80, 160, 320, 640];
// The open top band each solve closes DEPTH_BANDS with: the fog's ends at 1280 m, so its pixels past that stand in no band,
// And the stone light's is open to any depth
const FOG_TOP_DEPTH_BAND = 1280;
// oxlint-disable-next-line typescript/no-inferrable-types -- isolatedDeclarations demands the annotation this value would otherwise infer
const STONE_LIGHT_TOP_DEPTH_BAND: number = Infinity;
// The table each solve bins by: DEPTH_BANDS closed by its own open top band
export const FOG_DEPTH_BANDS: readonly number[] = [...DEPTH_BANDS, FOG_TOP_DEPTH_BAND];
export const STONE_LIGHT_DEPTH_BANDS: readonly number[] = [...DEPTH_BANDS, STONE_LIGHT_TOP_DEPTH_BAND];
