---
name: ui-library
description: Apply when building or restyling any interface in apps/web, choosing a colour, adding a UI component, or reaching for @vuetify/v0. Esposter's own UI library — three layers (feature, library, Vuetify 0), the import boundary that keeps Vuetify 0 inside the library, the design tokens as the one source of colour for both libraries during the migration, the document chrome, and icon names written whole as i-mdi: classes. Outranks the vendored vuetify0 skill wherever they meet.
---

# UI Library

The app is moving off Material-as-Vuetify-draws-it onto a library of its own: the agent console's voxel look, built in `apps/web` on Vuetify 0's headless primitives. The design and the ladder of stages are `apps/web/content/docs/proposals/refactors/ui-library/index.md`; this skill is what holds while the migration runs.

## Settled — do not re-propose

- **Restyling Vuetify, another headless library, a styled library, or writing the behaviour ourselves.** Argued and rejected in the proposal's index ("Why this and not another way").
- **Moving the library into a package.** It stays in `apps/web` until a second app consumes it.
- **Auto-importing Vuetify 0.** Its names collide with VueUse and with the "useV" names Vuetify's module auto-imports; the library imports it by name, and nothing else imports it at all.
- **Keeping the palette in the library's services folder.** `vuetify.config.ts` and `uno.config.ts` read it, and they load before any `@/` alias resolves, so it lives in `apps/web/configuration/` beside `breakpoints.ts` and imports its enums relatively, as `configuration/vuetify.ts` does.

## Three layers

- **A feature uses the library; only the library imports Vuetify 0.** The library's folders are listed in the `.oxlintrc.json` override that lifts the `@vuetify/v0` ban. When a feature needs a behaviour the library does not have yet, grow the library first, as a separate commit — never import Vuetify 0 from the feature behind a disable.
- **The vendored `vuetify0` skill applies inside the library only.** Its "never a native button, use Button" rule is right for the library's own components and wrong for a feature, which uses the library's component instead. Where the two skills disagree, this one wins.
- **Which component replaces which Vuetify component, and in which stage**, is the proposal's `components.md`. Build a component for the stage that consumes it, not in advance.

## Tokens

How the palette reaches both libraries, UnoCSS and the first response is `apps/web/content/docs/architecture/ui-library.md`. The rules an edit follows:

- **A colour is a token.** A new colour is an entry in `UiPaletteMap` for both themes; a component or a template never writes a hex value or a Vuetify colour the token set already covers.
- **Vuetify never gets a colour of its own** — `vuetify.config.ts` only maps tokens onto its theme keys, so one palette edit repaints both libraries.
- **A new pair that fails the palette test is re-picked**, never exempted from it.
- **Only `NuxtTheme` selects a theme**, and the library's theme only ever follows Vuetify's through `useSelectUiTheme`.
- **A length is a whole number of `--ui-step`.** The type scale and motion durations become tokens beside it with the first component that reads them.

## Icons

How icons reach both libraries is the architecture page's Icons section. The rules an edit follows:

- **An icon is `i-mdi:` and its name, written whole** in the file that uses it — a prop or a map entry. The preset generates only what its extractor sees, so a name assembled at runtime draws nothing, and so does one written as a `v-icon`'s text content: pass it as the `icon` prop.
- **A `.ts` file that names an icon starts with `// @unocss-include`.** The pipeline does not scan TypeScript — widening it to every `.ts` file feeds the attributify extractor arbitrary code and breaks the stylesheet. `uno.config.test.ts` fails on a file that forgets.
- **A Vuetify alias needs no hand-written safelist entry.** `vuetify.config.ts` maps every alias from Vuetify's own list, and `uno.config.ts` safelists what it maps.
- **A test finds an icon by `[class~="i-mdi:close"]`**, never `.i-mdi:close`, which is a pseudo-class selector, not a class.

## The document chrome

Scrollbars, selection, the caret, native control accents and the focus ring live once in the `ui-chrome` layer of `apps/web/app/assets/css/globals.scss`. A page never restates them, and a component that wants its own focus or selection treatment simply declares it — the layer is first in `apps/web/app/assets/css/layers.css`, so no override is needed.

## Migrating a unit

Write down every flow and state a unit has before touching its template; the unit fails if the new version drops any of them. The steps and the order of units are the proposal's `page-migration.md`, and its ledger opens with that stage.
