import { ThemeMode } from "#src/models/ui/ThemeMode";

// A mode once the system preference is resolved, which is what a palette and a theme are keyed by
export type ResolvedThemeMode = Exclude<ThemeMode, typeof ThemeMode.System>;

export const ResolvedThemeModes = [ThemeMode.Dark, ThemeMode.Light] as const satisfies ResolvedThemeMode[];
