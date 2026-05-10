import type { ThemeOptions, VariationsOptions } from "vuetify/lib/composables/theme.mjs";

import { defineConfig, presetAttributify, presetWind3 } from "unocss";
import { presetVuetify } from "unocss-preset-vuetify";

import vuetifyConfig from "./vuetify.config";

const theme = vuetifyConfig.theme as Exclude<ThemeOptions, false>;
const firstThemeColors = Object.values(theme.themes ?? {})[0]?.colors ?? {};
const variations = theme.variations as VariationsOptions;
const variationKeys: string[] = [];

for (const color of variations?.colors ?? []) {
  for (let i = 0; i < (variations?.darken ?? 0); i++) variationKeys.push(`${color}-darken-${i}`);

  for (let i = 0; i < (variations?.lighten ?? 0); i++) variationKeys.push(`${color}-lighten-${i}`);
}

export default defineConfig({
  outputToCssLayers: {
    cssLayerName: (layer) => (layer === "properties" ? null : `uno.${layer}`),
  },
  presets: [presetWind3(), presetAttributify(), presetVuetify()],
  rules: [
    ["overflow-anchor-none", { "overflow-anchor": "none" }],
    [
      "elevation--1",
      {
        "box-shadow":
          "inset 0 2px 1px -1px rgba(0,0,0,0.2), inset 0 1px 1px 0 rgba(0,0,0,0.14), inset 0 1px 3px 0 rgba(0,0,0,0.12)",
      },
    ],
    // UnoCSS appends / var(--un-bg-opacity) to rgb(var(--v-theme-border)), producing invalid background-color syntax.
    ["bg-border", { "background-color": "rgb(var(--v-theme-border))" }],
    // UnoCSS appends / var(--un-border-opacity) to border-color, breaking Vuetify's rgb(var()) format — bypass with explicit rules.
    ...[...Object.keys(firstThemeColors), ...variationKeys].map(
      (key) => [`b-${key}`, { "border-color": `rgb(var(--v-theme-${key}))` }] as [string, Record<string, string>],
    ),
  ],
  safelist: Array.from({ length: 6 }, (_, i) => `elevation-${i}`),
  theme: {
    colors: Object.fromEntries(
      [...Object.keys(firstThemeColors), ...variationKeys].map((key) => [key, `rgb(var(--v-theme-${key}))`]),
    ),
  },
});
