---
name: vuetify
description: Esposter Vuetify 4 conventions — v-btn tooltips, typed SelectItemCategoryDefinition for selects/lists/menus, enum-value-as-display-title pattern, dialog form validity, StyledAvatar for user avatars, and keyboard shortcut components. Apply when writing Vuetify components or dialogs.
---

# Vuetify Conventions

## Primary Buttons

Use `StyledButton` for primary call-to-action buttons (create, save, accept, request, start). Pass Vuetify props through `:button-props="{ ... }"` rather than a raw primary `v-btn`.

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
  const categoryItems = computed<SelectItemCategoryDefinition<null | string>[]>(() => [
    { title: "None", value: null },
    ...categories.value.map(({ id, name }) => ({ title: name, value: id })),
  ]);
  // <v-select :items="categoryItems" />
  ```

- Name the items constant to reflect what the value represents — e.g. `columnIds` for `SelectItemCategoryDefinition<string>[]` where each value is a column ID.
- **Prefer enum values as display titles** — when the enum string value IS the label, use `Object.values(EnumType).map((v) => ({ title: v, value: v }))` (`ColumnTypeItemCategoryDefinitions` pattern). When display must differ from the enum value (rare), use `const Map = { ... } as const satisfies Record<Enum, Except<SelectItemCategoryDefinition<Enum>, "value">>` + `parseDictionaryToArray` (`CsvDelimiterItemCategoryDefinitions` pattern). Update enum string values to match the label when reasonable, to keep key and value the same string.

## Dialog Form Validity

Name the form validity ref `isEditFormValid`; bind via `v-model` on `<v-form>`, init `ref(true)` (optimistic). Disable Save & Close via `:confirm-button-attrs="{ disabled: !isEditFormValid }"`. Never use try/catch in submit handlers — prevent invalid submission through validation rules so state stays consistent. Use `StyledEditFormDialogErrorIcon` with `:edit-form :is-edit-form-valid` (plus optional `:schema :edited-value` for Zod validation). `editForm` is a required prop typed `InstanceType<typeof VForm> | undefined` (always passed; `| undefined` reflects the ref being uninitialized before mount). `isEditFormValid` is field-level only (from `<v-form v-model>`); schema errors are computed internally inside `StyledEditFormDialogErrorIcon`.

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

- Use the auto-imported `useVRules()` composable (Vuetify's rules plugin; `prefixComposables: true` renames `useRules` → `useVRules`). Declare `const rules = useVRules();` at the top of `<script setup>` with the other composables, then reference rules as builders: `:rules="[rules.required(), rules.maxLength(100)]"`. Never inline arrow-function rules in templates (the linter strips them).
- Built-in aliases (`required`, `maxLength`, `minLength`, `email`, `pattern`, …) come from Vuetify — don't reimplement them; their default messages live in Vuetify's locale (e.g. `required` → "This field is required", `maxLength` → "You must enter a maximum of {0} characters").
- Custom stateless/parameterized rules live in `app/rules.config.ts` (wired via `vuetify.moduleOptions.rulesConfiguration.configFile`): currently `isNotProfanity`, `requireAtLeastN(n)`, `requireAtMostMaxFileSize`. Add new global rules there as `aliases` builders (`(err) => (value) => …` or `(options, err) => (value) => …`, threading `err` for a caller-supplied message), end the file with `satisfies RulesOptions`, then call `rules.<name>(...)`.
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

- Rules that depend on reactive component state (e.g. uniqueness against a live list) stay component composables instead — see vue-composable-patterns "Extract Duplicate Validation Rules".
- The `required` HTML attribute is not a Vuetify prop — use `:rules="[rules.required()]"`.

## HTML Footprint

- **Prefer Vuetify components over raw HTML** — avoid `<div>`, `<span>`, `<p>`, `<ul>`, `<li>` unless there is genuinely no suitable Vuetify component. Use `v-container`/`v-row`/`v-col` for layout, `v-list`/`v-list-item` for lists (the `#append` slot centers inline actions), `v-alert`/`v-messages` for inline text.
- Only reach for raw HTML when Vuetify would add unnecessary complexity (e.g. a single unstyled text node inside a slot).

## User Avatars

- **Always use `<StyledAvatar>`** — never inline `v-avatar` + `v-img` + fallback `<span>`. It handles image/fallback internally (shows `v-img` when `image` is set, falls back to `StyledDefaultAvatar`).
- Props: `image?: User["image"]`, `name: User["name"]`, `avatarProps?: VAvatar["$props"]`.

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

A button and its keyboard shortcut are one component — see the **vue-component-patterns** skill (Maximal Component Granularity).

## Scrollspy Sub-Nav (Two-Level List + `useElementVisibility` + `useVGoTo`)

For a settings-style surface where a sidebar tracks the section scrolled into view:

- **Two-level nav** — `v-list` with `:opened="[activeCategory]"` (controlled, so only the active category expands) + `v-list-group` per category. Sub-items render the active category's sections.
- **Scroll tracking — `useElementVisibility` per section, active = topmost visible.** Each section reports its own visibility (`const isVisible = useElementVisibility(sectionRef)`) into a shared `Set` of visible section ids; the active section is the **first in section order that is in the set**. When the current section scrolls out of view the next visible one takes over. **Do NOT use `v-intersect` / `IntersectionObserver` for this** — the observer re-fires on _any_ layout change, so clicking a button in the content (a warning toggling, a slider expanding) reflows the page and spuriously moves the sidebar highlight. Visibility-driven topmost-selection only changes on real scroll. It also needs no `rootMargin` band math, no "only on `isIntersecting`" logic, and no bottom-edge special-casing.
- **Keep the panel header _outside_ the scroll container**, not `sticky` inside it. Put it in a fixed bar above the scroll area (a `#header` slot on the shared content shell, which is `flex flex-col` with the scroll `div` as `flex-1`). This is what makes everything else simple: a section clipped above the scroll area is genuinely not visible, so "topmost visible" is the section sitting right under the header (header-aware for free), and `goTo` lands a section's title at the scroll-area top = below the header, with **no offset hack**. A sticky in-flow header overlaps the content and breaks both.
- **Click-to-scroll** — `useVGoTo()` (auto-imported, `v` prefix — never `import { useGoTo } from "vuetify"`). Scroll within the panel's scroll container: `goTo(element, { container: '#<scroll-container-id>' })`. Resolve the target with `document.getElementById(id)` so section ids may contain spaces (enum values), avoiding selector escaping. The container id is still needed for this one reason (`goTo` must know the scroll element — it is not the window).
- **Click vs. scrollspy race** — set the active id immediately on click, and guard the visibility watcher with an `isScrollingToSection` flag (true before `await goTo(...)`, false after) so the animated scroll keeps the clicked value and doesn't flicker the highlight through intermediate sections.

Section identity comes from a **per-subsection enum** whose values double as titles and DOM ids (one enum per panel, e.g. `VoiceSettingsSection`); a `Record<ParentType, EnumValues[]>` map drives the sidebar sub-items. See the esbabbler `specs/user-settings.md` for the concrete wiring.

### Animated active rail — `StyledSlideIndicator`

For the sliding bar that follows the active item, reuse the generic `StyledSlideIndicator` component (`components/Styled/SlideIndicator.vue`) — don't hand-roll per sidebar. Drop-in contract:

- Place it inside a `position: relative` container (in a `v-list-group`, that's `.v-list-group__items` — set it relative via a scoped `:deep`).
- Give each item `data-slide-indicator-key="<key>"`.
- Pass `:active-key="<activeKey>"`.

It measures the active item's `offsetTop`/`offsetHeight` (so it handles varying item heights) and animates via `transform: translateY`, re-measuring on `activeKey` change and container resize (`useResizeObserver`). Works for any future vertical nav, not just settings.
