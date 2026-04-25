import { ThemeMode } from "@/models/vuetify/ThemeMode";

export const ThemeModeIconMap = {
  [ThemeMode.dark]: "mdi-weather-night",
  [ThemeMode.light]: "mdi-white-balance-sunny",
  [ThemeMode.system]: "mdi-desktop-tower-monitor",
} as const satisfies Record<ThemeMode, string>;
