---
name: oxlint
description: Apply when fixing lint errors, editing oxlint.config.ts, configuring vitest lint rules, investigating a slow oxlint pass, writing a custom lint rule, adding an accessibility attribute to a template, or adding regexes, interface declarations or JSON parsing. Esposter's lint conventions for oxlint and vize — which pass runs a rule, how it is changed and rolled out, and how a disable directive is written.
---

# Oxlint and Vize Conventions

## Settled — do not re-propose

- **`oxc/no-map-spread` switched off.** Its message names one alternative, mutating the element in the `.map` callback, which the immutability rule bans, and `Object.assign({}, …)` is `prefer-object-spread`'s error, so the rule left only a directive at every site that built a new object. It is off, and `immutability/no-map-mutation` bans the mutation it steered toward (`references/custom-js-plugins.md`, `.agents/skills/typescript/references/collections.md`).
- **A plugin for the file-organization skill's models rule** (an `interface` or `type` outside `models/`). Every one of its exceptions is a roster — path globs for the trees whose files are the type, name suffixes for hook maps and a composable's own options, a directory test for composables — and a roster is the maintenance the decision tree in `references/custom-js-plugins.md` rejects. The rule stays a review and sweep rule.
- **The tool names in `comments/no-capitalized-identifier`** (`Pnpm`, `Oxlint`, `Tinybench` — the tool-name alternation in `.agents/ledgers/comments.md`'s find recipe). The list grows with every tool the repo adopts, and nothing in one file says a word was ever lowercase, so the rule decides only the names a function prefix or the file's own bindings prove; the rest stays the ledger's grep.

## Deep Dives

- `references/lint-configuration.md` — when editing `oxlint.config.ts` (a category, a rule entry, an `overrides` scope), probing a rule check-only, deleting a disable directive, or bumping oxlint.
- `references/plugin-rules.md` — when a `vitest/` or `promise/` rule reports, a style pair fights, or a rule with a site or two is weighed.
- `references/ignore-patterns.md` — when editing `ignorePatterns`, the oxlint step hangs, or oxlint walks an agent worktree.
- `references/type-aware-cost.md` — when the oxlint pass slows, its memory climbs, or one type-aware rule tops the timings table.
- `references/import-rules.md` — when an import rule reports: a duplicate import, a comment in the import block, a module cycle.
- `references/json-linting.md` — when changing what is checked in the repo's JSON, adding a JSONC file, or adding a generated JSON tree.
- `references/rule-cost.md` — when writing or reviewing a selector-ban entry or a JS plugin rule, or when one tops the timings table: how calls are counted, the selector shapes that run on every node, and the gates a plugin rule takes.
- `references/stale-directives.md` — when a lint reports an unused disable directive, or a template directive may suppress nothing.
- `references/custom-js-plugins.md` — before writing any lint rule for a repo convention: the decision tree that says whether it earns a plugin at all (twice-found, syntactic, no roster of paths or helper names, nothing stock says it), and how one is authored under `scripts/src/oxlint/`.
- `references/rule-notes.md` — when a rule reports and the fix is not what its message says: the `require-await`, `prefer-spread` and `prefer-mock-promise-shorthand` autofixes, `no-useless-default-assignment` on an overload, the `method-signature-style` exceptions, the `expect.any` and `JSON.parse` bans and when a `JSON.parse` disable is earned, the `fetch` ban in `scripts/`, `prefer-named-capture-group`.
- `references/template-accessibility.md` — when an `a11y/*` rule reports on a template, when adding an accessibility attribute, or when promoting one of the staged-off rules.

## Running lint

Oxlint runs as **one repo-wide pass** from the one `oxlint.config.ts` at the repo root, and vize lints every component's template in its own pass, the root `lint:vue` task. So the root `vp run lint:fix` — oxlint's fix over the whole tree, then vize's — is the only lint that matches CI's, and a session runs it only to answer CI's red (the `running-checks` skill). The narrower lanes are for iterating: `vp run lint:fix:packages` covers `packages/` alone, and a targeted `oxlint <path>` takes seconds, worth running to find a rule's hits mid-sweep.

**The verdict rule is the `running-checks` skill's** (`references/reading-results.md`); here the root lint runs one leaf per pass and every leaf reports, so a clean summary sits above a failed one and the log may hold several, and `vp run` replaying a cached task makes the earlier lines look freshly computed when they were not. Redirect to a file and read `$?`, or read the whole output rather than its end.

**Never hand-fix lint errors** — let the fix script do it. **The one exception is while you are changing a rule**: an edit to `oxlint.config.ts` is verified check-only, because a fix variant would rewrite the repo to satisfy a decision that is still being made (`references/lint-configuration.md`).

**A new ban is rolled out from one violation list, never one package at a time.** Oxlint and vize each pass the whole repository once, so one check-only run lists every site across the tree. Collect the whole set before editing anything: a rule finds sites a grep for the same shape does not, because the shape wraps across lines, so the list is also the count.

## Which directive to use

Pick the directive by **which pass reports the rule**, and spell the rule the way that pass names it:

- **Oxlint rule** → `oxlint-disable`, using oxlint's plugin prefix: `typescript/`, `unicorn/`, `import/`, `oxc/`, `promise/`, `vitest/`, `vue/`. Never `@typescript-eslint/` — oxlint accepts it as an alias, so it silently works and drifts. Core rules take no prefix (`no-void`, `prefer-spread`). `no-inferrable-types` and `require-await` exist under both a core and a `typescript/` name — prefix them.
- **Local plugin rule** → `oxlint-disable`, named by the plugin's `meta.name`: `selector-ban/no-restricted-syntax`, `sequential-loops/require-loop-shape`.
- **Template rule** → an HTML comment directive in the spelling vize reads, naming the `a11y/` or `vue/` rule (`references/template-accessibility.md`).
- Format: file-level on the first line, `/* oxlint-disable <rule> -- reason */`; line-level, `// oxlint-disable-next-line <rule> -- reason`. The reason is required: `comments/require-directive-reason` reports a script directive without one, and the template half, `scripts/src/workspace/templateDirectiveReasons.test.ts`, fails a template directive without one. A bare directive naming no rule turns every rule off, so it is written only into generated files the lint already ignores. A `no-await-in-loop` reason opens each `; `-separated clause with its shape (`Retry: …`), one of the `runtime-efficiency` skill's sequential-loops page (`sequential-loops/require-loop-shape`).
- **One rule disabled on several lines of a file is one file-level directive, not repeated `-next-line` ones.** `comments/no-repeated-disable-next-line` reports each repeat per linter prefix and rule, and its autofix collapses them into one directive at the top with the distinct reasons joined. When a file-level directive would also hide the sites a later edit adds to that file, the lines take a `// oxlint-disable <rule>` block closed by `// oxlint-enable <rule>` after the last line it covers, so only those lines are excused.
- **A directive a better spelling removes is not a reason.** Before writing one, try the form the rule asks for — `match.groups` rather than skipping capture groups, a named field rather than a positional one; the directive is for the case where the rule is wrong about this code, never for code the rule is right about.
- **A generated file that fails a rule is fixed in its writer, never disabled.** No directive, config override or `ignores` entry covers a generated path to get past a rule, with two exceptions, each a file-level `no-restricted-syntax` directive its generator emits: a generated lazy-loader map, for the `await import()` ban (`typescript` skill, `references/dynamic-imports.md`), and the game data's key map, for the value-set casing rule, since its keys are the lock's own dataset names that readers look up at runtime and recasing them would break the lookup. The generator, or the code it writes, changes to produce what the rule expects, and the real output is linted to prove it.

## No type-aware rule of our own runs

Oxlint's built-in type-aware rules do run (`typeAware: true` in `oxlint.config.ts` — `restrict-template-expressions` is one, and it is what makes `String(x)` inside a template literal legitimate for an `unknown` or `symbol`). What cannot run is a type-aware rule we author: the type-aware backend runs no JS rules. **A convention that needs types is enforced by review, not by a rule** — do not add a type-aware plugin to buy one back (`openspec/specs/architecture/lint-toolchain/design.md`, Decisions).
