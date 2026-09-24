import type { UiStyle } from "@/models/ui/UiStyle";
import type { ResolvedThemeMode } from "@/models/vuetify/ResolvedThemeMode";

import { ResolvedThemeModes } from "@/models/vuetify/ResolvedThemeMode";
import { getUiTheme } from "@/services/ui/getUiTheme";
import { UiPaletteMap } from "@@/configuration/UiPaletteMap";
import { getVuetifyThemeColors } from "@@/vuetify.config";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { useTheme } from "@vuetify/v0";

export const useSelectUiTheme = () => {
  const theme = useTheme();
  const { themes } = useVTheme();
  return (uiStyle: UiStyle, themeMode: ResolvedThemeMode) => {
    theme.select(getUiTheme(uiStyle, themeMode));
    // Vuetify's themes are named by mode, so the style reaches the pages it still draws as each mode's colours
    // @TODO: retirement removes Vuetify's themes, and this loop with them (/docs/proposals/refactors/ui-library/retirement)
    for (const resolvedThemeMode of ResolvedThemeModes) {
      const vuetifyTheme = themes.value[resolvedThemeMode];
      if (!vuetifyTheme) throw new InvalidOperationError(Operation.Read, useSelectUiTheme.name, resolvedThemeMode);
      Object.assign(vuetifyTheme.colors, getVuetifyThemeColors(UiPaletteMap[uiStyle][resolvedThemeMode]));
    }
  };
};
