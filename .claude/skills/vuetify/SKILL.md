---
name: vuetify
description: Esposter Vuetify 4 conventions — StyledButton for primary actions, button backgrounds (colourless-flat transparency rule, container-provided variant="text" answered with StyledButton/StyledTooltipIconButton rather than variant="elevated"), the isIconButton shape switch, :to and type never inside :button-props, v-prefixed auto-imported composables (useVDisplay/useVTheme), global defaults never repeated, tooltips on icon-only buttons, mergeProps for nested activators, plain-variant buttons inside input slots, typed SelectItemCategoryDefinition items (clearable banned, no item-title/item-value), enum-value-as-display-title, form validity naming and useVRules, StyledList, StyledAvatar, no SASS variables in component styles, plus deep dives on form dialogs and custom validation rules, constructing items arrays from enums and maps, the CSS custom property registry, and scrollspy sub-nav. Apply when writing or reviewing Vuetify components, dialogs, selects, forms, or lists.
---

# Vuetify Conventions

## Primary Buttons

Use `StyledButton` for every confirm / complete / primary call-to-action (create, save, accept, publish, request, start). **Never a raw `color="primary"` `v-btn`** — colourless buttons are transparent by default (see below), so a primary-coloured fill reads badly on the app's transparent / `v-main` base; `StyledButton` renders the midnight-bloom gradient + white text instead. It paints with `background-image`, so it is immune to every background rule and inherited variant below.

- Pass Vuetify props through `:button-props="{ ... }"` (camelCase — `{ prependIcon: 'mdi-plus', disabled: !isValid, loading: isSubmitting }`).
- **`:to`, `type` and native listeners go directly on the wrapper**, never inside `:button-props` — they fall through to the root `v-btn` (`type` is a native attribute, not a typed `VBtn` prop, so `buttonProps` fails typecheck). Link choice, the raw-`<a>` ban and `RoutePath` targets belong to the **routing** skill.
- Destructive confirms stay a `color="error"` `v-btn` — error red is visible on the transparent base, and `StyledButton` is for positive/primary actions only.
- **`StyledTooltipIconButton` passes `:icon` by default**, and Vuetify's `icon` prop switches the button to the icon-button variant: circular, equal width/height, no min-width. Converting a `<v-tooltip>` + rectangular `<v-btn>` to it silently turns the button into a circle — pass `:is-icon-button="false"` to keep the regular button shape with the icon as a child. `rounded`/`tile` cannot restore it; they only change corners, not the forced square dimensions.

## Button Backgrounds — the Two Rules That Decide the Fill

1. `globals.scss` (`@layer vuetify-overrides`) transparentises **colourless** flat buttons only: `.v-btn--flat:not([class*="bg-"])`. A `color` on an `elevated`/`flat` variant emits a `bg-*` class in the later `vuetify-utilities` layer, so that fill survives — never add `bg-transparent` to a colourless button, it is already transparent.
2. **A parent container can override the variant.** `v-card-actions`, `v-toolbar` (so also `StyledPageHeader`), `v-toolbar-items`, `v-banner-actions`, `v-bottom-navigation`, `v-snackbar`, `v-btn-group`, `v-stepper-actions` all `provideDefaults({ VBtn: { variant: … } })` — mostly `"text"`. `variant="text"` routes `color` to the **text**, not the background, so no `bg-*` class is emitted and rule 1 then paints the button transparent.

**Do not fight rule 2 with `variant="elevated"`.** Transparent-on-container is the app's look, and a lone re-elevated button is the odd one out. A filled action inside a container uses a primitive that is immune because it paints with `background-image`:

| Need                              | Use                                              |
| --------------------------------- | ------------------------------------------------ |
| Filled primary action (label)     | `StyledButton`                                   |
| Icon action in a toolbar / header | `StyledTooltipIconButton` (transparent, no fill) |
| Destructive confirm               | `color="error"` `v-btn` — red text, no fill      |

Corollary: `color` on a container-nested `v-btn` only tints text. Never reach for a non-semantic theme colour as a fill (`color="border"` is for borders) — that only ever worked via an explicit `variant="elevated"`.

A **deliberately raised** button (e.g. a raised add action in a page header) is the one case that restates the variant, and it needs **both** halves — `variant="elevated"` to beat the container's `"text"`, and `flat: false` to beat the global `VBtn` `flat` default, since elevation only applies when `variant === "elevated" && !flat`:

```vue
<StyledTooltipIconButton
  icon="mdi-plus"
  :button-props="{ flat: false, variant: 'elevated' }"
  :is-icon-button="false"
  text="Add Foo"
/>
```

## Auto-Imported Composables — `v` Prefix

Vuetify composables are auto-imported with a `v` prefix and are globally available — **never import from `"vuetify"` directly**: `useVDisplay()`, `useVTheme()`, `useVLocale()`, `useVDate()`, `useVGoTo()`, `useVRules()`.

## Global Defaults (vuetify.config.ts)

These variants are set globally and must **never** be repeated on individual components:

| Component       | Default                        |
| --------------- | ------------------------------ |
| `VAutocomplete` | `variant="outlined"`           |
| `VColorInput`   | `variant="outlined"`           |
| `VCombobox`     | `variant="outlined"`           |
| `VFileInput`    | `variant="outlined"`           |
| `VSelect`       | `variant="outlined"`           |
| `VTextarea`     | `variant="outlined"`           |
| `VTextField`    | `variant="outlined"`           |
| `VBtn`          | `flat`                         |
| `VDialog`       | `maxWidth="100%"`, `width=500` |
| `VTooltip`      | `location="top"`               |

## Button Conventions

- **Every icon-only `v-btn` must have a `v-tooltip`** — wrap with `v-tooltip` + descriptive `text` so the action is discoverable. A button with **visible label text** is self-describing and needs none.
- **`#activator` slot always first** in `v-tooltip` (and `v-menu`).
- **Icon choice for create actions** — use the semantically specific MDI icon when available (`mdi-table-row-plus-after`, `mdi-table-column-plus-after`); fall back to `mdi-plus` for generic create.
- **Inside a `v-text-field` slot** (`#append-inner` etc.) use `variant="plain"` and omit `color` — a `variant="flat" color="primary"` button paints a filled block inside the input, where plain stays transparent and inherits the surrounding text colour.

## Nested Activators — `mergeProps`, Never Stacked `v-bind`

When one button is the activator for **multiple** overlays (a `v-menu`/`v-dialog`/`v-hover` _and_ a `v-tooltip`), combine each overlay's slot props with `mergeProps(...)` from `vue` on a single `:=`. **Never stack two `:=` binds** — a second `v-bind` of the same key silently overrides the first, dropping the loser's `onClick`/`onMouseenter`/`class`; `mergeProps` chains handlers and concatenates `class`/`style`.

**Order: structural/outer activator(s) first, tooltip last** — `mergeProps(menuProps, tooltipProps)`, `mergeProps(dialogProps, tooltipProps)`, or three-way `mergeProps(tooltipActivatorProps, hoverProps, buttonProps)`.

```vue
<v-menu>
  <template #activator="{ props: menuProps }">
    <v-tooltip text="Options">
      <template #activator="{ props: tooltipProps }">
        <v-btn icon="mdi-dots-vertical" :="mergeProps(menuProps, tooltipProps)" />
      </template>
    </v-tooltip>
  </template>
</v-menu>
```

A custom dialog/menu button that exposes an `#activator` slot **merges its own tooltip into the slot props** (`<slot name="activator" :="mergeProps(dialogProps, tooltipProps)" />`) so consumers just bind the scope (`:="activatorProps"`) — and consumers must **not** wrap such an activator in a second `v-tooltip`; it already has one.

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
- Built-in aliases (`required`, `maxLength`, `minLength`, `email`, `pattern`, …) come from Vuetify — don't reimplement them or their messages. The `required` HTML attribute is not a Vuetify prop; use `:rules="[rules.required()]"`.
- Rules validate **what is submitted, not what was typed** — when the sent value is composed from the field (markup wrapper, appended link/suffix), the rule checks the composed value's constraint, even though `counter` still tracks the raw input.
- Rules depending on reactive component state (uniqueness against a live list) are **not** global aliases — they belong in a composable, or an Ajv keyword when the form is Vjsf. See the `vue-composable-patterns` skill's "Validation Rules — Pick the Right Layer".

## Keyboard-Navigable Lists (StyledList)

Use `<StyledList>` instead of `<v-list>` whenever a list supports arrow-key navigation — it takes `selectedIndex?: number`, `listProps?: VList["$props"]`, `listAttrs?: VList["$attrs"]` and auto smooth-scrolls to the active item (`{ behavior: 'smooth', block: 'nearest' }`, only when out of view). Never replicate `watch(selectedIndex) → scrollIntoView` manually.

```vue
<StyledList :selected-index="selectedIndex" :list-props="{ density: 'compact' }">
  <v-list-item v-for="..." :active="selectedIndex === index" ... />
</StyledList>
```

## HTML Footprint

**Prefer Vuetify components over raw HTML** — avoid `<div>`, `<span>`, `<p>`, `<ul>`, `<li>` unless there is genuinely no suitable component: `v-container`/`v-row`/`v-col` for layout, `v-list`/`v-list-item` for lists (the `#append` slot centers inline actions), `v-alert`/`v-messages` for inline text. Only reach for raw HTML when Vuetify would add unnecessary complexity (a single unstyled text node inside a slot).

## User Avatars

**Always `<StyledAvatar>`** — never inline `v-avatar` + `v-img` + fallback `<span>`; it shows `v-img` when `image` is set and falls back to `StyledDefaultAvatar`. Props: `image?: User["image"]`, `name: User["name"]`, `avatarProps?: VAvatar["$props"]`, `avatarAttrs?: VAvatar["$attrs"]` — the two are combined with `mergeProps(avatarAttrs, avatarProps)` onto whichever root renders, so activator/tooltip slot props go through `avatarAttrs`.

```vue
<StyledAvatar mr-3 :image="user.image" :name="user.name" :avatar-props="{ size: '2.25rem' }" />
```

## No SASS Variables in Component Styles

**Never use Vuetify SASS variables (`$border-width-root` etc.) in component `<style>` blocks** — they are build-time variables requiring `additionalData` injection, which conflicts with Vuetify's compilation pipeline. Shared values are CSS custom properties in the `:root` block in `globals.scss`; use `var(--name)`.

The goal is always attributify: prefer inline UnoCSS utilities and delete the style block (`<div b-1 b-border top="[var(--app-bar-height)]" />`). The `var(...)` form is only acceptable when a style block is genuinely required (`:deep()` selectors, `@keyframes`, element selectors), and `lang="scss"` only for SCSS-specific features (`@mixin`/`@include`, `#{...}` interpolation) — simple styles with `v-bind()` and `:deep()` don't need it.

## Keyboard Shortcut Components

A button and its keyboard shortcut are one component — see the **vue-page-composition** skill (Maximal Component Granularity).

## Deep Dives

- `references/form-dialogs-and-rules.md` — when wiring a form dialog or inline form's validity/error icon, or adding a custom global validation rule.
- `references/select-item-construction.md` — when building the items constant for a select, list or menu from an enum or map.
- `references/css-custom-properties.md` — when a component genuinely needs a `<style>` block and a shared value in it.
- `references/scrollspy-sub-nav.md` — when a sidebar must track which section is scrolled into view.
