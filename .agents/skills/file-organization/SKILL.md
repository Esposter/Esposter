---
name: file-organization
description: Apply when creating, moving, renaming, or organising any file, export, constant, or package. Esposter file and folder organisation — alias imports never relative, shared/ never importing the client, one export per file with types under models/, no magic strings or duplicate constants, layer by kind and folder by consumer, syntax never extracted into a helper, the ≥2-consumers rule for shared packages, renaming without re-export aliases, and file length.
---

# File & Folder Organisation

## Imports

- **Always use alias imports** — never relative imports (`./`, `../`), even for same-folder files. Enforced by oxlint `no-restricted-imports` against the map each manifest declares; the app's aliases, the exemptions and the one repo-root exception are `references/import-aliases.md`.
- **Never import a composable — `configuration/imports.ts` auto-imports `composables/**` whole.** An explicit specifier resolves to the same function and reads as though the site is reaching for something the others are not; the two that still need one (a type beside a composable, a test helper under `composables/`) are on the same page.
- **`shared/` may never import `@/` or `~/`** — it is parsed by the server as well as shipped to the browser, so a client import drags UI-library types and browser-only values into the server's graph. Banned by a root `.oxlintrc.json` override, type-only imports included. When a `shared/` module needs a client concern, give it a **twin**: `shared/` keeps the validating schema, `app/` derives the form schema from it with `safeExtend` and `satisfies z.ZodType<TSharedType>`. Moving the client module down into `shared/` relocates the boundary instead of restoring it. See `apps/web/content/docs/architecture/module-boundaries.md`.
- Import grouping, blank lines, ordering, and line endings — see the `formatting` skill.

## Files and Exports

- **One export per file** — each exported function, class, or interface in its own file. Exception: Zod schemas may colocate with their interface/type (tightly coupled).
- **Enums and shared model schemas get their own files** — exported enums, discriminated-union variants, payload types, and reusable Zod schemas belong in `models/` (or the relevant shared model folder), one named concern per file. Don't define an enum/reusable payload schema inside a Drizzle table file just because that table is the first consumer; schema files import model enums/types/schemas and only define the table plus its table-derived select schema/type.
- **An `interface` or `type` lives in its own file under `models/` (`app/models/<feature>/` app-local, `shared/models/<feature>/` cross-package), never beside the code that reads it** — a service, store, constant file or `.vue` component declares no type of its own; an options bag, a return shape or a resource contract is a model file the reader imports, so the next reader finds it where every other shape is. The local declarations are exactly three exceptions (a Zod schema's type, and a single-use hook map or a composable's own parameter shape, which is its options, context or emit type — `references/colocated-types.md`) plus an SFC's `Props` (the `vue` skill) and a test file's fixture shapes, and those sit together at the top of the block after the imports (and macros), before the runtime `const`/logic — never interleaved between logic blocks.
- **Never use `export { }` syntax** — always inline `export const`/`class`/`interface`/`type`/`function` at the declaration site. Only valid exceptions: empty `export {}` in `.d.ts` files (module marker), `ctix`-generated barrel files (pinned package), and a package's `eslint.config.js`, which re-exports the shared config as `export { default } from "@esposter/configuration/eslint/index.{typescript,vue}.js";` — ESLint demands a file at that exact path, so it is the tool's entrypoint rather than an import indirection, and it may not be a symlink (`references/symlinks.md`).
- **Layer by kind, folder by consumer** — classes and types in `models/` (one per file), exported functions in `services/`, dependency-free universals in `util/`, and a file lives in the subfolder of the one feature that consumes it. Each layer's boundary, the library-extension and default-factory exceptions, and the `<layer>/shared/` bucket two features share: `references/layer-placement.md`.
- **No magic strings** — always use enums for discriminants, command types, and other categorical values. Before typing any literal, search the repo for a value that already means it and import that: an enum member (`Operation.Read`, `DatabaseEntityType.Post`), a separator (`ID_SEPARATOR`), a registry entry (`AsyncDataKey`, `LocalStorageKey`, `RoutePath`), a mime type off the configuration map. A literal is earned only when nothing existing means it — a second spelling of something the repo already names never renames with the original.

## Constants

- **Constants go in `constants.ts`** under `services/`, beside the files that use them — never a production `constants.ts` inside `composables/`, and never a module-scope `const MAX_THING = …` at the top of an SFC or composable: the moment a value is worth naming it is worth importing, and the next file that needs it should find it without reaching into a component. The test and bench equivalents are `constants.test.ts` / `constants.bench.ts`, carrying shared fixture data under the same multi-export exception, colocated with the code under test even when that sits under `composables/`. Helper _functions_ still get one file each (`testing` skill).
- **No duplicate constants — one source of truth per value (per runtime realm).** Never repeat the same literal (magic number/string) or re-declare the same named constant in two files within a realm; extract it to a `constants.ts` and import it when the value is reused or is a real source of truth, and leave single-use literals inline. E.g. `KIBIBYTE = 2 ** 10`, with `MEGABYTE = KIBIBYTE ** 2` derived from it — never a bare `1024`/`2 ** 20`. This includes test files: import the constant, don't re-declare a local copy in the `.test.ts`.
- A literal a JSON or `postinstall`-evaluated config must repeat, a function's name (`functionName.name`, never a `*_NAME` constant) and a `DEFAULT_*` option object frozen at every depth — `references/constants.md`; editing a config literal that repeats one is `references/config-literals.md`.

## Never Duplicate Similar Logic — Source AND Tests

Before writing a helper, grep for an existing one; before finishing a feature, grep for near-twin functions you may have created and collapse them. When ≥2 functions — or ≥2 call sites, the same condition written inline at each — share a shape and differ only in a predicate/parameter, extract **one functional primitive** (`sweepStaleEntries(directory, isStale)`) and make each caller a thin, intention-revealing wrapper that keeps the domain name and passes the constants.

- **Syntax is never extracted, and an extraction, a flag or a field earns its place only by taking a mistake away from its call sites** — the `over-engineering` skill owns both rules, the drift test that tells a rule from a construct, and the catalogue of shapes an extraction fails as; its decidable half is enforced by `pass-through-helper/no-forwarding-wrapper`.
- The shapes an extraction takes — the `create*` factory over shared state, why classes stay in `models/`, and the arguments already rejected against both rules above — are `references/extraction-and-duplication.md`.

## The `scripts/` layout — `references/scripts-layout.md`

Read it when adding a command, a sub-command or a plugin under the repo-root `scripts/`: the entrypoint at `src/<command>/index.ts`, its services and types under the same key one layer each, and where two verbs' shared code sits.

## Cross-package placement — `references/cross-package-placement.md`

Read it before adding a module or constant to a shared package, relocating an existing one for symmetry, or implementing behaviour a second package needs. In short: **a shared package is for code with ≥2 consuming packages** — name the second consumer or leave the code beside its sole one, and when a second appears move the implementation rather than writing another. The home is the lowest package both already depend on; `scripts/src/workspace/sharedExportConsumers.test.ts` fails on an export of `packages/shared` fewer than two packages name. The page also owns the client/node cross-realm exception, env-reading scripts, and the domain-package rule for Azure helpers.

## Symlinks — `references/symlinks.md`

Read it before creating or verifying one. In short: PowerShell `New-Item -ItemType SymbolicLink`, **never `ln -s` on Windows**, which copies the file and commits duplicate content silently.

## Constant Maps — `references/constant-maps.md`

Read it when adding a map keyed by an enum or discriminant, or deciding whether a second map may share its file. In short: **PascalCase matching the filename, `as const satisfies`, one map per file**.

### Typing over a discriminant — `references/generic-typing.md`

Read it when a map's entries are type-parameterised generics, when a component looks such a configuration up, or when writing a component generic over a subtype: explicit type map + `satisfies` mapped type (no `as` casts), a `MaybeRefOrGetter` lookup composable hiding the single internal cast, and `generic="T extends …"` SFCs that take the typed value **and** its configuration as props.

## localStorage keys — `references/local-storage-keys.md`

Read it when adding, renaming or enumerating a persisted browser key. Every key lives in the one `LocalStorageKey` registry — never a `*_LOCAL_STORAGE_KEY` constant in a feature's `constants.ts`, never a literal inlined into `useLocalStorage(...)`.

## Command classes — `references/command-pattern.md`

Read it when adding or editing a command in the undo/redo stack: the base class, the field order, and why every instance is `markRaw`'d on entry.

## Creating a New Package — `references/new-package.md`

Read it when adding a package under `packages/`, adding a `bin` entrypoint (no shebang — pnpm generates the shim), or choosing `peerDependencies` vs `dependencies`. It carries the eight-step setup (package.json fields and scripts, the two tsconfigs, the tsdown factory, the re-exporting `eslint.config.js`, the ctix barrel, `pnpm i`, `pnpm build`) and the placement rule that decides what the build externalizes.

## Renaming — no alias re-exports — `references/renames.md`

Delete the old file and update every import site; a re-export alias is a second importable path that keeps the old name discoverable and the rename half-done. **Renaming a file, or moving a function into a shared package**, is that page.

## File Length

- **Target 50-100 lines per file** (`.ts` and `.vue` alike) — consistently over 100 lines is a yellow flag that an extraction is overdue (helper/sub-service/model for `.ts`; slot/sub-component/composable for `.vue` — see the `vue-component-patterns` skill).
- Each file should have a single clear responsibility. Split a file that handles multiple concerns.
- Exceptions: generated files, large constant maps with many entries, complex/rare layout components, and files where colocation of tightly coupled logic (a Zod schema next to its interface) is intentional.
