import type { DungeonsKey } from "#shared/generated/hostedAssetKeys/dungeonsKeys";

import { DungeonsKeys } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import { BarOrigin } from "#src/models/dungeons/UI/bar/BarOrigin";
import { BarType } from "#src/models/dungeons/UI/bar/BarType";

export const BarTextureMap = {
  [BarType.Experience]: {
    [BarOrigin.Left]: DungeonsKeys.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalBlueLeft,
    [BarOrigin.Middle]: DungeonsKeys.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalBlueMid,
    [BarOrigin.Right]: DungeonsKeys.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalBlueRight,
  },
  [BarType.Health]: {
    [BarOrigin.Left]: DungeonsKeys.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalGreenLeft,
    [BarOrigin.Middle]: DungeonsKeys.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalGreenMid,
    [BarOrigin.Right]: DungeonsKeys.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalGreenRight,
  },
} as const satisfies Record<BarType, Record<BarOrigin, DungeonsKey>>;
