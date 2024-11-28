import type { Theme } from "@/models/dungeons/theme/Theme";

import { ThemeModeSetting } from "#shared/models/dungeons/data/settings/ThemeModeSetting";

export const ThemeModeColorsMap = {
  [ThemeModeSetting.Blue]: {
    border: 0x6d9aa8,
    primary: 0x32454c,
  },
  [ThemeModeSetting.Green]: {
    border: 0x6da87d,
    primary: 0x324c3a,
  },
  [ThemeModeSetting.Purple]: {
    border: 0x796da8,
    primary: 0x38324c,
  },
} as const satisfies Record<ThemeModeSetting, Theme>;
