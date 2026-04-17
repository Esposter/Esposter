---
name: vuetify
description: Esposter Vuetify 3 conventions — v-btn tooltips, typed SelectItemCategoryDefinition for selects/lists/menus, enum-value-as-display-title pattern, dialog form validity, StyledAvatar for user avatars, and keyboard shortcut components. Apply when writing Vuetify components or dialogs.
---

# Vuetify Conventions

## Auto-Imported Composables — `v` Prefix

Vuetify composables are auto-imported with a `v` prefix. **Never import them from `"vuetify"` directly** — they are already globally available:

```typescript
// WRONG — explicit import
import { useDisplay } from "vuetify";
const { smAndDown } = useDisplay();

// CORRECT — auto-import with v prefix
const { smAndDown } = useVDisplay();
```

Common composables: `useVDisplay()`, `useVTheme()`, `useVLocale()`, `useVDate()`.

## Global Defaults (vuetify.config.ts)

The following variants are set globally and must **never** be repeated on individual components:

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

- **Every `v-btn` must have a `v-tooltip`** — wrap with `v-tooltip` and a descriptive `text` prop. This applies to all buttons, including those with visible label text.
- Standard pattern:
  ```vue
  <v-tooltip text="Descriptive action">
    <template #activator="{ props: tooltipProps }">
      <v-btn icon="mdi-some-icon" size="small" tile :="tooltipProps" @click="doSomething()" />
    </template>
  </v-tooltip>
  ```
- **`#activator` slot always first** — the `#activator` template must be the first child in `v-tooltip` (and `v-menu`).
- **Icon choice for create actions** — use the semantically specific MDI icon when available: `mdi-table-row-plus-after` for adding rows, `mdi-table-column-plus-after` for adding columns. Fall back to `mdi-plus` for generic create actions.

## Icon Buttons Inside Input Slots

When placing a `v-btn` inside a `v-text-field` slot (e.g. `#append-inner`), use `variant="plain"` and omit `color`. The global `VBtn` default sets `style: { backgroundColor: "transparent" }` as an inline style — `variant="flat"` with `color="primary"` cannot override an inline style. `variant="plain"` works with the transparent default and lets the icon inherit the surrounding text color naturally.

```vue
<!-- WRONG — we default to inline backgroundColor: transparent in vuetify.config.ts for convenience with avatar backgrounds and icons -->
<v-btn color="primary" icon="mdi-plus" @click="submit()" />

<!-- CORRECT — plain variant works with the transparent default -->
<v-btn icon="mdi-plus" variant="plain" @click="submit()" />
```

## Vuetify Selects and List Items

- When building items for `v-autocomplete`, `v-select`, or `v-list-item` (in a `v-menu` / `v-list`), always type them as `SelectItemCategoryDefinition<T>[]` (`{ title: string, value: T }`) from `@/models/vuetify/SelectItemCategoryDefinition`. Never inline untyped `{ title, value }` arrays — always extract to a typed constant.
- **Never specify `item-title` or `item-value` props** — Vuetify's defaults are already `"title"` and `"value"`, which match `SelectItemCategoryDefinition` exactly.
- Name the items constant to reflect what the value represents — e.g. `columnIds` for `SelectItemCategoryDefinition<string>[]` where each `value` is a column ID.
- **Prefer enum values as display titles** — when the enum string value IS the display label, use `Object.values(EnumType).map((v) => ({ title: v, value: v }))` (`ColumnTypeItemCategoryDefinitions` pattern). When the display must differ from the enum value (rare), use a `const Map = { ... } as const satisfies Record<Enum, Except<SelectItemCategoryDefinition<Enum>, "value">>` + `parseDictionaryToArray` (`CsvDelimiterItemCategoryDefinitions` pattern). Update enum string values to match their display label when reasonable, to keep enum key and value the same string.

## Dialog Form Validity

Always name the form validity ref `isEditFormValid`. Bind it via `v-model` on `<v-form>` and use `ref(true)` for optimistic initial state. Disable Save & Close via `:confirm-button-attrs="{ disabled: !isEditFormValid }"` (combined with other conditions as needed). Never use try/catch in submit handlers — prevent invalid submission through form validation rules so state is always consistent. Use `StyledEditFormDialogErrorIcon` with `:edit-form :is-edit-form-valid` (plus optional `:schema :edited-value` for Zod schema validation). `editForm` is a required prop typed `InstanceType<typeof VForm> | undefined` (always passed; `| undefined` reflects the ref being uninitialized before mount). `isEditFormValid` is field-level only (from `<v-form v-model>`); schema errors are computed internally inside `StyledEditFormDialogErrorIcon`.

## Inline Form Error Display (non-dialog)

For inline forms (e.g. slash command params, embedded editors) where showing validation errors inline would break the layout:

- Add `hide-details` to all `v-text-field` / `v-textarea` inputs
- Show `StyledEditFormDialogErrorIcon` in the form's header row instead
- Use `useTemplateRef<InstanceType<typeof VForm>>("formRef")` and `const isFormValid = ref(true)` locally — no store needed
- Pass `:edit-form="formRef ?? undefined" :is-edit-form-valid="isFormValid"` to the error icon

```vue
<!-- Header row with error icon -->
<div flex items-center gap-2>
  <v-icon ... />
  <span>{{ title }}</span>
  <StyledEditFormDialogErrorIcon :edit-form="formRef ?? undefined" :is-edit-form-valid="isFormValid" />
</div>

<!-- Form body with hide-details on all fields -->
<v-form ref="formRef" v-model="isFormValid">
  <v-text-field :rules="[formRules.required]" hide-details ... />
</v-form>
```

## Keyboard-Navigable Lists (StyledList)

Use `<StyledList>` instead of `<v-list>` whenever a list supports arrow-key navigation. `StyledList` accepts a `:selected-index` prop and automatically smooth-scrolls to the active item:

```vue
<StyledList :selected-index="selectedIndex" :list-props="{ density: 'compact' }">
  <v-list-item v-for="..." :active="selectedIndex === index" ... />
</StyledList>
```

- Never replicate the `watch(selectedIndex) → scrollIntoView` logic manually — always delegate to `StyledList`
- Props: `selectedIndex?: number`, `listProps?: VList["$props"]`, `listAttrs?: VList["$attrs"]`
- Scroll uses `{ behavior: 'smooth', block: 'nearest' }` — only scrolls when item is out of view

## Form Validation Rules

- **Always use `formRules` from `@/services/vuetify/formRules`** — never write inline arrow-function rules in templates (the linter strips them). Import and use the pre-defined rules: `[formRules.required]`, `[formRules.isNotProfanity]`, `[formRules.requireAtMostNCharacters(n)]`, `[formRules.requireAtMostMaxFileSize]`.
- Multiple rules combine naturally: `:rules="[formRules.required, formRules.requireAtMostNCharacters(100)]"`
- The `required` HTML attribute is not a Vuetify prop — use `:rules="[formRules.required]"` instead.

## HTML Footprint

- **Prefer Vuetify components over raw HTML elements** — avoid `<div>`, `<span>`, `<p>`, `<ul>`, `<li>`, etc. unless there is genuinely no suitable Vuetify component. Use `v-container` / `v-row` / `v-col` for layout, `v-list` / `v-list-item` for lists (the `#append` slot centers inline actions), and `v-alert` or `v-messages` for inline text messages.
- Only reach for raw HTML when a Vuetify component would add unnecessary complexity (e.g. a single text node inside a slot that needs no styling).

## User Avatars

- **Always use `<StyledAvatar>`** for displaying user avatars — never write inline `v-avatar` + `v-img` + fallback `<span>` combinations.
- `StyledAvatar` handles the image/fallback logic internally (shows `v-img` when `image` is set, falls back to `StyledDefaultAvatar`).
- Props: `image?: User["image"]`, `name: User["name"]`, `avatarProps?: VAvatar["$props"]`

  ```vue
  <!-- CORRECT -->
  <StyledAvatar mr-3 :image="user.image" :name="user.name" :avatar-props="{ size: '2.25rem' }" />

  <!-- WRONG — do not write this inline -->
  <v-avatar :image size="36" mr-3>
    <v-img v-if="image" :src="image" />
    <span v-else>{{ name[0] }}</span>
  </v-avatar>
  ```

## Keyboard Shortcut Components

When a button has an associated keyboard shortcut, extract it into its own component that owns both the `v-btn` and the `onKeyStroke` handler. This keeps each component focused on one action (e.g., `UndoButton.vue`, `RedoButton.vue`).
