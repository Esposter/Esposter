import type { ResolvedThemeMode } from "../app/models/ui/ResolvedThemeMode.ts";

import { ThemeMode } from "../app/models/ui/ThemeMode.ts";
import { UiStyle } from "../app/models/ui/UiStyle.ts";
import { UiToken } from "../app/models/ui/UiToken.ts";

// The UI library's palette: one entry per token for each design style in each mode. The UnoCSS config reads it as well
// As the app, and it loads before any alias resolves, so it lives beside it. Every palette uses the same token names,
// So a component never knows which one is selected. Voxel's dark palette is dusk, and its light one is dawn, authored
// Beside it rather than computed from it. Voxel lifts nothing by tone and draws its
// Lines in the edge colour, so its lifted panel is its panel and its divider its border
export const UiPaletteMap = {
  // Radix's slate for the neutrals — app background, a panel a tone above it, a lifted panel a tone further, the
  // Divider a step fainter than the border, muted and text — and Vue's green as the one accent: the bright mint of the
  // Script setup Vue logo's face in dark. Light's panel sits a tone below the background, as Material's surface
  // Containers do, and what is lifted is white. The accent, error, info and warning are each the most saturated colour of
  // Their hue that still passes the contrast tests below on every surface, as a link's blue is, so one colour serves a
  // Fill, a label's text and a mark alike; in light that puts a green far deeper than the logo's, since a green as bright
  // As it cannot be read on white. Success is a leaf green a hue yellower than the accent's mint, so a saved mark and an
  // Accent button beside it never read as one colour
  [UiStyle.Standard]: {
    [ThemeMode.Dark]: {
      [UiToken.Accent]: "#28e498",
      [UiToken.Background]: "#111113",
      [UiToken.Border]: "#363a3f",
      [UiToken.Divider]: "#2e3135",
      [UiToken.Error]: "#ff7273",
      [UiToken.Info]: "#43a5ff",
      [UiToken.Lifted]: "#272a2d",
      [UiToken.Muted]: "#b0b4ba",
      [UiToken.Panel]: "#212225",
      [UiToken.Success]: "#77d163",
      [UiToken.Text]: "#edeef0",
      [UiToken.Warning]: "#fcc701",
    },
    [ThemeMode.Light]: {
      [UiToken.Accent]: "#007245",
      [UiToken.Background]: "#fcfcfd",
      [UiToken.Border]: "#d9d9e0",
      [UiToken.Divider]: "#e0e1e6",
      [UiToken.Error]: "#c2001d",
      [UiToken.Info]: "#0063b7",
      [UiToken.Lifted]: "#ffffff",
      [UiToken.Muted]: "#60646c",
      [UiToken.Panel]: "#f3f3f5",
      [UiToken.Success]: "#1f7400",
      [UiToken.Text]: "#1c2024",
      [UiToken.Warning]: "#905500",
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
