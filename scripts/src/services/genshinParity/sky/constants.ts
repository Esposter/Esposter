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
