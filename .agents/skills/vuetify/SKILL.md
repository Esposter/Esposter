---
name: vuetify
description: Apply when touching vuetify.config.ts, the Vuetify Nuxt module, or anything that still imports from vuetify. Esposter's residual Vuetify — nothing renders through it (the lint bans every v- tag), what still imports it is the retirement proposal's to remove, and nothing new is built on it.
---

# Vuetify — the residual

Vuetify no longer renders anything. Every `v-*` tag is banned by the lint (`packages/configuration/eslint/overrides/vueRules.js`, whose messages name each replacement), no component calls a `useV*` composable, and every interface is the UI library's (`ui-library` skill). What still imports Vuetify — the theme and defaults in `apps/web/vuetify.config.ts`, the alert type, the UnoCSS preset — is what `apps/web/content/docs/proposals/refactors/ui-library/retirement.md` removes, and this skill is deleted with it.

- **Build nothing new on Vuetify** — no component, no `useV*` composable, no SASS variable, no `vuetify.config.ts` default. The library owns each.
- **A change to `vuetify.config.ts` is a step of the retirement**, never new configuration: the palette it carries is the design tokens' (`ui-library` skill), so a colour is changed there and Vuetify follows.
