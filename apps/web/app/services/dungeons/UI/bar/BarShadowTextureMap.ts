import type { DungeonsKey } from "#shared/generated/hostedAssetKeys/dungeonsKeys";

import { DungeonsKeys } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import { BarOrigin } from "#src/models/dungeons/UI/bar/BarOrigin";

// Drawn behind every bar whatever it measures, so this is not a `BarType` — a shadow is what sits under a bar
// Rather than something a bar can be
export const BarShadowTextureMap = {
  [BarOrigin.Left]: DungeonsKeys.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalShadowLeft,
  [BarOrigin.Middle]: DungeonsKeys.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalShadowMid,
  [BarOrigin.Right]: DungeonsKeys.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalShadowRight,
} as const satisfies Record<BarOrigin, DungeonsKey>;
