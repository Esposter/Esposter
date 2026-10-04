import type { QualityTierSettings } from "#src/renderer/QualityTierSettings";

import { AntialiasingMode } from "#src/renderer/AntialiasingMode";
import { QualityTier } from "#src/renderer/QualityTier";

// What each tier spends, cheapest cut first: grass blades, whose thinning the look survives best, the shadow maps,
// Which cost every shadowed fragment, the god rays, a march per pixel at half resolution, the pixel ratio, which
// Costs every fragment, and bloom, a chain of blurs. TRAA settles the thin outlines and leaf edges that SMAA leaves
// Shimmering, for a velocity target and a frame of history. The ramp, the rim and the outlines are the style, so no
// Tier drops them
export const QualityTierSettingsMap: Readonly<Record<QualityTier, QualityTierSettings>> = {
  [QualityTier.High]: {
    antialiasingMode: AntialiasingMode.Traa,
    cascadeCount: 4,
    godraysStepCount: 60,
    grassDensity: 1,
    isBloomEnabled: true,
    maxPixelRatio: 2,
    shadowMapSize: 2048,
  },
  [QualityTier.Low]: {
    antialiasingMode: AntialiasingMode.Smaa,
    cascadeCount: 2,
    godraysStepCount: 0,
    grassDensity: 0.3,
    isBloomEnabled: false,
    maxPixelRatio: 1,
    shadowMapSize: 1024,
  },
  [QualityTier.Medium]: {
    antialiasingMode: AntialiasingMode.Smaa,
    cascadeCount: 3,
    godraysStepCount: 30,
    grassDensity: 0.6,
    isBloomEnabled: true,
    maxPixelRatio: 1.5,
    shadowMapSize: 1024,
  },
};
