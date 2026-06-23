---
name: file-organization
description: Esposter file and folder organisation — one export per file, no export{} syntax, models vs services vs constants, command pattern field ordering, constant maps with as-const-satisfies, generic Vue components, MIME types, and file length. Apply when creating, moving, or organising files, exports, constants, or new packages.
---

# File & Folder Organisation

## Imports

- **Always use alias imports** — never relative imports (`./`, `../`), even for same-folder files.
  - `#shared/` — shared package (`packages/app/app/shared/`); shared models, services, constants. E.g. `import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor"`.
  - `@@/` — project root (`packages/app/`); `server/` and other root-level paths.
  - `@/` — app source dir (`packages/app/app/`); `composables/`, `components/`, `store/`, `services/`, etc.
  - Never use `~~/` (old Nuxt alias) — replace with `@@/`.
- Import grouping, blank lines, and ordering — see the `formatting` skill.

## Files and Exports

- **One export per file** — each exported function, class, or interface in its own file. Exception: Zod schemas may co-locate with their interface/type (tightly coupled).
- **Enums and shared model schemas get their own files** — exported enums, discriminated-union variants, payload types, and reusable Zod schemas belong in `models/` (or the relevant shared model folder), one named concern per file. Don't define an enum/reusable payload schema inside a Drizzle table file just because that table is the first consumer. Schema files import model enums/types/schemas and only define the table plus table-derived select schema/type.
- **Co-locate single-use event/hook map types** — when an event/hook map interface (e.g. `AdminActionHookMap`, `MessageHookMap`) is imported only by its own service file (which creates the singleton), define the interface in the service file rather than a separate `models/` file. The service exports the instance; consumers import the instance, not the type. Do **not** apply to general type maps (`ColumnTypeColumnMap`, `DataSourceConfigurationTypeMap`) — those stay in `models/` regardless of consumer count.
- **Interfaces go in `models/`** — never define an exported interface inline in a `.vue` component. Extract to `app/models/<feature>/InterfaceName.ts` (app-local) or `shared/models/<feature>/InterfaceName.ts` (cross-package) for reuse.
- **One class per file** — classes belong in a `models/` folder.
- **Never use `export { }` syntax** — always inline `export const`/`class`/`interface`/`type`/`function` at the declaration site. Only valid exceptions: empty `export {}` in `.d.ts` files (module marker) and `ctix`-generated barrel files (pinned package). Hand-written `.ts` with `export { ... }` is wrong.
- **Constants go in `constants.ts`** — all module-level constants in a `constants.ts` under `services/` alongside the files that use them. Never put `constants.ts` inside `composables/`.
- **Default option objects** are constants: export one shared `DEFAULT_*` object from the feature's `services/.../constants.ts` and reuse everywhere. Use `Object.freeze({ ... } satisfies InterfaceName)` so callers can't mutate the shared default.
- **No duplicate constants — one source of truth per value.** Never repeat the same literal (magic number/string) or re-declare the same named constant in two files. Extract it to a `constants.ts` and import it. Examples: `KIBIBYTE = 2 ** 10` (derive `MEGABYTE = KIBIBYTE ** 2` from it, never write a bare `1024`/`2 ** 20`); `PUSH_NOTIFICATION_MESSAGE_MAX_LENGTH` lives only in `@esposter/db-schema` and downstream packages import it. This includes test files — import the constant, don't re-declare a local copy in the `.test.ts`.
- **Cross-package constant home = the lowest shared dependency.** Pick the package both consumers already depend on: `@esposter/shared` (client-safe, universal) or `@esposter/configuration` (node/build-tooling base). A value is duplicated across realms only when one realm is client-bundle-safe and the other is node-only and they can't share a package (e.g. `KIBIBYTE` exists in both `packages/app/shared/services/app/constants.ts` for client code and `@esposter/configuration` for build scripts).
- **Functions go in `services/`** — factory functions, command creators, and other exported functions belong in `services/`, not `models/`. `models/` is strictly classes and interfaces/types.
- **External library extensions go in `services/`** — helpers that extend/wrap third-party libraries (e.g. `services/zod/extractSchemaFields.ts`, `services/dayjs/index.ts`), not `utils/`.
- **`utils/` is for truly universal utilities only** — math, string, regex, type utilities, Node/browser engine extensions with no external dependency. If the helper imports a third-party package, it belongs in `services/`.
- **Generic browser utilities** go in `app/utils/` (e.g. `readFileAsText.ts`).
- **Feature folders** — group related models/services/components under a feature subfolder (e.g. `tableEditor/file/`).
- **No magic strings** — always use enums for discriminants, command types, and other categorical values.

## Constant Maps

- **PascalCase matching the filename, with `as const satisfies`** — e.g. `export const DataSourceConfigurationMap = { ... } as const satisfies Record<...>`, `export const ColumnStatisticsDefinitions = [ ... ] as const satisfies readonly ColumnStatisticsDefinition[]`.
  - **Exception**: for generic definition arrays where a `format` (or similar) callback is contravariant over the union of entry types, `satisfies` fails — use `as const` alone and cast at the call site with `as never`. See typescript skill "Generic Definition Arrays".
  - **Exception**: when consumers need optional interface fields visible after enum lookup (e.g. `Item.color` on a map where some entries omit it), use an explicit `const MapName: Record<Enum, Interface> = { ... }` annotation instead of `as const satisfies`. This widens lookup results to the shared interface while still enforcing every enum key.
- **Reuse existing item interfaces for UI metadata maps** — when an entry is a UI display/action item with `title`, `icon`, optional `color`/`active`/`shortTitle`, use `Item` from `@/models/shared/Item` instead of re-declaring an inline shape. `Item.onClick` is optional so it covers both display-only metadata and actionable menu items. Use narrower item interfaces only when they match exactly — `SelectItemCategoryDefinition<T>` (value), `ListItemCategoryDefinition<T>` (value + icon).
- **Destructure in `v-for` unless passing the base item as props** — `v-for="{ key, format } of ColumnStatisticsDefinitions"` preferred over `v-for="def of ..."` when only specific fields are needed. Exception: if the item itself must be passed as a prop (`<SomeCard :item="def" />`), don't destructure.
- **One constant map per file, named after the constant** — `ColumnTypeFormSchemaMap.ts` exports only `ColumnTypeFormSchemaMap`. Never co-locate multiple maps. When a map transforms another (e.g. omitting a key), derive it: `[ColumnType.Boolean]: ColumnTypeFormSchemaMap[ColumnType.Boolean].omit({ name: true })`.
- **Generic type maps for polymorphic dispatch** — when a map associates a discriminant key (e.g. `DataSourceType`) with a type-parameterised generic, define an explicit type map first, then use a mapped type in `satisfies` for per-entry type safety without `as` casts:
  ```typescript
  // 1. Explicit type map (one file, in models/)
  type DataSourceItemTypeMap = { [DataSourceType.Csv]: CsvDataSourceItem };
  // 2. Satisfies mapped type — each entry checked against its specific type parameter
  export const DataSourceConfigurationMap: Record<
    DataSourceType,
    DataSourceConfiguration<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>
  > = { ... };
  ```
- **Generic map lookup composables** — when a component looks up a typed configuration from a generic map using a discriminant key on a generic item, extract the lookup into a composable. Use `MaybeRefOrGetter<TItem>` with `toValue()` so callers pass refs or plain values. Hide the single internal `as` cast and expose a fully typed API:
  ```typescript
  export const useDataSourceConfiguration = <
    TDataSourceItem extends DataSourceItemTypeMap[keyof DataSourceItemTypeMap],
  >(
    item: MaybeRefOrGetter<TDataSourceItem>,
  ): ComputedRef<DataSourceConfiguration<TDataSourceItem>> =>
    computed(() => DataSourceConfigurationMap[toValue(item).type] as DataSourceConfiguration<TDataSourceItem>);
  ```

## Generic Vue Components

Use `<script setup lang="ts" generic="T extends SomeBase">` to make components type-safe over a subtype. Pass the typed value AND its associated generic config/interface as props so the parent resolves concrete types and the child stays typed without lookups/casts:

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

Commands are classes extending `ADataSourceCommand<T extends CommandType>`. Each declares `readonly type = CommandType.X` (no `name` — the base provides `get name() { return this.type; }`). `CommandType` enum lives in `models/tableEditor/file/commands/CommandType.ts`. Field ordering within a command: `readonly type` → blank line → `get description()` → blank line → all `readonly #` private fields grouped together (no blank lines between same-level fields) → blank line → constructor → blank line between each method. Use ECMAScript `#` private members, never the TypeScript `private` keyword (see the `typescript` skill); subclass-reachable methods like `doExecute`/`doUndo` stay `protected`.

Command instances are stored in the `useFileHistoryStore` `ref` arrays, so they MUST be `markRaw`'d on entry — a reactive `Proxy` breaks `#` private brand checks at execute/undo time. See the `pinia` skill "Storing Class Instances — markRaw".

## MIME Types

Store MIME type strings in the relevant configuration map (e.g. `DataSourceConfigurationMap`) rather than calling `mime-types` `lookup` at runtime — `mime-types` uses Node.js `path.extname`, unavailable in the browser. Access `mimeType` through the configuration map at the call site.

## Creating a New Package

New workspace packages follow existing patterns (e.g. `packages/db`, `packages/db-mock`):

1. **`package.json`** — set `name`, `private: true` (internal) or omit (publishable), `"type": "module"`, `"main": "dist/index.js"`, `"types": "dist/index.d.ts"`, `"files": ["dist"]`. Standard scripts: `build` (`pnpm export:gen && rolldown --config rolldown.config.ts`), `export:gen`, `format`, `format:check`, `lint`, `lint:fix`, `typecheck`. If it has tests, add `test`/`coverage` scripts + `vitest`/`@vitest/coverage-v8`/`@types/node` devDeps and an `src/index.test.ts` bundle-size snapshot (see testing skill).
2. **`tsconfig.json`** — `{ "extends": "../configuration/tsconfig.node.json" }` (node) or `"../configuration/tsconfig.vue.json"` (browser/Vue).
3. **`tsconfig.build.json`** — `{ "extends": ["./tsconfig.json", "../configuration/tsconfig.build.json"] }`.
4. **`rolldown.config.ts`** — use `rolldownConfigurationNode` (server-only), `rolldownConfigurationBrowser` (browser/isomorphic), or a custom extension if extra externals are needed.
5. **`eslint.config.js`** — symlink to the shared config. On Windows (elevated PowerShell or Developer Mode):
   ```powershell
   New-Item -ItemType SymbolicLink -Path "packages\db-mock\eslint.config.js" -Target "..\configuration\eslint\index.typescript.js"
   ```
   Use `index.typescript.js` (TS-only) or `index.vue.js` (Vue). Linux/macOS: `ln -s ../configuration/eslint/index.typescript.js eslint.config.js`.
6. **`.oxlintrc.json`** — symlink to the shared oxlint config. Windows:
   ```powershell
   New-Item -ItemType SymbolicLink -Path "packages\db-mock\.oxlintrc.json" -Target "..\configuration\.oxlintrc.json"
   ```
   Linux/macOS: `ln -s ../configuration/.oxlintrc.json .oxlintrc.json`.
7. **`src/index.ts`** — minimal barrel; `ctix` regenerates it on `pnpm export:gen`.
8. **Run plain `pnpm i`** from repo root to link the package. Follow `architecture/monorepo-tooling.md` for install safety.
9. **Run `pnpm build`** in the new package to produce `dist/`.

### Rolldown externals

Packages declared as `peerDependencies` must also be in the rolldown `external` array — pnpm doesn't tell rolldown to skip them. Either:

- Add to the shared `rolldownConfigurationBrowser.external` list in `packages/configuration/src/rolldownConfigurationBrowser.ts` (preferred when used by multiple packages), OR
- Override locally: `export default { ...rolldownConfigurationNode, external: [...rolldownConfigurationNode.external, "my-peer-dep"] }`. The `external` array is `(RegExp | string)[]` — don't cast it to `string[]`.

After adding to the shared config, rebuild `packages/configuration` (`pnpm build`) before rebuilding dependents.

### peerDependencies vs dependencies

Use `peerDependencies` for packages that:

- Are direct runtime imports or generated `.d.ts` imports that should not be bundled into dist.
- Are framework/runtime singletons, SDKs mirrored in public APIs, or heavy/plugin runtimes the consumer must provide (e.g. `vue`, `pinia`, Azure SDKs, `drizzle-orm`, `zod`, `drizzle-kit`, `@electric-sql/pglite`).
- Are owned by the package that directly imports them. Don't redeclare transitive-only peers from imported workspace packages.

Use `dependencies` for direct runtime imports that are not consumer-provided and must be bundled/auto-installed. Workspace packages imported at runtime usually stay in `dependencies`.

### Example: `packages/db-mock`

A test-only node package. `@electric-sql/pglite` is a peer (heavy, not bundled, loaded at runtime by `createMockDb`), listed in `rolldownConfigurationBrowser.external`. `drizzle-kit` is a `devDependency` only — used by `scripts/generateSnapshot.ts` (regenerates the committed `src/snapshot.tar.gz` via `pnpm snapshot:gen`) and the verification test, not the shipped `createMockDb` runtime. `eslint.config.js` is a symlink to `../configuration/eslint/index.typescript.js`.

## Refactoring — No Alias Re-exports

When renaming a file (e.g. `createCode.ts` → `createToken.ts`):

- **Delete the old file** — never leave a re-export alias (`export { createToken as createCode } from "./createToken"`).
- Update all import sites to the new path/name directly.
- If a barrel (`index.ts`) exported the old name, update it too.

The alias pattern looks helpful but creates confusion: the old name stays discoverable, callers assume it's canonical, and the rename never fully propagates.

## Shared Schemas

- **Shared field schemas** — when multiple models share a field (e.g. `description`), define a single named interface + schema (`Description` / `descriptionSchema`) in `shared/models/tableEditor/` and spread the schema's `.shape` into each model schema. No `With` prefix (follows `SourceColumnId`, `ApplicableColumnTypes`). Don't add `.default(...)` to the shared schema — each implementing class declares its own default as a class field and adds it at the schema call site.

## File Length

- **Target 50-100 lines per file** (`.ts` and `.vue` alike) — consistently over 100 lines is a yellow flag that an extraction is overdue (helper/sub-service/model for `.ts`; slot/sub-component/composable for `.vue` — see the `vue-component-patterns` skill).
- Each file should have a single clear responsibility. Split a file that handles multiple concerns.
- Exceptions: generated files, large constant maps with many entries, complex/rare layout components, and files where co-location of tightly coupled logic (e.g. a Zod schema next to its interface) is intentional.

## Line Endings

See the `formatting` skill.
