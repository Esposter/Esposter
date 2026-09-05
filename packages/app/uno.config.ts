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
const opacityUtilities = {
  "op-disabled": { opacity: "var(--v-disabled-opacity, 0.38)" },
  "op-high-emphasis": { opacity: "var(--v-high-emphasis-opacity, 0.87)" },
  "op-loading": { opacity: "var(--v-loading-opacity, 0.5)" },
  "op-medium-emphasis": { opacity: "var(--v-medium-emphasis-opacity, 0.6)" },
} as const satisfies Record<string, Record<string, string>>;
const getOverlayBackgroundColor = (state: string) => ({
  "background-color": `color-mix(in srgb, currentColor calc(var(--v-${state}-opacity) * var(--v-theme-overlay-multiplier) * 100%), transparent)`,
});
const overlayUtilities = {
  "bg-activated": getOverlayBackgroundColor("activated"),
  "bg-hover": getOverlayBackgroundColor("hover"),
} as const satisfies Record<string, Record<string, string>>;
const toKebabCase = (str: string) => str.replaceAll(/[A-Z]/gu, (m) => `-${m.toLowerCase()}`);

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
    ...Object.entries(elevationPresets.md3).map(
      ([level, css]) => [`elevation-${level}`, css] as [string, Record<string, string>],
    ),
    ["overflow-anchor-none", { "overflow-anchor": "none" }],
    // Vuetify's own interaction tints, as backgrounds rather than the `.v-*__overlay` pseudo-element it paints
    // Them with. The formula is copied from VBtn (`calc(var(--v-<state>-opacity) * var(--v-theme-overlay-
    // Multiplier))`) so anything hand-rolling a hover or active state lands on the exact colour a button does,
    // In both themes, and follows the theme when those variables move. `color-mix` is what carries currentColor
    // Through at a fraction — an `opacity` here would fade the element's own text with it
    ...Object.entries(overlayUtilities),
    ...Object.entries(opacityUtilities),
  ],
  safelist: [
    ...Array.from({ length: 6 }, (_, i) => `elevation-${i}`),
    ...allColorKeys.flatMap((key) => [`bg-${key}`, `text-${key}`]),
    ...Object.keys(opacityUtilities),
  ],
  shortcuts: {
    ...Object.fromEntries(
      Object.entries(typographyPresets.md3).map(([name, styles]) => [
        `text-${toKebabCase(name)}`,
        [Object.fromEntries(Object.entries(styles).map(([k, v]) => [toKebabCase(k), v]))],
      ]),
    ),
    "text-hint": "op-medium-emphasis text-body-small",
  },
  theme: {
    breakpoint: forUnoCSS,
    colors: Object.fromEntries(allColorKeys.map((key) => [key, `rgb(var(--v-theme-${key}))`])),
    // Override preset-wind4's default sans stack, which lists OS-only fonts
    // ("Segoe UI", "Helvetica Neue", Arial) with no downloadable web source.
    // These warn at startup because nuxt-og-image scans this token to embed
    // Fonts into OG images and cannot resolve them. Roboto matches Vuetify's body font.
    font: {
      sans: 'Roboto, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    },
  },
});
