---
name: oxlint
description: Esposter oxlint + ESLint linting conventions — which lint script to run locally vs in CI (oxlint is repo-wide, per-package scripts are ESLint only), never hand-fixing lint errors, verifying a rule change check-only because a fix variant rewrites the repo to satisfy a decision still being made, the require-await autofix that breaks a Promise-returning function, picking oxlint-disable vs eslint-disable and spelling the rule the reporting linter's way, method-signature-style and its overload exceptions, the no-useless-default-assignment false positive on an overloaded implementation signature, the expect.any and JSON.parse no-restricted-syntax bans and when a JSON.parse disable is earned, prefer-named-capture-group, why nothing type-aware can be linted, and the vuejs-accessibility template rules (which are staged off and what promotes them, component-tag false positives, template disable comments), plus deep dives on editing .oxlintrc.json (categories, prefixed rule names, vitest and promise entries, no-duplicate-imports needing allowSeparateTypeImports, ignorePatterns, stale-directive audits) and on the eslint-plugin-jsonc setup (the json vs jsonc recommended split, package.json staying on @eslint/json for depend, the generated-JSON exclusions, and why jsonc/sort-keys stays out) and on authoring a custom JS plugin. Apply when fixing lint errors, editing .oxlintrc.json, configuring vitest lint rules, investigating slow ESLint rules, writing a custom lint rule, adding an accessibility attribute to a template, or adding regexes, interface declarations or JSON parsing.
---

# Oxlint + ESLint Conventions

## Deep Dives

- `references/lint-configuration.md` — when editing `.oxlintrc.json` (a category, a rule entry, a vitest or promise option, `ignorePatterns`, an `overrides` scope), deleting a manual ESLint disable, or hunting stale disable directives.
- `references/custom-js-plugins.md` — when a repo-specific convention needs its own lint rule under `scripts/oxlint/`.

## Running lint

Oxlint runs as **repo-wide passes**, never per-package — there are no per-package `.oxlintrc.json` files, only one `.oxlintrc.json` at the repo root. Per-package `lint`/`lint:fix` scripts (in each package's `package.json`) run **ESLint only**. Oxlint is wired into the **root** scripts instead:

- `pnpm lint` / `pnpm lint:fix` (root) — `oxlint` over the whole repo, then ESLint.
- `pnpm lint:fix:packages` / `pnpm lint:packages` (root) — `oxlint packages` (all packages), then ESLint over non-app packages.

The root `pnpm lint` is **three** passes, and the two local lanes below cover two of them. The third is `eslint .` from the root, and it is the only one that reaches **`scripts/`, `.agents/` and the root config files** — neither lane does, because one filters to `packages/*` and the other runs inside `packages/app`. A change to a sweep script or a skill is therefore unlinted locally however carefully the lanes are run, and lands as a red CI Lint job over a rule the fix variant would have applied silently. Run `pnpm exec eslint --fix .` from the root whenever the change touches anything outside `packages/`.

**Local verification runs the fix variants**: `pnpm lint:fix:packages` (root) for `packages/*` (non-app) changes; `pnpm lint:fix` from `packages/app/` for app changes. Neither local path oxlints the app — `lint:fix:packages` ignores `packages/app/**` and the app-local script is ESLint-only; app oxlint coverage comes solely from the root `pnpm lint` in CI. Reserve the check-only `pnpm lint` for CI. Never hand-fix lint errors — let the fix script do it. **The one exception is while you are changing a rule**: an edit to `.oxlintrc.json` is verified check-only, because a fix variant would rewrite the repo to satisfy a decision that is still being made (`references/lint-configuration.md`).

## The `require-await` autofix can break a Promise-returning function

`require-await` strips `async` from a function whose body never awaits — and the lint hook applies it to any file you edit, so it lands on code you did not think you were touching. `async` is not only about awaiting: it also wraps a plain return value in a promise. A function annotated `: Promise<T>` that returns a bare `T` on one early-exit path (a no-op outcome returned before any async work) stops compiling the moment the keyword goes, and the error surfaces on the _return_ line, far from the edit that caused it.

Fix it by making that path's value a promise (`return Promise.resolve({ status: … })`) rather than re-adding `async` — the keyword goes straight back out on the next edit of the file. **Typecheck after any lint-hook autofix that touched a signature**; the hook reports success either way.

That fix restores the return type but not the rejection path: without `async`, a throw in the synchronous part of the body escapes at the call site instead of rejecting the returned promise, so a caller that only attaches `.catch()` never sees it. When the function is written to throw for its callers to handle as a rejection, keep `async` and disable `require-await` on it with that reason.

## Which directive to use

Pick the directive by **which linter reports the rule**, and spell the rule the way that linter names it:

- **Oxlint rule** → `oxlint-disable`, using oxlint's plugin prefix: `typescript/`, `unicorn/`, `import/`, `oxc/`, `promise/`, `vitest/`, `vue/`. Never `@typescript-eslint/` — oxlint accepts it as an alias, so it silently works and drifts. Core rules take no prefix (`no-void`, `prefer-spread`). `no-inferrable-types` and `require-await` exist under both a core and a `typescript/` name — prefix them.
- **ESLint-only rule** → `eslint-disable`, using the plugin's real name (`perfectionist/sort-objects`, `@typescript-eslint/no-misused-spread`). Rules oxlint owns are switched off in ESLint by `eslint-plugin-oxlint`, so an `eslint-disable` for one is dead weight.
- Oxlint honours **both** prefixes; ESLint honours only its own. A rule needing both (e.g. `no-control-regex`) needs one directive each — see `stripAnsi.test.ts`.
- Format: file-level on the first line, `/* oxlint-disable <rule> -- reason */`; line-level, `// oxlint-disable-next-line <rule>`. Always state the reason.

## Nothing type-aware runs in either linter

Type-aware linting goes through Rust/tsgolint, which can't run JS rules, and ESLint could only host such a rule by turning on `parserOptions.projectService`, which multiplies lint time (`neverthrow/must-use-result` was dropped for exactly that reason rather than moved). **A convention that needs types is enforced by review, not by a rule** — do not re-add a type-aware plugin to buy one back.

## Template accessibility — `vuejs-accessibility` (ESLint)

SFC templates are linted by `eslint-plugin-vuejs-accessibility`, configured in `packages/configuration/eslint/plugins/vuejsAccessibility.js`. It reads only the template AST, so it costs nothing type-aware; oxlint has no a11y plugin, so `eslint-plugin-oxlint` disables nothing here and every rule genuinely runs — in the ESLint passes only, which means app templates are never covered by `lint:fix:packages`.

- **Four rules are staged off**, each with its promotion condition beside it: `click-events-have-key-events`, `no-static-element-interactions`, `mouse-events-have-key-events` and `media-has-caption`. The first three are satisfied by adding tab stops, widget roles and focus-driven reveals — keyboard design decisions (a list of clickable cells wants one roving tabindex, not one tab stop each), not markup fixes. Promote a rule together with the widget pattern that earns it, never to quiet a lint run.
- **The adopted accessibility surface is what these rules check, and nothing beyond it.** A rule catches attributes, roles and handlers on an element; it cannot see page structure. So heading-level semantics — "the page title should be an `<h1>`", "sections want `<h2>`" — are **not** a convention here, and a review finding asking for one is declined rather than applied. Visual role is carried by a typography utility (`text-headline-small`, `text-h6`) on whatever element the layout wants, and titles usually come from a shell primitive (`StyledPageHeader`) rather than page markup, so no page can decide its own level correctly anyway. An unenforceable rule buys drift, not accessibility.
- **A finding on a component tag is usually wrong.** Most interactive markup here is Vuetify, which the plugin sees as an opaque tag and either skips or judges by a prop it can't resolve; a Vue component nested inside `<svg>` is misread as a plain element outright. Reach for the rule's own option before a disable — several ship an escape hatch whose _schema_ default ESLint never applies (`no-autofocus` needs an explicit `{ ignoreNonDOM: true }` to stay off component props).
- **Never silence a finding with an `aria-label` restating visible text.** Fix the markup, or disable the line with the reason. A control that only proxies a labelled affordance (a `hidden` file input behind a button) is `aria-hidden="true"` **plus** `tabindex="-1"`; `aria-hidden` alone trips `no-aria-hidden-on-focusable`.
- **Template directives are HTML comments**: `<!-- eslint-disable-next-line vuejs-accessibility/<rule> -- reason -->`. `-next-line` reaches the element's opening line only, so an attribute several lines down a multi-line tag needs an `eslint-disable` / `eslint-enable` pair wrapping the element instead. Both forms are safe above a single root element: the dev-mode render function becomes a fragment carrying `DEV_ROOT_FRAGMENT`, which the runtime resolves back to the one-element child for attribute fallthrough, and the production compiler strips template comments outright.
- Take only `files`, `plugins` and `rules` from the plugin's flat config — its `languageOptions` sets a bare `vue-eslint-parser` that would replace the Nuxt TS sub-parser and turn every `lang="ts"` block into a parse error.

## `typescript/no-useless-default-assignment` (oxlint)

The rule proves a default can never fire from the signature it is written on — and for an overloaded function that
is the **implementation** signature, never the overloads a caller actually sees. So a parameter one overload
declares optional, defaulted in an implementation whose own annotation makes it required, reports as a useless
default. Deleting it is a runtime defect the types no longer describe: the single-argument call indexes by
`undefined`. Take the file-level `/* oxlint-disable typescript/no-useless-default-assignment -- reason */`
(`packages/shared/src/util/array/takeOne.ts`).

## `typescript/method-signature-style` (oxlint)

Interface method signatures must be property signatures (`bar: (x: string) => void`, not `bar(x: string): void`). Two exceptions take a file-level `/* oxlint-disable typescript/method-signature-style -- reason */`:

1. **Built-in interface augmentations needing generic-per-call-site overloads** (`declare global { interface ObjectConstructor { … } }`) — method signatures let each call site pass different type arguments; property signatures don't.
2. **Third-party declaration files with real overloads** (DefinitelyTyped-style `.d.ts`) — overloaded method signatures can't be cleanly converted.

**Overloads in your own code** don't qualify: use call signatures inside an object type — `bar: { (x: string): void; (x: number): string }`.

## `no-restricted-syntax` bans (ESLint, `packages/configuration/eslint/typescriptRules.js`)

**`expect.any(...)`** and the other `expect.<asymmetric>` matchers are banned in tests — they assert only the type, not the value. Capture the real argument from the mock's `mock.calls` and assert it exactly (`const [upperDir] = takeOne(vi.mocked(fn).mock.calls);`). When the captured arg is a known shared reference, assert it directly (`toHaveBeenCalledExactlyOnceWith("error", noop)`); when only its type is knowable, use `toBeTypeOf`. `takeOne` and `noop` come from `@esposter/shared`.

**`JSON.parse`** is banned because `jsonDateParse` from `@esposter/shared` is the default parse: plain `JSON.parse` leaves every Date as an ISO string. A type argument on the parse replaces the `as` cast, and belongs on the plain-parse helper of the last bullet rather than on `jsonDateParse` — `parseMachineJson<{ "exit-code"?: number }>(line)`. It is still only a compile-time claim: anything crossing a trust boundary is typed by the schema that validates it (the **zod** skill's `references/boundary-payloads.md`). See `packages/app/content/docs/architecture/serialization.md`.

- Disable it on the line, with the reason, only where blanket revival would change wanted runtime behaviour: the parse feeds a Zod schema that validates and coerces the result itself while a free-text field could hold an ISO-shaped string (resource content blobs, drafts), payloads replayed verbatim (dead-letter events), and `jsonDateParse`'s own implementation.
- **Tests do not get a disable** — a test parses with `jsonDateParse` like everything else, unless the model it asserts against types the field as a string.
- **"The data has no dates" is not a reason** — the reviver is then a no-op, so `jsonDateParse` is the shorter correct call and stays correct if a date ever appears. That holds for machine-generated JSON whose string fields are a fixed vocabulary a program writes (versions, rule ids, status keys).
- **It stops holding the moment a string field is free-form text a person names** — a repo-relative path, a symlink target, a script body. The reviver reads shape, not schema, so a file legitimately called `2026-08-05T12:00:00Z` arrives as a `Date` the reading schema's `z.string()` then rejects, failing a whole read over one filename. Those documents parse plainly, through **one named helper per package** that owns the single disable — same rule as the content blobs above: the schema owns coercion, so the parse must not guess.

## `prefer-named-capture-group` (oxlint)

Every capturing group `(...)` must be named `(?<name>...)` — including plain groups inside lookaheads (`(?=...)`, `(?!...)`). `(?:...)` is already non-capturing and needs no name.

**Named groups retain positional indices**, so all existing usages keep working and only `match.groups.name` is new: replacement strings (`"$1"`), callback positional args, `exec(str)?.[1]`, and back-references (`\1`, also `\k<name>`).
