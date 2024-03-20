import { MenuColorSetting } from "@/models/dungeons/data/settings/MenuColorSetting";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";

export const MenuColorImageKeyMap = {
  [MenuColorSetting.Blue]: ImageKey.GlassPanel,
  [MenuColorSetting.Green]: ImageKey.GlassPanelGreen,
  [MenuColorSetting.Purple]: ImageKey.GlassPanelPurple,
} as const satisfies Record<MenuColorSetting, ImageKey>;
