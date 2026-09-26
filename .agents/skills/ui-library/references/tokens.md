# Tokens

Read when adding a colour pair, a style token or a theme, or when anything selects a theme. That a colour is a token, lengths and durations are steps, and type is the four rules is in `SKILL.md`; this page is how the token set grows. How the palette reaches UnoCSS and the first response is `apps/web/content/docs/architecture/ui-library.md`.

- **A new pair that fails the palette test is re-picked**, never exempted from it.
- **Only `NuxtTheme` selects a theme**: it hands the reader's style and theme mode to `useSelectUiTheme`, whose one watcher selects the pair. A region in another mode or style is a `UiThemeScope`; the style a component draws in is `useUiStyle`'s, never the store's.
- **A drawing value is a style token.** A radius — a control's or a container's — an edge width, a surface's fill or shadow, a hover treatment, a face, a type size, the heading colour or the scrim is a `UiStyleToken` with a value in every column of `UiStyleMap` (`apps/web/configuration/`), read as its `--ui-<token>` custom property. A rule or a library component reads the token and never writes one style's value; nothing a style holds is a padding, a gap or a height, which stay in the layout tier in `globals.scss`.

## Lengths and motion

- **A length is a whole number of `--ui-step`, and a duration of `--ui-motion-unit`**: a transition names `--ui-motion-short`, `--ui-motion-medium` or `--ui-motion-long`, each a duration on the one eased curve, and never a time, an easing or a `steps()` of its own, so reduced motion holds it still with the rest. Motion is never stepped: stepped frames read as frame drops and make every pop-in feel slow (the architecture page's Motion section).

## Type

- **Type is the four rules.** A page's root wears `ui-body`, and a heading wears `ui-heading`, `ui-title` or `ui-display`; a template never sets a font family, a size or a weight of its own. Each face is its own token — `--ui-font-body`, which the readable-text setting swaps, `--ui-font-heading`, and `--ui-font-mono` for code — and a title that is none of the four takes `text-heading-color`.
