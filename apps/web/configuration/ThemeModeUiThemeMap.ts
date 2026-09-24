import { UiTheme } from "../app/models/ui/UiTheme";
import { ThemeMode } from "../app/models/vuetify/ThemeMode";
// The theme each of Vuetify's resolved modes selects, so one resolution drives both libraries
export const ThemeModeUiThemeMap = {
  [ThemeMode.dark]: UiTheme.Dusk,
  [ThemeMode.light]: UiTheme.Dawn,
} as const satisfies Record<Exclude<ThemeMode, ThemeMode.system>, UiTheme>;
