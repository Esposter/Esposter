import type { ResolvedThemeMode } from "../app/models/ui/ResolvedThemeMode";

import { ThemeMode } from "../app/models/ui/ThemeMode";
import { UiStyle } from "../app/models/ui/UiStyle";
import { UiToken } from "../app/models/ui/UiToken";
// The UI library's palette: one entry per token for each design style in each mode. The UnoCSS config reads it as well
// As the app, and it loads before any alias resolves, so it lives beside it. Every palette uses the same
// Token names, so a component never knows which one is selected. Voxel's dark palette is dusk, the agent console's as it
// Was drawn; its light one is dawn, authored beside it rather than computed from it. Voxel lifts nothing by tone and
// Draws its lines in the edge colour, so its lifted panel is its panel and its divider its border
export const UiPaletteMap = {
  // Radix's slate for the neutrals — app background, a panel a tone above it, a lifted panel a tone further, the divider a
  // Step fainter than the border, muted and text — and Vue's green as the one accent: the bright one its docs lead with in
  // Dark, and in light its hue darkened as far as passing on its own tonal fill. Light's panel sits a tone below the
  // Background, as Material's surface containers do, and what is lifted is white
  [UiStyle.Standard]: {
    [ThemeMode.Dark]: {
      [UiToken.Accent]: "#42d392",
      [UiToken.Background]: "#111113",
      [UiToken.Border]: "#363a3f",
      [UiToken.Divider]: "#2e3135",
      [UiToken.Error]: "#ff9592",
      [UiToken.Info]: "#70b8ff",
      [UiToken.Lifted]: "#272a2d",
      [UiToken.Muted]: "#b0b4ba",
      [UiToken.Panel]: "#212225",
      [UiToken.Success]: "#1fd8a4",
      [UiToken.Text]: "#edeef0",
      [UiToken.Warning]: "#ffca16",
    },
    [ThemeMode.Light]: {
      [UiToken.Accent]: "#23694a",
      [UiToken.Background]: "#fcfcfd",
      [UiToken.Border]: "#d9d9e0",
      [UiToken.Divider]: "#e0e1e6",
      [UiToken.Error]: "#ce2c31",
      [UiToken.Info]: "#0b6ac0",
      [UiToken.Lifted]: "#ffffff",
      [UiToken.Muted]: "#60646c",
      [UiToken.Panel]: "#f3f3f5",
      [UiToken.Success]: "#1b7a5f",
      [UiToken.Text]: "#1c2024",
      [UiToken.Warning]: "#9a5b00",
    },
  },
  [UiStyle.Voxel]: {
    [ThemeMode.Dark]: {
      [UiToken.Accent]: "#e0a458",
      [UiToken.Background]: "#16161e",
      [UiToken.Border]: "#5c5470",
      [UiToken.Divider]: "#5c5470",
      [UiToken.Error]: "#e56b6f",
      [UiToken.Info]: "#7fb7e6",
      [UiToken.Lifted]: "#221f33",
      [UiToken.Muted]: "#9a8c98",
      [UiToken.Panel]: "#221f33",
      [UiToken.Success]: "#5ec8a0",
      [UiToken.Text]: "#f2e9e4",
      [UiToken.Warning]: "#f4d35e",
    },
    [ThemeMode.Light]: {
      [UiToken.Accent]: "#8f4f0a",
      [UiToken.Background]: "#efe6de",
      [UiToken.Border]: "#b3a6b1",
      [UiToken.Divider]: "#b3a6b1",
      [UiToken.Error]: "#b0303a",
      [UiToken.Info]: "#1d5a92",
      [UiToken.Lifted]: "#faf5f0",
      [UiToken.Muted]: "#5f5566",
      [UiToken.Panel]: "#faf5f0",
      [UiToken.Success]: "#1c6b4c",
      [UiToken.Text]: "#221f33",
      [UiToken.Warning]: "#7a5a00",
    },
  },
} as const satisfies Record<UiStyle, Record<ResolvedThemeMode, Record<UiToken, string>>>;
