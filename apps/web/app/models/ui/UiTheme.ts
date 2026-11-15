import type { ResolvedThemeMode } from "#src/models/ui/ResolvedThemeMode";
import type { UiStyle } from "#src/models/ui/UiStyle";

// A library theme: one design style in one mode, each registered with Vuetify 0 under this name
export type UiTheme = `${UiStyle}-${ResolvedThemeMode}`;
