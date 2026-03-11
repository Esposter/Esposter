# CLAUDE.md

## Repository Overview

**Project**: Esposter
**Description**: A comprehensive social platform monorepo ("A nice and casual place for posting random things").
**Architecture**: Monorepo using pnpm workspaces and Lerna for package management.
**Language**: TypeScript (Strict Mode)
**Runtime**: Node.js `^24.13.0`
**Package Manager**: pnpm `^10.28.1` (with Catalog protocol)

## Technology Stack

- **Framework**: Nuxt 4
- **UI Library**: Vue 3.5+
- **Build System**: Vite, Rolldown
- **Styling**: UnoCSS (Attributify Mode), Vuetify 3, Sass
- **State Management**: Pinia
- **API**: tRPC, Nuxt Server Routes
- **Database**: Drizzle ORM (PostgreSQL), Azure Table Storage, Azure Blob Storage
- **Server**: Azure Functions (Serverless)
- **Testing**: Vitest
- **Linting**: Oxlint + ESLint

## Monorepo Structure

| Package Path               | Description                                                 |
| :------------------------- | :---------------------------------------------------------- |
| `packages/app`             | Main Nuxt 4 web application (frontend, server routes, tRPC) |
| `packages/azure-functions` | Serverless backend (Azure Event Grid, Timers, HTTP)         |
| `packages/db-schema`       | Source of truth for DB: Drizzle ORM schemas, migrations     |
| `packages/db`              | Database connection logic                                   |
| `packages/shared`          | Shared TypeScript types, utilities, constants               |
| `packages/configuration`   | Shared config (TSConfig, ESLint, Prettier)                  |
| `packages/vue-phaserjs`    | Phaser game engine Vue integration                          |
| `packages/azure-mock`      | Mock Azure services for local dev/testing                   |

## Development Workflow

- **Start Dev Server**: `pnpm dev` (root) or `pnpm start`
- **Build All**: `pnpm build`
- **Barrel Files**: `pnpm export:gen` in specific packages (uses `ctix`)
- **DB Migrations**: `pnpm db:gen` then `pnpm db:up` (from `packages/db-schema`)

## Coding Conventions

### TypeScript

- TypeScript compiler: `strict` mode enabled. ESLint: `tseslint.configs.strictTypeChecked`. `any` is **BANNED**.
- `Omit` is **BANNED** — use `Except` from `type-fest`.
- **No parameter properties** — never use `constructor(private readonly foo: T)`. Always declare class properties explicitly and assign in the constructor body: `private readonly foo: T; constructor(foo: T) { super(); this.foo = foo; }`.
- Non-null assertions (`!`) are **BANNED** — use optional chaining or guard clauses.
- `.forEach()` is **BANNED** — use `for...of`.
- Always use named imports from libraries.
- Explicitly type variables with proper types.
- **No `current*` variable caching of `.value`** — don't assign `const currentX = x.value` just to use it once. If TypeScript narrowing is needed after a guard, assign with a descriptive name (`const selectedFile = file.value`). Prefer plain `const` over `computed()` when the source value is already non-reactive (e.g. a `readonly` prop field).

### Control Flow

- **Guard clauses first**: always use `if (!condition) return` to exit early instead of wrapping the main body in an `if` block. Reduce nesting aggressively — if the body of an `if` is the rest of the function, invert the condition and return early instead.
- **Always use `if/else if/else` from the very first branch** when a function has multiple conditional returns — no standalone `if` followed by `else if`.

### File & Folder Organisation

- **One export per file** — each exported function, class, or interface lives in its own file. Exception: Zod schemas may be co-located with their interface/type since they are tightly coupled.
- **One class per file** — classes belong in a `models/` folder (e.g., `app/models/`, `shared/models/`).
- **Constants go in `constants.ts`** — all module-level constants in a `constants.ts` file under `services/` alongside the files that use them. Never put `constants.ts` inside `composables/`.
- **Constant maps use PascalCase** with `as const satisfies` — e.g. `export const DataSourceConfigurationMap = { ... } as const satisfies Record<...>`.
- **Generic type maps for polymorphic dispatch** — when a constant map needs to associate a discriminant key (e.g. `DataSourceType`) with a type-parameterised generic (e.g. `DataSourceConfiguration<TItem>`), define an explicit type map first, then use a mapped type in `satisfies` to get per-entry type safety without any `as` casts:
  ```typescript
  // 1. Explicit type map (one file, in models/)
  type DataSourceItemTypeMap = { [DataSourceType.Csv]: CsvDataSourceItem };
  // 2. Satisfies mapped type — each entry is checked against its specific type param
  export const DataSourceConfigurationMap: Record<
    DataSourceType,
    DataSourceConfiguration<ADataSourceItem<DataSourceType>>
  > = { ... };
  ```
- **Generic map lookup composables** — when a component needs to look up a typed configuration from a generic map using a discriminant key on a generic item, extract the lookup into a composable. Use `MaybeRefOrGetter<TItem>` with `toValue()` so callers can pass refs or plain values. Hide the single internal `as` cast and expose a fully typed API:
  ```typescript
  export const useDataSourceConfiguration = <
    TDataSourceItem extends DataSourceItemTypeMap[keyof DataSourceItemTypeMap],
  >(
    item: MaybeRefOrGetter<TDataSourceItem>,
  ): ComputedRef<DataSourceConfiguration<TDataSourceItem>> =>
    computed(() => DataSourceConfigurationMap[toValue(item).type] as DataSourceConfiguration<TDataSourceItem>);
  // Caller (no cast needed):
  const dataSourceConfiguration = useDataSourceConfiguration(modelValue);
  ```
- **Zod imports** — always use the `z` export: `z.ZodType`, `z.ZodError`, etc. Never use named imports like `import type { ZodType }`.
- **Zod `.default()`** — do not combine `.optional().default(value)`; `.default()` already handles `undefined` input, so `.optional()` is redundant.
- **Generic Zod schemas** — when an abstract class has a generic type parameter (e.g. `ADataSourceItem<TType, TConfig>`), its schema must also be generic. Export a `create*Schema` function that takes typed zod schemas as parameters and returns the composed schema. Never hardcode type-specific values in a base schema. Use `T` for a single type parameter, descriptive `T*` names (e.g. `TType`, `TConfiguration`) for multiple:
  ```typescript
  // WRONG — hardcodes type, missing configuration
  export const aDataSourceItemSchema = z.object({ ...base.shape, type: dataSourceTypeSchema });
  // CORRECT — generic function, concrete schemas passed by callers
  export const createDataSourceItemSchema = <
    TType extends z.ZodType<keyof DataSourceConfigurationTypeMap>,
    TConfiguration extends z.ZodType<object>,
  >(
    typeSchema: TType,
    configurationSchema: TConfiguration,
  ) => z.object({ ...aTableEditorItemEntitySchema.shape, configuration: configurationSchema, type: typeSchema });
  // Caller:
  export const csvDataSourceItemSchema = createDataSourceItemSchema(
    z.literal(DataSourceType.Csv),
    csvDataSourceConfigurationSchema,
  ) satisfies z.ZodType<ToData<CsvDataSourceItem>>;
  ```
  For the union schema used by parent models (e.g. `TableEditorConfiguration`), create a separate `*ItemSchema.ts` file using `z.discriminatedUnion`:
  ```typescript
  // DataSourceItemSchema.ts
  export const dataSourceItemSchema = z.discriminatedUnion("type", [csvDataSourceItemSchema]);
  ```
  Adding a new type = add its schema to the discriminated union array.
- **Generic Vue components** — use `<script setup lang="ts" generic="T extends SomeBase">` to make components type-safe over a specific subtype. Pass the typed value AND its associated generic config/interface as props so the parent resolves the concrete types and the child stays fully typed without lookups or casts:
  ```vue
  <!-- Parent (knows concrete type): -->
  <FilePicker :item="modelValue" :configuration="DataSourceConfigurationMap[DataSourceType.Csv]" />
  <!-- Child: -->
  <script setup lang="ts" generic="TDataSourceItem extends ADataSourceItem<DataSourceType>">
  interface FilePickerProps {
    configuration: DataSourceConfiguration<TDataSourceItem>;
    item: TDataSourceItem;
  }
  </script>
  ```
- **Generic browser utilities** go in `app/utils/` (e.g., `readFileAsText.ts`).
- **Feature folders**: related models/services/components are grouped under a feature subfolder (e.g., `tableEditor/file/`).
- **Functions go in `services/`** — factory functions, command creators, and other exported functions belong in `services/`, not `models/`. `models/` is strictly for classes and interfaces/types.
- **Command Pattern** — use factory functions returning plain objects with `execute`/`undo` arrow properties instead of classes. Interfaces for command contracts go in `models/`; factory functions go in `services/` (e.g., `services/tableEditor/file/commands/createDeleteRowCommand.ts`).
- **Boolean computed naming** — use `is*` prefix for boolean computed refs (e.g., `isUndoable`, `isRedoable`, `isSavable`). Do not use `can*`.
- **Single-responsibility keyboard shortcut components** — when a button has an associated keyboard shortcut, extract it into its own component that owns both the `v-btn` and the `onKeyStroke` handler. This keeps each component focused on one action (e.g., `UndoButton.vue`, `RedoButton.vue`).

### Helper Functions

- **Don't extract helpers that add no value** — if a helper function just wraps an inline object literal or a single expression without reuse or meaningful abstraction, return/use the value directly. Three lines of inline code is better than a named wrapper used once.

### Inline Functions

- **Inline arrow functions** where argument types can be inferred from context — don't extract single-use, trivially-typed lambdas into named functions.
- **Inline Vue event handlers** — always write handlers directly in the template (`@submit="async (_, onComplete) => { ... }"`). This lets Vue infer event argument types automatically. Only extract to a named function if the same logic is reused in multiple places.
- **`defineModel`**: don't pass `{ default: false }` for booleans — omit the options entirely (`defineModel<boolean>()`).
- **`defineSlots`**: always assign to a variable — `const slots = defineSlots<{ ... }>()`.
- **No abbreviated parameter names** — use full descriptive names (e.g. `event` not `e`, `column` not `col`, `configuration` not `config`, `dataSource` not `source`). Exception: simple iteration callbacks where the meaning is obvious from context (e.g. `.filter((row, index) => ...)`).
- **Destructure event parameters** — when only specific properties of an event are needed, destructure them directly in the parameter list instead of accessing via `event.property` repeatedly: `({ ctrlKey, metaKey, preventDefault }) => { ... }` not `(event) => { event.ctrlKey ... }`.
- **`@click` shorthands** — if a click handler is a single async call, use `@click="myAsyncFn(args)"` directly — no need to wrap in `async () => { await myAsyncFn(args) }`.

### Composables

- **Single-function composables return the function directly** — when a composable only exposes one function, return it directly instead of wrapping in an object: `return async (...) => { ... }`. Callers use `const fn = useX()` instead of `const { fn } = useX()`.
- **`Promise.resolve(value)` for sync-to-async** — when a sync expression needs to satisfy a `Promise<T>` return type, use `Promise.resolve(value)` instead of `async () => value`.

### MIME Types

- Store MIME type strings in the relevant configuration map (e.g. `DataSourceConfigurationMap`) rather than calling `mime-types` `lookup` at runtime — `mime-types` uses Node.js `path.extname` which is not available in the browser. Access `mimeType` through the configuration map at the call site.

### Styling (UnoCSS Attributify Mode — MANDATORY)

- Use prop-based styling: `<div text-red p-4>` for ALL static styles.
- Use `flex` not `d-flex`.
- Use `size` attribute (or `width`/`height` props) instead of `w-<n>` / `h-<n>` where possible.
- Only use `class="..."` when technically required (dynamic `:class` bindings, Vuetify-specific typography/colour classes like `text-overline`, `text-medium-emphasis`, `text-wrap`). UnoCSS utilities (spacing, flex, sizing) must always be attributes even when mixed with Vuetify classes: `<div class="text-overline" mb-2>`.

### Line Endings

- All files must use **LF** line endings (`\n`), not CRLF.
- After creating files on Windows, run `sed -i 's/\r$//' <file>` to strip CR.

### Pinia Store Usage

- **Naming**: use the full store name — `const fileTableEditorStore = useFileTableEditorStore()`, not `const store = ...` or abbreviated names.
- **In Vue components**: always destructure, and keep each store's lines grouped together in this order — no mixing across stores:
  1. `const xyzStore = useXyzStore()`
  2. `const { ref1, ref2 } = storeToRefs(xyzStore)` _(omit if no refs/computeds needed)_
  3. `const { method1 } = xyzStore` _(omit if no methods needed)_
  4. _(repeat for next store)_
- Never use dot-access (`store.method()`) in components.
- **Store-to-store** (inside a Pinia store file): declare nested stores at the root of the setup function, access via `store.property` / `store.method()` — do NOT destructure (Pinia requires dot-access for store-to-store to maintain reactivity).

### Vue Hooks

- Always place `watch`, `onMounted`, `onUnmounted`, and other Vue lifecycle hooks/watchers at the **bottom** of `<script setup>`, after all `const` assignments.
- Always put a blank line before them to visually separate them from regular `const` assignments.
- Always wrap the callback in an explicit arrow function — never pass a function reference directly. This avoids scope/binding issues and prevents accidental argument forwarding: `onUnmounted(() => { reset(); })` not `onUnmounted(reset)`.
- This applies everywhere — `.map()`, `.filter()`, `.forEach()`, event handlers, lifecycle hooks, etc. Always use `array.map((item) => fn(item))` not `array.map(fn)`.

### Props Interface Naming

- Always use `interface {ComponentName}Props` (e.g. `interface DialogProps`, `interface EditDialogButtonProps`)
- Always call `defineProps<{ComponentName}Props>()`

### Vue Slot Ordering

- **`#activator` always first** — in components that use both `#activator` and other slots (e.g. `v-tooltip`, `v-menu`), always place the `#activator` template as the first child.

### Vue Directives

- **Always use `:` shorthand** instead of `v-bind:propName` — write `:disabled="..."` not `v-bind:disabled="..."`. The object-spread form `v-bind="object"` has no shorthand and stays as-is.

### Vue / Formatting

- `<script setup lang="ts">` at the top of every SFC.
- Always use `lang="scss"` in Vue `<style>` blocks.
- Use self-closing tags for components/elements without content: `<Component />`.
- No blank lines within Vue templates.
- No blank lines between `const` assignments — group them tightly together.
- No blank line before `return` when it immediately follows a `const` assignment in a small function.
- Remove comments — make variable names descriptive instead.
- Minimise blank lines; group related code tightly.
- **Blank line after a closing `}`** of an `if`, `for`, or other block statement — unless it is the last statement in its scope or is immediately followed by another opening block.

### Resource Management

- Always clean up in `onUnmounted`: intervals, timeouts, animation frames, event listeners.
- Prefer `VueUse` composables over manual event listeners where possible.

### Testing Conventions (Vitest)

- **`describe(functionRef, ...)`** — pass the function reference directly, not a string name.
- **Declare `const` inside `describe`** — all shared test constants (e.g. `HEADER`, reusable values) must be declared inside the `describe` callback scope, not at module level, so they are scoped and cleaned up correctly.
- **`expect.hasAssertions()`** — always include at the top of every test body.
- **Canonical test values** — always use minimal, meaningful values:
  - Boolean: `"true"`, `"false"` — test both together in one test
  - Integer: `"0"` / number `0`
  - Decimal: `"0.1"` / number `0.1`
  - Negative: `"-1"` / number `-1`
  - NaN: `String(Number.NaN)`
  - Date (epoch): `"1970-01-01"` (YYYY-MM-DD); second date: `"1970-01-02"`
  - String: `""` as base value; use `" "` for a different value. Only use `"a"` when a space would be trimmed to `""` (making it identical to base). Never use named strings like `"Alice"` / `"Bob"`.
  - Object keys in tests: use `""` as base key, `" "` as a second key — never use semantic names like `"name"` / `"age"`.
  - Number diff values: `0`, `1`, `2`, etc.
- **Date format tests** — when testing all date formats, use a `for...of` loop inside a single test, converting epoch via `dayjs("1970-01-01", "YYYY-MM-DD", true).format(format)`. Never use `test.each` for date format iteration.
- **Interpolated descriptions** — use template literals with enum values: `` `boolean returns ${ColumnType.Boolean}` ``.
- **Human-readable names** — use plain English: "integer", "decimal", "negative", "epoch date", "NaN".

### CRUD Store Patterns

Follow `createOperationData` conventions exactly when writing store update/delete methods:

- **update**: `findIndex` first, guard `if (index === -1) return`, then mutate in place with `Object.assign(takeOne(items.value, index), updatedItem)`.
- **delete**: reassign the array — `items.value = items.value.filter(...)` — never `splice`.
- Always guard against a missing parent ref before any operation: `if (!parentRef.value) return`.
