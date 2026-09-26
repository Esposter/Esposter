---
name: file-organization
description: Apply when creating, moving, renaming, or organising any file, export, constant, or package. Esposter file and folder organisation — imports, one export per file, layers and folders, constants, duplication, packages, renames and file length.
---

# File & Folder Organisation

## Settled — do not re-propose

- **A plugin for one export per file** — its exceptions (`constants.ts`, a schema beside its type, an enum beside its values array, a composable's own options) are a roster that grows with the repo; the models-rule plugin is the `oxlint` skill's Settled line for the same reason.
- **A rule for duplicate constants or the sole-consumer rule** — both need the whole repo in mind; the ≥2-consumers half already has its test.
- **Converting `apps/infra/src/azure/constants/` to named exports** — one PascalCase file per constant, each a default export, read that way at hundreds of sites; no rule names default exports either way, the tree is internally consistent, and the swap is dozens of files of churn.

## Imports

- **Always use alias imports** — never relative imports (`./`, `../`), even for same-folder files. Enforced by oxlint `no-restricted-imports` against the map each manifest declares; the app's aliases, the exemptions and the one repo-root exception are `references/import-aliases.md`.
- **Never import a composable — `configuration/imports.ts` auto-imports `composables/**` whole.** An explicit specifier resolves to the same function and reads as though the site is reaching for something the others are not; the two that still need one (a type beside a composable, a test helper under `composables/`) are on the same page.
- **`shared/` may never import `@/` or `~/`** — it is parsed by the server as well as shipped to the browser, so a client import drags UI-library types and browser-only values into the server's graph. Banned by a root `.oxlintrc.json` override, type-only imports included. When a `shared/` module needs a client concern, give it a **twin**: `shared/` keeps the validating schema, `app/` derives the form schema from it with `safeExtend` and `satisfies z.ZodType<TSharedType>`. Moving the client module down into `shared/` relocates the boundary instead of restoring it. See `apps/web/content/docs/architecture/module-boundaries.md`.
- **A library import is named, and only when nothing auto-imports it** — `ref`, `computed`, `watch`, `storeToRefs` and every VueUse composable are auto-imported, so never imported by hand.
- **Node built-ins take the `node:` protocol** (`unicorn/prefer-node-protocol`) — but **never import an ambient global**: `process`, `console`, `Buffer`, `URL` and `fetch` are already there, so only the non-ambient built-ins are imported at all.
- Import grouping, blank lines, ordering, and line endings — see the `formatting` skill.

## Files and Exports

- **One export per file** — each exported function, class, or interface in its own file. Exception: Zod schemas may colocate with their interface/type (tightly coupled).
- **Enums and shared model schemas get their own files** — exported enums, discriminated-union variants, payload types, and reusable Zod schemas belong in `models/` (or the relevant shared model folder), one named concern per file. Don't define an enum/reusable payload schema inside a Drizzle table file just because that table is the first consumer; schema files import model enums/types/schemas and only define the table plus its table-derived select schema/type.
- **An `interface` or `type` lives in its own file under `models/`**, never beside the code that reads it; the few local declarations that stay sit together after the imports (`references/colocated-types.md`).
- **Never an `export { … }` list** — export at the declaration site (`no-restricted-syntax`). A re-export carrying `from` is outside the rule: the `ctix` barrels, and a package's `eslint.config.js`, which ESLint demands at that exact path, so it is the tool's entrypoint rather than an import indirection and may not be a symlink (`references/symlinks.md`).
- **A script's output lives under `generated/<generator>/` in its consumer, one file per entity, never hand-edited and never inside an authored file** (`references/generated-output.md`).
- **Layer by kind, folder by consumer** — classes and types in `models/` (one per file), exported functions in `services/`, dependency-free universals in `util/`, and a file lives in the subfolder of the one feature that consumes it. Each layer's boundary, the library-extension and default-factory exceptions, and the `<layer>/shared/` bucket two features share: `references/layer-placement.md`.
- **No magic strings** — always use enums for discriminants, command types, and other categorical values. Before typing any literal, search the repo for a value that already means it and import that: an enum member (`Operation.Read`, `DatabaseEntityType.Post`), a separator (`ID_SEPARATOR`), a registry entry (`AsyncDataKey`, `LocalStorageKey`, `RoutePath`), a mime type off the configuration map. A literal is earned only when nothing existing means it — a second spelling of something the repo already names never renames with the original.

## Constants

- **Constants go in `constants.ts` under `services/`**, never at the top of an SFC or composable; tests use `constants.test.ts` (`references/constants.md`).
- **No duplicate constants — one source of truth per value per runtime realm**, tests included; a single-use literal stays inline (`references/constants.md`).
- A literal or helper a JSON or `postinstall`-evaluated config must repeat, a function's name (`functionName.name`, never a `*_NAME` constant) and a `DEFAULT_*` option object frozen at every depth — `references/constants.md`; editing a config literal that repeats one is `references/config-literals.md`.

## Never Duplicate Similar Logic — Source AND Tests

Before writing a helper, grep for an existing one; before finishing a feature, grep for near-twin functions you may have created and collapse them. When ≥2 functions — or ≥2 call sites, the same condition written inline at each — share a shape and differ only in a predicate/parameter, extract **one functional primitive** (`sweepStaleEntries(directory, isStale)`) and make each caller a thin, intention-revealing wrapper that keeps the domain name and passes the constants.

- **Syntax is never extracted, and an extraction, a flag or a field earns its place only by taking a mistake away from its call sites** — the `over-engineering` skill owns both rules, the drift test that tells a rule from a construct, and the catalogue of shapes an extraction fails as; its decidable half is enforced by `pass-through-helper/no-forwarding-wrapper`.
- The shapes an extraction takes — the `create*` factory over shared state, why classes stay in `models/`, and the arguments already rejected against both rules above — are `references/extraction-and-duplication.md`.

## The `scripts/` layout — `references/scripts-layout.md`

Read it when adding a command, a sub-command or a plugin under the repo-root `scripts/`: the entrypoint at `src/<command>/index.ts`, its services and types under the same key one layer each, and where two verbs' shared code sits.

## Cross-package placement — `references/cross-package-placement.md`

Read it before adding a module or constant to a shared package, relocating an existing one for symmetry, or implementing behaviour a second package needs. In short: **a shared package is for code with ≥2 consuming packages** — name the second consumer or leave the code beside its sole one, and when a second appears move the implementation rather than writing another. The home is the lowest package both already depend on; `scripts/src/workspace/sharedExportConsumers.test.ts` fails on an export of `packages/shared` fewer than two packages name — unless another file in the package reads it, which makes it a piece of one that does clear the threshold. The page also owns the client/node cross-realm exception, env-reading scripts, and the domain-package rule for Azure helpers.

## Symlinks — `references/symlinks.md`

Read it before creating or verifying one. In short: PowerShell `New-Item -ItemType SymbolicLink`, **never `ln -s` on Windows**, which copies the file and commits duplicate content silently.

## Constant Maps — `references/constant-maps.md`

Read it when adding a map keyed by an enum or discriminant, or deciding whether a second map may share its file. In short: **PascalCase matching the filename, `as const satisfies`, one map per file**.

### Typing over a discriminant — `references/generic-typing.md`

Read it when a map's entries are type-parameterised generics, when a component looks such a configuration up, or when writing a component generic over a subtype: explicit type map + `satisfies` mapped type (no `as` casts), a `MaybeRefOrGetter` lookup composable hiding the single internal cast, and `generic="T extends …"` SFCs that take the typed value **and** its configuration as props.

## localStorage keys — `references/local-storage-keys.md`

Read it when adding, renaming or enumerating a persisted browser key. Every key lives in the one `LocalStorageKey` registry — never a `*_LOCAL_STORAGE_KEY` constant in a feature's `constants.ts`, and a literal inlined into `useLocalStorage(...)` is a `no-restricted-syntax` error.

## Command classes — `references/command-pattern.md`

Read it when adding or editing a command in the undo/redo stack: the base class, the field order, and why every instance is `markRaw`'d on entry.

## Creating a New Package — `references/new-package.md`

Read it when adding a package under `packages/`, a member that is only run, or a `bin` entrypoint (no shebang — pnpm generates the shim): the eight-step setup from the manifest to the first `pnpm build`. Which field a dependency goes in is the `build` skill's.

## Renaming — no alias re-exports — `references/renames.md`

Delete the old file and update every import site; a re-export alias is a second importable path that keeps the old name discoverable and the rename half-done. **Renaming a file, or moving a function into a shared package**, is that page.

## File Length

- **Target 50-100 lines per file** (`.ts` and `.vue` alike) — consistently over 100 lines is a yellow flag that an extraction is overdue (helper/sub-service/model for `.ts`; slot/sub-component/composable for `.vue` — see the `vue-component-patterns` skill).
- Each file should have a single clear responsibility. Split a file that handles multiple concerns.
- Exceptions: generated files, large constant maps with many entries, complex/rare layout components, and files where colocation of tightly coupled logic (a Zod schema next to its interface) is intentional.

## Reference pages

- `references/generated-output.md` — when a script writes files the repo commits.
