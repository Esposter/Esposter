import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { ThemeMode } from "@/models/vuetify/ThemeMode";

export const ThemeModeIconMeaningMap = {
  [ThemeMode.dark]: UiIconMeaning.DarkMode,
  [ThemeMode.light]: UiIconMeaning.LightMode,
  [ThemeMode.system]: UiIconMeaning.SystemMode,
} as const satisfies Record<ThemeMode, UiIconMeaning>;
