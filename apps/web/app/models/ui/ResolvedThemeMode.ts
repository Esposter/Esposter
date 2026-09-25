// Relative, since the palette in `configuration/` reads this type, and the Nuxt config loads it before any alias resolves
import { ThemeMode } from "./ThemeMode";
// A mode once the system preference is resolved, which is what a palette and a theme are keyed by
export type ResolvedThemeMode = Exclude<ThemeMode, ThemeMode.System>;

export const ResolvedThemeModes = [ThemeMode.Dark, ThemeMode.Light] as const satisfies ResolvedThemeMode[];
