# Maintaining `.oxlintrc.json` and Disable Directives

## Changing a rule is a check-only exercise — never run `lint:fix`

Turning a rule on, loosening its options, or probing what one would report all mean running the linter against code that has not agreed to the rule yet, and a fix variant then **rewrites the repo to satisfy a decision nobody has made**. An autofixable rule lands across the whole tree in one pass, so the diff is too large to read, and the fixes for a rule you go on to reject have to be picked back out of a commit carrying the ones you kept. Some of them do not come back by re-running either: `require-await` strips a keyword the signature needed (`SKILL.md`), and a `no-duplicate-imports` merge folds a top-level `import type` back inline — the opposite of what `import/consistent-type-specifier-style` asks for.

So while `.oxlintrc.json` is being edited, run the **check-only** `pnpm lint` (or `oxlint -c <probe>`), never `lint:fix`/`lint:fix:packages`. The probe-config audit below is the same rule in practice: it reads diagnostics off a copy of the config and touches no source at all. A fix pass earns its run once the rule is settled and committed, not before.

## Categories — always list `correctness` explicitly

Oxlint keeps the `correctness` category enabled by default even when the config specifies other categories — but `eslint-plugin-oxlint` **replaces** its default categories with whatever the config lists. If `correctness` is missing from the explicit `categories` map, the plugin assumes the category is off and leaves every correctness rule's ESLint twin enabled — ESLint then re-runs the expensive type-aware rules (`no-floating-promises`, `await-thenable`, …) that oxlint/tsgolint already checks. Symptom: a rule shows up in ESLint `TIMING` output even though oxlint covers it. See `packages/app/content/docs/proposals/refactors/eslint-to-oxlint-migration.md` for the ongoing migration process.

**An unimported config file under `eslint/plugins/` is not automatically dead.** `plugins/json.js` is deliberately left out of `plugins/index.js`: it stages `json/recommended` and `json/sort-keys`, kept ready to switch on rather than rewritten when the tree can take them. Check a file for a rule set staged this way before calling it unreferenced.

Two things stand between that file and green, both measured by wiring it in and reading the run:

- **`json/sort-keys` reports six figures**, and nearly all of it is generated — the drizzle migration snapshots and the asset data blobs, where sorting the keys rewrites an artifact its generator owns. What survives excluding those is package manifests, where alphabetical is the _wrong_ order: the rule wants `description` before `version` and `devDependencies` before `scripts`. Enabling it means ignoring the generated trees and deciding that manifests are exempt, not a mechanical pass.
- **A JSONC file fails to parse under the `json/json` language** — `.vscode/settings.json` reports `Unexpected character '/'` on its first comment. Those paths need a second block using `json/jsonc`.

`json/recommended` on its own is already green repo-wide, and oxlint lints no JSON at all, so it is the half that can go on whenever someone wants it.

**A manual ESLint disable is dead weight only for a rule oxlint actually _runs_.** `eslint-plugin-oxlint` is appended last in every flat config, so its `"off"` entries win — but it generates one per rule in an enabled **category** and then deletes that entry again for every rule `.oxlintrc.json` deactivates, because a rule turned off is a rule not covered. An oxlint-side `"off"` and an ESLint-side `"off"` for the same rule are therefore a **pair**, not a duplicate: drop the ESLint half as redundant and the rule comes back on in ESLint alone, reporting across a tree oxlint passes clean. Check the root map for an `"off"` before deleting any ESLint disable. Notable exception: its `vue-svelte-astro-exceptions` config deliberately keeps `no-unused-vars`, `@typescript-eslint/no-unused-vars`, and `@typescript-eslint/consistent-type-imports` **enabled on `.vue` files**, so vue-side offs for those are load-bearing. Verify with `eslint --print-config <file>` on both a `.ts` and a `.vue` file before deleting a manual disable.

## A bump can enable a rule that contradicts the repo's own style

Categories are on wholesale, so an oxlint bump that promotes a new rule into one turns it on everywhere with no config change — and the count is the tell. `one-var` arrived that way and reported five figures of errors in one pass, every one of them the repo's own convention of one declaration per `const`. A rule the repo deliberately writes against goes to `"off"` in the root `rules` map rather than being obeyed; the count is what distinguishes it from a rule with a genuine backlog, so run `oxlint | grep -oE 'error [a-z-]+\([a-z0-9/-]+\)' | sort | uniq -c` before deciding.

A bump can also _regress_ a rule that was green the release before. A release made `no-redeclare` fire on TypeScript's value+type declaration merging — `export const Foo: {…} = {…} as const; export type Foo = typeof Foo;` — across every file using it, all legal TS. It is `"off"` in the root `rules` map: the pattern is the repo's own convention, and a genuine redeclaration is a typecheck error (TS2451) before it is ever a lint one. Pinning oxlint back instead would freeze every other rule with it; confirm a suspected regression with `pnpm dlx oxlint@<previous> …` before reaching for either.

## Configure a plugin rule under its prefixed name only

Oxlint resolves a bare rule name to the plugin rule of that name, so a bare entry and a prefixed entry are **the same rule** — and the bare one wins. `"no-unassigned-import": "off"` therefore silently voids an `"import/no-unassigned-import": ["error", { allow: … }]` entry above it: the rule never runs and its options are never read. The same aliasing applies to `no-async-await` (oxc), `no-namespace` (import), `no-await-expression-member`/`prefer-add-event-listener`/`prefer-global-this` (unicorn). Write every entry prefixed from the start; a bare one arriving in a diff is the thing to catch.

A dead entry looks exactly like a passing one, so audit it empirically: copy `.oxlintrc.json`, delete the suspect `"off"` entries, run `oxlint -c <probe> --format=json`, and count diagnostics per `code`. A rule reporting hits under the probe while the real config is green was never enforcing anything. Rules with **zero** hits are free to enable — delete the `"off"` line — but first plant a violation and confirm the rule fires, since a stale or unimplemented rule name also scores zero.

`ignorePatterns` is the odd one out: it is gitignore-style and matches the **path of the file being linted**, so an import specifier written there matches nothing. The import-specifier options (`allow`, `no-restricted-imports`'s `patterns[].group`) match the **whole specifier**, and in both kinds `*` does not cross `/`: `*.css` never matches `grapesjs/dist/css/grapes.min.css`, and an alias ban written `@/*` catches only a single segment — `@/foo`, never `@/services/foo`. That is the worse failure of the two, because almost every real import is nested: the ban still matches _something_, so it reads as working while passing everything it was written to stop. Always write the double star — `**/*.css`, `@/**`.

## An `overrides` entry **replaces** a rule's options

Scoping a rule to a path with an `overrides` entry does not merge its options with the top-level entry — it substitutes them wholesale, so every option the repo-wide entry carried silently stops applying inside that scope. A rule that takes a list of bans (`no-restricted-imports`, `no-restricted-syntax`) therefore has to **restate the repo-wide entries** alongside the scoped ones, and the duplication is load-bearing rather than sloppy. There is no comment syntax in `.oxlintrc.json` to say so, so the reason belongs in the docs page the ban serves.

Verify substitution empirically rather than by reading — plant a file in the scope that violates the _top-level_ option, then run `oxlint -c <probe> --format=json <file>` and confirm both diagnostics appear.

## `vitest/` rules run under oxlint

The vitest rules come from oxlint's `vitest` plugin (`@vitest/eslint-plugin` is removed). All categories are on, so every plugin rule is an error unless configured in `.oxlintrc.json`. Non-obvious entries there:

- **Configured with options** — `consistent-test-it` (`fn: "test"`; the default demands `it` inside `describe`) and `valid-title` (`ignoreTypeOfDescribeName`/`ignoreTypeOfTestName` allow the repo's `describe(functionRef)` convention). The rules are already on via categories; the entries restate `"error"` only to carry the options.
- **Pair rules** — oxlint ships both sides of style pairs; exactly one must be off or they fight: `prefer-called-once` is off because `prefer-called-times` matches the repo's `toHaveBeenCalledTimes(1)`; `no-importing-vitest-globals` is off because the repo imports vitest APIs explicitly (its counterpart `prefer-importing-vitest-globals` stays on).
- **`prefer-each` is on and owns that ban alone.** It asks for what the `testing` skill mandates — `test.each` for a table of cases, never a loop around `test` — so no `no-restricted-syntax` twin sits beside it; adding one back would only ask for a second disable comment on the same line. Measured against planted cases it catches `for`/`for...in`/`for...of` around `test`/`it`, the `.skip` and `.concurrent` forms included, and does not catch a `while` loop.
- **`prefer-describe-function-title` is off** — its fixer only checks that an identifier matching the title is in scope, not that it's a function; for arrays, Zod schemas, routers, or plugin objects the fix produces a `[object Object]` suite title.
- **`warn-todo`/`require-test-timeout`/`require-top-level-describe` are off** — `describe.todo` placeholders and hook-registering `setup*`/test-setup files are conventions here, and per-test timeouts are not used.

## `promise/` rules run under oxlint

The `promise` plugin is on, but most of what it enforces the repo already owns — and four of its rules argue with conventions or with another linter, so they are `"off"`:

- **`prefer-await-to-callbacks` is off** — it reads any `(error) => …` argument as an err-first callback, so every neverthrow `.match(onOk, (error) => …)` and `.orElse((error) => …)` in the repo reports. The pattern it asks you to replace is the one the `error-handling` skill mandates.
- **`avoid-new` is off** — `new Promise` here is deferreds, Phaser tweens, `sleep`, `openIndexedDb` and msw request-started signals. None of them has an `await` form to prefer.
- **`prefer-await-to-then` is off, and the `no-restricted-syntax` ban stays** — every site it reports already carries an `eslint-disable no-restricted-syntax` for the repo's own `.then`/`.catch`/`.finally` ban, so enabling it only asks for a second disable comment on the same line. The custom selector is also the stricter of the two: oxlint's rule skips a chain in a function that is deliberately not `async`, which the ban is written to catch, and its message points at `try`/`catch` — itself banned here — where the selector names `getResult`/`getResultAsync` + `.match`.
- **`no-return-wrap` is off — it contradicts a type-aware rule.** It reports `Promise.all(hooks.map((hook) => Promise.resolve(hook(...args))))` as a redundant wrap, but a `Promisable<void>` hook is not thenable, so removing the wrap makes `typescript/await-thenable` report the same line ("This expression is not Promise-like") — whose own help text prescribes the wrap back. `no-return-wrap` is syntactic and sees no types, so it cannot tell a real wrap from a union being normalised; the type-aware rule wins.
- **`param-names` is enabled at `"error"` with custom patterns** — its default patterns are anchored (`^_?resolve$`), which rejects the descriptive names the `naming` skill asks for (`resolveReadStarted`, `resolveTick`). The entry loosens both to a prefix match (`^_?resolve`, `^_?reject`), so a genuinely wrong name still reports.

Everything else in the plugin is green and left on category defaults.

## `ignorePatterns` — the tsgo hang is load-bearing

`options.typeAware: true` runs `tsgolint`, which drives the experimental tsgo. tsgo **infinite-loops** building the type graph for a file importing the giant recursive `three/webgpu` + `three/tsl` types, which is why the one file that does is in `ignorePatterns`. **Do not remove that exclusion** or the whole `oxlint` step hangs forever — every other file lints in seconds, so bisect a suspected new hang per-directory, then per-file.

The CI symptom is not what it looks like: the Lint job has no `timeout-minutes` and the workflow sets `cancel-in-progress`, so it runs until the next push cancels it and reports `ELIFECYCLE exit 129` (SIGHUP) — **not** a heap error, which would be 134 with `heap out of memory`. typescript-eslint does not hang on the same file: it uses the mature `typescript` compiler via `projectService`, not tsgo.

oxlint has no per-file type-aware toggle — `overrides` cannot set `options.typeAware` — so `ignorePatterns` is the only lever. Recheck whether a newer `oxlint-tsgolint` / tsgo fixes it before assuming the exclusion is still needed.

## `ignorePatterns` — `.agents/worktrees` is load-bearing

Agent worktrees are full parallel checkouts of this monorepo nested at `.agents/worktrees/<name>/`, so without that entry both linters walk a second copy of the whole repo per live worktree and report every diagnostic at another branch's path. It has to be stated here rather than left to git: the only thing hiding those paths from git is the agent harness's machine-local `.git/info/exclude`, which no clone or CI runner has. This one entry covers ESLint too — `eslint-plugin-oxlint`'s `buildFromOxlintConfigFile` turns `ignorePatterns` into flat-config `ignores`. The path itself is owned by `AGENT_WORKTREES_DIRECTORY` in `@esposter/configuration` (which carries the full rationale) and pinned to this file by `scripts/agentDirectories.test.ts`.

## `no-duplicate-imports` is only usable with `allowSeparateTypeImports`

A module's type imports are written as their own `import type` statement here — `import/consistent-type-specifier-style`, on through the `style` category, asks for exactly that — so the rule's default reads every one of those pairs as a duplicate, hundreds of them, all of them the convention. The entry has to carry `{ "allowSeparateTypeImports": true }`, which is what takes it to zero. `includeExports` is on beside it at no cost: the barrels ctix generates re-export without importing, so nothing here pairs an `import` with an `export … from` for the same module.

## Finding stale disable directives

Let each linter judge its own — never read one's verdict on the other's:

```bash
# oxlint: only "Unused oxlint-disable" lines are real. It flags every
# eslint-disable for a plugin it lacks (perfectionist) as unused — false.
pnpm dlx oxlint --disable-nested-config --report-unused-disable-directives
# eslint: reports unused directives even for rules it has turned off
eslint . --report-unused-disable-directives
```
