---
name: file-organization
description: Esposter file and folder organisation — the alias imports (shared/root/app-source, never relative) and the shared-may-not-import-client boundary, one export per file, no export{} syntax, no magic strings where a constant already means it, the literal a postinstall-evaluated or JSON config must repeat instead of importing and the two exclusions a walk into .agents/ owes, local type declarations at the top of the block, models vs services vs utils vs constants, the sole-consumer subfolder rule, no duplicate constants, when an extraction or a flag earns its existence, the ≥2-consumers rule for shared packages, renaming without re-export aliases, and file length — plus deep dives on cross-package placement, extraction shapes, config literals and repo-wide walks, constant maps, generic type maps and generic Vue components, symlinks, localStorage keys, command classes, and creating a workspace package. Apply when creating, moving, renaming, or organising any file, export, constant, or package.
---

# File & Folder Organisation

## Imports

- **Always use alias imports** — never relative imports (`./`, `../`), even for same-folder files. Enforced by oxlint `no-restricted-imports` for `packages/*/src/**` and the repo-root `scripts/src/**` (the `#src/*` half), each against the map its own manifest declares. Two things are exempt, sharing one override because the alias ban still applies to both: the ctix-generated `src/index.ts` barrel, which is not hand-written, and `.agents/**`, which is the one tree with no `imports` map to point at. `packages/configuration` is **not** exempt — it declares `#src/*` like every other package, its root `tsdown.config.ts` and `vitest.config.ts` included, and the bootstrap survives it because Node resolves the map to a `.ts` target it can already type-strip. Reaching the repo-root `package.json` is the one exception anywhere, since no `#` map reaches up out of its own package, and both sites carry an `oxlint-disable-next-line` saying so.
  - `#shared/` — the app's shared directory (`apps/web/shared/`, **not** `app/shared/`); models, services, constants shared between client and server.
  - `@@/` — project root (`apps/web/`); `server/` and other root-level paths.
  - `@/` — app source directory (`apps/web/app/`); `composables/`, `components/`, `store/`, `services/`, etc.
  - Never use `~~/` (old Nuxt alias) — replace with `@@/`.
  - **Never import a composable — `configuration/imports.ts` auto-imports `composables/**` whole.** An `import { useMutation } from "@/composables/shared/useMutation"` resolves to the same function the auto-import would hand you, so it is pure noise that reads as though this call site is reaching for something the others are not. Two things still need the specifier: a **type** exported beside a composable (`PaginationCacheOptions`, `OnlineSubscribableContext`), which the auto-import does not carry, and a `*.test.ts` / `*.bench.ts` helper living under `composables/`, which the scan skips.
  - Those are the **app's** aliases and Nuxt generates them. Everywhere else — every `packages/*` and the repo-root `scripts/` — a tree addresses its own source through the `#src/*` subpath imports its manifest declares, and oxlint bans `@/` there (`build` skill).
- **`shared/` may never import `@/` or `~/`** — it is parsed by the server as well as shipped to the browser, so a client import drags UI-library types and browser-only values into the server's graph. Banned by a root `.oxlintrc.json` override, type-only imports included. When a `shared/` module needs a client concern, give it a **twin**: `shared/` keeps the validating schema, `app/` derives the form schema from it with `safeExtend` and `satisfies z.ZodType<TSharedType>`. Moving the client module down into `shared/` relocates the boundary instead of restoring it. See `apps/web/content/docs/architecture/module-boundaries.md`.
- Import grouping, blank lines, ordering, and line endings — see the `formatting` skill.

## Files and Exports

- **One export per file** — each exported function, class, or interface in its own file. Exception: Zod schemas may colocate with their interface/type (tightly coupled).
- **Enums and shared model schemas get their own files** — exported enums, discriminated-union variants, payload types, and reusable Zod schemas belong in `models/` (or the relevant shared model folder), one named concern per file. Don't define an enum/reusable payload schema inside a Drizzle table file just because that table is the first consumer; schema files import model enums/types/schemas and only define the table plus its table-derived select schema/type.
- **Colocate single-use event/hook map types** — when an event/hook map interface (`FooHookMap`, `BarHookMap`) is imported only by its own service file (which creates the singleton), define the interface in that service file rather than a separate `models/` file; consumers import the instance, not the type. Does **not** apply to general type maps (`FooTypeMap`, `BarTypeMap`) — those stay in `models/` regardless of consumer count.
- **A composable's own parameter shape colocates with it** — an `Use<Name>Options`, a context or an emit type that exists only to name what that composable takes reads as part of its signature, and every consumer imports the two together. It moves to `models/` the moment something other than that composable's own callers names it. This is the Zod colocation exception applied to a signature rather than a schema.
- **An `interface` or `type` lives in its own file under `models/` (`app/models/<feature>/` app-local, `shared/models/<feature>/` cross-package), never beside the code that reads it** — a service, store, constant file or `.vue` component declares no type of its own; an options bag, a return shape or a resource contract is a model file the reader imports, so the next reader finds it where every other shape is. The local declarations are exactly the three exceptions above (a Zod schema's type, a single-use hook map, a composable's own options) plus an SFC's `Props` (the `vue` skill) and a test file's fixture shapes, and those sit together at the top of the block after the imports (and macros), before the runtime `const`/logic — never interleaved between logic blocks.
- **One class per file**, in a `models/` folder.
- **Never use `export { }` syntax** — always inline `export const`/`class`/`interface`/`type`/`function` at the declaration site. Only valid exceptions: empty `export {}` in `.d.ts` files (module marker), `ctix`-generated barrel files (pinned package), and a package's `eslint.config.js`, which re-exports the shared config as `export { default } from "@esposter/configuration/eslint/index.{typescript,vue}.js";` — ESLint demands a file at that exact path, so it is the tool's entrypoint rather than an import indirection, and it may not be a symlink (`references/symlinks.md`).
- **Functions go in `services/`** — factory functions, command creators, and other exported functions. `models/` is strictly classes and interfaces/types. **Exception**: the nullary factory that hands a model its own field default stays beside the type it constructs (`getInitialWorld` in `World.ts`, read only by `Save`'s `world = getInitialWorld()`). Where the type is derived from the value — `type Settings = typeof InitialSettings` — there is nowhere else for it to go, since the model would have to import a service to describe its own shape; where it is not, splitting the pair separates a default from the type it belongs to for no reader's benefit. A default factory that takes an argument, branches, or is read by anything but its own model is an ordinary service function (`createDefaultSheetSettings`).
- **External library extensions go in `services/`** — helpers that extend/wrap third-party libraries (`services/<lib>/doThing.ts`), not `util/`. A helper over a language global rather than a library is a `util/` one (`util/date/formatDate.ts`).
- **`utils/` is for truly universal utilities only** — math, string, regex, type utilities, Node/browser engine extensions with no external dependency. If the helper imports a third-party package, it belongs in `services/`. Generic browser utilities go in `app/utils/` (e.g. `readFoo.ts`).
- **Feature folders** — group related models/services/components under a feature subfolder (e.g. `feature/sub-feature/`).
- **Sole-consumer subfolder rule (CRITICAL).** A file lives in the subfolder of the **one feature that consumes it**, and stays at the parent level only when two or more sibling features import it or it is a shared primitive with no owning feature — which is what keeps a directory from accumulating twenty loose files from distinct sub-concerns. A `models/` folder mirroring a `services/` folder mirrors its feature subfolders too, leaving only cross-feature types at the root. Don't over-fragment the other way: a shared-primitive bucket stays whole even when large, and an already-feature-organised folder is not nested further.
- **No magic strings** — always use enums for discriminants, command types, and other categorical values. Before typing any literal, search the repo for a value that already means it and import that: an enum member (`Operation.Read`, `DatabaseEntityType.Post`), a separator (`ID_SEPARATOR`), a registry entry (`AsyncDataKey`, `LocalStorageKey`, `RoutePath`), a mime type off the configuration map. A literal is earned only when nothing existing means it — a second spelling of something the repo already names never renames with the original.

## Constants

- **Constants go in `constants.ts`** under `services/`, beside the files that use them — never a production `constants.ts` inside `composables/`, and never a module-scope `const MAX_THING = …` at the top of an SFC or composable: the moment a value is worth naming it is worth importing, and the next file that needs it should find it without reaching into a component. The test and bench equivalents are `constants.test.ts` / `constants.bench.ts`, carrying shared fixture data under the same multi-export exception, colocated with the code under test even when that sits under `composables/`. Helper _functions_ still get one file each (`testing` skill).
- **No duplicate constants — one source of truth per value (per runtime realm).** Never repeat the same literal (magic number/string) or re-declare the same named constant in two files within a realm; extract it to a `constants.ts` and import it when the value is reused or is a real source of truth, and leave single-use literals inline. E.g. `KIBIBYTE = 2 ** 10`, with `MEGABYTE = KIBIBYTE ** 2` derived from it — never a bare `1024`/`2 ** 20`. This includes test files: import the constant, don't re-declare a local copy in the `.test.ts`.
- **A config that cannot import the constant repeats the literal, says why, and is pinned by a test only where nothing downstream fails on the drift.** JSON, `.gitignore` and anything a `postinstall` evaluates have no module resolution for a workspace package, and a walk into `.agents/` owes two exclusions. Editing one: `references/config-literals.md`.
- **Do not extract function names into constants** — use `functionName.name` at the call site, or pass that `.name` down when a helper must report on behalf of the public API. A `CREATE_THING_ERROR_NAME = "createThing"` constant is duplication, not a source of truth. The one binding `.name` cannot serve is a const holding a factory's return — `getWslNativeCacheRoot = createProbeCache({ … })` names an anonymous closure, so its `.name` is `""` and the literal stays; name inference reaches only a function expression assigned directly.
- **Default option objects** are constants: export one shared `DEFAULT_*` object from the feature's `services/.../constants.ts` and reuse it everywhere, wrapped in `Object.freeze({ ... } satisfies InterfaceName)` so callers can't mutate the shared default. **`Object.freeze` is shallow**: it protects the top level only, and an array or object held in a property stays mutable. Freeze those values too, or a single caller's `push` becomes every later caller's default.

## Never Duplicate Similar Logic — Source AND Tests

Before writing a helper, grep for an existing one; before finishing a feature, grep for near-twin functions you may have created and collapse them. When ≥2 functions share a shape and differ only in a predicate/parameter, extract **one functional primitive** (`sweepEntries(directory, isStale)`) and make each caller a thin, intention-revealing wrapper that keeps the domain name and passes the constants.

- **An extraction earns its existence only when a call site stops being able to get something wrong** — the caller passes less than it did, or passes it in a shape that cannot be wrong. A wrapper carrying no logic, no invariant and no default is a rename with an import, and its decidable half is enforced by `pass-through-helper/no-forwarding-wrapper`.
- **A flag, field or primitive earns its existence only when something behaves differently without it.** Single responsibility is a unit having one job, never one boolean per case, and a distinction with no behavioural consequence is not debt.
- The shapes an extraction takes — the `create*` factory over shared state, why classes stay in `models/`, and the arguments already rejected against both rules above — are `references/extraction-and-duplication.md`.

## Cross-package placement — `references/cross-package-placement.md`

Read it before adding a module or constant to a shared package, relocating an existing one for symmetry, or implementing behaviour a second package needs. In short: **a shared package is for code with ≥2 consuming packages** — name the second consumer or leave the code beside its sole one, and when a second appears move the implementation rather than writing another. The home is the lowest package both already depend on. The page also owns the client/node cross-realm exception, env-reading scripts, and the domain-package rule for Azure helpers.

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

Read it when adding a package under `packages/`, adding a `bin` entrypoint (no shebang — pnpm generates the shim), or choosing `peerDependencies` vs `dependencies`. It carries the eight-step setup (package.json fields and scripts, the two tsconfigs, the rolldown factory, the re-exporting `eslint.config.js`, the ctix barrel, `pnpm i`, `pnpm build`) and the rule that every peer dependency must also appear in the rolldown `external` array.

## Renaming — no alias re-exports — `references/renames.md`

Delete the old file and update every import site; a re-export alias is a second importable path that keeps the old name discoverable and the rename half-done. **Renaming a file, or moving a function into a shared package**, is that page.

## File Length

- **Target 50-100 lines per file** (`.ts` and `.vue` alike) — consistently over 100 lines is a yellow flag that an extraction is overdue (helper/sub-service/model for `.ts`; slot/sub-component/composable for `.vue` — see the `vue-component-patterns` skill).
- Each file should have a single clear responsibility. Split a file that handles multiple concerns.
- Exceptions: generated files, large constant maps with many entries, complex/rare layout components, and files where colocation of tightly coupled logic (a Zod schema next to its interface) is intentional.
