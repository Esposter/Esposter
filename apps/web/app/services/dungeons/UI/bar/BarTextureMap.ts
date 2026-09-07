import { FileKey } from "#shared/generated/phaser/FileKey";
import { BarOrigin } from "@/models/dungeons/UI/bar/BarOrigin";
import { BarType } from "@/models/dungeons/UI/bar/BarType";

export const BarTextureMap = {
  [BarType.Experience]: {
    [BarOrigin.Left]: FileKey.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalBlueLeft,
    [BarOrigin.Middle]: FileKey.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalBlueMid,
    [BarOrigin.Right]: FileKey.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalBlueRight,
  },
  [BarType.Health]: {
    [BarOrigin.Left]: FileKey.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalGreenLeft,
    [BarOrigin.Middle]: FileKey.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalGreenMid,
    [BarOrigin.Right]: FileKey.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalGreenRight,
  },
} as const satisfies Record<BarType, Record<BarOrigin, FileKey>>;
