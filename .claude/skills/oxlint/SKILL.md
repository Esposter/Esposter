---
name: oxlint
description: Esposter oxlint + ESLint linting conventions — the explicit correctness category rule in .oxlintrc.json (eslint-plugin-oxlint replaces default categories), the vitest plugin's configured/paired/off rules, method-signature-style exceptions (built-in augmentations, third-party .d.ts), prefer-named-capture-group naming patterns, and when to use disable directives. Apply when fixing lint errors, editing .oxlintrc.json, configuring vitest lint rules, investigating slow ESLint rules, or adding regexes/interface declarations.
---

# Oxlint + ESLint Conventions

## Running lint

Oxlint runs as **repo-wide passes**, never per-package — there are no per-package `.oxlintrc.json` files, only one `.oxlintrc.json` at the repo root. Per-package `lint`/`lint:fix` scripts (in each package's `package.json`) run **ESLint only**. Oxlint is wired into the **root** scripts instead:

- `pnpm lint` / `pnpm lint:fix` (root) — `oxlint` over the whole repo, then ESLint.
- `pnpm lint:fix:packages` / `pnpm lint:packages` (root) — `oxlint packages` (all packages), then ESLint over non-app packages.

**Local verification runs the fix variants**: `pnpm lint:fix:packages` (root) for `packages/*` (non-app) changes; `pnpm lint:fix` from `packages/app/` for app changes. Neither local path oxlints the app — `lint:fix:packages` ignores `packages/app/**` and the app-local script is ESLint-only; app oxlint coverage comes solely from the root `pnpm lint` in CI. Reserve the check-only `pnpm lint` for CI. Never hand-fix lint errors — let the fix script do it.

## `.oxlintrc.json` categories — always list `correctness` explicitly

Oxlint keeps the `correctness` category enabled by default even when the config specifies other categories — but `eslint-plugin-oxlint` **replaces** its default categories with whatever the config lists. If `correctness` is missing from the explicit `categories` map, the plugin assumes the category is off and leaves every correctness rule's ESLint twin enabled — ESLint then re-runs the expensive type-aware rules (`no-floating-promises`, `await-thenable`, …) that oxlint/tsgolint already checks. Symptom: a rule shows up in ESLint `TIMING` output even though oxlint covers it. See `/docs/proposals/refactors/eslint-to-oxlint-migration` for the ongoing migration process.

**Manual ESLint disables for oxlint-covered rules are dead weight** — `eslint-plugin-oxlint` is appended last in every flat config, so its `"off"` entries win; hand-written deletes/offs stay only for rules it leaves enabled. Notable exception: its `vue-svelte-astro-exceptions` config deliberately keeps `no-unused-vars`, `@typescript-eslint/no-unused-vars`, and `@typescript-eslint/consistent-type-imports` **enabled on `.vue` files**, so vue-side offs for those are load-bearing. Verify with `eslint --print-config <file>` on both a `.ts` and a `.vue` file before deleting a manual disable.

## `vitest/` rules run under oxlint

The vitest rules come from oxlint's `vitest` plugin (`@vitest/eslint-plugin` is removed). All categories are on, so every plugin rule is an error unless configured in `.oxlintrc.json`. Non-obvious entries there:

- **Configured, not enabled** — `consistent-test-it` (`fn: "test"`; the default demands `it` inside `describe`) and `valid-title` (`ignoreTypeOfDescribeName`/`ignoreTypeOfTestName` allow the repo's `describe(functionRef)` convention). The rules are already on via categories; the entries exist only to pass options.
- **Pair rules** — oxlint ships both sides of style pairs; exactly one must be off or they fight: `prefer-called-once` is off because `prefer-called-times` matches the repo's `toHaveBeenCalledTimes(1)`; `no-importing-vitest-globals` is off because the repo imports vitest APIs explicitly (its counterpart `prefer-importing-vitest-globals` stays on).
- **`prefer-describe-function-title` is off** — its fixer only checks that an identifier matching the title is in scope, not that it's a function; for arrays, Zod schemas, routers, or plugin objects the fix produces a `[object Object]` suite title.
- **`warn-todo`/`require-test-timeout`/`require-top-level-describe` are off** — `describe.todo` placeholders and hook-registering `setup*`/test-setup files are conventions here, and per-test timeouts are not used.

## Which directive to use

Pick the directive by **which linter reports the rule**, and spell the rule the way that linter names it:

- **Oxlint rule** → `oxlint-disable`, using oxlint's plugin prefix: `typescript/`, `unicorn/`, `import/`, `oxc/`, `vitest/`, `vue/`. Never `@typescript-eslint/` — oxlint accepts it as an alias, so it silently works and drifts. Core rules take no prefix (`no-void`, `prefer-spread`). `no-inferrable-types` and `require-await` exist under both a core and a `typescript/` name — prefix them.
- **ESLint-only rule** → `eslint-disable`, using the plugin's real name (`perfectionist/sort-objects`, `@typescript-eslint/no-misused-spread`). Rules oxlint owns are switched off in ESLint by `eslint-plugin-oxlint`, so an `eslint-disable` for one is dead weight.

Oxlint honours **both** prefixes; ESLint honours only its own. A rule needing both (e.g. `no-control-regex`) needs one directive each — see `stripAnsi.test.ts`.

To find stale directives, let each linter judge its own — never read one's verdict on the other's:

```bash
# oxlint: only "Unused oxlint-disable" lines are real. It flags every
# eslint-disable for a plugin it lacks (perfectionist) as unused — false.
pnpm dlx oxlint --disable-nested-config --report-unused-disable-directives
# eslint: reports unused directives even for rules it has turned off
eslint . --report-unused-disable-directives
```

## Custom JS plugins

The repo authors its own oxlint rules as **JS plugins** (`jsPlugins` in `.oxlintrc.json`) — for repo-specific conventions no off-the-shelf rule covers. Only viable for **purely syntactic** rules: oxlint JS plugins get no type information (type-aware linting goes through Rust/tsgolint, which can't run JS rules), so anything needing the type checker (e.g. `neverthrow/must-use-result`) stays on ESLint.

- Plugins are **TypeScript** files under `scripts/oxlint/` (one rule-set per file), so the root `tsgo` typecheck covers them and oxlint loads them directly via Node type-stripping. Author them with `@oxlint/plugins`: `definePlugin`/`defineRule` (their sole purpose is inference — visitor handler params like `AwaitExpression(node)` type themselves, so **never annotate them inline**), and the `ESTree` namespace / `Context`/`Plugin` types for standalone helpers. There is no node-type enum — `node.type === "CallExpression"` literals are the discriminants, checked against `ESTree` so a typo won't compile. Pin `@oxlint/plugins` to the exact `oxlint` version.
- Reference the `.ts` by path in the root `jsPlugins` array; enable the rule under `rules` (or a scoped `overrides` entry) as `<meta.name>/<rule>`.
- **Scope with `overrides`** when a rule only applies to part of the tree — e.g. `persistThenNotify.ts` (the [persist-then-notify](/docs/architecture/persist-then-notify) enforcer) is scoped to `packages/app/server/**/*.ts`, because an `EventEmitter.emit` only means "realtime notify" in server mutations; client emitters (the Phaser game bus) are unrelated. `overrides` objects reject unknown keys — no `"//"` comment field; document intent in the plugin file's header instead.
- The plugin runs in oxlint's single root pass, so it's fast enough to stay always-on. **The JS plugin API is alpha and not subject to semver** — keep `oxlint` pinned and re-verify plugins after a bump.
- The plugin file is itself linted by the repo's own oxlint+eslint pass (it lives under `scripts/`), so it must satisfy every repo convention — no `void` operator, sorted `Set`s (`perfectionist/sort-sets`), capitalized comments, comments on their own line.
- Verify a new plugin empirically before wiring it in: run it over the whole repo to measure false positives, and plant a violation in a matching path to confirm it actually fires under the real config (a mis-scoped `files` glob or wrong rule name fails silently to zero hits).

## `typescript/method-signature-style` (oxlint)

Interface method signatures must be property signatures:

```ts
// ✗ method signature
interface Foo {
  bar(x: string): void;
}

// ✓ property signature
interface Foo {
  bar: (x: string) => void;
}
```

**Exceptions — use `/* oxlint-disable */` with a reason comment:**

1. **Built-in interface augmentations needing generic-per-call-site overloads.** Method signatures on augmented built-ins (e.g. `ObjectConstructor`) let each call site pass different type arguments; property signatures don't. Example: `global.d.ts`.

   ```ts
   /* oxlint-disable typescript/method-signature-style -- method signatures required for generic overloads on built-in interfaces */
   declare global {
     interface ObjectConstructor {
       entries<T extends object>(o: T): ...;
     }
   }
   ```

2. **Third-party declaration files with real overloads.** Files from DefinitelyTyped or similar with overloaded method signatures can't be cleanly converted. Example: `desmos.d.ts`.

   ```ts
   /* oxlint-disable typescript/method-signature-style -- third-party declaration file with overloaded method signatures */
   ```

**Overloads in your own code** — use call signatures inside an object type:

```ts
interface Foo {
  bar: {
    (x: string): void;
    (x: number): string;
  };
}
```

**Disable directive format:**

- File-level (first line of file): `/* oxlint-disable typescript/method-signature-style -- reason */`
- Line-level: `// oxlint-disable-next-line typescript/method-signature-style`

## `no-restricted-syntax` — `expect.any` is banned (ESLint)

`expect.any(...)` (and the other `expect.<asymmetric>` matchers) are banned in tests via `no-restricted-syntax` in `packages/configuration/eslint/typescriptRules.js`. They are loose — they assert only the type, not the value.

Instead, capture the real argument from the mock's `mock.calls` and assert it exactly:

```ts
// ✗ loose matcher — also errors on no-restricted-syntax
expect(applyFlushPlan).toHaveBeenCalledExactlyOnceWith(expect.any(String), HOST_DIR, PLAN);

// ✓ capture the real value (takeOne asserts exactly one call) and assert it exactly
const [upperDir] = takeOne(vi.mocked(applyFlushPlan).mock.calls);
expect(applyFlushPlan).toHaveBeenCalledExactlyOnceWith(upperDir, HOST_DIR, PLAN);
```

When the captured arg is a known shared reference, assert it directly (`expect(child.on).toHaveBeenCalledExactlyOnceWith("error", noop)`); when only its type is knowable, use `toBeTypeOf` (`expect(checkIsStale).toBeTypeOf("function")`). `takeOne` and `noop` come from `@esposter/shared`.

## `prefer-named-capture-group` (oxlint)

Every capturing group `(...)` must be named `(?<name>...)`:

```ts
// ✗
const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(str);

// ✓
const match = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/u.exec(str);
```

**Named groups retain positional indices** — all existing usages keep working; only `match.groups.name` is new:

```ts
str.replace(/(?<id>\d+)/gu, "$1"); // replacement string $1
str.replace(/(?<id>\d+)/gu, (_, id) => id); // callback positional arg
/(?<id>\d+)/u.exec(str)?.[1]; // positional index match[1]
/(?<name>\w+) = \1/u; // back-reference \1 (also \k<name>)
```

**Non-capturing groups** — `(?:...)` is already non-capturing; doesn't need a name. Only plain `(...)` must be named.

**Lookahead groups** — plain capturing groups inside lookaheads (`(?=...)`, `(?!...)`) still need naming:

```ts
// ✓
/(?<count>\d+)(?!.*(?<trailing>\d+))/u;
```
