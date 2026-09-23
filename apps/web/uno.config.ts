// https://vuetifyjs.com/en/features/css-utilities/unocss-tailwind-preset
import type { IconsOptions } from "vuetify-nuxt-module";
import type { ThemeOptions, VariationsOptions } from "vuetify/lib/composables/theme.mjs";

import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { defineConfig, presetAttributify, presetIcons, presetWind4 } from "unocss";
import { elevationPresets, typographyPresets } from "unocss-preset-vuetify";

import { UiTokens } from "./app/models/ui/UiToken";
import { UNOCSS_BREAKPOINTS } from "./configuration/breakpoints";
import vuetifyConfig from "./vuetify.config";

const icons = vuetifyConfig.icons as IconsOptions;
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
const CUSTOM_ICONS_DIRECTORY = join(import.meta.dirname, "app/assets/icons");
const UI_EDGE = "var(--ui-panel-edge)";
const UI_STEP = "var(--ui-step)";
const UI_NEGATIVE_STEP = "calc(var(--ui-step) * -1)";
// The UI library's surfaces, each drawn with hard-edged shadows in its tokens and never a radius or a blur. A frame
// Holds content, ringed one step out on each side so its corners are left notched, with a faint lit line along its
// Top. A raised block can be pressed, lit along its top and left and shaded along the others. A sunk field takes
// Input, shaded along its bottom. A popover is the top-layer element a menu, a select or a
// Field's suggestions open in, emptied of the browser's own popover look and padded, so the frame inside it never
// Overlaps what it hangs off
const uiSurfaceUtilities = {
  "ui-frame": {
    "background-color": "var(--ui-panel)",
    "box-shadow": [
      `0 ${UI_NEGATIVE_STEP} 0 0 ${UI_EDGE}`,
      `0 ${UI_STEP} 0 0 ${UI_EDGE}`,
      `${UI_NEGATIVE_STEP} 0 0 0 ${UI_EDGE}`,
      `${UI_STEP} 0 0 0 ${UI_EDGE}`,
      `inset 0 ${UI_STEP} 0 0 color-mix(in srgb, var(--ui-text) 8%, transparent)`,
    ].join(", "),
  },
  "ui-popover": {
    "background-color": "transparent",
    border: "none",
    color: "inherit",
    "min-width": "anchor-size(width)",
    overflow: "visible",
    padding: `calc(${UI_STEP} * 2)`,
  },
  "ui-raised": {
    "background-color": UI_EDGE,
    "box-shadow": [
      `inset calc(${UI_STEP} / -2) calc(${UI_STEP} / -2) 0 0 color-mix(in srgb, var(--ui-background) 45%, transparent)`,
      `inset calc(${UI_STEP} / 2) calc(${UI_STEP} / 2) 0 0 color-mix(in srgb, var(--ui-text) 20%, transparent)`,
    ].join(", "),
    color: "var(--ui-text)",
    font: "inherit",
  },
  "ui-sunk": {
    "background-color": "var(--ui-background)",
    "box-shadow": `inset 0 calc(${UI_STEP} / -2) 0 0 ${UI_EDGE}`,
    color: "inherit",
    font: "inherit",
    padding: `0 calc(${UI_STEP} * 2)`,
  },
} as const satisfies Record<string, Record<string, string>>;
// `@esposter/shared` exports the same conversion, and this file cannot import it: the app's `postinstall` is
// `nuxt prepare`, which is where the UnoCSS module loads this config — before any workspace package is built,
// So the import resolves to a `dist` a fresh clone does not have yet and fails the install
const toKebabCase = (text: string) => text.replaceAll(/[A-Z]/gu, (match) => `-${match.toLowerCase()}`);
// The preset accepts two spellings for most of what it generates — `pa-4` beside `p-4`, `border-2` beside
// `b-2`, `overflow-hidden` beside `of-hidden`, `font-bold` beside `fw-bold` — and every extra spelling is one
// More way the same style is written across the tree. The shortest spelling of each family is canonical and
// The rest are refused here, which the generator honours by emitting nothing and `unocss/blocklist` reports at
// The attribute that wrote them. The dash between a utility and its value is structure, not spelling, so
// `p-4` stays over `p4`. Two families keep the longer form: a text colour is `text-*` rather than `c-*`
// Because Vuetify's colour pack ships the same `text-*` classes and the safelist generates them, and a bare
// `rounded` or `border` is never listed because on a Vuetify component it is that component's own prop
const BLOCKED_SPELLINGS: [RegExp, string][] = [
  [/^[pm]a-/u, "`p-` / `m-`"],
  [/^[pm][xylrtb]?-auto$/u, "`-a`"],
  [/^[pmwh][xylrtb]?\d/u, "a dash before the size (`p-4`, `w-4`)"],
  [/^border-/u, "`b-`"],
  [/^(?:rounded-|b-rd)/u, "`rd-`"],
  [/^opacity-|^op\d/u, "`op-`"],
  [/^(?:text|bg)-opacity-/u, "`text-op-` / `bg-op-`"],
  [/^font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black|\d)/u, "`fw-`"],
  [/^flex-(?:justify|items|grow|shrink|inline)/u, "the bare `justify-`, `items-`, `grow`, `shrink`, `inline-flex`"],
  [/^(?:color|c)-/u, "`text-` for a text colour"],
  [/^leading-/u, "`lh-`"],
  [/^(?:position|pos)-/u, "the bare position keyword (`relative`)"],
  [/^grid-(?:cols|rows)-/u, "`cols-` / `rows-`"],
  [/^font-size-/u, "`text-`"],
  [/^text-align-/u, "`text-center` and its siblings"],
  [/^overflow-/u, "`of-`"],
  [/^whitespace-/u, "`ws-`"],
  [/^vertical-/u, "`align-middle` and its siblings"],
  [/^decoration-(?:underline|none|line-through)/u, "`underline`, `no-underline`, `line-through`"],
  [/^case-/u, "`uppercase` and its siblings"],
  // Vuetify's helper classes. The preset matches none of them, so as an attribute each generates nothing and
  // Reads on the page as no style rather than the wrong one — the MD2 type set is the loudest, since it lands
  // As no typography at all
  [
    /^text-(?:h[1-6]|subtitle-[12]|body-[12]|caption|overline|(?:medium|high)-emphasis|disabled|truncate|no-wrap|uppercase|lowercase|capitalize)$/u,
    "the MD3 `text-*` shortcut, `op-*-emphasis`, `truncate`, `text-nowrap`, `uppercase`",
  ],
  [/^font-weight-/u, "`fw-`"],
  [/^text-decoration-/u, "`underline`, `no-underline`, `line-through`"],
  [
    /^d-(?:flex|none|block|inline|inline-flex|inline-block)$/u,
    "`flex`, `hidden`, `block`, `inline`, `inline-flex`, `inline-block`",
  ],
  [/^justify-space-/u, "`justify-between`, `justify-around`, `justify-evenly`"],
  [/^align-(?:center|start|end|stretch)$/u, "`items-center` and its siblings"],
  [/^flex-(?:column|row-reverse|column-reverse)$/u, "`flex-col`, `flex-row-reverse`, `flex-col-reverse`"],
  [/^fill-(?:height|width)$/u, "`h-full` / `w-full`"],
  [/^ga-\d/u, "`gap-`"],
  [/^m[tblrxya]-n\d/u, "the doubled dash (`mt--1`)"],
  // The emphasis names are opacity utilities: prefixed as a colour they match nothing, and spelt as their
  // Numeric value they stop following the theme's own token
  [/^(?:b|bg|text)-(?:medium|high)-emphasis$/u, "`op-medium-emphasis` / `op-high-emphasis` on their own"],
  [/^op-(?:38|60|87)$/u, "`op-disabled`, `op-medium-emphasis`, `op-high-emphasis`"],
];

export default defineConfig({
  blocklist: BLOCKED_SPELLINGS.map(([matcher, canonical]) => [matcher, { message: `write ${canonical}` }]),
  // Every template is read once at startup, from the Vite root Nuxt sets to `app/`. Otherwise the dev stylesheet
  // Holds only the utilities of modules transformed so far, and a page first reached by client navigation — or a
  // Component behind `<ClientOnly>` — renders without the ones only it uses until a reload. The pipeline filter still
  // Applies, so a `.ts` file is read only when it opts in with `@unocss-include`
  content: { filesystem: ["**/*.{ts,vue}"] },
  outputToCssLayers: {
    cssLayerName: (layer) => (layer === "properties" ? null : `uno-${layer}`),
  },
  presets: [
    presetWind4({
      dark: { dark: ".v-theme--dark", light: ".v-theme--light" },
      preflights: { reset: false },
    }),
    presetAttributify(),
    // The collections are this app's dependencies, so they resolve from here rather than from wherever the process
    // Started — the root Vitest run starts at the repo root, where pnpm hoists none of them. The app's own marks sit
    // Beside the Iconify sets, as `i-custom:` and the file's name: drawn as CSS like every other icon, so a library
    // Component and a Vuetify icon prop both reach them
    presetIcons({
      collections: {
        custom: Object.fromEntries(
          readdirSync(CUSTOM_ICONS_DIRECTORY).map((filename) => [
            basename(filename, ".svg"),
            () => readFileSync(join(CUSTOM_ICONS_DIRECTORY, filename), "utf8"),
          ]),
        ),
      },
      collectionsNodeResolvePath: import.meta.dirname,
    }),
  ],
  rules: [
    ...Object.entries(elevationPresets.md3).map(
      ([level, css]) => [`elevation-${level}`, css] as [string, Record<string, string>],
    ),
    ["of-anchor-none", { "overflow-anchor": "none" }],
    // Vuetify's own interaction tints, as backgrounds rather than the `.v-*__overlay` pseudo-element it paints
    // Them with. The formula is copied from VBtn (`calc(var(--v-<state>-opacity) * var(--v-theme-overlay-
    // Multiplier))`) so anything hand-rolling a hover or active state lands on the exact colour a button does,
    // In both themes, and follows the theme when those variables move. `color-mix` is what carries currentColor
    // Through at a fraction — an `opacity` here would fade the element's own text with it
    ...Object.entries(overlayUtilities),
    ...Object.entries(opacityUtilities),
    ...Object.entries(uiSurfaceUtilities),
  ],
  safelist: [
    ...Array.from({ length: 6 }, (_value, index) => `elevation-${index}`),
    ...allColorKeys.flatMap((key) => [`bg-${key}`, `text-${key}`]),
    ...Object.keys(opacityUtilities),
    ...new Set(Object.values(icons.unocssAdditionalIcons ?? {})),
  ],
  shortcuts: {
    ...Object.fromEntries(
      Object.entries(typographyPresets.md3).map(([name, styles]) => [
        `text-${toKebabCase(name)}`,
        [Object.fromEntries(Object.entries(styles).map(([property, value]) => [toKebabCase(property), value]))],
      ]),
    ),
    "text-hint": "op-medium-emphasis text-body-small",
    // One choice in a popover's list, tinted while it is the highlighted, selected or focused one
    "ui-item":
      "px-2 text-left w-full cursor-pointer hover:bg-accent/10 aria-selected:bg-accent/20 data-[highlighted]:bg-accent/20 focus-visible:bg-accent/20",
  },
  theme: {
    breakpoint: UNOCSS_BREAKPOINTS,
    // A token reads its custom property, so a utility follows the selected theme at runtime. Vuetify's own colour
    // Names stay beside them while a template not yet on the library still writes one, and where a name is both,
    // The token wins: Vuetify's theme is fed the same value, so the two only differ in which library owns it
    colors: {
      ...Object.fromEntries(allColorKeys.map((key) => [key, `rgb(var(--v-theme-${key}))`])),
      ...Object.fromEntries(UiTokens.map((uiToken) => [uiToken, `var(--ui-${uiToken})`])),
    },
    // Override preset-wind4's default sans stack, which lists OS-only fonts
    // ("Segoe UI", "Helvetica Neue", Arial) with no downloadable web source.
    // These warn at startup because nuxt-og-image scans this token to embed
    // Fonts into OG images and cannot resolve them. Roboto matches Vuetify's body font.
    font: {
      sans: 'Roboto, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    },
  },
});
