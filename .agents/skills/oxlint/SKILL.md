---
name: oxlint
description: Esposter oxlint + ESLint linting conventions — which lint script to run locally vs in CI (oxlint is repo-wide, per-package scripts are ESLint only), never hand-fixing lint errors, verifying a rule change check-only because a fix variant rewrites the repo to satisfy a decision still being made, picking oxlint-disable vs eslint-disable and spelling the rule the reporting linter's way, why nothing type-aware can be linted, and a new ban rolled out from one violation list, plus deep dives on the per-rule notes (the require-await autofix that breaks a Promise-returning function, method-signature-style and its overload exceptions, the no-useless-default-assignment false positive on an overloaded implementation signature, the expect.any and JSON.parse no-restricted-properties bans and when a JSON.parse disable is earned, prefer-named-capture-group), on the vuejs-accessibility template rules (which are staged off and what promotes them, component-tag false positives, template disable comments), on editing .oxlintrc.json (categories, prefixed rule names, vitest and promise entries, no-duplicate-imports needing allowSeparateTypeImports, ignorePatterns, stale-directive audits) and on the eslint-plugin-jsonc setup (the json vs jsonc recommended split, package.json staying on @eslint/json for depend, the generated-JSON exclusions, and why jsonc/sort-keys stays out) and on authoring a custom JS plugin. Apply when fixing lint errors, editing .oxlintrc.json, configuring vitest lint rules, investigating slow ESLint rules, writing a custom lint rule, adding an accessibility attribute to a template, or adding regexes, interface declarations or JSON parsing.
---

# Oxlint + ESLint Conventions

## Deep Dives

- `references/lint-configuration.md` — when editing `.oxlintrc.json` (a category, a rule entry, a vitest or promise option, `ignorePatterns`, an `overrides` scope), deleting a manual ESLint disable, or hunting stale disable directives.
- `references/custom-js-plugins.md` — when a repo-specific convention needs its own lint rule under `scripts/src/oxlint/`.
- `references/rule-notes.md` — when a rule reports and the fix is not what its message says: the `require-await` autofix, `no-useless-default-assignment` on an overload, the `method-signature-style` exceptions, the `expect.any` and `JSON.parse` bans and when a `JSON.parse` disable is earned, `prefer-named-capture-group`.
- `references/template-accessibility.md` — when a `vuejs-accessibility` rule reports on a template, when adding an accessibility attribute, or when promoting one of the staged-off rules.

## Running lint

Oxlint runs as **one repo-wide pass** from the one `.oxlintrc.json` at the repo root; a package's own `lint`/`lint:fix` is **ESLint only**. So the root `pnpm lint:fix` — oxlint over the whole tree, the app included, then `eslint .`, then every package's `lint:fix` — is the only lint that matches CI and the last one a change runs. The narrower lanes are for iterating: `pnpm lint:fix:packages` ignores `apps/web/**`, and a package's own script oxlints nothing. Only the root `eslint .` reaches **`scripts/`, `.agents/` and the root config files**, so a change to a sweep script or a skill lands as a red CI Lint job unless the root pass ran. A targeted `oxlint <path>` is seconds and worth running per unit mid-sweep, never as the gate.

**Never hand-fix lint errors** — let the fix script do it. **The one exception is while you are changing a rule**: an edit to `.oxlintrc.json` is verified check-only, because a fix variant would rewrite the repo to satisfy a decision that is still being made (`references/lint-configuration.md`).

**A new ban is rolled out from one violation list, never one package at a time.** Both root scripts end in `pnpm -r --parallel run lint`, which aborts on the first package that fails (`ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL`) — so a rule with sites in several packages reports one package's list, and clearing it only reveals the next. `pnpm -r --no-bail run lint` runs every package and reports all of them at once. Collect the whole set before editing anything: a rule finds sites a grep for the same shape does not, because the shape wraps across lines, so the list is also the count.

## Which directive to use

Pick the directive by **which linter reports the rule**, and spell the rule the way that linter names it:

- **Oxlint rule** → `oxlint-disable`, using oxlint's plugin prefix: `typescript/`, `unicorn/`, `import/`, `oxc/`, `promise/`, `vitest/`, `vue/`. Never `@typescript-eslint/` — oxlint accepts it as an alias, so it silently works and drifts. Core rules take no prefix (`no-void`, `prefer-spread`). `no-inferrable-types` and `require-await` exist under both a core and a `typescript/` name — prefix them.
- **ESLint-only rule** → `eslint-disable`, using the plugin's real name (`perfectionist/sort-objects`, `@typescript-eslint/no-misused-spread`). Rules oxlint owns are switched off in ESLint by `eslint-plugin-oxlint`, so an `eslint-disable` for one is dead weight.
- Oxlint honours **both** prefixes; ESLint honours only its own. A rule needing both (e.g. `no-control-regex`) needs one directive each — see `stripAnsi.test.ts`.
- Format: file-level on the first line, `/* oxlint-disable <rule> -- reason */`; line-level, `// oxlint-disable-next-line <rule>`. Always state the reason.

## Nothing type-aware runs in either linter

Type-aware linting goes through Rust/tsgolint, which can't run JS rules, and ESLint could only host such a rule by turning on `parserOptions.projectService`, which multiplies lint time (`neverthrow/must-use-result` was dropped for exactly that reason rather than moved). **A convention that needs types is enforced by review, not by a rule** — do not re-add a type-aware plugin to buy one back.
