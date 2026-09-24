// https://vuetifyjs.com/en/features/css-utilities/unocss-tailwind-preset
import type { StaticRule } from "unocss";
import type { IconsOptions } from "vuetify-nuxt-module";
import type { ThemeOptions, VariationsOptions } from "vuetify/lib/composables/theme.mjs";

import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { defineConfig, presetAttributify, presetIcons, presetWind4, symbols } from "unocss";
import { elevationPresets, typographyPresets } from "unocss-preset-vuetify";

import { UiTokens } from "./app/models/ui/UiToken";
import { UNOCSS_BREAKPOINTS } from "./configuration/breakpoints";
import { UiStyleMap } from "./configuration/UiStyleMap";
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
// The UI library's surfaces, each drawn by the selected design style's tokens rather than values of its own, so a style
// Is a column of `UiStyleMap` and never a second set of rules. A frame holds content, a lifted frame floats over the
// Page — a popover's panel, a dialog, a toast — a raised block can be pressed, and a sunk field takes input. A
// Container rounds by the container radius, a control by the control radius. A
// Popover is the top-layer element a menu, a select or a field's suggestions open in, emptied of the browser's own
// Popover look and padded, so the lifted frame inside it never overlaps what it hangs off. A focused field draws its
// Style's focus mark in place of the document's ring, which reads as a second edge around a field
const uiSurfaceUtilities = {
  "ui-frame": {
    "background-color": "var(--ui-panel)",
    "border-radius": "var(--ui-container-radius)",
    "box-shadow": "var(--ui-frame-shadow)",
  },
  "ui-lifted": {
    "background-color": "var(--ui-lifted)",
    "border-radius": "var(--ui-container-radius)",
    "box-shadow": "var(--ui-lifted-shadow)",
  },
  "ui-popover": {
    "background-color": "transparent",
    border: "none",
    color: "inherit",
    "min-width": "anchor-size(width)",
    overflow: "visible",
    padding: "calc(var(--ui-step) * 2)",
  },
  "ui-raised": {
    "background-color": "var(--ui-raised-background)",
    "border-radius": "var(--ui-control-radius)",
    "box-shadow": "var(--ui-raised-shadow)",
    color: "var(--ui-raised-color)",
    font: "inherit",
  },
  "ui-sunk": [
    {
      "background-color": "var(--ui-sunk-background)",
      "border-radius": "var(--ui-control-radius)",
      "box-shadow": "var(--ui-sunk-shadow)",
      color: "inherit",
      font: "inherit",
    },
    {
      "background-color": "color-mix(in srgb, var(--ui-tint) 10%, var(--ui-sunk-background))",
      outline: "none",
      // A field the library wraps around an editable of its own, such as the rich text editor's, is focused while that is
      [symbols.selector]: (selector: string) => `${selector}:is(:focus-visible, :has([contenteditable="true"]:focus))`,
    },
  ],
} as const satisfies Record<string, StaticRule[1]>;
// A shape laid over a surface rather than a surface of its own: a pill is the corner a search field takes. Its rule is
// Generated after every surface's, whose own corner it has to win at the same specificity, so it cannot sit among them
// Where the sorted keys would put it ahead of the raised and sunk surfaces
const uiShapeUtilities = {
  "ui-pill": {
    "border-radius": "var(--ui-pill-radius)",
  },
} as const satisfies Record<string, Record<string, string>>;
// The library's type: four sizes, each read from the style tier with its face, weight and colour. Body text reads its
// Own face token, so the readable-text setting swaps one token and no component knows about it; every size above the
// Body is a heading, in the heading face, weight and colour
const getUiTypeUtility = (
  size: string,
  fontFamily = "var(--ui-font-heading)",
  color = "var(--ui-heading-color)",
  fontWeight = "var(--ui-weight-heading)",
) => ({
  color,
  "font-family": fontFamily,
  "font-size": `var(--ui-text-${size})`,
  "font-weight": fontWeight,
  "line-height": "1.2",
});
const uiTypeUtilities = {
  "ui-body": getUiTypeUtility("body", "var(--ui-font-body)", "var(--ui-text)", "normal"),
  "ui-display": getUiTypeUtility("display"),
  "ui-heading": getUiTypeUtility("heading"),
  "ui-title": getUiTypeUtility("title"),
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
  // Each design style's tokens as one rule on its `data-ui-style` value, written here so they are static CSS rather than
  // A stylesheet built at runtime. A theme scope carries the attribute as well as the root, because a token that reads
  // A colour is resolved where it is declared: inherited from the root, a frame inside a dusk scope would keep dawn's edge
  preflights: Object.entries(UiStyleMap).map(([uiStyle, styleTokens]) => ({
    getCSS: () =>
      `[data-ui-style="${uiStyle}"]{${Object.entries(styleTokens)
        .map(([styleToken, value]) => `--ui-${styleToken}:${value};`)
        .join("")}}`,
    layer: "theme",
  })),
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
    ...Object.entries(uiShapeUtilities),
    ...Object.entries(uiTypeUtilities),
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
    // A bar over what it heads — a dialog's title, an editor's menu, a row of tabs — on a divider along its bottom
    "ui-bar": "shadow-[inset_0_calc(var(--ui-border-width)*-1)_0_0_var(--ui-divider)]",
    "ui-block":
      "bg-border grow-0 shrink basis-[calc(var(--ui-step)*4)] min-w-[var(--ui-step)] h-[var(--ui-step)] op-[var(--ui-block-opacity)] data-[filled]:bg-[var(--ui-blocks-fill)]",
    // A row of blocks a step thick that fills a block at a time, and one block in it, lit in the row's fill colour once
    // Filled. A row narrower than its blocks squeezes each one rather than spilling out. Voxel draws each block apart;
    // Standard hides them and draws the row as one rounded track, its fill eased to the exact reading the row carries
    // As `--ui-blocks-value`, keyed on the style the row carries, which is the nearest scope's
    "ui-blocks": [
      "flex gap-1 max-w-full [--ui-blocks-fill:var(--ui-accent)]",
      "data-[ui-style=standard]:rd-full data-[ui-style=standard]:bg-border data-[ui-style=standard]:bg-[linear-gradient(var(--ui-blocks-fill)_0_0)] data-[ui-style=standard]:bg-no-repeat data-[ui-style=standard]:bg-[length:var(--ui-blocks-value)_100%] data-[ui-style=standard]:[transition:background-size_var(--ui-motion-medium)]",
    ].join(" "),
    // Something pressed, a button or a link that looks like one: raised, and filled by its variant or while pressed
    "ui-button": [
      // One control height, 8 steps, which a field and a select's trigger share, so a row of them lines up; an icon
      // Button is square in it, and content taller than an icon, such as a name over a topic, keeps a step above and below.
      // Three steps either side, so a tonal fill reads as a button rather than a highlighted word
      "px-3 py-1 min-h-8 min-w-8 inline-flex gap-2 items-center justify-center shrink-0 cursor-pointer ui-raised",
      "hover:[filter:var(--ui-hover-filter)] hover:[background-image:var(--ui-hover-overlay)] active:[background-image:var(--ui-pressed-overlay)] disabled:cursor-default disabled:op-disabled",
      // A toggle while pressed, and the chosen one of a toggle group, which is a radio group
      "aria-pressed:bg-accent aria-pressed:text-background aria-checked:bg-accent aria-checked:text-background",
      "data-[variant=Accent]:bg-accent data-[variant=Accent]:text-background",
      "data-[variant=Danger]:bg-error data-[variant=Danger]:text-background",
      // A trigger that holds a value, drawn as the field it is — a select's — and the search field the palette's trigger
      // Opens, in a search field's pill
      "data-[variant=Field]:bg-[var(--ui-sunk-background)] data-[variant=Field]:shadow-[var(--ui-sunk-shadow)] data-[variant=Field]:text-text data-[variant=Field]:focus-visible:outline-none data-[variant=Field]:focus-visible:bg-[color-mix(in_srgb,var(--ui-tint)_10%,var(--ui-sunk-background))]",
      "data-[variant=Search]:bg-[var(--ui-sunk-background)] data-[variant=Search]:shadow-[var(--ui-sunk-shadow)] data-[variant=Search]:text-text data-[variant=Search]:rd-[var(--ui-pill-radius)] data-[variant=Search]:focus-visible:outline-none data-[variant=Search]:focus-visible:bg-[color-mix(in_srgb,var(--ui-tint)_10%,var(--ui-sunk-background))]",
      // No surface of its own: clear on whatever it sits on, tinted in the accent while hovered. Over a picture, where
      // Clear would not read, a button takes the raised default instead. A quiet toggle still fills while pressed, as a
      // Toolbar's bold does
      "data-[variant=Quiet]:bg-transparent data-[variant=Quiet]:shadow-none data-[variant=Quiet]:text-muted",
      "data-[variant=Quiet]:hover:bg-[color-mix(in_srgb,var(--ui-tint)_10%,transparent)] data-[variant=Quiet]:hover:text-text",
      "data-[variant=Quiet]:aria-pressed:bg-accent data-[variant=Quiet]:aria-pressed:text-background data-[variant=Quiet]:aria-checked:bg-accent data-[variant=Quiet]:aria-checked:text-background",
    ].join(" "),
    // A guide line down the start edge of what it holds — a navigation's nested list, a thread — as a divider
    "ui-guide": "shadow-[inset_var(--ui-border-width)_0_0_0_var(--ui-divider)]",
    // A card: a thing a reader picks among others as a whole — a post, a type to create, a type's count, a recent
    // resource — rather than a row of a list or a menu. A frame, padded, that takes the style's hover as a button does
    "ui-card":
      "p-3 text-left cursor-pointer ui-frame hover:[filter:var(--ui-hover-filter)] hover:[background-image:var(--ui-hover-overlay)]",
    // One row of a list, pressed: a row, tinted while it is hovered, and more while it is the highlighted, selected or
    // Focused one. The tint marks a focused row, so it draws no ring as well
    "ui-item":
      "ui-row cursor-pointer focus-visible:outline-none hover:bg-[color-mix(in_srgb,var(--ui-tint)_10%,transparent)] aria-selected:bg-[color-mix(in_srgb,var(--ui-tint)_20%,transparent)] data-[highlighted]:bg-[color-mix(in_srgb,var(--ui-tint)_20%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--ui-tint)_20%,transparent)]",
    // One row of a list that goes nowhere — an activity entry, a session — laid out as every row is: a mark's column, the
    // Title and whatever ends the row, on one line one control height tall
    "ui-row": "px-2 py-1 text-left flex gap-2 w-full min-h-8 items-center rd-[var(--ui-control-radius)]",
    // A row of tabs on a divider, and one tab in it, which draws the active indicator over its own stretch of the line in
    // The accent while it is the selected tab or the current page's link
    "ui-tab":
      "px-3 py-1 text-muted text-nowrap cursor-pointer no-underline hover:bg-[color-mix(in_srgb,var(--ui-tint)_10%,transparent)] aria-[current=page]:text-accent aria-[current=page]:shadow-[inset_0_calc(var(--ui-indicator-width)*-1)_0_0_var(--ui-accent)] data-[selected]:text-accent data-[selected]:shadow-[inset_0_calc(var(--ui-indicator-width)*-1)_0_0_var(--ui-accent)]",
    "ui-tab-list": "flex of-x-auto ui-bar",
  },
  theme: {
    breakpoint: UNOCSS_BREAKPOINTS,
    // A token reads its custom property, so a utility follows the selected theme at runtime. Vuetify's own colour
    // Names stay beside them while a template not yet on the library still writes one, and where a name is both,
    // The token wins: Vuetify's theme is fed the same value, so the two only differ in which library owns it
    colors: {
      ...Object.fromEntries(allColorKeys.map((key) => [key, `rgb(var(--v-theme-${key}))`])),
      ...Object.fromEntries(UiTokens.map((uiToken) => [uiToken, `var(--ui-${uiToken})`])),
      "heading-color": "var(--ui-heading-color)",
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
