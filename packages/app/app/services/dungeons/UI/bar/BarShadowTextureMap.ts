import { ImageKey } from "#shared/models/dungeons/keys/image/ImageKey";
import { BarOrigin } from "@/models/dungeons/UI/bar/BarOrigin";

// Drawn behind every bar whatever it measures, so this is not a `BarType` — a shadow is not a thing a bar can
// Be, it is what sits under one
export const BarShadowTextureMap = {
  [BarOrigin.Left]: ImageKey.BarLeftCapShadow,
  [BarOrigin.Middle]: ImageKey.BarMiddleShadow,
  [BarOrigin.Right]: ImageKey.BarRightCapShadow,
} as const satisfies Record<BarOrigin, ImageKey>;
