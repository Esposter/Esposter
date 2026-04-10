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

## Vuetify Selects and List Items

- When building items for `v-autocomplete`, `v-select`, or `v-list-item` (in a `v-menu` / `v-list`), always type them as `SelectItemCategoryDefinition<T>[]` (`{ title: string, value: T }`) from `@/models/vuetify/SelectItemCategoryDefinition`. Never inline untyped `{ title, value }` arrays — always extract to a typed constant.
- **Never specify `item-title` or `item-value` props** — Vuetify's defaults are already `"title"` and `"value"`, which match `SelectItemCategoryDefinition` exactly.
- Name the items constant to reflect what the value represents — e.g. `columnIds` for `SelectItemCategoryDefinition<string>[]` where each `value` is a column ID.
- **Prefer enum values as display titles** — when the enum string value IS the display label, use `Object.values(EnumType).map((v) => ({ title: v, value: v }))` (`ColumnTypeItemCategoryDefinitions` pattern). When the display must differ from the enum value (rare), use a `const Map = { ... } as const satisfies Record<Enum, Except<SelectItemCategoryDefinition<Enum>, "value">>` + `parseDictionaryToArray` (`CsvDelimiterItemCategoryDefinitions` pattern). Update enum string values to match their display label when reasonable, to keep enum key and value the same string.

## Dialog Form Validity

Always name the form validity ref `isEditFormValid`. Bind it via `v-model` on `<v-form>` and use `ref(true)` for optimistic initial state. Disable Save & Close via `:confirm-button-attrs="{ disabled: !isEditFormValid }"` (combined with other conditions as needed). Never use try/catch in submit handlers — prevent invalid submission through form validation rules so state is always consistent. Use `StyledEditFormDialogErrorIcon` with `:edit-form-ref :is-edit-form-valid` (plus optional `:schema :value` for Zod schema validation) in the `#prepend-actions` slot. `editFormRef` is a required prop typed `InstanceType<typeof VForm> | undefined` (always passed; `| undefined` reflects the ref being uninitialized before mount). `isEditFormValid` is field-level only (from `<v-form v-model>`); schema errors are computed internally inside `StyledEditFormDialogErrorIcon` via `watchDeep` on `value`.

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
