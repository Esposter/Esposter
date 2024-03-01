import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { MenuColorOption } from "@/models/dungeons/settings/MenuColorOption";

export const MenuColorImageKeyMap = {
  [MenuColorOption.Blue]: ImageKey.GlassPanel,
  [MenuColorOption.Green]: ImageKey.GlassPanelGreen,
  [MenuColorOption.Purple]: ImageKey.GlassPanelPurple,
} as const satisfies Record<MenuColorOption, ImageKey>;
