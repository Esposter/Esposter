# Tokens

Read when adding a colour pair, a style token or a theme, or when anything selects a theme. That a colour is a token, lengths and durations are steps, and type is the library's type rules is in `SKILL.md`; this page is how the token set grows. How the palette reaches UnoCSS and the first response is `openspec/specs/architecture/ui-library/design.md`.

- **A new pair that fails the palette test is re-picked**, never exempted from it.
- **A colour is the most saturated one of its hue that passes `UiPaletteMap.test.ts`**, found by holding the hue and moving lightness to the test's edge, as a link's blue sits at it. That is why one colour serves a fill, its label and a mark with no second token, and why a hue that is bright by nature, green and yellow, lands far deeper in light than in dark. Take a measured colour over a neon one at the same edge, and keep the status colours apart by hue: success is a leaf green beside the accent's mint, since two greens a few degrees apart read as one.
- **Only `NuxtTheme` selects a theme**: it hands the reader's style and theme mode to `useSelectUiTheme`, whose one watcher selects the pair. The style a component draws in is `useUiStyle`'s, never the store's.
- **A drawing value is a style token.** A radius — a control's or a container's — an edge width, a surface's fill or shadow, a hover treatment, a face, a type size, the heading colour or the scrim is a `UiStyleToken` with a value in every column of `UiStyleMap` (`apps/web/configuration/`), read as its `--ui-<token>` custom property. A rule or a library component reads the token and never writes one style's value; nothing a style holds is a padding, a gap or a height, which stay in the layout tier in `apps/web/app/assets/css/globals.css`.

## Lengths and motion

- **A length is a whole number of `--ui-step`, and a duration of `--ui-motion-unit`**: a transition names `--ui-motion-short`, `--ui-motion-medium` or `--ui-motion-long`, each a duration on the one eased curve, and never a time, an easing or a `steps()` of its own, so reduced motion holds it still with the rest. Motion is never stepped: stepped frames read as frame drops and make every pop-in feel slow (`openspec/specs/architecture/design-language/design.md`, "Motion").

## Type

- **Type is the library's type rules.** A page's root wears `ui-body`, and a heading wears `ui-heading`, `ui-title` or `ui-display`, while the line under a heading or a card's title wears `ui-lede`, the heading's size at normal weight in the colour it sits in, which `text-muted` quiets; a template never sets a font family, a size or a weight of its own. Each face is its own token — `--ui-font-body`, which the readable-text setting swaps, `--ui-font-heading`, and `--ui-font-mono` for code — and a title that is none of them takes `text-heading-color`.
