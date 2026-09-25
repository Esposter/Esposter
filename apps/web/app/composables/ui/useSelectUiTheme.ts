import type { ResolvedThemeMode } from "@/models/ui/ResolvedThemeMode";
import type { UiStyle } from "@/models/ui/UiStyle";

import { ThemeMode } from "@/models/ui/ThemeMode";
import { getUiTheme } from "@/services/ui/getUiTheme";
import { UiPaletteMap } from "@@/configuration/UiPaletteMap";
import { useTheme } from "@vuetify/v0";

// Selects the library theme for a style and a resolved mode — on the server render as well, which an immediate watcher
// Runs in and a lazy one does not. The server cannot read the system's scheme, so a system reader is first served
// Light: while that holds, a media query in the head repaints the root in the style's dark palette for a system that
// Asks for dark, and the first paint is already right before the mounted media query selects dark for real
export const useSelectUiTheme = (
  uiStyle: MaybeRefOrGetter<UiStyle>,
  themeMode: MaybeRefOrGetter<ThemeMode>,
  resolvedThemeMode: MaybeRefOrGetter<ResolvedThemeMode>,
) => {
  const theme = useTheme();
  const systemDarkCss = computed(() => {
    const uiStyleValue = toValue(uiStyle);
    const resolvedThemeModeValue = toValue(resolvedThemeMode);
    if (toValue(themeMode) !== ThemeMode.System || resolvedThemeModeValue !== ThemeMode.Light) return "";
    const variables = Object.entries(UiPaletteMap[uiStyleValue][ThemeMode.Dark])
      .map(([key, value]) => `--ui-${key}:${value};`)
      .join("");
    return `@media (prefers-color-scheme: dark){:root[data-theme="${getUiTheme(uiStyleValue, resolvedThemeModeValue)}"]{color-scheme:dark;${variables}}}`;
  });
  useHead({ style: [{ id: "ui-system-dark", innerHTML: systemDarkCss }] });
  watchImmediate([() => toValue(uiStyle), () => toValue(resolvedThemeMode)], ([newUiStyle, newResolvedThemeMode]) => {
    theme.select(getUiTheme(newUiStyle, newResolvedThemeMode));
  });
};
