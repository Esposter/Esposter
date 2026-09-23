// @unocss-include
import { ThemeMode } from "@/models/vuetify/ThemeMode";

export const ThemeModeIconMap = {
  [ThemeMode.dark]: "i-mdi:weather-night",
  [ThemeMode.light]: "i-mdi:white-balance-sunny",
  [ThemeMode.system]: "i-mdi:desktop-tower-monitor",
} as const satisfies Record<ThemeMode, string>;
