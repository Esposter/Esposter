import { ThemeModeSetting } from "@/models/dungeons/data/settings/ThemeModeSetting";
import type { Theme } from "@/models/dungeons/theme/Theme";

export const ThemeModeColorsMap = {
  [ThemeModeSetting.Blue]: {
    primary: 0x32454c,
    border: 0x6d9aa8,
  },
  [ThemeModeSetting.Green]: {
    primary: 0x324c3a,
    border: 0x6da87d,
  },
  [ThemeModeSetting.Purple]: {
    primary: 0x38324c,
    border: 0x796da8,
  },
} as const satisfies Record<ThemeModeSetting, Theme>;
