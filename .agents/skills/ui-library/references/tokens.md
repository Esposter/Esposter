# Tokens

Read when adding a colour pair, a style token or a theme, or when anything selects a theme. That a colour is a token, lengths and durations are steps, and type is the four rules is in `SKILL.md`; this page is how the token set grows. How the palette reaches both libraries, UnoCSS and the first response is `apps/web/content/docs/architecture/ui-library.md`.

- **Vuetify never gets a colour of its own** — `vuetify.config.ts` only maps tokens onto its theme keys, so one palette edit repaints both libraries.
- **A new pair that fails the palette test is re-picked**, never exempted from it.
- **Only `NuxtTheme` selects a theme**: one watcher on Vuetify's mode and the reader's style calls `useSelectUiTheme`, which selects the pair in both libraries. A region in another mode or style is a `UiThemeScope`; the style a component draws in is `useUiStyle`'s, never the store's.
- **A drawing value is a style token.** A radius — a control's or a container's — an edge width, a surface's fill or shadow, a hover treatment, a face, a type size, the heading colour or the scrim is a `UiStyleToken` with a value in every column of `UiStyleMap` (`apps/web/configuration/`), read as its `--ui-<token>` custom property. A rule or a library component reads the token and never writes one style's value; nothing a style holds is a padding, a gap or a height, which stay in the layout tier in `globals.scss`.
