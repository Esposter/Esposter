---
name: file-organization
description: Esposter file and folder organisation — the alias imports (shared/root/app-source, never relative) and the shared-may-not-import-client boundary, one export per file, no export{} syntax, the literal a postinstall-evaluated or JSON config must repeat instead of importing, local type declarations at the top of the block, models vs services vs utils vs constants, the sole-consumer subfolder rule, extracting duplication to one primitive or a create* factory, a flag earning its existence, no duplicate constants, the ≥2-consumers rule for shared packages and where cross-package constants/helpers live, constant maps with as-const-satisfies, the LocalStorageKey registry, MIME types in the configuration map, symlinks via PowerShell, renaming without re-export aliases, shared field schemas, and file length — plus deep dives on cross-package placement, generic type maps and generic Vue components, command classes, creating a workspace package, and single-file .agents/workflows scripts. Apply when creating, moving, renaming, or organising any file, export, constant, or package.
---

# File & Folder Organisation

## Imports

- **Always use alias imports** — never relative imports (`./`, `../`), even for same-folder files.
  - `#shared/` — the app's shared dir (`packages/app/shared/`, **not** `app/shared/`); models, services, constants shared between client and server.
  - `@@/` — project root (`packages/app/`); `server/` and other root-level paths.
  - `@/` — app source dir (`packages/app/app/`); `composables/`, `components/`, `store/`, `services/`, etc.
  - Never use `~~/` (old Nuxt alias) — replace with `@@/`.
- **`shared/` may never import `@/` or `~/`** — it is parsed by the server as well as shipped to the browser, so a client import drags UI-library types and browser-only values into the server's graph. Banned by a root `.oxlintrc.json` override, type-only imports included. When a `shared/` module needs a client concern, give it a **twin**: `shared/` keeps the validating schema, `app/` derives the form schema from it with `safeExtend` and `satisfies z.ZodType<TSharedType>`. Moving the client module down into `shared/` relocates the boundary instead of restoring it. See `packages/app/content/docs/architecture/module-boundaries.md`.
- Import grouping, blank lines, ordering, and line endings — see the `formatting` skill.

## Files and Exports

- **One export per file** — each exported function, class, or interface in its own file. Exception: Zod schemas may colocate with their interface/type (tightly coupled).
- **Enums and shared model schemas get their own files** — exported enums, discriminated-union variants, payload types, and reusable Zod schemas belong in `models/` (or the relevant shared model folder), one named concern per file. Don't define an enum/reusable payload schema inside a Drizzle table file just because that table is the first consumer; schema files import model enums/types/schemas and only define the table plus its table-derived select schema/type.
- **Colocate single-use event/hook map types** — when an event/hook map interface (`FooHookMap`, `BarHookMap`) is imported only by its own service file (which creates the singleton), define the interface in that service file rather than a separate `models/` file; consumers import the instance, not the type. Does **not** apply to general type maps (`FooTypeMap`, `BarTypeMap`) — those stay in `models/` regardless of consumer count.
- **Interfaces go in `models/`** — never define an exported interface inline in a `.vue` component. Extract to `app/models/<feature>/InterfaceName.ts` (app-local) or `shared/models/<feature>/InterfaceName.ts` (cross-package).
- **Local `interface`/`type` declarations sit at the top of the block** — within a `.vue` `<script setup>` or a `.ts` module, group them together after the imports (and macros), before the runtime `const`/logic. Never interleave one between logic blocks.
- **One class per file**, in a `models/` folder.
- **Never use `export { }` syntax** — always inline `export const`/`class`/`interface`/`type`/`function` at the declaration site. Only valid exceptions: empty `export {}` in `.d.ts` files (module marker) and `ctix`-generated barrel files (pinned package).
- **Functions go in `services/`** — factory functions, command creators, and other exported functions. `models/` is strictly classes and interfaces/types.
- **External library extensions go in `services/`** — helpers that extend/wrap third-party libraries (`services/<lib>/doThing.ts`, `services/dayjs/index.ts`), not `utils/`.
- **`utils/` is for truly universal utilities only** — math, string, regex, type utilities, Node/browser engine extensions with no external dependency. If the helper imports a third-party package, it belongs in `services/`. Generic browser utilities go in `app/utils/` (e.g. `readFoo.ts`).
- **Feature folders** — group related models/services/components under a feature subfolder (e.g. `feature/sub-feature/`).
- **Sole-consumer subfolder rule (CRITICAL).** A file lives in the subfolder of the **one feature that consumes it**, and stays at the parent level only when two or more sibling features import it or it is a shared primitive with no owning feature — which is what keeps a directory from accumulating twenty loose files from distinct sub-concerns. A `models/` folder mirroring a `services/` folder mirrors its feature subfolders too, leaving only cross-feature types at the root. Don't over-fragment the other way: a shared-primitive bucket stays whole even when large, and an already-feature-organised folder is not nested further.
- **No magic strings** — always use enums for discriminants, command types, and other categorical values. Before typing any literal, search the repo for a value that already means it and import that: an enum member (`Operation.Read`, `DatabaseEntityType.Post`), a separator (`ID_SEPARATOR`), a registry entry (`AsyncDataKey`, `LocalStorageKey`, `RoutePath`), a mime type off the configuration map. A literal is earned only when nothing existing means it — a second spelling of something the repo already names never renames with the original.

## Constants

- **Constants go in `constants.ts`** under `services/`, beside the files that use them — never a production `constants.ts` inside `composables/`, and never a module-scope `const MAX_THING = …` at the top of an SFC or composable. The moment a value is worth naming it is worth importing, and the next file that needs it finds it in the area's `constants.ts` rather than reaching into a component. The test and bench equivalents are `constants.test.ts` / `constants.bench.ts`, carrying shared fixture data under the same multi-export exception, colocated with the code under test even when that sits under `composables/`. Helper _functions_ still get one file each (`testing` skill).
- **No duplicate constants — one source of truth per value (per runtime realm).** Never repeat the same literal (magic number/string) or re-declare the same named constant in two files within a realm; extract it to a `constants.ts` and import it when the value is reused or is a real source of truth, and leave single-use literals inline. E.g. `KIBIBYTE = 2 ** 10`, with `MEGABYTE = KIBIBYTE ** 2` derived from it — never a bare `1024`/`2 ** 20`. This includes test files: import the constant, don't re-declare a local copy in the `.test.ts`.
- **A config that cannot import the constant repeats the literal and is pinned by a test.** Some files are read by a tool that has no module resolution for a workspace package: JSON (`tsconfig.json`, `.oxlintrc.json`), and — the one that fails loudly and late — anything a `postinstall` evaluates, which runs before any workspace package is built, so importing one fails the install itself on a fresh clone. Reaching for the constant there is not a tidier version of the literal, it is a broken install. Write the literal, say in a comment why it cannot be imported, and add the one test that asserts the file still carries the value its owner declares (`scripts/agentWorktrees.test.ts` for the JSON configs, `packages/app/content.config.test.ts` for the docs collection). That test is the exception to the rule against pinning wiring: nothing else fails when the copy drifts.
- **Do not extract function names into constants** — use `functionName.name` at the call site, or pass that `.name` down when a helper must report on behalf of the public API. A `CREATE_THING_ERROR_NAME = "createThing"` constant is duplication, not a source of truth.
- **Default option objects** are constants: export one shared `DEFAULT_*` object from the feature's `services/.../constants.ts` and reuse it everywhere, wrapped in `Object.freeze({ ... } satisfies InterfaceName)` so callers can't mutate the shared default.

## Never Duplicate Similar Logic — Source AND Tests

Before writing a helper, grep for an existing one; before finishing a feature, grep for near-twin functions you may have created and collapse them. When ≥2 functions share a shape and differ only in a predicate/parameter, extract **one functional primitive** (`sweepEntries(dir, isStale)`) and make each caller a thin, intention-revealing wrapper that keeps the domain name and passes the constants.

- **Stop at the primitive.** Don't introduce a stateful class or "lifecycle manager" when there is no state — it fights the functional grain and adds ceremony for nothing. Classes are for `models/` only.
- **Shared stateful control flow becomes a `create*` factory returning a closure.** When the near-twins also share per-module state (a memo, a cache tier ordering), the factory takes every varying part as a function parameter and returns the stateful closure. Each call site stays one named `export const` built from it, keeping its own domain rationale; a caller whose semantics differ — a guard that must run before the memo, an action that throws instead of degrading — wraps or parameterizes rather than forking the flow.
- **Module-scope closure state does not reset between tests** — a test depending on it must call `vi.resetModules()` and then dynamically `import()` the module (static imports stay cached), or build a fresh instance from the factory per test.
- **Don't force unrelated things together** — different domains stay separate even when they rhyme. The abstraction must reduce total complexity: single-use code stays inline, and per-feature helpers encoding genuinely different semantics stay separate.
- **An extraction earns its existence only when a call site stops being able to get something wrong.** The test is what the caller no longer has to state, never how short the call reads. A helper that still takes every element hand-written at every call site — `getUnsubscribeAll(a, b, c)` over an inline `[a, b, c]` loop — has moved a loop and absorbed no decision: forgetting one is exactly as easy after. A wrapper carrying no logic, no invariant and no default is a rename with an import, so delete it and leave the inline form. Extraction that pays: the caller passes less than it did, or passes it in a shape that cannot be wrong. **Enforced** by `pass-through-helper/no-forwarding-wrapper` (`scripts/oxlint/passThroughHelper.ts`) for the decidable half — an exported arrow whose whole body is one call passing exactly its own parameters. It has no production suppressions and gets none: "it narrows the parameter type", "it is the single definition several reads agree on" and "it mirrors an upstream API name" have all been raised and rejected. Inline the wrapper.
- **A flag, field or primitive earns its existence only when something behaves differently without it.** The mirror of the rule above: collapsing near-twins wins because two things become one, so splitting one mechanism into two that each need a decision at every call site loses. Single responsibility is a unit having one job, never one boolean per case. Prefer an over-approximation that costs nothing to a precise distinction that adds surface — one flag covering two causes is free when the consequence is identical — and architect so the case never has to be accounted for rather than adding the switch that accounts for it. **A distinction with no behavioural consequence is not debt**; recording it as such invites the next reviewer to build the switch.

## Cross-package placement — `references/cross-package-placement.md`

Read it before adding a module or constant to a shared package, relocating an existing one for symmetry, or implementing behaviour a second package needs. In short: **a shared package is for code with ≥2 consuming packages** — name the second consumer or leave the code beside its sole one, and when a second appears move the implementation rather than writing another. The home is the lowest package both already depend on. The page also owns the client/node cross-realm exception, env-reading scripts, and the domain-package rule for Azure helpers.

## `.agents/workflows` scripts and repo-wide globs — `references/workflow-scripts.md`

Read it when editing a workflow script or its tests, or writing any glob (Vitest project, tsconfig, lint ignore) that reaches into `.agents/`. In short: the sandbox forbids `import`, so a script is **single-file by force and its length is not a finding**; split it by mode inside the file. Its tests are ordinary modular TypeScript, typechecked and linted, and each linter is configured for the scripts in its own file. Any repo-wide glob must exclude `AGENT_WORKTREES_DIRECTORY`.

## Symlinks

Always PowerShell `New-Item -ItemType SymbolicLink -Path <link> -Target <target>` (needs Developer Mode or an elevated shell), deleting the existing file first. **Never `ln -s` on Windows** — Git Bash's `ln` copies the file instead of linking, so duplicate content gets committed silently. The repo sets `core.symlinks=true` and stores links as git mode `120000`; verify with `git ls-files -s <path>`.

Tracked symlinks: `AGENTS.md` is the canonical agent guide, with `CLAUDE.md` and `GEMINI.md` pointing at it; `.claude` → `.agents`, so a harness reading either name finds one tree; each package's `eslint.config.js` → the shared `../configuration/eslint/index.{typescript,vue}.js`.

## Constant Maps

- **PascalCase matching the filename, with `as const satisfies`** — `export const FooConfigurationMap = { ... } as const satisfies Record<...>`. Per-variant definition maps and their `as const satisfies` mapped type — see the `typescript` skill (`references/type-modelling.md`).
  - **Exception**: when consumers need optional interface fields visible after enum lookup (e.g. `Item.color` on a map where some entries omit it), annotate explicitly — `const MapName: Record<Enum, Interface> = { ... }` — which widens lookup results to the shared interface while still enforcing every enum key.
- **Reuse existing item interfaces for UI metadata maps** instead of re-declaring an inline entry shape — the `Item` interface and its narrower alternatives are the `vue-page-composition` skill's.
- **Destructure in `v-for` unless passing the base item as props** — `v-for="{ key, format } of FooDefinitions"` over `v-for="definition of ..."` when only specific fields are needed. Exception: if the item itself is passed as a prop (`<SomeCard :item="definition" />`), don't destructure.
- **One constant map per file, named after the constant** — `FooConfigurationMap.ts` exports only `FooConfigurationMap`. Never colocate two independent maps in one file.
  - **Exception**: a map that only indexes declarations already in that file (a `type → schema` lookup beside the discriminated union built from those same schemas) stays with them — it has no existence apart from them, and splitting it would import every sibling straight back. This is the Zod colocation exception applied to a map.
  - When a map transforms another (e.g. omitting a key), derive it rather than restating the entries: `[Foo.Bar]: FooSchemaMap[Foo.Bar].omit({ name: true })`.

### Typing over a discriminant — `references/generic-typing.md`

Read it when a map's entries are type-parameterised generics, when a component looks such a configuration up, or when writing a component generic over a subtype: explicit type map + `satisfies` mapped type (no `as` casts), a `MaybeRefOrGetter` lookup composable hiding the single internal cast, and `generic="T extends …"` SFCs that take the typed value **and** its configuration as props.

## localStorage keys — `references/local-storage-keys.md`

Read it when adding, renaming or enumerating a persisted browser key. Every key lives in the one `LocalStorageKey` registry — never a `*_LOCAL_STORAGE_KEY` constant in a feature's `constants.ts`, never a literal inlined into `useLocalStorage(...)`.

## Command classes — `references/command-pattern.md`

Read it when adding or editing a command in the undo/redo stack: the base class, the field order, and why every instance is `markRaw`'d on entry.

## MIME Types

Store MIME type strings in the relevant configuration map (e.g. `DataSourceConfigurationMap`) rather than calling `mime-types` `lookup` at runtime — `mime-types` uses Node.js `path.extname`, unavailable in the browser. Access `mimeType` through the configuration map at the call site.

## Creating a New Package — `references/new-package.md`

Read it when adding a package under `packages/`, adding a `bin` entrypoint (no shebang — pnpm generates the shim), or choosing `peerDependencies` vs `dependencies`. It carries the eight-step setup (package.json fields and scripts, the two tsconfigs, the rolldown factory, the symlinked `eslint.config.js`, the ctix barrel, `pnpm i`, `pnpm build`) and the rule that every peer dependency must also appear in the rolldown `external` array.

## Refactoring — No Alias Re-exports

When renaming a file (`createFoo.ts` → `createBar.ts`), **delete the old file** — never leave a re-export alias (`export { createBar as createFoo } from "./createBar"`). Update all import sites to the new path/name directly, and the barrel (`index.ts`) if it exported the old name. The alias pattern looks helpful but creates confusion: the old name stays discoverable, callers assume it's canonical, and the rename never fully propagates.

The same applies to a function that **moves into a shared package**: consumers import it from the owning package directly. Never leave a local file whose whole body re-exports it — one function with two importable paths means a grep for its call sites finds the wrong half. A package barrel (`index.ts`) is the one file allowed to re-export, because publishing the package is its entire job.

## Shared Schemas

When multiple models share a field (e.g. `bar`), define a single named interface + schema (`Bar` / `barSchema`) in `shared/models/entity/` and spread the schema's `.shape` into each model schema. No `With` prefix. Don't add `.default(...)` to the shared schema — each implementing class declares its own default as a class field and adds it at the schema call site.

## File Length

- **Target 50-100 lines per file** (`.ts` and `.vue` alike) — consistently over 100 lines is a yellow flag that an extraction is overdue (helper/sub-service/model for `.ts`; slot/sub-component/composable for `.vue` — see the `vue-component-patterns` skill).
- Each file should have a single clear responsibility. Split a file that handles multiple concerns.
- Exceptions: generated files, large constant maps with many entries, complex/rare layout components, and files where colocation of tightly coupled logic (a Zod schema next to its interface) is intentional.
