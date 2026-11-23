# Maintaining `oxlint.config.ts` and Disable Directives

Read when turning a rule on or off, loosening its options, probing what one would report, or writing or deleting a disable directive. Which pass runs each rule is in `SKILL.md`; this page is the file and the directive.

## Changing a rule is a check-only exercise — never run `lint:fix`

Turning a rule on, loosening its options, or probing what one would report all mean running the linter against code that has not agreed to the rule yet, and a fix variant then **rewrites the repo to satisfy a decision nobody has made**. An autofixable rule lands across the whole tree in one pass, so the diff is too large to read, and the fixes for a rule you go on to reject have to be picked back out of a commit carrying the ones you kept. Some of them do not come back by re-running either: `require-await` strips a keyword the signature needed (`references/rule-notes.md`).

So while `oxlint.config.ts` is being edited, run the **check-only** `vp run lint` (or `oxlint -c <probe>`), never `vp run lint:fix`/`vp run lint:fix:packages`. The probe-config audit under "Configure a plugin rule under its prefixed name only" is the same rule in practice: it reads diagnostics off a copy of the config and touches no source at all. A fix pass earns its run once the rule is settled and committed, not before.

## A bump can enable a rule that contradicts the repo's own style

Categories are on wholesale, so an oxlint bump that promotes a new rule into one turns it on everywhere with no config change — and the count is the tell. `one-var` is that shape: it reports five figures of errors, every one of them the repo's own convention of one declaration per `const`. A rule the repo deliberately writes against goes to `"off"` in the root `rules` map rather than being obeyed; the count is what distinguishes it from a rule with a genuine backlog, so run `oxlint | grep -oE 'error [a-z-]+\([a-z0-9/-]+\)' | sort | uniq -c` before deciding.

A bump can also enable a type-aware rule the backend does not implement yet. Categories are on wholesale, so the rule turns on everywhere, and the backend fails the whole type-aware pass on "unknown rule" rather than skipping it, which reads as the lint being broken. Set it `"off"` with the upstream request as its `@TODO` (`oxc-project/tsgolint` #1371 for `typescript/no-unsafe-class-instance-assignment`, from oxlint 1.95) and turn it back on once the backend ships it; holding oxlint back freezes every other rule with it (`openspec/specs/architecture/lint-toolchain/design.md`, "Decisions").

A bump can also _regress_ a rule that was green the release before. `no-redeclare` is `"off"` in the root `rules` map because it fires on TypeScript's value+type declaration merging — `export const Foo: {…} = {…} as const; export type Foo = typeof Foo;` — which is legal TS: the pattern is the repo's own convention, and a genuine redeclaration is a typecheck error (TS2451) before it is ever a lint one. Pinning oxlint back instead would freeze every other rule with it; confirm a suspected regression with `pnpm dlx oxlint@<previous> …` before reaching for either.

## Configure a plugin rule under its prefixed name only

Oxlint resolves a bare rule name to the plugin rule of that name, so a bare entry and a prefixed entry are **the same rule** — and the bare one wins. `"no-unassigned-import": "off"` therefore silently voids an `"import/no-unassigned-import": ["error", { allow: … }]` entry above it: the rule never runs and its options are never read. The same aliasing applies to `no-async-await` (oxc), `no-namespace` (import), `no-await-expression-member`/`prefer-add-event-listener`/`prefer-global-this` (unicorn). Write every entry prefixed from the start; a bare one arriving in a diff is the thing to catch.

A dead entry looks exactly like a passing one, so audit it empirically: copy `oxlint.config.ts`, delete the suspect `"off"` entries, run `oxlint -c <probe> --format=json`, and count diagnostics per `code`. A rule reporting hits under the probe while the real config is green was never enforcing anything. Rules with **zero** hits are free to enable — delete the `"off"` line — but first plant a violation and confirm the rule fires, since a stale or unimplemented rule name also scores zero.

`ignorePatterns` is the odd one out: it is gitignore-style and matches the **path of the file being linted**, so an import specifier written there matches nothing. The import-specifier options (`allow`, `no-restricted-imports`'s `patterns[].group`) match the **whole specifier**, and in both kinds `*` does not cross `/`: `*.css` never matches `theme-kit/theme.min.css`, and an alias ban written `@/*` catches only a single segment — `@/foo`, never `@/services/foo`. That is the worse failure of the two, because almost every real import is nested: the ban still matches _something_, so it reads as working while passing everything it was written to stop. Always write the double star — `**/*.css`, `@/**`.

## An `overrides` entry **replaces** a rule's options

Scoping a rule to a path with an `overrides` entry does not merge its options with the top-level entry — it substitutes them wholesale, so every option the repo-wide entry carried silently stops applying inside that scope. A rule that takes a list of bans (`no-restricted-globals`, `no-restricted-imports`) therefore has to **restate the repo-wide entries** alongside the scoped ones. `oxlint.config.ts` restates them by construction rather than by copy: each entry is a constant declared once in `oxlint/`, which the config imports, and the root list is `RESTRICTED_GLOBALS` / `RESTRICTED_IMPORT_PATHS`, and an override spreads that list and lifts an entry by identity (`RESTRICTED_GLOBALS.filter((restrictedGlobal) => restrictedGlobal !== USE_ROUTE_GLOBAL)`) or appends its own. A ban added to the root list reaches every scope that does not lift it, so there is no copy to drift and no suite holding copies to the root. A new repo-wide import ban is still a selector in `scripts/src/services/oxlint/selectorBan/syntaxes/restrictedImportSyntaxes.ts`, which `selector-ban/no-restricted-syntax` reads with every other list.

The `oxlint/` folder is laid out as the `file-organization` skill lays out any source: the entries' interfaces are one per file under `oxlint/models/`, its one function (`getAutoImportedPaths`, which reads a tree's generated auto-import declarations) is under `oxlint/services/`, and the constants sit in files named for their concern. The root and `scripts` tsconfigs glob the folder's files nested, so a file added at any depth is checked without an entry.

Verify substitution empirically rather than by reading — plant a file in the scope that violates the _top-level_ option, then run `oxlint -c <probe> --format=json <file>` and confirm both diagnostics appear.

**The omission is silent, so never write a scoped list out by hand.** An override that forgets a repo-wide ban lints exactly like one that carries it, so a ban can survive only in the one tree that never needed the override. `"off"` is the same bug in its shortest form: a `**/*.test.ts` entry turning `no-restricted-globals` off for `document` and `localStorage` also turns off the polling ban on `waitFor`/`waitUntil`, in the one file kind where polling is written. Lift the entries the scope does not need from the root list instead of switching the rule off wholesale.

**A scoped glob is stale until it is counted.** Two failure shapes, both of which read as passing: a glob matching **no files at all** (a tree that holds no TS), and a glob **stopping short of a tree that already follows the rule** (`packages/*/src/**` alone leaves `apps/infra`, `apps/jobs` and `apps/realtime` uncovered even though all three declare `#src/*` and none has a `paths` block, and a dead `oxlint-disable-next-line` for the ban then sits in the tree it never reached). `apps/web` has no `src/`, so `apps/*/src/**` is exactly the three non-Nuxt apps and reads as the twin of the packages glob. Count the files a glob matches before trusting it, and treat a disable directive found outside a ban's scope as evidence the scope is wrong rather than that the directive is.

## Bumping oxlint

On every oxlint catalog bump:

1. Read the timings table on the next root oxlint run (`references/type-aware-cost.md`). A rule that rises to the top is a lead, not a verdict.
2. Read a bump's new plugin rules against the selector lists too. A selector ban retires when a **plugin** rule turns out to express the same ban, so confirm the two agree against planted cases before deleting the selector entry.
3. Plant a violation for each local plugin rule and confirm it still fires. The JS plugin API is alpha, so a contract change silently drops a rule while CI stays green (`references/custom-js-plugins.md`, "Writing one").
4. A rule a bump newly covers is handled by the section above, "A bump can enable a rule that contradicts the repo's own style".
