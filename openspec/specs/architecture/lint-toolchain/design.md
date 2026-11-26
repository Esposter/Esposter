# Lint Toolchain

Lint is a set of passes, each reading the files it can parse and no other, so a rule runs in one pass only. Oxlint checks every script in the repository in one native pass, its type-aware rules included. Vize checks each component's template, which oxlint does not read. The workspace tests check what no linter reads: JSON files, banned dependencies, and the reasons on template directives. Knip finds unused files, exports and dependencies, and actionlint checks the workflows. `vize fmt` formats the components and oxfmt everything else, both sorting imports, and neither lints.

```mermaid
flowchart LR
  lint["vp run lint"] --> oxlint["oxlint: every script"]
  lint --> vize["vize: every component template"]
  lint --> knip["knip: unused files, exports, dependencies"]
  lint --> actionlint["actionlint: workflows"]
  fix["vp run lint:fix"] --> oxlint
  fix --> vize
```

The root `lint` task depends on the four checks above. `lint:fix` runs the two that rewrite files, oxlint's and vize's; knip and actionlint only report.

## The passes

- **Oxlint** runs once over the repository from `oxlint.config.ts`. Every category is listed explicitly at `error`, and `typeAware` runs the type-aware rules natively (see [The type-aware pass](#the-type-aware-pass)). Its rules are the native ones, the `selector-ban/no-restricted-syntax` lists, the local JS plugins, the Pinia rules among them in the `pinia` plugin. The local plugins are one entrypoint each under `scripts/src/oxlint/` (`selector-ban`, `sorting`, `props-interface`, `pinia` and the rest), and `oxlint/jsPlugins.ts` loads them by file, so a new one needs no entry.
- **Vize** runs each component's whole template from `vite/vueOptions.ts`. Its `incremental` preset runs only the rules that file names. Entries scope a rule set by path: the packages styled by scoped CSS alone take the template bans and the scoped-style bans, and the app takes its UnoCSS blocklist. The template ban lists are in `vite/services/`.
- **Knip** reads `knip.config.ts`. Its entries include the oxlint plugins, since oxlint loads them by path, and the sorting plugin's rules, which it imports from their folder at load.
- **Actionlint** checks the workflows, with its shellcheck and pyflakes passes off.
- **Workspace tests** are Vitest suites under `scripts/src/workspace/`, for what no linter reads: JSON and JSONC files (`jsonFiles.test.ts`), banned dependencies (`bannedDependencies.test.ts`) and the reasons on template directives (`templateDirectiveReasons.test.ts`).
- **Oxfmt** formats every file but a component with `oxfmt.config.ts` at the root, whose settings live in `packages/configuration/oxfmt/`. Its `sortImports` puts type imports first and values after, with packages and `#` subpaths ahead of relative ones.
- **`vize fmt`** formats the components, which oxfmt ignores, under the same shared block with `vue.fmt` in `vite/vueOptions.ts` over it (see [Two formatters](#two-formatters)).

## Directives and reasons

Each pass has its own spelling, and both require a reason.

- A script directive is `// oxlint-disable-next-line <rule> -- <reason>`, or `/* oxlint-disable <rule> -- <reason> */` on a file's first line. A local plugin's rule is named by its `meta.name`, as `selector-ban/no-restricted-syntax`. `comments/require-directive-reason` reports a directive without a reason.
- A template directive is the HTML comment `<!-- oxlint-disable-next-line <rule> -- <reason> -->`, the same spelling as a script's. Vize's tree carries no comment for a linter to read, so `scripts/src/workspace/templates/templateDirectiveReasons.test.ts` checks the reason.

## Where a ban is written

A ban goes to the first mechanism that can express it. The step is chosen by running a planted violation through the candidate, never by reading a rule list.

```mermaid
flowchart TD
  BAN["a ban to write"] --> READ{"does a linter read the file?"}
  READ -->|"no: JSON, manifests, template comments"| TEST["a workspace test in scripts/src/workspace/"]
  READ -->|yes| TPL{"a template?"}
  TPL -->|yes| VIZE["vize: a rule or a selector list in vite/"]
  TPL -->|no| NATIVE{"an oxlint rule expresses it?"}
  NATIVE -->|yes| OXLINT["oxlint.config.ts"]
  NATIVE -->|no| SELECTOR{"an AST selector expresses it?"}
  SELECTOR -->|yes| LIST["a list under scripts/src/services/oxlint/selectorBan/syntaxes/"]
  SELECTOR -->|no| PLUGIN["a JS plugin under scripts/src/oxlint/"]
```

A JS plugin is the last linter step: it is surface this repo owns, tests and maintains. A few bans stay selector entries rather than native rules: `window.localStorage`, `stopImmediatePropagation` and `splice`, since oxlint reads a component's script and not its template; the `.then`/`.catch`/`.finally` chain, since `promise/prefer-await-to-then` is off (the `oxlint` skill's `references/plugin-rules.md`); and the naming bans, since oxlint does not implement the naming rules. The TypeScript `private` keyword ban has no linter that ships it, so it is permanent. A catalog bump is checked by planting a violation for each local plugin and selector list; the `oxlint` skill's `references/lint-configuration.md`, "Bumping oxlint", is the runbook.

## The type-aware pass

The type-aware rules run on `tsrs-lint`, which oxlint launches with no flags. The switches the typecheck scripts pass `tsrs` are therefore set in `oxlint.config.ts`, through the environment the backend inherits.

Every root oxlint script passes `--debug=timings`, so each run ends with a table of rule times. The top rule is a lead, not a verdict: the backend computes each type once and caches it, so the first rule to force an expensive type is charged for it. A slow file is found by timing per package, then per file.

`no-deprecated` runs on every lint. An engine marks a call `@deprecated` a release before removing it, and the rule catches the call before it is committed.

The type-aware rules read the `.ts` files of the program and never a component's `<script>` block, so no type-aware finding is reported in a `.vue` file: oxlint sends the backend only the paths of script extensions ([oxc#30135](https://github.com/oxc-project/oxc/issues/30135)), whatever the content mapper types. A cast there keeps its reason as a plain comment, since a directive for it would suppress nothing.

`packages/genshin-mods` and `packages/genshin-persona/mod` turn `typescript/strict-void-return` off through an `overrides` entry. Asking whether an async hook fits the engine's generic `On` overloads costs far more there than anywhere else in the repository. Every other type-aware rule still runs in those trees.

## Decisions

**The type-aware backend is `tsrs-lint`.** It is the Rust port of the type-aware linter, bundled by vite-plus, which points oxlint at it. Rejected: running a second type-aware backend beside it, which leaves two backends for one set of rules.

**The lint sets the typecheck's switches itself.** `oxlint.config.ts` sets the content-mapper switch and the fast preset in the environment before oxlint starts the backend, so a lint run and the typecheck scripts share one checker setting by statement rather than by default. Rejected: a launcher script or a wrapper that adds the flag, since the backend reads the variables itself. Rejected too: setting them in the root scripts and in CI, which the editor's lint never runs. The `@TODO` in `oxlint.config.ts` names the upstream change that would let the lint configuration pass the backend its options directly.

**A type-aware rule the backend lacks is `"off"` until the backend ships it.** Categories are on wholesale, so an oxlint release can enable a type-aware rule `tsrs-lint` does not implement, and the backend then fails the whole type-aware pass on "unknown rule" rather than skipping that rule. The rule is set `"off"` with the upstream request as its `@TODO`, and it is turned on again once the backend ships it. Rejected: holding oxlint at the release before, which freezes every other rule with it.

**An unused disable directive fails the lint.** `reportUnusedDisableDirectives` is `"error"` in `oxlint.config.ts`, so a directive a change leaves with nothing to suppress is reported where it sits, and `lint:fix` deletes it. Rejected: the hunt by hand, which let stale directives collect between runs; and the CLI flag, which would add a switch to every lint script.

**`typescript/no-unsafe-enum-assignment` is off.** The repository declares no `enum`, since `erasableSyntaxOnly` refuses one, so the rule asks the checker for types it cannot report on, and it was the costliest rule of the type-aware pass.

**A convention that needs types is enforced by review, not by a local rule.** The backend runs no JS rules, so a local rule has no types, and a type-aware JS plugin would need the parser to read a project for every file, which multiplies the pass. Rejected: a type-aware local plugin.

**A consequence of the content mapper: a generic component's props are typed.** The mapper types a generic `.vue` component's test-utils `props()`, so a type-aware rule can report an assertion over an optional wrapper as unnecessary. The fix narrows the wrapper first, never a disable.

## Two formatters

Oxfmt formats every file but a component, and `vize fmt` formats the components: oxfmt has no plugin API, so neither can run inside the other, and vize formats no Markdown, YAML or standalone CSS. Each ignores the other's files. The shared `fmt` block in `vite.config.ts` is oxfmt's configuration, and vize reads it too, with `vue.fmt` (`VUE_OPTIONS`, `vite/vueOptions.ts`) merged over it key by key. Two keys differ there:

- **`ignorePatterns`** is the shared list without `**/*.vue`, which oxfmt adds to its own. Both read `IGNORE_PATTERNS` from `packages/configuration/oxfmt/`.
- **The attribute order** keeps every attribute as written except `class`, which leads its run of static attributes (`attributeGroups: [["class"], ["*"]]` under `attributeSortOrder: "as-written"`). That is rule 2 of the template order in the `vue` skill's `references/ordering.md`, and the one rule vize can express. A group names attributes rather than their shape, so an attributify utility and a boolean prop look alike, and the attributes no group names always come last, so the `is-*` boolean props cannot follow them. Rejected: a `type` group, since a valued prop follows the utilities in that order.

`vize fmt` writes the blank line between an SFC's top-level blocks, which oxfmt never did. Every format path routes a component to vize:

- **`pnpm format`** and **`format:check`** run `vize fmt` over `**/*.vue` beside `vp fmt`, `format:check` as two cached leaves (`vite/checkTasks.ts`).
- **The pre-commit hook** formats every staged component from its staged blob through `.githooks/formatComponent.ts`, which calls vize's `format()`: the command line reads no stdin, and under the main checkout's config, which a worktree with no install borrows, it skips the worktree's files as ignored.
- **`pnpm ai:format`** and the precheck format a component in process with `formatSync`, one file at a time (`scripts/src/services/format/formatSource.ts`).

Each names the root `vite.config.ts` as its configuration. `format()` discovers one from the component's directory otherwise and stops at the nearest Vite or Vitest config, which in an app is the app's `vitest.config.ts`, holding no formatter options.

A blank line inside a multi-line handler attribute keeps the handler's indentation, where every other blank line is written empty, and `vize fmt --check` fails the trimmed form ([Vize issue 13714](https://github.com/ubugeeei-prod/vize/issues/13714)). It is invisible at runtime, and the next format after the fix rewrites those lines.

## Key files

| File                                                | Role                                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `oxlint.config.ts`                                  | Categories, rules, `overrides`, `ignorePatterns` and the type-aware switches          |
| `oxlint/`                                           | The lists `oxlint.config.ts` reads, and `jsPlugins.ts`, which loads the local plugins |
| `scripts/src/oxlint/`                               | The local JS plugins, one entrypoint each                                             |
| `scripts/src/oxlint/pinia.ts`                       | The Pinia rules enabled under `pinia/<rule>`                                          |
| `scripts/src/services/oxlint/selectorBan/syntaxes/` | The selector-ban lists behind `selector-ban/no-restricted-syntax`                     |
| `vite/vueOptions.ts`                                | Vize's rules, its per-path entries and its formatter options                          |
| `vite/services/`                                    | Vize's template ban lists, and the HTML data behind the scoped-styles ban             |
| `vite/checkTasks.ts`                                | The `lint`, `lint:fix` and per-pass tasks                                             |
| `knip.config.ts`                                    | Knip's entries, which include the oxlint plugins                                      |
| `scripts/src/workspace/`                            | The tests for what no linter reads                                                    |
| `oxfmt.config.ts`, `packages/configuration/oxfmt/`  | The formatters' shared settings, import order and ignore list                         |
| `.githooks/formatComponent.ts`                      | A partly staged component's staged copy through vize's `format()`                     |

## The HTML data behind the scoped-styles ban

`scopedStyleSyntaxes.ts` reads two static tables of the HTML standard: the tag names in `htmlTagNames.ts` and each element's attributes in `htmlElementAttributes.ts`. Both are typed constants copied from the upstream `html-tag-names` and `html-element-attributes` packages under their MIT notice, and each file's header names the upstream release it came from. A refresh re-crawls the standard and re-checks those headers.

The tag names do not yet include `selectedcontent`, which the standard defines, so the ban does not check it until a refresh adds it.
