import { ThemeMode } from "@/models/vuetify/ThemeMode";

export const ThemeModeTooltipMap = {
  [ThemeMode.dark]: "Dark Mode",
  [ThemeMode.light]: "Light Mode",
  [ThemeMode.system]: "System Mode",
} as const satisfies Record<ThemeMode, string>;
