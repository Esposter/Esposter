import { ThemeMode } from "@/models/vuetify/ThemeMode";

export const ThemeModeTooltipMap = {
  [ThemeMode.light]: "Light Mode",
  [ThemeMode.dark]: "Dark Mode",
  [ThemeMode.system]: "System Mode",
} as const satisfies Record<ThemeMode, string>;
