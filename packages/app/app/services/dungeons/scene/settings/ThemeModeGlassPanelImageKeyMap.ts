import { ThemeModeSetting } from "#shared/models/dungeons/data/settings/ThemeModeSetting";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";

export const ThemeModeGlassPanelImageKeyMap = {
  [ThemeModeSetting.Blue]: ImageKey.GlassPanel,
  [ThemeModeSetting.Green]: ImageKey.GlassPanelGreen,
  [ThemeModeSetting.Purple]: ImageKey.GlassPanelPurple,
} as const satisfies Record<ThemeModeSetting, ImageKey>;
