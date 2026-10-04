import type { ResolvedThemeMode } from "../app/models/ui/ResolvedThemeMode.ts";

import { ThemeMode } from "../app/models/ui/ThemeMode.ts";
import { UiStyle } from "../app/models/ui/UiStyle.ts";
import { UiToken } from "../app/models/ui/UiToken.ts";

// The UI library's palette: one entry per token for each design style in each mode. The UnoCSS config reads it as well
// As the app, and it loads before any alias resolves, so it lives beside it. Every palette uses the same
// Token names, so a component never knows which one is selected. Voxel's dark palette is dusk, the agent console's as it
// Was drawn; its light one is dawn, authored beside it rather than computed from it. Voxel lifts nothing by tone and
// Draws its lines in the edge colour, so its lifted panel is its panel and its divider its border
export const UiPaletteMap = {
  // Genshin's menus and its HUD: light is the game's parchment, the cream of its settings and loading screens under its
  // Slate-navy text, with a gold darkened as far as passing on its own tonal fill; dark is the translucent navy of its
  // HUD and dialogue, cream text and the gold as the game draws it
  [UiStyle.Genshin]: {
    [ThemeMode.Dark]: {
      [UiToken.Accent]: "#d3bc8e",
      [UiToken.Background]: "#1b1f2b",
      [UiToken.Border]: "#4a5168",
      [UiToken.Divider]: "#373d50",
      [UiToken.Error]: "#ff8f87",
      [UiToken.Info]: "#8cc3f2",
      [UiToken.Lifted]: "#2e3445",
      [UiToken.Muted]: "#b3ab9c",
      [UiToken.Panel]: "#252a38",
      [UiToken.Success]: "#9bd48c",
      [UiToken.Text]: "#ece5d8",
      [UiToken.Warning]: "#f2c66b",
    },
    [ThemeMode.Light]: {
      [UiToken.Accent]: "#735419",
      [UiToken.Background]: "#ece5d8",
      [UiToken.Border]: "#cdbf9f",
      [UiToken.Divider]: "#dcd1ba",
      [UiToken.Error]: "#a3302f",
      [UiToken.Info]: "#275c93",
      [UiToken.Lifted]: "#fbf8f2",
      [UiToken.Muted]: "#5a5f6e",
      [UiToken.Panel]: "#f4efe5",
      [UiToken.Success]: "#2f6a2c",
      [UiToken.Text]: "#3b4255",
      [UiToken.Warning]: "#7c5000",
    },
  },
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
