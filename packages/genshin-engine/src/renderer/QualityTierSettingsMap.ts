import type { QualityTierSettings } from "#src/renderer/QualityTierSettings";

import { QualityTier } from "#src/renderer/QualityTier";

// What each tier spends, cheapest cut first: the pixel ratio costs every fragment, the shadow map every shadowed
// Fragment, and bloom a chain of blurs. The ramp, the rim and the outlines are the style, so no tier drops them
export const QualityTierSettingsMap: Readonly<Record<QualityTier, QualityTierSettings>> = {
  [QualityTier.High]: { isBloomEnabled: true, maxPixelRatio: 2, shadowMapSize: 2048 },
  [QualityTier.Low]: { isBloomEnabled: false, maxPixelRatio: 1, shadowMapSize: 1024 },
  [QualityTier.Medium]: { isBloomEnabled: true, maxPixelRatio: 1.5, shadowMapSize: 2048 },
};
