---
name: oxlint
description: Esposter oxlint + ESLint linting conventions — method-signature-style exceptions (built-in augmentations, third-party .d.ts), prefer-named-capture-group naming patterns, and when to use disable directives. Apply when fixing lint errors or adding regexes/interface declarations.
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

## `prefer-named-capture-group` (ESLint)

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
