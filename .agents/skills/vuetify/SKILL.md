---
name: vuetify
description: Esposter Vuetify 4 conventions — StyledButton for primary actions, the isIconButton shape switch, :to and type never inside :button-props, v-prefixed auto-imported composables (useVDisplay/useVTheme), global defaults never repeated and why a state-conditional style cannot be one, drawer elevation, tooltips on icon-only buttons, StyledTooltipIconButton/StyledTooltipMenuIconButton over a hand-rolled activator chain, plain-variant buttons inside input slots, typed SelectItemCategoryDefinition items (clearable banned, no item-title/item-value), enum-value-as-display-title, form validity naming and useVRules, the mount gate a dialog born open owes Vuetify's block scroll strategy, no SASS variables in component styles, plus deep dives on button backgrounds, router-driven highlighting of linked buttons and tabs, StyledList and StyledAvatar, form dialogs and custom validation rules, constructing items arrays from enums and maps, the CSS custom property registry, scrollspy sub-nav, and mergeProps activator stacks. Apply when writing or reviewing Vuetify components, dialogs, selects, forms, or lists.
---

# Vuetify Conventions

## Primary Buttons

Use `StyledButton` for every confirm / complete / primary call-to-action (create, save, accept, publish, request, start). **Never a raw `color="primary"` `v-btn`** — colourless buttons are transparent by default (`references/button-backgrounds.md`), so a primary-coloured fill reads badly on the app's transparent / `v-main` base; `StyledButton` renders the midnight-bloom gradient + white text instead. It paints with `background-image`, so it is immune to every background rule and inherited variant.

- Pass Vuetify props through `:button-props="{ ... }"` (camelCase — `{ prependIcon: 'mdi-plus', disabled: !isValid, loading: isSubmitting }`).
- **`:to`, `type` and native listeners go directly on the wrapper**, never inside `:button-props` — they fall through to the root `v-btn` (`type` is a native attribute, not a typed `VBtn` prop, so `buttonProps` fails typecheck). Link choice, the raw-`<a>` ban and `RoutePath` targets belong to the **routing** skill.
- Destructive confirms stay a `color="error"` `v-btn` — error red is visible on the transparent base, and `StyledButton` is for positive/primary actions only.
- **`StyledTooltipIconButton` passes `:icon` by default**, and Vuetify's `icon` prop switches the button to the icon-button variant: circular, equal width/height, no min-width. Converting a `<v-tooltip>` + rectangular `<v-btn>` to it silently turns the button into a circle — pass `:is-icon-button="false"` to keep the regular button shape with the icon as a child. `rounded`/`tile` cannot restore it; they only change corners, not the forced square dimensions.

## Button Backgrounds — `references/button-backgrounds.md`

Colourless flat buttons are transparent by app CSS, and a parent container (`v-card-actions`, `v-toolbar`, `v-btn-group`, …) can override the variant to `"text"` so a `color` tints the text rather than the background. Read the page before adding a fill, and never fight the container with `variant="elevated"` — a filled action inside one is `StyledButton`, an icon action is `StyledTooltipIconButton`, a destructive confirm is a `color="error"` `v-btn`.

## Auto-Imported Composables — `v` Prefix

Vuetify composables are auto-imported with a `v` prefix and are globally available — **never import from `"vuetify"` directly**: `useVDisplay()`, `useVTheme()`, `useVLocale()`, `useVDate()`, `useVGoTo()`, `useVRules()`.

## Global Defaults (vuetify.config.ts)

**A prop `vuetify.config.ts` declares must never be repeated on an instance.** Read the `defaults` object there for the current set rather than a copy of it here — it is one screen long. Two entries recur: `variant="outlined"` on every text input, and a `hideDetails` on every input.

`hideDetails: "auto"` is the one worth understanding, because the value a caller reaches for instead is worse than redundant. `"auto"` renders the details row exactly when there is a message to put in it; bare `hide-details` means `true`, which hides the row unconditionally and so **swallows the validation error a field with rules exists to report**. Both the static and the bound form are eslint errors (`vue/no-restricted-static-attribute` and `vue/no-restricted-syntax` in `packages/configuration/eslint/overrides/vueRules.js`) — a binding computes per render what `"auto"` already answers per render. A layout that genuinely cannot afford the row carries a disable comment stating why; no field in the app does today, and no input is pinned to `true` either — `true` reserves exactly as little space as `"auto"` while also swallowing the message, so it is never the better value, not even on a switch.

**A default is a constant, so anything conditional on component state cannot be one.** A prop set here applies to every instance in every state, and several of the states worth styling are ones the component turns on for itself — `temporary` at the mobile breakpoint, `--active` while a drawer is on-canvas. Style those as a rule in `globals.scss` keyed on Vuetify's own state classes, inside the `vuetify-overrides` layer, using the framework's mixins so the values stay Vuetify's (`@use "vuetify/tools" as vuetify`). This is the one place a Vuetify SASS API is allowed — component `<style>` blocks still may not (below).

**Every drawer goes through `StyledNavigationDrawer`, never `v-navigation-drawer` directly.** A permanent drawer still honours `model-value`, and Vuetify only forces one open when `permanent` _changes_ to true — the initial pass takes that branch for a null model alone. So a drawer bound to a ref that starts closed renders `inert` for the whole session, and any handler closing the mobile overlay closes the desktop rail with it. The wrapper is the single place that resolves it: while it is permanent it is open, and the model is the open state of the overlay it becomes when it is not. Bound state that is conditional on a prop cannot live in `vuetify.config.ts` — a default is a constant, so this is a component or nothing.

**`v-navigation-drawer` is flat; a drawer that floats over the content is not.** Vuetify shadows a drawer only while it is temporary and open, where a scrim is already holding it off the page, and that is the whole of it — there is no app-wide elevation override. A permanent or persistent drawer reserves its own column in the layout, so the content sits beside it rather than under it and a border is separation enough. `StyledNavigationOverlay` is the other case: an absolutely-positioned sheet over the content with no scrim, where the shadow is the only thing distinguishing the two, so it states `elevation="4"` itself. Elevation follows whether the surface overlaps what is behind it, not whether it is called a drawer.

## Button Conventions

- **Every icon-only `v-btn` must have a `v-tooltip`** — wrap with `v-tooltip` + descriptive `text` so the action is discoverable. A button with **visible label text** is self-describing and needs none.
- **`#activator` slot always first** in `v-tooltip` (and `v-menu`).
- **Icon choice for create actions** — use the semantically specific MDI icon when available (`mdi-table-row-plus-after`, `mdi-table-column-plus-after`); fall back to `mdi-plus` for generic create.
- **Inside a `v-text-field` slot** (`#append-inner` etc.) use `variant="plain"` and omit `color` — a `variant="flat" color="primary"` button paints a filled block inside the input, where plain stays transparent and inherits the surrounding text colour.

## Linked Buttons and Tabs Are Highlighted by the Router — `references/router-driven-highlighting.md`

Once a `v-btn`/`v-tab` carries `to`, Vuetify derives its highlight from the router link and ignores the group's `model-value`. Read the page before binding `to`, or when the wrong tab is lit: it owns the catch-all `exact` rule, the tab standing for a group of pages, and the explicit `:active` escape hatch.

## Nested Activators — the Primitive First, `mergeProps` Only Beyond It

**The two common stacks already have a component; reach for it before writing an activator chain at all.**

| Stack                            | Use                           |
| -------------------------------- | ----------------------------- |
| `v-tooltip` + `v-btn`            | `StyledTooltipIconButton`     |
| `v-menu` + `v-tooltip` + `v-btn` | `StyledTooltipMenuIconButton` |

Hand-rolling either is the single most repeated finding in this area — the chain looks like plumbing rather than a component, so it gets rewritten instead of imported. Anything the two primitives do not cover (a `v-dialog` or `v-hover` in the stack, a non-icon activator, three-way nesting) binds one `mergeProps(...)` and never two `:=` binds — `references/nested-activators.md`.

## Selects and List Items

- **Type items as `SelectItemCategoryDefinition<T>[]`** (`{ title: string, value: T }`) from `@/models/vuetify/SelectItemCategoryDefinition` for `v-autocomplete`/`v-select`/`v-list-item`. Never inline untyped `{ title, value }` arrays — extract to a typed constant, named for what the value represents (`fooIds` when each value is a foo id).
- **Never specify `item-title`/`item-value`** — Vuetify's defaults match `SelectItemCategoryDefinition`. Source data with different field names is mapped to `{ title, value }` at the call site, never passed raw and compensated for with those props.
- **`clearable` is BANNED on selects** — clearing emits `null`, which violates the no-null convention and fails non-nullable API inputs. Model "no selection / all" as an explicit first item carrying the empty sentinel (`{ title: "All members", value: "" }`, `{ title: "No limit", value: 0 }`) so the ref stays a plain inferred `ref("")`/`ref(0)` and the sentinel propagates end-to-end (see the typescript skill's sentinel section).
- **Prefer enum values as display titles** — set `title` to the enum member itself so key and value stay the same string, updating the enum's string value to the intended label rather than inventing a separate title.
- **`v-list-item` icon placement** — `prepend-icon` for decorative/category icons, `append-icon` for action/severity icons (e.g. moderation actions). Action icon colour/value come from the relevant `Foo*Map` constants — never hardcoded inline.

## Forms

- Name a form validity ref `isEditFormValid`, bind it via `v-model` on `<v-form>`, and init `ref(true)` (optimistic). Prevent invalid submission through validation rules so state stays consistent, rather than catching in the submit handler (see the `error-handling` skill).
- **`StyledFormDialog` consumers never pass `!isEditFormValid`** — it merges form validity, `isSubmitting`, `type="submit"`, `form` and `loading` into the confirm button internally, so `confirmButtonAttrs` carries only the consumer's own extra condition. **`StyledEditFormDialog` has no `confirmButtonAttrs` at all.**
- Use the auto-imported `useVRules()` — declare `const rules = useVRules();` at the top of `<script setup>` with the other composables, then reference builders: `:rules="[rules.required(), rules.maxLength(100)]"`. One-off inline arrow rules in the template are fine; extract to script only when shared or unwieldy.
- **A built-in alias first, always** (`required`, `maxLength`, `minLength`, `email`, `pattern`, `notEmpty`, …) — never reimplement one or its message, including as a rule that surfaces a server Zod schema's issue text. A custom alias is earned only where no built-in covers the check, and is then named and worded in Vuetify's own voice (`minValue` beside `minLength`) as a literal: routing it through the locale forces the whole `en` locale to be merged eagerly, which the app has no use for while i18n is deferred. The `required` HTML attribute is not a Vuetify prop — use `:rules="[rules.required()]"`.
- Rules validate **what is submitted, not what was typed** — when the sent value is composed from the field (markup wrapper, appended link/suffix), the rule checks the composed value's constraint, even though `counter` still tracks the raw input.
- Rules depending on reactive component state (uniqueness against a live list) are **not** global aliases — they belong in a composable, or an Ajv keyword when the form is Vjsf. See the `vue-composable-patterns` skill's "Validation Rules — Pick the Right Layer".

## Snackbars

- **A snackbar reporting standing state takes `SNACKBAR_PERSISTENT_TIMEOUT`** (`@/services/vuetify/constants`) — an error waiting to be read, a list scrolled away from the present. Vuetify's default timeout retracts the message while what it reports is still true, and with a one-way `:model-value` binding nothing brings it back until the value flips. A timeout belongs only to a snackbar announcing something that happened.

## A Dialog Born Open Waits for Its Mount

`StyledDialog` gates its own model on `useMounted()`, so consumers pass their open state straight through. A **raw `v-dialog` rendered open on its first render** — one a page's async setup decides, or one that _is_ the page — owes the same gate: `:model-value="isMounted"`. Vuetify's block scroll strategy reads the overlay's root element on a timeout after it activates, and a navigation renders the incoming page inside a suspense that has not mounted one yet, so the strategy dereferences `undefined` and the whole page render goes with it (still unguarded upstream at 4.2.0).

## HTML Footprint

**Prefer Vuetify components over raw HTML** — avoid `<div>`, `<span>`, `<p>`, `<ul>`, `<li>` unless there is genuinely no suitable component: `v-container`/`v-row`/`v-col` for layout, `v-list`/`v-list-item` for lists (the `#append` slot centers inline actions), `v-alert`/`v-messages` for inline text. Only reach for raw HTML when Vuetify would add unnecessary complexity (a single unstyled text node inside a slot).

## No SASS Variables in Component Styles

**Never use Vuetify SASS variables (`$border-width-root` etc.) in component `<style>` blocks** — they are build-time variables requiring `additionalData` injection, which conflicts with Vuetify's compilation pipeline. Shared values are CSS custom properties in the `:root` block in `globals.scss`; use `var(--name)`.

The goal is always attributify: prefer inline UnoCSS utilities and delete the style block (`<div b-1 b-border top="[var(--app-bar-height)]" />`). The `var(...)` form is for the cases where a block is genuinely required — which ones those are, and when `lang="scss"` is earned, is the `styling` skill's.

## Deep Dives

- `references/form-dialogs-and-rules.md` — when wiring a form dialog or inline form's validity/error icon, choosing between a built-in rule and a custom one, or adding a custom global validation rule and wording its message.
- `references/select-item-construction.md` — when building the items constant for a select, list or menu from an enum or map.
- `references/css-custom-properties.md` — when a component genuinely needs a `<style>` block and a shared value in it.
- `references/scrollspy-sub-nav.md` — when a Vuetify sidebar must track which section is scrolled into view.
- `references/nested-activators.md` — when one control activates two or more overlays and no primitive covers the stack.
- `references/button-backgrounds.md` — when a button's fill is not what you expected, or a container has turned it transparent.
- `references/router-driven-highlighting.md` — when binding `to` on a button or tab, or the wrong tab is lit.
- `references/styled-primitives.md` — when building a keyboard-navigable list, rendering a user's avatar, or reaching for a shared wrapper around a tooltip and a text button.
