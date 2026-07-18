---
name: oxlint
description: Esposter oxlint + ESLint linting conventions — the explicit correctness category rule in .oxlintrc.json (eslint-plugin-oxlint replaces default categories), method-signature-style exceptions (built-in augmentations, third-party .d.ts), prefer-named-capture-group naming patterns, and when to use disable directives. Apply when fixing lint errors, editing .oxlintrc.json, investigating slow ESLint rules, or adding regexes/interface declarations.
---

# Oxlint + ESLint Conventions

## Running lint

Oxlint runs as **repo-wide passes**, never per-package — there are no per-package `.oxlintrc.json` files, only one `.oxlintrc.json` at the repo root. Per-package `lint`/`lint:fix` scripts (in each package's `package.json`) run **ESLint only**. Oxlint is wired into the **root** scripts instead:

- `pnpm lint` / `pnpm lint:fix` (root) — `oxlint` over the whole repo, then ESLint.
- `pnpm lint:fix:packages` / `pnpm lint:packages` (root) — `oxlint packages` (all packages), then ESLint over non-app packages.

**To verify `packages/*` (non-app) changes, run `pnpm lint:fix:packages` from the repo root** — it's fast and includes both oxlint and eslint. Skip it whenever the change touches `packages/app` (Nuxt makes the eslint pass slow); leave app lint to CI. `pnpm lint` is **CI-only** (check, no fix) — never run it locally. Never hand-fix lint errors either — let the fix script do it.

```bash
# verify packages/* changes (oxlint + eslint, non-app, fast):
pnpm lint:fix:packages
# CI-only, do not run locally:
pnpm lint       # whole-repo check, no fix
```

## `.oxlintrc.json` categories — always list `correctness` explicitly

Oxlint keeps the `correctness` category enabled by default even when the config specifies other categories — but `eslint-plugin-oxlint` **replaces** its default categories with whatever the config lists. If `correctness` is missing from the explicit `categories` map, the plugin assumes the category is off and leaves every correctness rule's ESLint twin enabled — ESLint then re-runs the expensive type-aware rules (`no-floating-promises`, `await-thenable`, …) that oxlint/tsgolint already checks. Symptom: a rule shows up in ESLint `TIMING` output even though oxlint covers it. See `/docs/proposals/refactors/eslint-to-oxlint-migration` for the ongoing migration process.

**Manual ESLint disables for oxlint-covered rules are dead weight** — `eslint-plugin-oxlint` is appended last in every flat config, so its `"off"` entries win; hand-written deletes/offs stay only for rules it leaves enabled. Notable exception: its `vue-svelte-astro-exceptions` config deliberately keeps `no-unused-vars`, `@typescript-eslint/no-unused-vars`, and `@typescript-eslint/consistent-type-imports` **enabled on `.vue` files**, so vue-side offs for those are load-bearing. Verify with `eslint --print-config <file>` on both a `.ts` and a `.vue` file before deleting a manual disable.

## Which directive to use

Pick the directive by **which linter reports the rule**, and spell the rule the way that linter names it:

- **Oxlint rule** → `oxlint-disable`, using oxlint's plugin prefix: `typescript/`, `unicorn/`, `import/`, `oxc/`, `vue/`. Never `@typescript-eslint/` — oxlint accepts it as an alias, so it silently works and drifts. Core rules take no prefix (`no-void`, `prefer-spread`). `no-inferrable-types` and `require-await` exist under both a core and a `typescript/` name — prefix them.
- **ESLint-only rule** → `eslint-disable`, using the plugin's real name (`perfectionist/sort-objects`, `vitest/require-top-level-describe`, `@typescript-eslint/no-misused-spread`). Rules oxlint owns are switched off in ESLint by `eslint-plugin-oxlint`, so an `eslint-disable` for one is dead weight.

Oxlint honours **both** prefixes; ESLint honours only its own. A rule needing both (e.g. `no-control-regex`) needs one directive each — see `stripAnsi.test.ts`.

To find stale directives, let each linter judge its own — never read one's verdict on the other's:

```bash
# oxlint: only "Unused oxlint-disable" lines are real. It flags every
# eslint-disable for a plugin it lacks (perfectionist/vitest) as unused — false.
pnpm dlx oxlint --disable-nested-config --report-unused-disable-directives
# eslint: reports unused directives even for rules it has turned off
eslint . --report-unused-disable-directives
```

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

`expect.any(...)` (and the other `expect.<asymmetric>` matchers) are banned in tests via `no-restricted-syntax` in `packages/configuration/eslint/typescriptRules.js`. They are loose (they assert only the type, not the value) and they trip a `vitest/valid-expect` false positive in the current `@vitest/eslint-plugin` (the static `expect.any` is misparsed as an `expect(x).any` modifier → `Expect has an unknown modifier`).

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
