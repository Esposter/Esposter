---
title: UI library
description: The app's own UI library on Vuetify 0's headless primitives — the design tokens as the one source of colour for both libraries while they coexist, the document chrome every page takes, icons as CSS generated per use, the first components and the surfaces they are drawn with, the import boundary that keeps Vuetify 0 inside the library, and the agent tooling installed with it.
---

# UI Library

The app is moving from Material as Vuetify draws it to a library of its own, built in `apps/web` on [Vuetify 0](https://0.vuetifyjs.com/introduction/why-vuetify0) — Vuetify's headless layer, which owns focus, keyboard handling, ARIA and positioning and paints nothing. The migration runs as a ladder of stages, designed in the [UI library proposal](/docs/proposals/refactors/ui-library). This page is what exists so far: the foundation every later stage builds on, the icons, and the first components, which the agent console is built from.

The foundation changes no component, and still repaints every page. Its design tokens are the colours of the whole app, Vuetify's pages included, and the document's own chrome — scrollbars, selection, caret, focus ring — reads them on every page whichever library draws it.

## One palette, two libraries

```mermaid
flowchart TD
  M[UiPaletteMap: dusk and dawn, one entry per token] --> P[The ui plugin: Vuetify 0's theme, through its Unhead adapter]
  M -->|at config time| VC[vuetify.config.ts: each Vuetify theme's base colours]
  M -->|at config time| UC[uno.config.ts: one colour per token, reading its custom property]
  C[Theme cookie and client hint] --> NT[NuxtTheme resolves the mode]
  NT --> V[Vuetify's theme changes]
  V -->|an immediate watcher, on the server render too| S[The matching library theme is selected]
  S --> P
  P --> H[The first response: the token stylesheet, the root's data-theme and colour scheme]
  H --> U[UnoCSS utilities and the document chrome]
  VC --> V
```

- **The palette is `UiPaletteMap`**, keyed by `UiTheme` and then `UiToken`: the colours an interface is drawn in: two surfaces (background and panel), the edge between them, text and its muted form, one accent, and error, info, success and warning. Dusk is the agent console's palette as it was drawn. Dawn is its light twin, authored beside it rather than computed from it, so the app keeps its light mode. Both use the same token names, so nothing that reads a token knows which theme is selected.
- **Every foreground token meets WCAG AA on every surface token in both themes.** A test computes the contrast ratio of each pair and holds it at the AA threshold.
- **Vuetify 0's theme plugin writes the tokens.** It renders one rule per theme, each token a custom property such as "--ui-accent" keyed on the root's "data-theme" attribute, and the root's colour scheme from the selected theme. Its Unhead adapter puts all of it in the first HTML response, so a page never paints in the wrong theme before hydration. The default adapter writes adopted stylesheets, which exist only in the browser.
- **Vuetify is fed from the palette.** `vuetify.config.ts` builds each of its themes' base colours — background, surface, text, primary, border and the status colours — from the matching entry, so a page Vuetify still draws matches the library on the same screen, and a palette edit repaints both.
- **UnoCSS reads the tokens as variables.** Each token is a theme colour whose value is its custom property, so a utility follows the selected theme at runtime. Vuetify's other colour names (primary, surface, border, and their opacity and variation keys) still generate while templates not yet migrated write them; where a name is both, the token wins, and since Vuetify is fed the same value the two only differ in owner.
- **The palette lives in `apps/web/configuration/`**, beside the breakpoint scale, because the Vuetify and UnoCSS configs read it and they load before any `@/` alias resolves. It imports its enums relatively, as the other configuration files do.

The agent console stays in dusk whichever theme the app is in. Its root is a theme scope, so its panels read the same tokens as every other page with dusk's values ([themes and scopes](#themes-and-scopes)). Its voxel world keeps a palette of its own, `AgentConsolePaletteMap`: the materials — wood, skin, stone and the rest — beside the dusk tokens its interface-coloured props are painted in, since a vertex colour is a value rather than a custom property.

## Icons

```mermaid
flowchart TD
  S[An icon name in source, written in full] --> X[UnoCSS's extractor]
  A[Vuetify's own aliases: a select's arrow, a checkbox's mark] -->|safelisted| G
  X --> G[That icon's rule alone: its SVG as a mask in the current colour]
  L[A library component: an icon by what it means] --> M[UiIconMap: the pixel set first, Material as the fallback]
  M --> X
  G --> V[A Vuetify icon prop, through the module's UnoCSS icon set]
  G --> P[The page ships the icons it draws and nothing else]
```

- **UnoCSS's icons preset is the engine.** A class naming an Iconify icon becomes a rule that draws its SVG as a mask filled with the current colour, so an icon takes the text colour as a glyph did. The Material Design Icons set is read at build time from its Iconify JSON package and never shipped. The rules sit in their own cascade layer ahead of Vuetify's and the utilities, since each also sets its colour to inherit: a component that colours its own icon, as a field does in its error state, and a colour or size utility written on an icon both still win.
- **A name is written in full**, as "i-mdi:" and the icon's name, because the preset generates only what its extractor finds in source. A name assembled from a prefix and a variable generates nothing and draws an empty box, so it is a review finding. The extractor reads components and markup but not plain TypeScript, which would hand every string in the app to the attributify extractor and break the stylesheet on the first one that looks like an attribute, so a `.ts` file that names an icon opts in with UnoCSS's `@unocss-include` comment on its first line. A `v-icon` takes its icon as the `icon` prop, never as text content, which the extractor does not read. A test generates the icons each source file names and fails on any it cannot find, or on a `.ts` file naming one without the comment.
- **Vuetify draws through the same CSS.** Its default set is the module's "unocss-mdi", which hands the class to Vuetify's class icon. Vuetify's internal icons are aliases no source file names, and the module maps only some of them, so `vuetify.config.ts` maps every alias Vuetify defines from Vuetify's own list and `uno.config.ts` safelists the result.
- **The custom component icons** — the anime and dungeon gate marks — stay components in the custom set. The app's Vuetify plugin adds that set to the module's icon configuration rather than replacing it, which would drop the aliases.
- **The library's icons are pixel icons, named by meaning.** `Ui/Icon.vue` takes a `UiIconMeaning` — what the icon says, such as success or remove — and `UiIconMap` resolves it to a class: [Pixelarticons](https://pixelarticons.com/) first, a set drawn on a pixel grid to sit on a voxel surface, and a Material Design Icons class for a meaning it has no glyph for. Swapping sets is one map edit, a fallback is a row in the map, and a feature never names a set. Vuetify's components keep their Material icons until their unit migrates.
- **A pixel icon renders at 1.5rem**, the size of its 24-unit grid, so every unit is a whole CSS pixel; any other size blurs the grid.
- **An icon is decoration unless it is labelled.** Without a label it is hidden from assistive technology; with one it is an image with that name, for an icon that says what nothing beside it does — a tool call's success or failure mark.
- **Under Vitest the UnoCSS module is not loaded**, so the module falls back to Vuetify's plain class set: an icon still carries its class, which is what a test finds it by, and nothing draws it.

## Components

The first components came out of the agent console, which drew the look by hand before the library existed. Each takes its behaviour from a Vuetify 0 primitive and its look from the tokens, and each has a component test of its keyboard and ARIA contract, so a feature's test never walks a menu's arrow keys again.

| Component       | Built on                              | What it is                                                                                         |
| :-------------- | :------------------------------------ | :------------------------------------------------------------------------------------------------- |
| `UiFrame`       | none                                  | A region of content, with an optional title in the accent colour and a slot for its actions        |
| `UiButton`      | Button                                | The raised block, with accent, danger and quiet variants; a pressed toggle takes the accent        |
| `UiIconButton`  | `UiButton`                            | An icon by meaning, and a required label that is its accessible name and its tooltip at once       |
| `UiCopyButton`  | `UiIconButton`                        | Copies its source, and says it did while the clipboard composable's copied state lasts             |
| `UiMenu`        | Popover, roving focus                 | A trigger and the actions it opens, as the menu button pattern has them                            |
| `UiSelect`      | Select, virtual focus                 | One choice from a list, as the select-only combobox pattern has it                                 |
| `UiSuggestions` | the popover composable, virtual focus | Completions under a text field the call site owns: the slash palette, a new session's repositories |
| `UiSpinner`     | none                                  | The terminal's star, a frame at a time, held still under reduced motion                            |
| `UiLoadingBar`  | Progress                              | A row of voxel blocks filled as the work gets done, with the progress bar's role and value         |
| `UiThemeScope`  | Theme                                 | A region drawn in another theme than the document's                                                |

### Keyboard contracts

- **A menu** opens from its trigger onto its first item by click, Enter, Space or the down arrow, and onto its last by the up arrow. The arrows walk it, and Home and End jump to its ends. Typing a title's first letters jumps to the next title they begin; a pause starts the search over, and one letter pressed again steps through every title it begins. Enter or Space picks. A pick or Escape closes it with focus back on the trigger, and Tab closes it and moves on.
- **A select** opens onto its selected option by the arrows, Enter or Space. Focus stays on the trigger, which names the highlighted option as its active descendant. The arrows, Home, End and typeahead walk it, and Enter picks.
- **Suggestions** leave focus in the field, since typing goes on there. The arrows walk them as the field's active descendant, and Enter or Tab takes the highlighted one. Enter with nothing highlighted is still the field's own key — the composer's send. Escape puts them away without reaching any shortcut on the page, and the next keystroke in the field brings them back. They show while the field has focus and something to offer, and pressing one with the mouse keeps the field focused.
- **Typeahead** is the library's own: one composable the menu and the select share, since Vuetify 0's select has none.

### Surfaces

The three surfaces of the [design language](/docs/proposals/refactors/ui-library/design-language) are UnoCSS rules in `uno.config.ts`, not a component each. A Vuetify 0 part renders its own element and only takes classes, so a select's trigger is raised and its list is framed with no wrapper component around either.

- **`ui-frame`** — a region: the panel colour inside a one-step ring, which leaves each corner cut out.
- **`ui-raised`** — something pressed: the edge colour with its upper sides lit and its lower sides in shadow. `UiButton` and the select's trigger wear it.
- **`ui-sunk`** — the background colour, shaded along its bottom, in the page's face. A text field in the library's look wears it until the library has a field of its own.
- **`ui-popover`** — the top-layer element a menu, a select or suggestions open in, emptied of the browser's own popover look and padded two steps, so the frame inside it never overlaps what it hangs off. Through `anchor-size()` it is at least as wide as that.
- **`ui-item`** — one row of a popover's list, tinted in the accent while it is highlighted, selected or focused.

### Popovers

- **CSS anchor positioning places them**, as Vuetify 0's popover composable writes it. The content opens below what it hangs off, aligned to its start, and the browser flips it to the other side or the other end where there is no room. Every engine the app supports has anchor positioning, so Vuetify 0's Floating UI adapter is not installed.
- **The top layer holds them**, through the Popover API, so no panel paints over a menu and no overflow clips one. A menu's trigger opens it natively through its popover target, so a click on the trigger of an open menu closes it rather than light-dismissing it and opening it again. Suggestions are a manual popover, since a click back into their own field lands outside them.

### What building them taught

- **The call site's attributes win over the primitive's.** Vuetify 0's button lays its own attributes over the ones passed to it, which would drop a form's submit type and a toggle's pressed state. `UiButton` renders the element itself, from the primitive's attributes with the call site's on top. It exposes that element, because a renderless primitive leaves a fragment rather than an element as the component's root.
- **A select's model sees only choices.** Vuetify 0's select clears the old choice before it selects the new one, which a model would see as the select going empty for a moment. `UiSelect` passes on only a value, so a call site that sends every change to a server never sends the empty one.
- **A spinner is decoration.** It sits beside a line that says what is under way, so it has no progress role and is hidden from assistive technology. The loading bar is the one with a value to report.

### Themes and scopes

`UiThemeScope` renders Vuetify 0's theme element, whose theme attribute gives every token beneath it that theme's values, and sets the colour scheme to match, so the browser's own controls follow. The document chrome declares its inherited colours — the scrollbar, the caret and the native controls' accent — on every theme scope as well as on the root, because an inherited value is resolved where it is declared.

## One owner per concern

Two component libraries on one page stay coherent only if each concern has exactly one owner at a time, which is Vuetify 0's own [compatibility rule](https://0.vuetifyjs.com/guide/integration/compatibility).

| Concern                 | Owner while both libraries are in the app                                           |
| :---------------------- | :---------------------------------------------------------------------------------- |
| Which theme is selected | `NuxtTheme`, through Vuetify's theme; the library's theme follows it                |
| The colour values       | the palette map, read by both themes                                                |
| Breakpoints             | Vuetify's display composable, fed by the [one scale](/docs/architecture/responsive) |
| Validation rules        | Vuetify's rules                                                                     |
| Hotkeys                 | Vuetify's hotkey composable                                                         |

`NuxtTheme` resolves the mode once and changes Vuetify's theme, and an immediate watcher on Vuetify's theme name selects the matching library theme through `useSelectUiTheme`. Every path that changes the theme — the resolution on each request, the system preference settling after hydration, and the theme toggle — goes through Vuetify's theme, so the watcher is the one place the library's selection is written. It is immediate because the server render has to select the right theme too: the adapter's own server-side watcher then patches the head entry before it is serialised. The other concerns move to Vuetify 0 at [retirement](/docs/proposals/refactors/ui-library/retirement), each in one commit.

## The document chrome

These are properties of the document rather than of any component, so they are set once and reach every page:

- **Scrollbars** thin, with the thumb in the panel edge colour on the background colour, through the standard scrollbar properties on the root, which every scroll container inherits.
- **Selection** in the accent colour, with the background colour for its text.
- **The caret** and **native controls** — a checkbox, a range, a progress bar — in the accent colour.
- **The focus ring** on every focus-visible element: a solid accent outline, its width and its offset each one step.
- **The colour scheme** on the root, from the selected theme, so the browser's own form controls pick the right half.

They sit in a cascade layer of their own, declared before every other layer, so a component that draws its own focus or selection — as Vuetify's fields do — wins over the chrome without an override. The one non-colour token so far is `--ui-step`, a quarter rem: the voxel the library's lengths are whole numbers of, and the width of its edges and focus ring. Only the chrome reads it yet; the type scale and motion durations become tokens with the first component that reads them.

## The boundary

A feature never imports Vuetify 0. Only the library does — its components, composables, models, services and its plugin — so the headless layer stays replaceable and every accessibility decision stays in one folder. An oxlint restricted-imports entry refuses "@vuetify/v0" and its subpaths everywhere else, with an override for exactly those folders. Vuetify 0 is not auto-imported either: its names collide with VueUse and with the ones Vuetify's module auto-imports, and nothing outside the library would call them.

## Agent tooling

- **Vuetify 0's own skill** is vendored into the agent tree, and recorded in `skills-lock.json`. It carries Vuetify 0's decision trees and anti-patterns, and applies inside the library only. The repository's `ui-library` skill holds our conventions on top and outranks it where they meet: its "never a native button" rule is right for a library component and wrong for a feature, which uses the library's instead. How a vendored skill sits in the agent tree is the [agent configuration](/docs/architecture/agent-configuration) page's.
- **Vuetify 0's docs** have a markdown twin of every page, at the same path with a ".md" suffix, which is what an agent reads to look up an API rather than guessing it.

## Key files

| File                                              | Role                                                                                            |
| :------------------------------------------------ | :---------------------------------------------------------------------------------------------- |
| `apps/web/configuration/UiPaletteMap.ts`          | Dusk and dawn, one entry per token                                                              |
| `apps/web/configuration/UiPaletteMap.test.ts`     | Every foreground token against every surface token, at the WCAG AA ratio                        |
| `apps/web/configuration/ThemeModeUiThemeMap.ts`   | The library theme each of Vuetify's resolved modes selects                                      |
| `apps/web/app/models/ui/UiToken.ts`               | The token names                                                                                 |
| `apps/web/app/models/ui/UiIconMeaning.ts`         | What each library icon says                                                                     |
| `apps/web/app/services/ui/UiIconMap.ts`           | Each meaning's icon class: the pixel set first, Material as the fallback                        |
| `apps/web/app/components/Ui/Icon.vue`             | The icon element, by meaning, decorative unless labelled                                        |
| `apps/web/app/components/Ui/`                     | The components, each beside its component test                                                  |
| `apps/web/app/composables/ui/useTypeahead.ts`     | The typeahead the menu and the select share                                                     |
| `apps/web/app/models/ui/UiMenuItem.ts`            | One choice in a menu, a select or suggestions                                                   |
| `apps/web/app/services/ui/constants.ts`           | The spinner's frames, the loading bar's blocks, the typeahead's pause and where a popover opens |
| `apps/web/app/plugins/ui.ts`                      | Vuetify 0's hydration and theme plugins, the theme through the Unhead adapter                   |
| `apps/web/app/composables/ui/useSelectUiTheme.ts` | Selects the library theme matching a Vuetify mode                                               |
| `apps/web/app/components/Nuxt/Theme.vue`          | Resolves the mode once and selects it in both libraries                                         |
| `apps/web/vuetify.config.ts`                      | Its theme colours read the palette map; its icons are the UnoCSS set, every alias mapped        |
| `apps/web/uno.config.ts`                          | One theme colour per token; the surfaces; the icons preset, and the safelisted aliases          |
| `apps/web/uno.config.test.ts`                     | Every icon a source file names generates its rule                                               |
| `apps/web/app/assets/css/globals.scss`            | The document chrome and the step token                                                          |
| `apps/web/app/assets/css/layers.css`              | Declares the chrome's layer first, and the icons' ahead of Vuetify's                            |
| `apps/web/app/plugins/vuetify.ts`                 | Adds the custom component icons to the module's icon configuration                              |
| `.oxlintrc.json`                                  | The import boundary                                                                             |
| `.agents/skills/ui-library/SKILL.md`              | The library's conventions                                                                       |

## Sources

- [Nuxt integration](https://0.vuetifyjs.com/guide/integration/nuxt), Vuetify 0: the transpile entry, the Unhead theme adapter and the hydration plugin.
- [Theming](https://0.vuetifyjs.com/guide/features/theming), Vuetify 0: themes as custom properties.
- [AI tools](https://0.vuetifyjs.com/guide/tooling/ai-tools), Vuetify 0: the skill and the markdown twin of every docs page.
- [Icons preset](https://unocss.dev/presets/icons), UnoCSS: icons as generated CSS masks from Iconify JSON, emitted only for the names the extractor finds.
- [Vuetify Nuxt module](https://nuxt.vuetifyjs.com/), its icons option: the "unocss-mdi" set and the aliases it maps.
- [Pixelarticons](https://pixelarticons.com/): the pixel icon set and its MIT licence.
- [Listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/) and [combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/), WAI-ARIA Authoring Practices: the select's and the suggestions' keyboard contracts, and the typeahead the menu shares with the select.
- [The menu role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/menu_role), MDN: the menu's keyboard contract and its focus returning to the trigger.
- [Popover](https://0.vuetifyjs.com/components/disclosure/popover) and [roving focus](https://0.vuetifyjs.com/composables/system/use-roving-focus), Vuetify 0: the primitives under the menu, the select and the suggestions.
- [position-anchor](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position-anchor), MDN, and [anchor positioning's Baseline status](https://github.com/web-platform-dx/web-features/issues/3558), web-features: anchor positioning in every engine since Firefox 147, which is why no JavaScript positioning is installed.
- [scrollbar-color](https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-color), MDN: the standard scrollbar properties the chrome sets.
- [Success criterion 1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum), WCAG 2.2: the AA threshold the palette test holds each pair to.
