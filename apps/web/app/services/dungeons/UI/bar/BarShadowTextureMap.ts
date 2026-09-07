import { FileKey } from "#shared/generated/phaser/FileKey";
import { BarOrigin } from "@/models/dungeons/UI/bar/BarOrigin";

// Drawn behind every bar whatever it measures, so this is not a `BarType` — a shadow is not a thing a bar can
// Be, it is what sits under one
export const BarShadowTextureMap = {
  [BarOrigin.Left]: FileKey.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalShadowLeft,
  [BarOrigin.Middle]: FileKey.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalShadowMid,
  [BarOrigin.Right]: FileKey.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalShadowRight,
} as const satisfies Record<BarOrigin, FileKey>;
