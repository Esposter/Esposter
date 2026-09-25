import type { ResolvedThemeMode } from "@/models/ui/ResolvedThemeMode";
import type { UiStyle } from "@/models/ui/UiStyle";

// A library theme: one design style in one mode, each registered with Vuetify 0 under this name
export type UiTheme = `${UiStyle}-${ResolvedThemeMode}`;
