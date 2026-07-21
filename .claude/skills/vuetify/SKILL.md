---
name: vuetify
description: Esposter Vuetify 4 conventions — StyledButton for primary actions, :to never inside :button-props, v-prefixed auto-imported composables (useVDisplay/useVTheme), global defaults never repeated, v-btn tooltips, mergeProps for nested activators, typed SelectItemCategoryDefinition for selects/lists/menus (clearable banned), enum-value-as-display-title, dialog form validity (StyledFormDialog vs StyledEditFormDialog), StyledList, useVRules form validation, StyledAvatar, CSS custom properties over SASS variables, and scrollspy sub-nav. Apply when writing or reviewing Vuetify components, dialogs, selects, forms, or lists.
---

# Vuetify Conventions

## Primary Buttons

Use `StyledButton` for every confirm / complete / primary call-to-action button (create, save, accept, publish, request, start). **Never use a raw `color="primary"` `v-btn`** — the global `VBtn` default has a transparent background, so a primary-coloured button reads badly on the app's transparent / `v-main` base; `StyledButton` renders the midnight-bloom gradient + white text instead.

- Pass Vuetify props through `:button-props="{ ... }"` (camelCase — e.g. `{ prependIcon: 'mdi-plus', disabled: !isValid, loading: isSubmitting }`). For navigation put `:to="RoutePath.X"` on the `<StyledButton>` (it falls through to the root `v-btn`) — never a `to` inside `buttonProps`.
- `type` is a **native attribute, not a typed `VBtn` prop** — put `type="submit"` directly on `<StyledButton>` (it falls through to the root `v-btn`), never inside `buttonProps` (which fails typecheck).
- `@click` and other native listeners also fall through to the root `v-btn`.
- Destructive confirms stay a `color="error"` `v-btn` (error red is visible on the transparent base) — `StyledButton` is for positive/primary actions only.

### `StyledTooltipIconButton` shape — `isIconButton`

Vuetify's `icon` prop on `v-btn` doesn't just place an icon — it switches the button to the icon-button variant: **circular, equal width/height, no min-width**. `StyledTooltipIconButton` passes `:icon` by default, so converting a regular `<v-tooltip>` + `<v-btn>` (icon as a `<v-icon>` child, rectangular shape) to it silently turns the button into a circle. When the rectangular default-button shape is intended, pass `:is-icon-button="false"` — the component then renders a regular `v-btn` with the icon as a child. `rounded`/`tile` in `buttonProps` cannot restore the rectangle (they only change corners, not the forced square dimensions).

## Navigation — Never `to` Inside `:button-props`

Link choice (`:to` vs `@click="navigateTo(...)"`), the raw-`<a>` ban, `RoutePath` targets, and imperative navigation are the **routing** skill's. Vuetify-specific: put `:to`/`@click` directly on the wrapper — `StyledButton` / `StyledTooltipIconButton` fall them through to the root `v-btn`. Never pass `to` inside `:button-props`.

## Auto-Imported Composables — `v` Prefix

Vuetify composables are auto-imported with a `v` prefix. **Never import from `"vuetify"` directly** — they are globally available:

```typescript
// auto-imported with v prefix — never import { useDisplay } from "vuetify"
const { smAndDown } = useVDisplay();
```

Common: `useVDisplay()`, `useVTheme()`, `useVLocale()`, `useVDate()`.

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
| `VBtn`          | `flat`, transparent background |
| `VDialog`       | `maxWidth="100%"`, `width=500` |
| `VTooltip`      | `location="top"`               |

## Button Conventions

- **Every icon-only `v-btn` must have a `v-tooltip`** — wrap with `v-tooltip` + descriptive `text` so the action is discoverable. A button with **visible label text** (`text="Remove"` or default-slot text) is self-describing and does **not** need a tooltip.
- **`#activator` slot always first** in `v-tooltip` (and `v-menu`).
- **Icon choice for create actions** — use the semantically specific MDI icon when available: `mdi-table-row-plus-after` (add rows), `mdi-table-column-plus-after` (add columns). Fall back to `mdi-plus` for generic create.

```vue
<v-tooltip text="Descriptive action">
  <template #activator="{ props: tooltipProps }">
    <v-btn icon="mdi-some-icon" size="small" tile :="tooltipProps" @click="doSomething()" />
  </template>
</v-tooltip>
```

## Nested Activators — `mergeProps`, Never Stacked `v-bind`

When one button is the activator for **multiple** overlays (a `v-menu`/`v-dialog`/`v-hover` _and_ a `v-tooltip`), each overlay's `#activator` slot hands you its own props object. Combine them with `mergeProps(...)` from `vue` on a single `:=` — **never stack two `:=` binds** (`:="menuProps" :="tooltipProps"`). A second `v-bind` of the same key silently overrides the first, so the loser's `onClick` / `onMouseenter` / `class` is dropped; `mergeProps` chains event handlers and concatenates `class`/`style` instead.

**Order: structural/outer activator(s) first, tooltip last** — e.g. `mergeProps(menuProps, tooltipProps)`, `mergeProps(dialogProps, tooltipProps)`, `mergeProps(hoverProps, tooltipProps)`, or three-way `mergeProps(tooltipActivatorProps, hoverProps, buttonProps)`.

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

**A custom dialog/menu button that exposes an `#activator` slot should merge its own tooltip into the slot props** so consumers don't have to:

```vue
<v-dialog>
  <template #activator="{ props: dialogProps }">
    <v-tooltip text="Settings">
      <template #activator="{ props: tooltipProps }">
        <slot name="activator" :="mergeProps(dialogProps, tooltipProps)" />
      </template>
    </v-tooltip>
  </template>
</v-dialog>
```

Consumers then bind the slot scope directly (`:="activatorProps"`) — **do not** wrap such an activator in a second `v-tooltip`; it already has one.

## Icon Buttons Inside Input Slots

When placing a `v-btn` inside a `v-text-field` slot (e.g. `#append-inner`), use `variant="plain"` and omit `color`. The global `VBtn` default sets `style: { backgroundColor: "transparent" }` inline, which `variant="flat"` + `color="primary"` cannot override. `variant="plain"` works with the transparent default and lets the icon inherit the surrounding text color.

```vue
<!-- CORRECT — plain variant works with the transparent default -->
<v-tooltip text="Add item">
  <template #activator="{ props: tooltipProps }">
    <v-btn icon="mdi-plus" variant="plain" :="tooltipProps" @click="submit()" />
  </template>
</v-tooltip>
```

## Vuetify Selects and List Items

- **`v-list-item` icon placement** — `prepend-icon` for decorative/category icons (before the title); `append-icon` for action/severity icons (after, e.g. moderation actions). Action icon color/value come from the relevant `AdminAction*Map` constants — never hardcode inline.
- **Type items as `SelectItemCategoryDefinition<T>[]`** (`{ title: string, value: T }`) from `@/models/vuetify/SelectItemCategoryDefinition` for `v-autocomplete`/`v-select`/`v-list-item`. Never inline untyped `{ title, value }` arrays — extract to a typed constant.
- **Never specify `item-title`/`item-value`** — Vuetify defaults (`"title"`, `"value"`) match `SelectItemCategoryDefinition`. If source data has different field names, map it to `{ title, value }` at the call site — never pass the raw shape and compensate with `item-title`/`item-value`.

  ```typescript
  // CORRECT — map to SelectItemCategoryDefinition<T> so no extra props needed
  const categoryItems = computed<SelectItemCategoryDefinition<string>[]>(() => [
    { title: "None", value: "" },
    ...categories.value.map(({ id, name }) => ({ title: name, value: id })),
  ]);
  // <v-select :items="categoryItems" />
  ```

- **`clearable` is BANNED on selects** — clearing emits `null`, which violates the no-null convention and fails non-nullable API inputs. Model "no selection / all" as an explicit first item carrying the empty sentinel (`{ title: "All members", value: "" }`, `{ title: "No limit", value: 0 }`) so the ref stays a plain inferred `ref("")`/`ref(0)` and the sentinel propagates end-to-end (see the typescript skill's sentinel section).

- Name the items constant to reflect what the value represents — e.g. `columnIds` for `SelectItemCategoryDefinition<string>[]` where each value is a column ID.
- **Prefer enum values as display titles** — set `title` to the enum member itself (`title: SomeEnum.Foo`) so key and value stay the same string. Update enum string values to match the intended label when reasonable, rather than inventing a separate title.

  Pick the construction by what each item carries:

  | Shape                                     | Construction                                                                      | Canonical example                             |
  | ----------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------- |
  | Enum value as title + extra fields (icon) | `as const satisfies Record<Enum, …>` map + `parseDictionaryToArray(Map, "value")` | `DataSourceTypeItemCategoryDefinitions`       |
  | Custom titles / an empty-sentinel item    | plain `SelectItemCategoryDefinition<T>[]` array literal                           | `BooleanFilterValueItemCategoryDefinitions`   |
  | Enum value needing display formatting     | `Object.values(Enum).map(...)` through `prettify()`                               | `StringTransformationItemCategoryDefinitions` |

## Dialog Form Validity

Two different components — don't wire them the same way.

**`StyledFormDialog`** owns its own `isEditFormValid` and `isSubmitting` and merges them into the confirm button internally (`disabled: Boolean(confirmButtonAttrs.disabled) || !isEditFormValid || isSubmitting`), along with `type="submit"`, `form`, and `loading`. So consumers **never** pass `!isEditFormValid` — `confirmButtonAttrs` carries only the consumer's **own** extra condition, if any:

```vue
<!-- only the consumer's own condition; form validity + submitting are already handled -->
<StyledFormDialog :confirm-button-attrs="{ disabled: selectedUserIds.length === 0 }" />
```

**`StyledEditFormDialog`** (the Save & Close family) has **no** `confirmButtonAttrs` at all — it takes `editedItem`, `schema`, `isDirty`, `isEditFormValid`, `isSavable`, `name`, `originalItem?`, and owns its save button (`EditFormDialog/SaveButton.vue`).

Name a form validity ref `isEditFormValid`, bind via `v-model` on `<v-form>`, init `ref(true)` (optimistic). Prevent invalid submission through validation rules so state stays consistent, rather than catching in the submit handler (error handling — see the `error-handling` skill).

Use `StyledEditFormDialogErrorIcon` with `:edit-form :is-edit-form-valid` (plus optional `:schema :edited-value` for Zod validation). `editForm` is a required prop typed `InstanceType<typeof VForm> | undefined` (always passed; `| undefined` reflects the ref being uninitialized before mount). `isEditFormValid` is field-level only (from `<v-form v-model>`); schema errors are computed internally inside `StyledEditFormDialogErrorIcon`.

## Inline Form Error Display (non-dialog)

For inline forms (slash command params, embedded editors) where inline validation errors would break the layout:

- Add `hide-details` to all `v-text-field`/`v-textarea` inputs.
- Show `StyledEditFormDialogErrorIcon` in the form's header row instead.
- Name locals to match prop names so `:edit-form :is-edit-form-valid` shorthands work.
- Ref the error icon to gate submit via `errorIcon.value?.isValid`.

```vue
<script setup lang="ts">
const editForm = useTemplateRef<InstanceType<typeof VForm>>("editForm");
const isEditFormValid = ref(true);
const errorIcon = useTemplateRef<InstanceType<typeof StyledEditFormDialogErrorIcon>>("errorIcon");
const disabled = computed(() => !(errorIcon.value?.isValid ?? true));
</script>

<div flex items-center gap-2>
  <StyledEditFormDialogErrorIcon ref="errorIcon" :edit-form :is-edit-form-valid />
</div>
<v-form ref="editForm" v-model="isEditFormValid">
  <v-text-field :rules="[rules.required()]" hide-details ... />
</v-form>
```

## Keyboard-Navigable Lists (StyledList)

Use `<StyledList>` instead of `<v-list>` whenever a list supports arrow-key navigation. It accepts `:selected-index` and auto smooth-scrolls to the active item:

```vue
<StyledList :selected-index="selectedIndex" :list-props="{ density: 'compact' }">
  <v-list-item v-for="..." :active="selectedIndex === index" ... />
</StyledList>
```

- Never replicate `watch(selectedIndex) → scrollIntoView` manually — delegate to `StyledList`.
- Props: `selectedIndex?: number`, `listProps?: VList["$props"]`, `listAttrs?: VList["$attrs"]`.
- Scroll uses `{ behavior: 'smooth', block: 'nearest' }` — only when item is out of view.

## Form Validation Rules

- Use the auto-imported `useVRules()` composable (Vuetify's rules plugin; `prefixComposables: true` renames `useRules` → `useVRules`). Declare `const rules = useVRules();` at the top of `<script setup>` with the other composables, then reference rules as builders: `:rules="[rules.required(), rules.maxLength(100)]"`. One-off inline arrow rules in the template are fine (same convention as inline event handlers); extract to script only when a rule is shared or the expression gets unwieldy.
- Rules validate **what is submitted, not what was typed**: when the sent value is composed from the field (markup wrapper, appended link/suffix), the rule checks the composed value's constraint — the field's `counter` may still track the raw input.
- Built-in aliases (`required`, `maxLength`, `minLength`, `email`, `pattern`, …) come from Vuetify — don't reimplement them; their default messages live in Vuetify's locale (e.g. `required` → "This field is required", `maxLength` → "You must enter a maximum of {0} characters").
- Custom stateless/parameterized rules live in `app/rules.config.ts` (wired via `vuetify.moduleOptions.rulesConfiguration.configFile`). Add new global rules there as `aliases` builders (`(err) => (value) => …` or `(options, err) => (value) => …`, threading `err` for a caller-supplied message), end the file with `satisfies RulesOptions`, then call `rules.<name>(...)`.
- Declare each custom alias's type in `app/types/vuetify.d.ts` so it gets autocomplete + option-type checking — use Vuetify's canonical builder helpers, not hand-rolled signatures:

```ts
import type { ValidationRuleBuilderWithOptions, ValidationRuleBuilderWithoutOptions } from "vuetify/labs/rules";

declare module "vuetify/labs/rules" {
  interface RuleAliases {
    myRule: ValidationRuleBuilderWithoutOptions; // (err?) => ValidationRule
    myRuleWithOption: ValidationRuleBuilderWithOptions<number>; // (option, err?) => ValidationRule
  }
}
```

- Rules depending on reactive component state (e.g. uniqueness against a live list) are **not** global aliases — they belong in a composable, or an Ajv keyword when the form is Vjsf. See the `vue-composable-patterns` skill's "Validation Rules — Pick the Right Layer".
- The `required` HTML attribute is not a Vuetify prop — use `:rules="[rules.required()]"`.

## HTML Footprint

- **Prefer Vuetify components over raw HTML** — avoid `<div>`, `<span>`, `<p>`, `<ul>`, `<li>` unless there is genuinely no suitable Vuetify component. Use `v-container`/`v-row`/`v-col` for layout, `v-list`/`v-list-item` for lists (the `#append` slot centers inline actions), `v-alert`/`v-messages` for inline text.
- Only reach for raw HTML when Vuetify would add unnecessary complexity (e.g. a single unstyled text node inside a slot).

## User Avatars

- **Always use `<StyledAvatar>`** — never inline `v-avatar` + `v-img` + fallback `<span>`. It handles image/fallback internally (shows `v-img` when `image` is set, falls back to `StyledDefaultAvatar`).
- Props: `image?: User["image"]`, `name: User["name"]`, `avatarProps?: VAvatar["$props"]`, `avatarAttrs?: VAvatar["$attrs"]` — the two are combined with `mergeProps(avatarAttrs, avatarProps)` onto whichever root renders, so pass activator/tooltip slot props through `avatarAttrs` (see Nested Activators above).

```vue
<StyledAvatar mr-3 :image="user.image" :name="user.name" :avatar-props="{ size: '2.25rem' }" />
```

## CSS Custom Properties — No SASS Variables in Component Styles

**Never use Vuetify SASS variables (`$border-width-root` etc.) in component `<style>` blocks.** These are build-time SASS variables requiring `additionalData` injection, which conflicts with Vuetify's compilation pipeline. All shared values live as CSS custom properties in the `:root` block in `globals.scss`; use `var(--name)`.

| Purpose                       | CSS custom property          | Value                                               |
| ----------------------------- | ---------------------------- | --------------------------------------------------- |
| App bar height                | `--app-bar-height`           | `56px`                                              |
| Vuetify avatar width          | `--avatar-width`             | `40px`                                              |
| Vuetify border width          | `--border-width`             | `thin`                                              |
| Vuetify border style          | `--border-style`             | `solid`                                             |
| Vuetify border radius         | `--border-radius`            | `4px`                                               |
| Vuetify transition speed      | `--transition-duration`      | `0.3s`                                              |
| Vuetify move transition speed | `--transition-move-duration` | `0.5s`                                              |
| Vue gradient                  | `--vue-gradient`             | `linear-gradient(45deg, #42d392 25%, #647eff)`      |
| Midnight bloom                | `--midnight-bloom`           | `linear-gradient(-20deg, #2b5876 0%, #4e4376 100%)` |

The goal is always attributify. Prefer inline UnoCSS utilities and delete the style block:

```vue
<!-- WRONG — SASS variable, requires additionalData injection -->
<style scoped lang="scss">
.panel {
  border: $border-width-root $border-style-root v-bind(border);
  top: $app-bar-height;
}
</style>
<!-- ALSO WRONG — scoped CSS class when attributify can do this directly -->
<style scoped>
.panel {
  border: var(--border-width) var(--border-style) v-bind(border);
  top: var(--app-bar-height);
}
</style>
<!-- CORRECT — attributify; no style block needed -->
<div b-1 b-border top="[var(--app-bar-height)]" />
```

The CSS custom-property form (`var(--border-width)`) is only acceptable when a style block is genuinely required (`:deep()` selectors, `@keyframes`, element selectors). Only add `lang="scss"` for SCSS-specific features (`@mixin`/`@include`, `#{...}` interpolation) — simple styles with `v-bind()` and `:deep()` don't need it.

## Keyboard Shortcut Components

A button and its keyboard shortcut are one component — see the **vue-page-composition** skill (Maximal Component Granularity).

## Scrollspy Sub-Nav (Two-Level List + `useElementVisibility` + `useVGoTo`)

For a settings-style surface where a sidebar tracks the section scrolled into view:

- **Two-level nav** — `v-list` with `:opened="[activeCategory]"` (controlled, so only the active category expands) + `v-list-group` per category. Sub-items render the active category's sections.
- **Scroll tracking — `useElementVisibility` per section, active = topmost visible.** Each section reports its own visibility (`const isVisible = useElementVisibility(sectionRef)`) into a shared `Set` of visible section ids; the active section is the **first in section order that is in the set**. **Do NOT use `v-intersect` / `IntersectionObserver`** — the observer re-fires on _any_ layout change, so an in-content reflow (a warning toggling, a slider expanding) spuriously moves the sidebar highlight. Visibility-driven topmost-selection only changes on real scroll, and needs no `rootMargin` band math or bottom-edge special-casing.
- **Keep the header outside the scroll container**, not `sticky` inside it — a section clipped above the scroll area is then genuinely not visible, so "topmost visible" and `goTo`'s landing position are both header-aware with no offset hack.
- **Click-to-scroll** — `useVGoTo()` (auto-imported, `v` prefix — never `import { useGoTo } from "vuetify"`), scrolling within the panel's scroll container: `goTo(element, { container: '#<scroll-container-id>' })`. Resolve the target with `document.getElementById(id)` so ids may contain spaces (enum values), avoiding selector escaping.
- **Click vs. scrollspy race** — set the active id immediately on click, and guard the visibility watcher with an `isScrollingToSection` flag (true before `await goTo(...)`, false after) so the animated scroll keeps the clicked value.

Section identity comes from a **per-subsection enum** whose values double as titles and DOM ids; a `Record<ParentType, EnumValues[]>` map drives the sidebar sub-items.

### Animated active rail — `StyledSlideIndicator`

For the sliding bar that follows the active item, reuse the generic `StyledSlideIndicator` component (`components/Styled/SlideIndicator.vue`) — don't hand-roll per sidebar. Drop-in contract:

- Place it inside a `position: relative` container (in a `v-list-group`, that's `.v-list-group__items` — set it relative via a scoped `:deep`).
- Give each item `data-slide-indicator-key="<key>"`.
- Pass `:active-key="<activeKey>"`.

It measures the active item's `offsetTop`/`offsetHeight` (so it handles varying item heights) and animates via `transform: translateY`, re-measuring on `activeKey` change and container resize (`useResizeObserver`). Works for any future vertical nav, not just settings.
