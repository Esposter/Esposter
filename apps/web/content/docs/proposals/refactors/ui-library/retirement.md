---
title: Retirement
description: Proposal — the last stage of the UI library. Once no unit renders a Vuetify component and schema forms no longer need vjsf, each concern Vuetify still owns is handed to Vuetify 0 in one commit, and Vuetify, its Nuxt module, its UnoCSS preset and their configuration are removed.
model: claude-opus-5-5
---

# Retirement

Retirement is not a rewrite. By the time it starts, [page migration](/docs/proposals/refactors/ui-library/page-migration) has left no template naming a Vuetify component, and [schema forms](/docs/proposals/refactors/ui-library/schema-forms) has removed the one engine built on Vuetify. What remains is the concerns Vuetify still owns without drawing anything — breakpoints, rules, hotkeys, scrolling, dates and the theme's selection — and the configuration that sets it up. Each concern moves in one commit, so a regression points at one hand-off.

## When it may start

The gate is mechanical, not a judgement:

- The lint ban on Vuetify component tags, grown unit by unit during page migration, covers every Vuetify component, and the tree passes it.
- vjsf is out of the manifest.
- The ledger's rows are all ticked.

A remaining consumer means the stage has not started. It is not worked around here: it is a unit that goes back to page migration.

## The hand-offs

| Concern         | Vuetify today                                | Vuetify 0 after                               | What the commit changes                                                      |
| :-------------- | :------------------------------------------- | :-------------------------------------------- | :--------------------------------------------------------------------------- |
| Breakpoints     | the display composable, fed by the one scale | the breakpoints plugin, fed by the same scale | the scale's type becomes the app's own; every call site keeps its flag names |
| Validation      | the rules composable and its aliases         | the rules composable, with the same aliases   | the aliases move to Vuetify 0's plugin; the auto-import workaround goes      |
| Hotkeys         | the hotkey composable                        | the hotkey composable                         | the command registry binds through Vuetify 0's                               |
| Scrolling to    | the go-to composable                         | the browser's own smooth scrolling            | each call site scrolls its element into view                                 |
| Dates           | the date adapter                             | Temporal, as every other date in the app      | its call sites convert with Temporal                                         |
| Theme selection | the theme composable, driven by `NuxtTheme`  | Vuetify 0's theme alone                       | `NuxtTheme` drives one library                                               |

The theme hand-off also removes the client hint. Vuetify needs to know the browser's colour scheme on the server because its theme is a class chosen in script. The tokens do not: in the system mode, the token stylesheet declares dusk inside a dark colour-scheme media query and dawn outside it, so the browser picks the right one on first paint with nothing sent to the server. Only an explicit choice of dusk or dawn is carried, by the theme cookie the app already sets.

## What it deletes

- **Packages**: Vuetify, the Vuetify Nuxt module and the Vuetify UnoCSS preset, from the app's manifest and the catalog.
- **Configuration**: the Vuetify config and its test, the module options, the SASS settings file, the rules config, the Vuetify type augmentation, the auto-import workaround for the rules composable, and the module's entries in the Nuxt module lists.
- **App code**: the Vuetify models and services folders, whose surviving piece — the theme mode — moves under the library's.
- **The app root**: `App.vue` loses its Vuetify app element, and the layouts lose their Vuetify main and footer.
- **UnoCSS**: Vuetify's colour names beside the tokens — primary, surface, border and their opacity and variation keys — with the safelist that generates them, the safelisted icon aliases Vuetify draws its own controls with, the blocklist entries that exist only because Vuetify's own helper classes shared a name with a utility, and the text colour exception that keeps the longer spelling for Vuetify's colour pack.
- **Skills and docs**: the `vuetify` skill; the Vuetify half of the `styling` skill and of the `ux` skill's visual design sources, which point to the design language instead of Material 3; the [responsive](/docs/architecture/responsive) page's second consumer of the scale.

## Once it lands

The design becomes as-built. The [design language](/docs/proposals/refactors/ui-library/design-language) and the [components](/docs/proposals/refactors/ui-library/components) catalogue are rewritten as an architecture standard, since they are the repository's answer to how any interface is drawn. The [context menus](/docs/architecture/ui-library#context-menus), already on the architecture page, and the [command palette](/docs/proposals/refactors/ui-library/command-palette) become standards of their own, as the search standard is. The staging pages are one-time changes, so they are deleted, with one line in the architecture index's log.

## Key files

| File                                                | Role after the change                                           |
| :-------------------------------------------------- | :-------------------------------------------------------------- |
| `apps/web/vuetify.config.ts`                        | Deleted                                                         |
| `apps/web/vuetify.config.test.ts`                   | Deleted                                                         |
| `apps/web/configuration/vuetify.ts`                 | Deleted                                                         |
| `apps/web/configuration/modules.ts`                 | Loses the module from both lists                                |
| `apps/web/configuration/imports.ts`                 | Loses the rules workaround                                      |
| `apps/web/configuration/breakpoints.ts`             | Types the scale itself                                          |
| `apps/web/app/assets/css/settings.scss`             | Deleted                                                         |
| `apps/web/app/rules.config.ts`                      | Its aliases move to Vuetify 0's rules plugin                    |
| `apps/web/app/types/vuetify.d.ts`                   | Deleted                                                         |
| `apps/web/app/components/Nuxt/Theme.vue`            | Selects the theme in Vuetify 0 alone                            |
| `apps/web/app/components/App/ScrollToTopButton.vue` | Scrolls with the browser's own smooth scrolling                 |
| `apps/web/app/App.vue`                              | Loses its Vuetify app element                                   |
| `apps/web/uno.config.ts`                            | Loses the Vuetify preset and the Vuetify-only blocklist entries |
| `.agents/skills/vuetify/SKILL.md`                   | Deleted                                                         |

## Notes

- A hand-off that turns out to lose behaviour is reverted alone, and the concern stays with Vuetify while the gap becomes the library's work. Since every other concern has already moved, Vuetify is then a dependency with one job, which is a state the page can ship in rather than a blocked migration.

## Sources

- [Breakpoints](https://0.vuetifyjs.com/composables/plugins/use-breakpoints), Vuetify 0: the breakpoints plugin and its server-rendering width.
- [Rules](https://0.vuetifyjs.com/composables/plugins/use-rules), Vuetify 0: the rules plugin the aliases move to.
- [prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme), MDN: how the system mode picks its theme with no server hint.
