import type { ResolvedThemeMode } from "@/models/ui/ResolvedThemeMode";
import type { UiStyle } from "@/models/ui/UiStyle";
import type { UiTheme } from "@/models/ui/UiTheme";

// The library theme a style and a mode select: one Vuetify 0 theme is registered under this name for each pair
export const getUiTheme = (uiStyle: UiStyle, themeMode: ResolvedThemeMode): UiTheme => `${uiStyle}-${themeMode}`;
