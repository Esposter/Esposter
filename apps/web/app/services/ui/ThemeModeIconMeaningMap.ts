import { ThemeMode } from "@/models/ui/ThemeMode";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

export const ThemeModeIconMeaningMap = {
  [ThemeMode.Dark]: UiIconMeaning.DarkMode,
  [ThemeMode.Light]: UiIconMeaning.LightMode,
  [ThemeMode.System]: UiIconMeaning.SystemMode,
} as const satisfies Record<ThemeMode, UiIconMeaning>;
