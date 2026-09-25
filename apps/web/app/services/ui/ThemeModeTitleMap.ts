import { ThemeMode } from "@/models/ui/ThemeMode";

export const ThemeModeTitleMap = {
  [ThemeMode.Dark]: "Dark",
  [ThemeMode.Light]: "Light",
  [ThemeMode.System]: "System",
} as const satisfies Record<ThemeMode, string>;
