import type { QualityTierSettings } from "#src/renderer/QualityTierSettings";

import { AntialiasingMode } from "#src/renderer/AntialiasingMode";
import { QualityTier } from "#src/renderer/QualityTier";

// What each tier spends, cheapest cut first: the shadow maps cost every shadowed fragment, the god rays a march per
// Pixel at half resolution, the pixel ratio every fragment, and bloom a chain of blurs. TRAA settles the thin
// Outlines and leaf edges that SMAA leaves shimmering, for a velocity target and a frame of history. The ramp, the
// Rim and the outlines are the style, so no tier drops them
export const QualityTierSettingsMap: Readonly<Record<QualityTier, QualityTierSettings>> = {
  [QualityTier.High]: {
    antialiasingMode: AntialiasingMode.Traa,
    cascadeCount: 4,
    godraysStepCount: 60,
    isBloomEnabled: true,
    maxPixelRatio: 2,
    shadowMapSize: 2048,
  },
  [QualityTier.Low]: {
    antialiasingMode: AntialiasingMode.Smaa,
    cascadeCount: 2,
    godraysStepCount: 0,
    isBloomEnabled: false,
    maxPixelRatio: 1,
    shadowMapSize: 1024,
  },
  [QualityTier.Medium]: {
    antialiasingMode: AntialiasingMode.Smaa,
    cascadeCount: 3,
    godraysStepCount: 30,
    isBloomEnabled: true,
    maxPixelRatio: 1.5,
    shadowMapSize: 1024,
  },
};
