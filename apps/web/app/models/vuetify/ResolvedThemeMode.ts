import { ThemeMode } from "@/models/vuetify/ThemeMode";
// A mode once the system preference is resolved, which is what a palette and a theme are keyed by
export type ResolvedThemeMode = Exclude<ThemeMode, ThemeMode.system>;

export const ResolvedThemeModes = [ThemeMode.dark, ThemeMode.light] as const satisfies ResolvedThemeMode[];
