---
name: vuetify
description: Apply when writing or reviewing Vuetify components, dialogs, selects, forms, or lists. Esposter Vuetify conventions — v-prefixed auto-imported composables, a global default never repeated on an instance, every drawer through StyledNavigationDrawer, typed SelectItemCategoryDefinition items with clearable banned, useVRules with a built-in alias first, the mount gate a dialog born open owes, and no SASS variables in component styles.
---

# Vuetify Conventions

## Button Backgrounds — `references/button-backgrounds.md`

A raw `v-btn` is transparent when colourless, and a parent container (`v-card-actions`, `v-toolbar`, …) can override its variant to `"text"` so a `color` tints the text rather than the background. Vuetify still draws its own buttons inside what it renders — a schema form's controls — so read the page before adding a fill to one; a button we write is the library's (`ui-library` skill), which answers to neither rule.

## Auto-Imported Composables — `v` Prefix

Vuetify composables are auto-imported with a `v` prefix and are globally available — **never import from `"vuetify"` directly**: `useVDisplay()`, `useVTheme()`, `useVLocale()`, `useVDate()`, `useVGoTo()`, `useVRules()`.

## Global Defaults (vuetify.config.ts)

**A prop `vuetify.config.ts` declares must never be repeated on an instance.** Read the `defaults` object there for the current set rather than a copy of it here — it is one screen long. Two entries recur, `variant="outlined"` and `hideDetails: "auto"` on every input — bare `hide-details` swallows the validation error a field with rules exists to report (eslint fails both forms) — and a default is a constant, so a style keyed on a state the component turns on for itself is a `globals.scss` rule in the `vuetify-overrides` layer, the one place a Vuetify SASS API is allowed (`references/global-defaults.md`).

**Every drawer goes through `StyledNavigationDrawer`, never `v-navigation-drawer` directly** — a permanent drawer bound to a ref that starts closed renders `inert` for the session (`references/drawers.md`).

## Button Conventions

- **`#activator` slot always first** in `v-menu` (and `v-dialog`).
- **Icon choice for create actions** — use the semantically specific MDI icon when available (`i-mdi:table-row-plus-after`, `i-mdi:table-column-plus-after`); fall back to `i-mdi:plus` for generic create.
- **A button in or beside a field is the library's.** A search's clear button is `UiTextField`'s own, and any other action sits beside the field as a quiet `UiIconButton` — never a button in a Vuetify field's slot, which the one `v-text-field` left, inside the schema-form dialog, does not use.

## Linked Buttons and Tabs Are Highlighted by the Router — `references/router-driven-highlighting.md`

Once a `v-btn`/`v-tab` carries `to`, Vuetify derives its highlight from the router link and ignores the group's `model-value`. Read the page before binding `to`, or when the wrong tab is lit: it owns the catch-all `exact` rule, the tab standing for a group of pages, and the explicit `:active` escape hatch.

## Selects and List Items

- **Type items as `SelectItemCategoryDefinition<T>[]`** (`{ title: string, value: T }`) from `@/models/vuetify/SelectItemCategoryDefinition` for `v-autocomplete`/`v-select`/`v-list-item`. Never inline untyped `{ title, value }` arrays — extract to a typed constant, named for what the value represents (`fooIds` when each value is a foo id).
- **Never specify `item-title`/`item-value`** — Vuetify's defaults match `SelectItemCategoryDefinition`. Source data with different field names is mapped to `{ title, value }` at the call site, never passed raw and compensated for with those props.
- **`clearable` is BANNED on selects** — clearing emits `null`, which violates the no-null convention and fails non-nullable API inputs. Model "no selection / all" as an explicit first item carrying the empty sentinel (`{ title: "All members", value: "" }`, `{ title: "No limit", value: 0 }`) so the ref stays a plain inferred `ref("")`/`ref(0)` and the sentinel propagates end-to-end (see the typescript skill's sentinel section).
- **Prefer enum values as display titles** — set `title` to the enum member itself so key and value stay the same string, updating the enum's string value to the intended label rather than inventing a separate title.
- **`v-list-item` icon placement** — `prepend-icon` for decorative/category icons, `append-icon` for action/severity icons (e.g. moderation actions). Action icon colour/value come from the relevant `Foo*Map` constants — never hardcoded inline.

## Forms

- Name a form validity ref `isEditFormValid`, bind it via `v-model` on `<v-form>`, and init `ref(true)` (optimistic). Prevent invalid submission through validation rules so state stays consistent, rather than catching in the submit handler (see the `error-handling` skill).
- **`StyledFormDialog` consumers never pass form validity** — it merges its form's `isValid` and `isSubmitting` into the confirm button internally, so `isConfirmDisabled` carries only the consumer's own extra condition. **`StyledEditFormDialog` takes no confirm condition at all.**
- Use the auto-imported `useVRules()` — declare `const rules = useVRules();` at the top of `<script setup>` with the other composables, then reference builders: `:rules="[rules.required(), rules.maxLength(100)]"`. One-off inline arrow rules in the template are fine; extract to script only when shared or unwieldy.
- **A built-in alias first, always** (`required`, `maxLength`, `minLength`, `email`, `pattern`, `notEmpty`, …) — never reimplement one or its message, a server Zod schema's constraints included; a bespoke message is earned only where the generic one would be wrong about what the user sees (`references/form-dialogs-and-rules.md`).
- Rules validate **what is submitted, not what was typed** — when the sent value is composed from the field (markup wrapper, appended link/suffix), the rule checks the composed value's constraint, even though `counter` still tracks the raw input.
- Rules depending on reactive component state (uniqueness against a live list) are **not** global aliases — the `vue-composable-patterns` skill's "Validation Rules — Pick the Right Layer" places them.

## A Dialog Born Open Waits for Its Mount

`StyledDialog` gates its own model on `useMounted()`, so consumers pass their open state straight through. A **raw `v-dialog` rendered open on its first render** — one a page's async setup decides, or one that _is_ the page — owes the same gate: `:model-value="isMounted"`. Vuetify's block scroll strategy reads the overlay's root element on a timeout after it activates, and a navigation renders the incoming page inside a suspense that has not mounted one yet, so the strategy dereferences `undefined` and the whole page render goes with it (still unguarded upstream at the version the lockfile resolves).

## HTML Footprint

**Prefer a library component over raw HTML** where one exists — `UiList` for a list and `UiAlert` for a line the page says about itself. A layout is grid and flex utilities on plain elements: the Vuetify grid and `v-alert` are banned by the lint (`packages/configuration/eslint/overrides/vueRules.js`), whose messages name each replacement.

## No SASS Variables in Component Styles

**Never use Vuetify SASS variables (`$border-width-root` etc.) in component `<style>` blocks** — they are build-time variables requiring `additionalData` injection, which conflicts with Vuetify's compilation pipeline. Shared values are CSS custom properties in the `:root` block in `globals.scss`; use `var(--name)`.

The goal is always attributify: prefer inline UnoCSS utilities and delete the style block (`<div b-1 b-border bottom="[var(--dock-inset-block-end)]" />`). The `var(...)` form is for the cases where a block is genuinely required — which ones those are, and when `lang="scss"` is earned, is the `styling` skill's.

## Deep Dives

- `references/global-defaults.md` — when a prop `vuetify.config.ts` already sets looks needed on an instance, `hide-details` looks like the answer, or a style depends on a state the component sets for itself.
- `references/form-dialogs-and-rules.md` — when wiring a form dialog or inline form's validity/error icon, choosing between a built-in rule and a custom one, or adding a custom global validation rule and wording its message.
- `references/select-item-construction.md` — when building the items constant for a select, list or menu from an enum or map.
- `references/css-custom-properties.md` — when a component genuinely needs a `<style>` block and a shared value in it.
- `references/scrollspy-sub-nav.md` — when a Vuetify sidebar must track which section is scrolled into view.
- `references/button-backgrounds.md` — when a button's fill is not what you expected, or a container has turned it transparent.
- `references/router-driven-highlighting.md` — when binding `to` on a button or tab, or the wrong tab is lit.
- `references/drawers.md` — when adding a navigation drawer or overlay sheet, or one renders `inert` or carries a shadow.
