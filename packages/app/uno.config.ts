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
    // "border" clashes with UnoCSS border property handling, emitting uninitialised --un-bg-border instead of --un-bg-opacity.
    ["bg-border", { "background-color": "rgb(var(--v-theme-border))" }],
  ],
  safelist: Array.from({ length: 6 }, (_, i) => `elevation-${i}`),
  theme: {
    colors: Object.fromEntries(
      [...Object.keys(firstThemeColors), ...variationKeys].map((key) => [key, `rgb(var(--v-theme-${key}))`]),
    ),
  },
});
