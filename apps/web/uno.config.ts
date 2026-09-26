import type { ExtractorContext, Preset, StaticRule } from "unocss";

import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { defineConfig, presetAttributify, presetIcons, presetWind4, symbols } from "unocss";

import { UiTokens } from "./app/models/ui/UiToken";
import { UNOCSS_BREAKPOINTS } from "./configuration/breakpoints";
import { UiStyleMap } from "./configuration/UiStyleMap";

// What cannot be used yet, faded by one strength across the app: a control that is disabled, and something still on its
// Way, such as a message the server has not confirmed
const opacityUtilities = {
  "op-disabled": { opacity: "0.38" },
  "op-loading": { opacity: "0.5" },
} as const satisfies Record<string, Record<string, string>>;
const CUSTOM_ICONS_DIRECTORY = join(import.meta.dirname, "app/assets/icons");
const HTML_COMMENT_REGEX = /<!--[\s\S]*?-->/gu;
// Attributify reads `<!-- ` as the start of a tag, so an apostrophe in a template comment opens a quote that runs on to
// The next one in the file and every attribute in between generates nothing. It reads the code with its comments
// Blanked to spaces, which keeps every offset where the lint rule that reports at an attribute expects it
const attributifyPreset = presetAttributify();
const attributify = {
  ...attributifyPreset,
  // oxlint-disable-next-line oxc/no-map-spread -- each extractor is wrapped in a new object, so the preset's own stays as it shipped
  extractors: attributifyPreset.extractors?.map((extractor) => ({
    ...extractor,
    extract: (context: ExtractorContext) =>
      extractor.extract?.({
        ...context,
        code: context.code.replaceAll(HTML_COMMENT_REGEX, (comment) => " ".repeat(comment.length)),
      }),
  })),
} satisfies Preset;
// Forced colours drop every shadow, which is all the style's edges are, so under them each surface takes a transparent
// Border the forced palette paints in, and a frame, a button and a field keep their outline. Only there, since a border
// Takes room a shadow does not
const FORCED_COLORS_EDGE = {
  border: "var(--ui-border-width) solid transparent",
  [symbols.parent]: "@media (forced-colors: active)",
};
// The UI library's surfaces, each drawn by the selected design style's tokens rather than values of its own, so a style
// Is a column of `UiStyleMap` and never a second set of rules. A frame holds content, a lifted frame floats over the
// Page — a popover's panel, a dialog, a toast — a raised block can be pressed, and a field takes input or sits set into
// Its surface — a chip, a track, a key cap. A container rounds by the container radius, a control by the control
// Radius. A popover is the top-layer element a menu, a select or a field's suggestions open in, emptied of the
// Browser's own popover look and padded, so the lifted frame inside it never overlaps what it hangs off. A focused
// Field draws its style's focus mark in place of the document's ring, which reads as a second edge around a field
const uiSurfaceUtilities = {
  "ui-field": [
    {
      "background-color": "var(--ui-panel)",
      "border-radius": "var(--ui-control-radius)",
      color: "inherit",
      font: "inherit",
    },
    {
      "background-color": "color-mix(in srgb, var(--ui-tint) 10%, var(--ui-panel))",
      // The ring kept but unseen, since forced colours drop the tint and paint the outline in
      "outline-color": "transparent",
      // A field the library wraps around an editable of its own, such as the rich text editor's, is focused while that is
      [symbols.selector]: (selector: string) => `${selector}:is(:focus-visible, :has([contenteditable="true"]:focus))`,
    },
    FORCED_COLORS_EDGE,
  ],
  "ui-frame": [
    {
      "background-color": "var(--ui-panel)",
      "border-radius": "var(--ui-container-radius)",
      "box-shadow": "var(--ui-frame-shadow)",
    },
    FORCED_COLORS_EDGE,
  ],
  "ui-lifted": [
    {
      "background-color": "var(--ui-lifted)",
      "border-radius": "var(--ui-container-radius)",
      "box-shadow": "var(--ui-lifted-shadow)",
    },
    FORCED_COLORS_EDGE,
  ],
  "ui-popover": {
    "background-color": "transparent",
    border: "none",
    color: "inherit",
    "min-width": "anchor-size(width)",
    overflow: "visible",
    padding: "calc(var(--ui-step) * 2)",
  },
  "ui-raised": [
    {
      "background-color": "var(--ui-raised-background)",
      "border-radius": "var(--ui-control-radius)",
      "box-shadow": "var(--ui-raised-shadow)",
      color: "var(--ui-raised-color)",
      font: "inherit",
    },
    FORCED_COLORS_EDGE,
  ],
} as const satisfies Record<string, StaticRule[1]>;
// A shape laid over a surface rather than a surface of its own: a pill is the corner a search field takes. Its rule is
// Generated after every surface's, whose own corner it has to win at the same specificity, so it cannot sit among them
// Where the sorted keys would put it ahead of the raised surface and the field
const uiShapeUtilities = { "ui-pill": { "border-radius": "var(--ui-pill-radius)" } } as const satisfies Record<
  string,
  Record<string, string>
>;
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
// The preset accepts two spellings for most of what it generates — `pa-4` beside `p-4`, `border-2` beside
// `b-2`, `overflow-hidden` beside `of-hidden`, `font-bold` beside `fw-bold` — and every extra spelling is one
// More way the same style is written across the tree. The shortest spelling of each family is canonical and
// The rest are refused here, which the generator honours by emitting nothing and `unocss/blocklist` reports at
// The attribute that wrote them. The dash between a utility and its value is structure, not spelling, so
// `p-4` stays over `p4`. One family keeps the longer form: a text colour is `text-*` rather than `c-*`, since
// `text-` already names the text's size and alignment, so everything said about the text shares one prefix
const BLOCKED_SPELLINGS: [RegExp, string][] = [
  [/^[pm]a-/u, "`p-` / `m-`"],
  [/^(?:rounded|border)$/u, "`rd` / `b`"],
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
  [/^font-weight-/u, "`fw-`"],
  [/^text-decoration-/u, "`underline`, `no-underline`, `line-through`"],
  // Spelt as its number, a disabled control stops fading by the one strength every other does
  [/^op-38$/u, "`op-disabled`"],
  // A mobile browser's toolbar comes and goes over `vh`, so a region sized by it runs under the toolbar or the dock
  [/^(?:min-|max-)?h-screen$/u, "`h-dvh`, which follows a mobile browser's toolbar"],
  [/\dvh\b/u, "`dvh`, which follows a mobile browser's toolbar"],
];

export default defineConfig({
  blocklist: BLOCKED_SPELLINGS.map(([matcher, canonical]) => [matcher, { message: `write ${canonical}` }]),
  // Every template is read once at startup, from the Vite root Nuxt sets to `app/`. Otherwise the dev stylesheet
  // Holds only the utilities of modules transformed so far, and a page first reached by client navigation — or a
  // Component behind `<ClientOnly>` — renders without the ones only it uses until a reload. The pipeline filter still
  // Applies, so a `.ts` file is read only when it opts in with `@unocss-include`
  content: { filesystem: ["**/*.{ts,vue}"] },
  outputToCssLayers: { cssLayerName: (layer) => (layer === "properties" ? null : `uno-${layer}`) },
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
    presetWind4({ dark: { dark: '[data-theme$="-dark"]', light: '[data-theme$="-light"]' } }),
    attributify,
    // The collections are this app's dependencies, so they resolve from here rather than from wherever the process
    // Started — the root Vitest run starts at the repo root, where pnpm hoists none of them. The app's own marks sit
    // Beside the Iconify sets, as `i-custom:` and the file's name, drawn as CSS like every other icon
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
    ["of-anchor-none", { "overflow-anchor": "none" }],
    ...Object.entries(opacityUtilities),
    ...Object.entries(uiSurfaceUtilities),
    ...Object.entries(uiShapeUtilities),
    ...Object.entries(uiTypeUtilities),
  ],
  shortcuts: {
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
      // Three steps either side, so a tonal fill reads as a button rather than a highlighted word. Under a finger, where a
      // Target is aimed less exactly, it is eleven steps square at the least, WCAG's enhanced target size
      "px-3 py-1 min-h-8 min-w-8 inline-flex gap-2 items-center justify-center shrink-0 cursor-pointer ui-raised",
      "[@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
      "hover:[filter:var(--ui-hover-filter)] hover:[background-image:var(--ui-hover-overlay)] active:[background-image:var(--ui-pressed-overlay)] disabled:cursor-default disabled:op-disabled",
      // A toggle while pressed, and the chosen one of a toggle group, which is a radio group
      "aria-pressed:bg-accent aria-pressed:text-background aria-checked:bg-accent aria-checked:text-background",
      "data-[variant=Accent]:bg-accent data-[variant=Accent]:text-background",
      "data-[variant=Danger]:bg-error data-[variant=Danger]:text-background",
      // A trigger that holds a value, drawn as the field it is — a select's — and the search field the palette's trigger
      // Opens, in a search field's pill
      "data-[variant=Field]:bg-[var(--ui-panel)] data-[variant=Field]:shadow-none data-[variant=Field]:text-text data-[variant=Field]:focus-visible:outline-hidden data-[variant=Field]:focus-visible:bg-[color-mix(in_srgb,var(--ui-tint)_10%,var(--ui-panel))]",
      // A field-toned toggle — a reaction — pressed takes a light tint of the info colour rather than the accent's fill,
      // Which reads too heavy for a count many of them sit beside
      "data-[variant=Field]:aria-pressed:bg-[color-mix(in_srgb,var(--ui-info)_10%,var(--ui-panel))] data-[variant=Field]:aria-pressed:text-text",
      "data-[variant=Search]:bg-[var(--ui-panel)] data-[variant=Search]:shadow-none data-[variant=Search]:text-text data-[variant=Search]:rd-[var(--ui-pill-radius)] data-[variant=Search]:focus-visible:outline-hidden data-[variant=Search]:focus-visible:bg-[color-mix(in_srgb,var(--ui-tint)_10%,var(--ui-panel))]",
      // No surface of its own: clear on whatever it sits on, tinted in the accent while hovered. Over a picture, where
      // Clear would not read, a button takes the raised default instead. A quiet toggle still fills while pressed, as a
      // Toolbar's bold does
      "data-[variant=Quiet]:bg-transparent data-[variant=Quiet]:shadow-none data-[variant=Quiet]:text-muted",
      "data-[variant=Quiet]:hover:bg-[color-mix(in_srgb,var(--ui-tint)_10%,transparent)] data-[variant=Quiet]:hover:text-text",
      "data-[variant=Quiet]:aria-pressed:bg-accent data-[variant=Quiet]:aria-pressed:text-background data-[variant=Quiet]:aria-checked:bg-accent data-[variant=Quiet]:aria-checked:text-background",
    ].join(" "),
    // A card: a thing a reader picks among others as a whole — a post, a type to create, a type's count, a recent
    // Resource — rather than a row of a list or a menu. A frame, padded, that takes the style's hover as a button does
    "ui-card":
      "p-3 text-left cursor-pointer ui-frame hover:[filter:var(--ui-hover-filter)] hover:[background-image:var(--ui-hover-overlay)]",
    // A guide line down the start edge of what it holds — a navigation's nested list, a thread — as a divider
    "ui-guide": "shadow-[inset_var(--ui-border-width)_0_0_0_var(--ui-divider)]",
    // One row of a list, pressed: a row, tinted while it is hovered, and more while it is the highlighted, selected,
    // Current or focused one. The tint marks a focused row, so it draws no ring as well. Under a finger it is eleven steps
    // Tall at the least, as a button is
    "ui-item":
      "ui-row [@media(pointer:coarse)]:min-h-11 cursor-pointer focus-visible:outline-hidden hover:bg-[color-mix(in_srgb,var(--ui-tint)_10%,transparent)] aria-selected:bg-[color-mix(in_srgb,var(--ui-tint)_20%,transparent)] aria-[current=page]:bg-[color-mix(in_srgb,var(--ui-tint)_20%,transparent)] aria-[current=true]:bg-[color-mix(in_srgb,var(--ui-tint)_20%,transparent)] data-[highlighted]:bg-[color-mix(in_srgb,var(--ui-tint)_20%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--ui-tint)_20%,transparent)]",
    // One row of a list that goes nowhere — an activity entry, a session — laid out as every row is: a mark's column, the
    // Title and whatever ends the row, on one line one control height tall
    "ui-row": "px-2 py-1 text-left flex gap-2 w-full min-h-8 items-center rd-[var(--ui-control-radius)]",
    // A row of tabs on a divider, and one tab in it, which draws the active indicator over its own stretch of the line in
    // The accent while it is the selected tab or the current page's link, and is eleven steps tall under a finger
    "ui-tab":
      "px-3 py-1 [@media(pointer:coarse)]:min-h-11 flex items-center text-muted text-nowrap cursor-pointer no-underline hover:bg-[color-mix(in_srgb,var(--ui-tint)_10%,transparent)] aria-[current=page]:text-accent aria-[current=page]:shadow-[inset_0_calc(var(--ui-indicator-width)*-1)_0_0_var(--ui-accent)] data-[selected]:text-accent data-[selected]:shadow-[inset_0_calc(var(--ui-indicator-width)*-1)_0_0_var(--ui-accent)]",
    "ui-tab-list": "flex of-x-auto ui-bar",
  },
  theme: {
    breakpoint: UNOCSS_BREAKPOINTS,
    // A token reads its custom property, so a utility follows the selected theme at runtime
    colors: {
      ...Object.fromEntries(UiTokens.map((uiToken) => [uiToken, `var(--ui-${uiToken})`])),
      "heading-color": "var(--ui-heading-color)",
    },
    // Override preset-wind4's default sans stack, which lists OS-only fonts
    // ("Segoe UI", "Helvetica Neue", Arial) with no downloadable web source.
    // These warn at startup because nuxt-og-image scans this token to embed
    // Fonts into OG images and cannot resolve them. Inter is the standard style's face, which @nuxt/fonts loads globally.
    font: {
      sans: 'Inter, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    },
  },
});
