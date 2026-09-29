---
name: file-organization
description: Apply when creating, moving, renaming, or organising any file, export, constant, or package. Esposter's file and folder organisation — which folder and which package a file belongs in and what it may import; alias imports never relative, one export per file, one source of truth per constant, near-twin functions collapsed onto one primitive, and a rename that leaves no re-export alias.
---

# File & Folder Organisation

## Settled — do not re-propose

- **A plugin for one export per file** — its exceptions (`constants.ts`, a schema beside its type, an enum beside its values array, a composable's own options) are a roster that grows with the repo; the models-rule plugin is the `oxlint` skill's Settled line for the same reason.
- **A rule for duplicate constants or the sole-consumer rule** — both need the whole repo in mind; the ≥2-consumers half already has its test.
- **Converting `apps/infra/src/azure/constants/` to named exports** — one PascalCase file per constant, each a default export, read that way at hundreds of sites; no rule names default exports either way, the tree is internally consistent, and the swap is dozens of files of churn.

## Imports

- **Always use alias imports** — never relative imports (`./`, `../`), even for same-folder files. Enforced by oxlint `no-restricted-imports` against the map each manifest declares; the app's aliases, the exemptions and the one repo-root exception are `references/import-aliases.md`.
- **Never import a composable — `configuration/imports.ts` auto-imports `composables/**` whole.** An explicit specifier resolves to the same function and reads as though the site is reaching for something the others are not; what still needs one (a type beside a composable, a test helper under `composables/`) is on the same page.
- **`shared/` may never import `@/` or `~/`** — it is parsed by the server as well as shipped to the browser, so a client import drags UI-library types and browser-only values into the server's graph. Banned by a root `oxlint.config.ts` override, type-only imports included. When a `shared/` module needs a client concern, give it a **twin**: `shared/` keeps the validating schema, `app/` derives the form schema from it with `safeExtend` and `satisfies z.ZodType<TSharedType>`. Moving the client module down into `shared/` relocates the boundary instead of restoring it. See `apps/web/content/docs/architecture/module-boundaries.md`.
- **A library import is named, and only when nothing auto-imports it** — `ref`, `computed`, `watch`, `storeToRefs` and every VueUse composable are auto-imported, so never imported by hand.
- **Node built-ins take the `node:` protocol** (`unicorn/prefer-node-protocol`) — but **never import an ambient global**: `process`, `console`, `Buffer`, `URL` and `fetch` are already there, so only the non-ambient built-ins are imported at all.
- Import grouping, blank lines, ordering, and line endings — the `formatting` skill ("Blank Lines").

## Files and Exports

- **One export per file** — each exported function, class, or interface in its own file. Exception: Zod schemas may colocate with their interface/type (tightly coupled).
- **Enums and shared model schemas get their own files** — exported enums, discriminated-union variants, payload types, and reusable Zod schemas belong in `models/` (or the relevant shared model folder), one named concern per file. Don't define an enum/reusable payload schema inside a Drizzle table file just because that table is the first consumer; schema files import model enums/types/schemas and only define the table plus its table-derived select schema/type.
- **An `interface` or `type` lives in its own file under `models/`**, never beside the code that reads it; the few local declarations that stay sit together after the imports (`references/colocated-types.md`).
- **Never an `export { … }` list** — export at the declaration site (`no-restricted-syntax`). A re-export carrying `from` is outside the rule: the generated barrels, and a package's `eslint.config.js`, which ESLint demands at that exact path, so it is the tool's entrypoint rather than an import indirection and may not be a symlink (`references/symlinks.md`).
- **A script's output lives under `generated/<generator>/` in its consumer, one file per entity, never hand-edited and never inside an authored file** (`references/generated-output.md`).
- **Layer by kind, folder by consumer** — classes and types in `models/` (one per file), exported functions in `services/`, dependency-free universals in `util/`, and a file lives in the subfolder of the one feature that consumes it. Each layer's boundary, the library-extension and default-factory exceptions, and the `<layer>/shared/` bucket two features share: `references/layer-placement.md`.
- **No magic strings** — always use enums for discriminants, command types, and other categorical values. Before typing any literal, search the repo for a value that already means it and import that: an enum member (`Operation.Read`, `DatabaseEntityType.Post`), a separator (`ID_SEPARATOR`), a registry entry (`AsyncDataKey`, `LocalStorageKey`, `RoutePath`), a mime type off the configuration map. A literal is earned only when nothing existing means it — a second spelling of something the repo already names never renames with the original.

## Constants

- **Constants go in `constants.ts` under `services/`**, never at the top of an SFC or composable; tests use `constants.test.ts` (`references/constants.md`).
- **No duplicate constants — one source of truth per value per runtime realm**, tests included; a single-use literal stays inline (`references/constants.md`).
- A literal or helper a JSON or `postinstall`-evaluated config must repeat, a function's name (`functionName.name`, never a `*_NAME` constant) and a `DEFAULT_*` option object frozen at every depth — `references/constants.md`; editing a config literal that repeats one is `references/config-literals.md`.

## Never Duplicate Similar Logic — Source AND Tests

Before writing a helper, grep for an existing one; before finishing a feature, grep for near-twin functions you may have created and collapse them. When ≥2 functions — or ≥2 call sites, the same condition written inline at each — share a shape and differ only in a predicate/parameter, extract **one functional primitive** (`sweepStaleEntries(directory, isStale)`) and make each caller a thin, intention-revealing wrapper that keeps the domain name and passes the constants.

- **An extraction, a flag or a field earns its place only by taking a mistake away from its call sites** — what that means for a helper and for a flag, and the shapes an extraction takes (a `create*` factory over shared state, classes kept in `models/`), are `references/extraction-and-duplication.md`, and its decidable half is `pass-through-helper/no-forwarding-wrapper`. That syntax is never extracted, and the drift test that tells a rule from a construct, are the `over-engineering` skill's (`references/syntax-extraction.md`).

## Packages and the repo's own layout

- **A shared package is for code with ≥2 consuming packages** — name the second consumer or leave the code beside its sole one, and when a second appears move the implementation rather than writing another (`references/cross-package-placement.md`); `scripts/src/workspace/sharedExportConsumers.test.ts` holds `packages/shared` to it.
- **A new package follows the existing setup**, and a `bin` entrypoint carries no shebang — pnpm generates the shim (`references/new-package.md`).
- **`scripts/` is laid out by layer like the app, keyed by command** (`references/scripts-layout.md`).
- **A symlink is made with PowerShell's `New-Item -ItemType SymbolicLink`, never `ln -s` on Windows**, which copies the file and commits duplicate content silently (`references/symlinks.md`).

## Maps, registries and classes

- **A constant map is PascalCase matching its filename, `as const satisfies`, one map per file** (`references/constant-maps.md`); a map over type-parameterised generics is typed by an explicit type map and a mapped `satisfies` (`references/generic-typing.md`).
- **Every localStorage key lives in the one `LocalStorageKey` registry** — never a `*_LOCAL_STORAGE_KEY` constant, and a literal inlined into `useLocalStorage(...)` is a `no-restricted-syntax` error (`references/local-storage-keys.md`).
- **An undo/redo command is a class over `ADataSourceCommand`, `markRaw`'d on entry** (`references/command-pattern.md`).

## Renames

- **A rename deletes the old file and updates every import site** — never a re-export alias, which keeps the old name discoverable and the rename half-done (`references/renames.md`).

## File Length

- **Target 50-100 lines per file** (`.ts` and `.vue` alike) — consistently over 100 lines is a yellow flag that an extraction is overdue (helper/sub-service/model for `.ts`; slot/sub-component/composable for `.vue` — the `vue-component-patterns` skill, "File Length").
- Each file should have a single clear responsibility. Split a file that handles multiple concerns.
- Exceptions: generated files, large constant maps with many entries, complex/rare layout components, and files where colocation of tightly coupled logic (a Zod schema next to its interface) is intentional.

## Reference pages

- `references/import-aliases.md` — when choosing an import specifier, when the alias ban fires, or when a composable import looks necessary.
- `references/colocated-types.md` — when a type has one consumer that is its own service or composable.
- `references/layer-placement.md` — when choosing between `models/`, `services/`, `util/`, a feature subfolder and `shared/`.
- `references/generated-output.md` — when a script writes files the repo commits.
- `references/constants.md` — when declaring, placing or repeating a constant, a function's name or a default option object.
- `references/config-literals.md` — when a JSON config, `.gitignore` or a `postinstall`-evaluated file needs a value a package owns, or a walk reaches into `.agents/`.
- `references/extraction-and-duplication.md` — when an extraction is about to be made, or argued for.
- `references/cross-package-placement.md` — before adding a module or constant to a shared package, relocating one for symmetry, or implementing behaviour a second package needs.
- `references/new-package.md` — when adding a package under `packages/`, a member that is only run, or a `bin` entrypoint.
- `references/scripts-layout.md` — when adding a command, a sub-command or a plugin under the repo-root `scripts/`.
- `references/symlinks.md` — before creating or verifying a tracked symlink.
- `references/constant-maps.md` — when adding a map keyed by an enum or discriminant, or deciding whether a second map may share its file.
- `references/generic-typing.md` — when a map's entries are type-parameterised generics, a component looks one up, or a component is generic over a subtype.
- `references/local-storage-keys.md` — when adding, renaming or enumerating a persisted browser key.
- `references/command-pattern.md` — when adding or editing a command in the undo/redo stack.
- `references/renames.md` — when renaming a file, or moving a function into a shared package.
- `references/large-renames.md` — when a rename reaches more than a handful of files, or when planning one.
