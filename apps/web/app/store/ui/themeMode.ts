import type { ResolvedThemeMode } from "@/models/ui/ResolvedThemeMode";

import { ThemeMode, themeModeSchema } from "@/models/ui/ThemeMode";
import { THEME_COOKIE_NAME, THEME_COOKIE_OPTIONS } from "@/services/ui/constants";

// The reader's theme mode, a cookie as the style is, so the first response already renders it. System follows the
// Scheme the browser asks for, which only the browser can read: `NuxtTheme` keeps `isSystemDark` in step once mounted,
// And until then the first response carries both, the media query picking between them
export const useThemeModeStore = defineStore("ui/themeMode", () => {
  const themeMode = useCookie(THEME_COOKIE_NAME, {
    ...THEME_COOKIE_OPTIONS,
    decode: (value) => themeModeSchema.safeParse(value).data ?? ThemeMode.System,
    default: () => ThemeMode.System,
  });
  const isSystemDark = ref(false);
  const resolvedThemeMode = computed<ResolvedThemeMode>(() => {
    if (themeMode.value !== ThemeMode.System) return themeMode.value;
    return isSystemDark.value ? ThemeMode.Dark : ThemeMode.Light;
  });
  return { isSystemDark, resolvedThemeMode, themeMode };
});
