import type { ThemeMode } from "@/models/vuetify/ThemeMode";

import { ThemeModeUiThemeMap } from "@@/configuration/ThemeModeUiThemeMap";
import { useTheme } from "@vuetify/v0";

export const useSelectUiTheme = () => {
  const theme = useTheme();
  return (themeMode: Exclude<ThemeMode, ThemeMode.system>) => {
    theme.select(ThemeModeUiThemeMap[themeMode]);
  };
};
