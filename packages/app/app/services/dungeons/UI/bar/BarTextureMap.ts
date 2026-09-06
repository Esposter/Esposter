import { ImageKey } from "#shared/models/dungeons/keys/image/ImageKey";
import { BarOrigin } from "@/models/dungeons/UI/bar/BarOrigin";
import { BarType } from "@/models/dungeons/UI/bar/BarType";

export const BarTextureMap = {
  [BarType.Experience]: {
    [BarOrigin.Left]: ImageKey.ExperienceBarLeftCap,
    [BarOrigin.Middle]: ImageKey.ExperienceBarMiddle,
    [BarOrigin.Right]: ImageKey.ExperienceBarRightCap,
  },
  [BarType.Health]: {
    [BarOrigin.Left]: ImageKey.HealthBarLeftCap,
    [BarOrigin.Middle]: ImageKey.HealthBarMiddle,
    [BarOrigin.Right]: ImageKey.HealthBarRightCap,
  },
} as const satisfies Record<BarType, Record<BarOrigin, ImageKey>>;
