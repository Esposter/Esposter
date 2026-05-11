// https://vuetifyjs.com/en/features/css-utilities/unocss-tailwind-preset
import type { ThemeOptions, VariationsOptions } from "vuetify/lib/composables/theme.mjs";

import { defineConfig, presetAttributify, presetWind4 } from "unocss";
import { elevationPresets, typographyPresets } from "unocss-preset-vuetify";

import { forUnoCSS } from "./configuration/breakpoints";
import vuetifyConfig from "./vuetify.config";

const theme = vuetifyConfig.theme as Exclude<ThemeOptions, false>;
const firstThemeColors = Object.values(theme.themes ?? {})[0]?.colors ?? {};
const variations = theme.variations as VariationsOptions;
const variationKeys: string[] = [];

for (const color of variations?.colors ?? []) {
  for (let i = 1; i <= (variations?.darken ?? 0); i++) variationKeys.push(`${color}-darken-${i}`);
  for (let i = 1; i <= (variations?.lighten ?? 0); i++) variationKeys.push(`${color}-lighten-${i}`);
}

const allColorKeys = [...Object.keys(firstThemeColors), ...variationKeys];
const toKebabCase = (str: string) => str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

export default defineConfig({
  outputToCssLayers: {
    cssLayerName: (layer) => (layer === "properties" ? null : `uno-${layer}`),
  },
  presets: [
    presetWind4({
      dark: {
        dark: ".v-theme--dark",
        light: ".v-theme--light",
      },
      preflights: {
        reset: false,
      },
    }),
    presetAttributify(),
  ],
  rules: [
    ["overflow-anchor-none", { "overflow-anchor": "none" }],
    [
      "elevation--1",
      {
        "box-shadow":
          "inset 0 2px 1px -1px rgba(0,0,0,0.2), inset 0 1px 1px 0 rgba(0,0,0,0.14), inset 0 1px 3px 0 rgba(0,0,0,0.12)",
      },
    ],
    ...Object.entries(elevationPresets.md3).map(
      ([level, css]) => [`elevation-${level}`, css] as [string, Record<string, string>],
    ),
  ],
  safelist: [
    ...Array.from({ length: 6 }, (_, i) => `elevation-${i}`),
    ...allColorKeys.flatMap((key) => [`bg-${key}`, `text-${key}`]),
  ],
  shortcuts: Object.fromEntries(
    Object.entries(typographyPresets.md3).map(([name, styles]) => [
      `text-${toKebabCase(name)}`,
      [Object.fromEntries(Object.entries(styles).map(([k, v]) => [toKebabCase(k), v]))],
    ]),
  ),
  theme: {
    breakpoint: forUnoCSS,
    colors: Object.fromEntries(allColorKeys.map((key) => [key, `rgb(var(--v-theme-${key}))`])),
  },
});
