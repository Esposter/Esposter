---
name: file-organization
description: Esposter file and folder organisation — one export per file, no export{} syntax, models vs services vs constants, command pattern field ordering, constant maps with as-const-satisfies, generic Vue components, MIME types, and LF line endings.
---

# File & Folder Organisation

## Imports

- **Always use alias imports** — never use relative imports (`./`, `../`), even for files in the same folder.
  - `#shared/` — shared package (`packages/app/app/shared/`). Use for shared models, services, and constants. Example: `import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor"`.
  - `@@/` — project root (`packages/app/`). Use for `server/` and other root-level paths. Example: `import { withAsyncIterator } from "@@/server/trpc/routers/withAsyncIterator.test"`.
  - `@/` — app source dir (`packages/app/app/`). Use for `composables/`, `components/`, `store/`, `services/`, etc. Example: `import { ... } from "@/composables/tableEditor/file/useEditedItemDataSourceOperations/testUtils"`.
  - Never use `~~/` (old Nuxt alias) — replace with `@@/`.

## Files and Exports

- **One export per file** — each exported function, class, or interface lives in its own file. Exception: Zod schemas may be co-located with their interface/type since they are tightly coupled.
- **Co-locate single-use event/hook map types** — when an event/hook map interface (e.g. `AdminActionHookMap`, `MessageHookMap`, `TableEditorHookMap`) is imported only by its own service file (which creates the singleton instance), define the interface directly in the service file rather than in a separate `models/` file. The service exports the instance; consumers import the instance, not the type. Do **not** apply this to general type maps (`ColumnTypeColumnMap`, `DataSourceConfigurationTypeMap`, etc.) — those stay in `models/` regardless of consumer count.
- **Interfaces go in `models/`** — never define an exported interface inline inside a `.vue` component. Extract it to `app/models/<feature>/InterfaceName.ts` (app-local) or `shared/models/<feature>/InterfaceName.ts` (cross-package). This makes it reusable (e.g. a Vjsf context interface shared between create and edit dialogs lives in `app/models/tableEditor/file/column/ColumnFormVjsfContext.ts`, not inside either component).
- **One class per file** — classes belong in a `models/` folder (e.g., `app/models/`, `shared/models/`).
- **Never use `export { }` syntax** — always use `export const`, `export class`, `export interface`, `export type`, or `export function` at the declaration site. The only valid exceptions are empty `export {}` in `.d.ts` files (to mark them as a module) and `ctix`-generated barrel files (pinned package). If you see `export { ... }` in a hand-written `.ts` file, it is wrong — inline the `export` keyword at each declaration instead.
- **Constants go in `constants.ts`** — all module-level constants in a `constants.ts` file under `services/` alongside the files that use them. Never put `constants.ts` inside `composables/`.
- **Default option objects** are constants: export one shared `DEFAULT_*` object from the feature's `services/.../constants.ts` and reuse it everywhere. Use `Object.freeze({ ... } satisfies InterfaceName)` for object defaults so callers cannot mutate the shared default.
- **Functions go in `services/`** — factory functions, command creators, and other exported functions belong in `services/`, not `models/`. `models/` is strictly for classes and interfaces/types.
- **External library extensions go in `services/`** — helpers that extend or wrap third-party libraries (e.g. `services/zod/extractSchemaFields.ts`, `services/dayjs/index.ts`) belong in `services/`, not `utils/`.
- **`utils/` is for truly universal utilities only** — math, string manipulation, regex, type utilities, and Node/browser engine extensions that have no dependency on external libraries. If the helper imports a third-party package, it belongs in `services/` instead.
- **Generic browser utilities** go in `app/utils/` (e.g., `readFileAsText.ts`).
- **Feature folders**: related models/services/components are grouped under a feature subfolder (e.g., `tableEditor/file/`).
- **No magic strings** — always use enums instead of string literals for discriminants, command types, and other categorical values.

## Constant Maps

- **Constant maps and arrays use PascalCase** matching the filename with `as const satisfies` — e.g. `export const DataSourceConfigurationMap = { ... } as const satisfies Record<...>` and `export const ColumnStatisticsDefinitions = [ ... ] as const satisfies readonly ColumnStatisticsDefinition[]`.
  - **Exception**: for generic definition arrays where the `format` (or similar) callback is contravariant over the union of entry types, `satisfies` will fail with a type error. In that case, use `as const` alone and cast at the call site with `as never`. See `.claude/skills/typescript/SKILL.md` — "Generic Definition Arrays".
  - **Exception**: when consumers need optional interface fields to stay visible after enum lookup (e.g. `Item.color` on a metadata map where some entries omit it), use an explicit `const MapName: Record<Enum, Interface> = { ... }` annotation instead of `as const satisfies`. This widens lookup results to the shared interface while still enforcing every enum key.
- **Reuse existing item interfaces for UI metadata maps** — when a map entry is a UI display/action item with `title`, `icon`, optional `color`, `active`, or `shortTitle`, use `Item` from `@/models/shared/Item` instead of re-declaring an inline `{ title; icon; color }` shape. `Item.onClick` is optional so the same interface can represent display-only metadata and actionable menu items. Use narrower existing item interfaces only when they match the shape exactly, e.g. `SelectItemCategoryDefinition<T>` for select items with `value`, or `ListItemCategoryDefinition<T>` for list/select items with `value + icon`.
- **Destructure in `v-for` unless passing the base item as component props** — `v-for="{ key, format } of ColumnStatisticsDefinitions"` is preferred over `v-for="def of ColumnStatisticsDefinitions"` when you only need specific fields. Exception: if the item itself must be passed as a prop to a child component (e.g. `<SomeCard :item="def" />`), do not destructure.
- **One constant map per file, named after the constant** — `ColumnTypeFormSchemaMap.ts` exports only `ColumnTypeFormSchemaMap`. Never co-locate multiple maps in one file. When a map is a transformation of another (e.g. omitting a key), derive it directly rather than repeating the source values: `[ColumnType.Boolean]: ColumnTypeFormSchemaMap[ColumnType.Boolean].omit({ name: true })`.
- **Generic type maps for polymorphic dispatch** — when a constant map needs to associate a discriminant key (e.g. `DataSourceType`) with a type-parameterised generic (e.g. `DataSourceConfiguration<TItem>`), define an explicit type map first, then use a mapped type in `satisfies` to get per-entry type safety without any `as` casts:
  ```typescript
  // 1. Explicit type map (one file, in models/)
  type DataSourceItemTypeMap = { [DataSourceType.Csv]: CsvDataSourceItem };
  // 2. Satisfies mapped type — each entry is checked against its specific type parameter
  export const DataSourceConfigurationMap: Record<
    DataSourceType,
    DataSourceConfiguration<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>
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

## Generic Vue Components

Use `<script setup lang="ts" generic="T extends SomeBase">` to make components type-safe over a specific subtype. Pass the typed value AND its associated generic config/interface as props so the parent resolves the concrete types and the child stays fully typed without lookups or casts:

```vue
<!-- Parent (knows concrete type): -->
<FilePicker :item="modelValue" :configuration="DataSourceConfigurationMap[DataSourceType.Csv]" />
<!-- Child: -->
<script setup lang="ts" generic="TDataSourceItem extends DataSourceItemTypeMap[keyof DataSourceItemTypeMap]">
interface FilePickerProps {
  configuration: DataSourceConfiguration<TDataSourceItem>;
  item: TDataSourceItem;
}
</script>
```

## Command Pattern

Commands are classes extending `ADataSourceCommand<T extends CommandType>`. Each command declares `readonly type = CommandType.X` (no `name` — the base class provides `get name() { return this.type; }`). `CommandType` enum lives in `models/tableEditor/file/commands/CommandType.ts`. Class field ordering within a command: `readonly type` → blank line → `get description()` → blank line → all `private readonly` fields grouped together (no blank lines between same-level fields) → blank line → constructor → blank line between each method.

## MIME Types

Store MIME type strings in the relevant configuration map (e.g. `DataSourceConfigurationMap`) rather than calling `mime-types` `lookup` at runtime — `mime-types` uses Node.js `path.extname` which is not available in the browser. Access `mimeType` through the configuration map at the call site.

## Whitespace & Comments

- **No blank line before a `//` comment that introduces the next block** — the comment itself is the separator. Only add a blank line before an uncommented block:

  ```ts
  // CORRECT — comment acts as separator, no blank line needed before it
  const foo = () => { ... };
  // Called when something happens
  const bar = () => { ... };

  // WRONG — blank line + comment is redundant
  const foo = () => { ... };

  // Called when something happens
  const bar = () => { ... };
  ```

## Creating a New Package

New workspace packages follow the pattern of existing packages (e.g. `packages/db`, `packages/db-mock`). Checklist:

1. **`package.json`** — set `name`, `private: true` (internal) or omit (publishable), `"type": "module"`, `"main": "dist/index.js"`, `"types": "dist/index.d.ts"`, `"files": ["dist"]`. Standard scripts: `build`, `export:gen`, `format`, `format:check`, `lint`, `lint:fix`, `typecheck`. Add `test`/`coverage` if the package has tests.
2. **`tsconfig.json`** — `{ "extends": "../configuration/tsconfig.node.json" }` (node-only) or `"../configuration/tsconfig.vue.json"` (browser/Vue).
3. **`tsconfig.build.json`** — `{ "extends": ["./tsconfig.json", "../configuration/tsconfig.build.json"] }`.
4. **`rolldown.config.ts`** — use `rolldownConfigurationNode` (server-only), `rolldownConfigurationBrowser` (browser/isomorphic), or a custom extension if extra externals are needed.
5. **`eslint.config.js`** — symlink to the shared config. On Windows (requires PowerShell to be elevated or Developer Mode enabled):
   ```powershell
   New-Item -ItemType SymbolicLink -Path "packages\db-mock\eslint.config.js" -Target "..\configuration\eslint\index.typescript.js"
   ```
   Use `index.typescript.js` (TypeScript-only package) or `index.vue.js` (Vue package). On Linux/macOS: `ln -s ../configuration/eslint/index.typescript.js eslint.config.js`.
6. **`.oxlintrc.json`** — symlink to the shared oxlint config. On Windows:
   ```powershell
   New-Item -ItemType SymbolicLink -Path "packages\db-mock\.oxlintrc.json" -Target "..\configuration\.oxlintrc.json"
   ```
   On Linux/macOS: `ln -s ../configuration/.oxlintrc.json .oxlintrc.json`.
7. **`src/index.ts`** — minimal barrel; `ctix` will regenerate it on `pnpm export:gen`.
8. **Run `pnpm install`** from the repo root to link the new package into the workspace.
9. **Run `pnpm build`** in the new package to produce `dist/`.

### Rolldown externals

Packages declared as `peerDependencies` must also be listed in the rolldown `external` array — pnpm doesn't automatically tell rolldown to skip them. Either:

- Add them to the shared `rolldownConfigurationBrowser.external` list in `packages/configuration/src/rolldownConfigurationBrowser.ts` (preferred when the peer is used by multiple packages), OR
- Override locally: `export default { ...rolldownConfigurationNode, external: [...rolldownConfigurationNode.external as string[], "my-peer-dep"] }`.

After adding to the shared config, rebuild `packages/configuration` (`pnpm build`) before rebuilding dependent packages.

### peerDependencies vs dependencies

Use `peerDependencies` for packages that:

- Are direct runtime imports or generated `.d.ts` imports that should not be bundled into the dist.
- Are framework/runtime singletons, SDKs mirrored in public APIs, or heavy/plugin runtimes that the consumer must provide (e.g. `vue`, `pinia`, Azure SDKs, `drizzle-orm`, `zod`, `drizzle-kit`, `@electric-sql/pglite`).
- Are owned by the package that directly imports them. Do not redeclare transitive-only peers from imported workspace packages.

Use `dependencies` for direct runtime imports that are not consumer-provided and must be bundled or auto-installed. Workspace packages imported at runtime usually stay in `dependencies`; their own package manifests declare their direct peer contracts.

### Example: `packages/db-mock`

A test-only node package. `drizzle-kit` and `@electric-sql/pglite` are peers (heavy, not bundled). Both are listed in `rolldownConfigurationBrowser.external`. `eslint.config.js` is a symlink to `../configuration/eslint/index.typescript.js`.

## Refactoring — No Alias Re-exports

When renaming a file (e.g. `createCode.ts` → `createToken.ts`, `readInviteCode.ts` → `readInviteToken.ts`):

- **Delete the old file** — never leave a re-export alias (e.g. `export { createToken as createCode } from "./createToken"`) in the old file's place.
- Update all import sites to the new file path and name directly.
- If a barrel (`index.ts`) exported the old name, update it too.

The alias pattern looks helpful but creates confusion: the old name stays discoverable, callers assume it's the canonical name, and the rename never fully propagates.

## Line Endings

- All files must use **LF** line endings (`\n`), not CRLF.
- The `Write` tool on Windows always produces CRLF. **Immediately after every `Write` call**, convert with:
  ```bash
  sed -i 's/\r//' "path/to/file"
  ```
  For multiple files at once:
  ```bash
  find "path/to/dir" -name "*.md" | xargs -I{} sed -i 's/\r//' "{}"
  ```

## Naming Conventions

- **No abbreviations in exported names** — always use the full English word. Key rules for this project:
  - `stat` / `stats` → `statistics` (both singular and plural — English treats "statistics" as the standard form, like "mathematics"; e.g. `ColumnStatistics`, `ColumnStatisticsKey`, `useColumnStatistics`, `computeColumnStatistics`)
  - `sum` (as a statistics identifier) → `summation` (e.g. `ColumnStatisticsDefinitionMap.summation`, `FooterStatisticsType.Summation`) — does NOT apply to math accumulator locals like `acc`, `s`, or the display title `"Sum"`
  - Prefer `FooterStatisticsType` over `FooterStatType`, `ColumnStatisticsDefinition` over `ColumnStatDefinition`, etc.

## Shared Schemas

- **Shared field schemas** — when multiple models share a field (e.g. `description`), define a single named interface + schema (e.g. `Description` / `descriptionSchema`) in `shared/models/tableEditor/` and spread the schema's `.shape` into each model schema. No `With` prefix (follows the same convention as `SourceColumnId`, `ApplicableColumnTypes`). Do not add `.default(...)` to the shared schema — each implementing class declares its own default as a class field and adds it at the schema call site.

## File Length

- **Target 50-100 lines per `.ts` file** — a file over 100 lines is a yellow flag that a helper, sub-service, or model extraction is overdue.
- Each file should have a single clear responsibility. If a file grows because it handles multiple concerns, split it.
- Exceptions: generated files, large constant maps with many entries, and files where co-location of tightly coupled logic (e.g. a Zod schema next to its interface) is intentional.
