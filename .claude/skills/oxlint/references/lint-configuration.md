# Maintaining `.oxlintrc.json` and Disable Directives

## Categories — always list `correctness` explicitly

Oxlint keeps the `correctness` category enabled by default even when the config specifies other categories — but `eslint-plugin-oxlint` **replaces** its default categories with whatever the config lists. If `correctness` is missing from the explicit `categories` map, the plugin assumes the category is off and leaves every correctness rule's ESLint twin enabled — ESLint then re-runs the expensive type-aware rules (`no-floating-promises`, `await-thenable`, …) that oxlint/tsgolint already checks. Symptom: a rule shows up in ESLint `TIMING` output even though oxlint covers it. See `/docs/proposals/refactors/eslint-to-oxlint-migration` for the ongoing migration process.

**Manual ESLint disables for oxlint-covered rules are dead weight** — `eslint-plugin-oxlint` is appended last in every flat config, so its `"off"` entries win; hand-written deletes/offs stay only for rules it leaves enabled. Notable exception: its `vue-svelte-astro-exceptions` config deliberately keeps `no-unused-vars`, `@typescript-eslint/no-unused-vars`, and `@typescript-eslint/consistent-type-imports` **enabled on `.vue` files**, so vue-side offs for those are load-bearing. Verify with `eslint --print-config <file>` on both a `.ts` and a `.vue` file before deleting a manual disable.

## Configure a plugin rule under its prefixed name only

Oxlint resolves a bare rule name to the plugin rule of that name, so a bare entry and a prefixed entry are **the same rule** — and the bare one wins. `"no-unassigned-import": "off"` therefore silently voids an `"import/no-unassigned-import": ["error", { allow: … }]` entry above it: the rule never runs and its options are never read. The same aliasing applies to `no-async-await` (oxc), `no-namespace` (import), `no-await-expression-member`/`prefer-add-event-listener`/`prefer-global-this` (unicorn).

A dead entry looks exactly like a passing one, so audit it empirically: copy `.oxlintrc.json`, delete the suspect `"off"` entries, run `oxlint -c <probe> --format=json`, and count diagnostics per `code`. A rule reporting hits under the probe while the real config is green was never enforcing anything. Rules with **zero** hits are free to enable — delete the `"off"` line — but first plant a violation and confirm the rule fires, since a stale or unimplemented rule name also scores zero.

Path-glob options (`allow`, `ignorePatterns`) match the **whole import specifier**, and `*` does not cross `/`: `*.css` never matches `grapesjs/dist/css/grapes.min.css`. Always write `**/*.css`.

## `vitest/` rules run under oxlint

The vitest rules come from oxlint's `vitest` plugin (`@vitest/eslint-plugin` is removed). All categories are on, so every plugin rule is an error unless configured in `.oxlintrc.json`. Non-obvious entries there:

- **Configured, not enabled** — `consistent-test-it` (`fn: "test"`; the default demands `it` inside `describe`) and `valid-title` (`ignoreTypeOfDescribeName`/`ignoreTypeOfTestName` allow the repo's `describe(functionRef)` convention). The rules are already on via categories; the entries exist only to pass options.
- **Pair rules** — oxlint ships both sides of style pairs; exactly one must be off or they fight: `prefer-called-once` is off because `prefer-called-times` matches the repo's `toHaveBeenCalledTimes(1)`; `no-importing-vitest-globals` is off because the repo imports vitest APIs explicitly (its counterpart `prefer-importing-vitest-globals` stays on).
- **`prefer-describe-function-title` is off** — its fixer only checks that an identifier matching the title is in scope, not that it's a function; for arrays, Zod schemas, routers, or plugin objects the fix produces a `[object Object]` suite title.
- **`warn-todo`/`require-test-timeout`/`require-top-level-describe` are off** — `describe.todo` placeholders and hook-registering `setup*`/test-setup files are conventions here, and per-test timeouts are not used.

## Workflow scripts (`.claude/workflows/*.js`) — oxlint only

They are async function bodies the harness injects globals into, so they carry a top-level `return`. That is a **parse error** for ESLint's parser (`'return' outside of function`), not a finding it can report — so the root `eslint.config.js` ignores them and oxlint is their only linter. Oxlint parses them fine; the one rule turned off for them, via an `overrides` entry in `.oxlintrc.json`, is `unicorn/prefer-module` (it reads every top-level `return` as a violation). Everything else applies, including the repo's comment and template-literal style. There is no module system in the sandbox, so a fix that suggests an import is always wrong.

## `ignorePatterns` — `.claude/worktrees` is load-bearing

Agent worktrees are full parallel checkouts of this monorepo nested at `.claude/worktrees/<name>/`, so without that entry both linters walk a second copy of the whole repo per live worktree and report every diagnostic at another branch's path. It has to be stated here rather than left to git: the only thing hiding those paths from git is the agent harness's machine-local `.git/info/exclude`, which no clone or CI runner has. This one entry covers ESLint too — `eslint-plugin-oxlint`'s `buildFromOxlintConfigFile` turns `ignorePatterns` into flat-config `ignores`. The path itself is owned by `AGENT_WORKTREES_DIRECTORY` in `@esposter/configuration` (which carries the full rationale) and pinned to this file by `scripts/agentWorktrees.test.ts`.

## Finding stale disable directives

Let each linter judge its own — never read one's verdict on the other's:

```bash
# oxlint: only "Unused oxlint-disable" lines are real. It flags every
# eslint-disable for a plugin it lacks (perfectionist) as unused — false.
pnpm dlx oxlint --disable-nested-config --report-unused-disable-directives
# eslint: reports unused directives even for rules it has turned off
eslint . --report-unused-disable-directives
```
