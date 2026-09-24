import type { UiStyle } from "@/models/ui/UiStyle";
import type { ResolvedThemeMode } from "@/models/vuetify/ResolvedThemeMode";
// A library theme: one design style in one mode, each registered with Vuetify 0 under this name
export type UiTheme = `${UiStyle}-${ResolvedThemeMode}`;
