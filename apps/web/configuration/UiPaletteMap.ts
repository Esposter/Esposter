import type { ResolvedThemeMode } from "../app/models/vuetify/ResolvedThemeMode";

import { UiStyle } from "../app/models/ui/UiStyle";
import { UiToken } from "../app/models/ui/UiToken";
import { ThemeMode } from "../app/models/vuetify/ThemeMode";
// The UI library's palette: one entry per token for each design style in each mode. The Vuetify and UnoCSS configs read
// It as well as the app, and they load before any alias resolves, so it lives beside them. Every palette uses the same
// Token names, so a component never knows which one is selected. Voxel's dark palette is dusk, the agent console's as it
// Was drawn; its light one is dawn, authored beside it rather than computed from it
export const UiPaletteMap = {
  // Radix's slate for the neutrals — app background, panel, border, muted and text — and green as the one accent: its
  // Text-safe step in dark, and the step that passes on white in light
  [UiStyle.Standard]: {
    [ThemeMode.dark]: {
      [UiToken.Accent]: "#3dd68c",
      [UiToken.Background]: "#111113",
      [UiToken.Border]: "#363a3f",
      [UiToken.Error]: "#ff9592",
      [UiToken.Info]: "#70b8ff",
      [UiToken.Muted]: "#b0b4ba",
      [UiToken.Panel]: "#18191b",
      [UiToken.Success]: "#1fd8a4",
      [UiToken.Text]: "#edeef0",
      [UiToken.Warning]: "#ffca16",
    },
    [ThemeMode.light]: {
      [UiToken.Accent]: "#1a7550",
      [UiToken.Background]: "#fcfcfd",
      [UiToken.Border]: "#d9d9e0",
      [UiToken.Error]: "#ce2c31",
      [UiToken.Info]: "#0d74ce",
      [UiToken.Muted]: "#60646c",
      [UiToken.Panel]: "#ffffff",
      [UiToken.Success]: "#1b7a5f",
      [UiToken.Text]: "#1c2024",
      [UiToken.Warning]: "#9a5b00",
    },
  },
  [UiStyle.Voxel]: {
    [ThemeMode.dark]: {
      [UiToken.Accent]: "#e0a458",
      [UiToken.Background]: "#16161e",
      [UiToken.Border]: "#5c5470",
      [UiToken.Error]: "#e56b6f",
      [UiToken.Info]: "#7fb7e6",
      [UiToken.Muted]: "#9a8c98",
      [UiToken.Panel]: "#221f33",
      [UiToken.Success]: "#5ec8a0",
      [UiToken.Text]: "#f2e9e4",
      [UiToken.Warning]: "#f4d35e",
    },
    [ThemeMode.light]: {
      [UiToken.Accent]: "#8f4f0a",
      [UiToken.Background]: "#efe6de",
      [UiToken.Border]: "#b3a6b1",
      [UiToken.Error]: "#b0303a",
      [UiToken.Info]: "#1d5a92",
      [UiToken.Muted]: "#5f5566",
      [UiToken.Panel]: "#faf5f0",
      [UiToken.Success]: "#1c6b4c",
      [UiToken.Text]: "#221f33",
      [UiToken.Warning]: "#7a5a00",
    },
  },
} as const satisfies Record<UiStyle, Record<ResolvedThemeMode, Record<UiToken, string>>>;
