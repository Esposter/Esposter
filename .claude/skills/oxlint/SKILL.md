---
name: oxlint
description: Esposter oxlint + ESLint linting conventions — method-signature-style exceptions (built-in augmentations, third-party .d.ts), prefer-named-capture-group naming patterns, and when to use disable directives. Apply when fixing lint errors or adding regexes/interface declarations.
---

# Oxlint + ESLint Conventions

## Running lint

```bash
# From packages/app or any package — use :fix for local verification
pnpm lint:fix   # oxlint --fix + eslint --fix (local use)
pnpm lint       # check-only, for CI

# From repo root
pnpm lint:fix   # runs root oxlint/eslint then lerna lint:fix for all packages
```

## `typescript/method-signature-style` (oxlint)

Rule: interface method signatures must be written as property signatures.

**Fix** — convert method → property:

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

1. **Built-in interface augmentations that need generic-per-call-site overloads.**
   Method signatures on augmented built-ins (e.g. `ObjectConstructor`) allow each call site to pass different type arguments. Property signatures don't. Example: `global.d.ts`.

   ```ts
   /* oxlint-disable typescript/method-signature-style -- method signatures required for generic overloads on built-in interfaces */
   declare global {
     interface ObjectConstructor {
       entries<T extends object>(o: T): ...;
     }
   }
   ```

2. **Third-party declaration files with real overloads.**
   Files copied from DefinitelyTyped or similar that have overloaded method signatures can't be cleanly converted without loss. Example: `desmos.d.ts`.
   ```ts
   /* oxlint-disable typescript/method-signature-style -- third-party declaration file with overloaded method signatures */
   ```

**Overloads in your own code** — when you genuinely need overloads in an interface, use call signatures inside an object type:

```ts
interface Foo {
  bar: {
    (x: string): void;
    (x: number): string;
  };
}
```

**Disable directive format:**

- File-level: `/* oxlint-disable typescript/method-signature-style -- reason */` (first line of file)
- Line-level: `// oxlint-disable-next-line typescript/method-signature-style`

## `prefer-named-capture-group` (ESLint)

Rule: every regex capture group `(...)` must be named `(?<name>...)`.

**Fix** — add a name to every capturing group:

```ts
// ✗
const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(str);

// ✓
const match = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/u.exec(str);
```

**Named groups retain positional indices** — all existing usages continue to work unchanged:

- `$1`, `$2` in replacement strings still work
- `match[1]`, `match[2]` still work
- Replace callback positional args `(_, group1, group2)` still work
- Back-references `\1` still work (named groups get both `\1` and `\k<name>`)
- Only `match.groups.name` is new

```ts
// All of these still work after naming the group
str.replace(/(?<id>\d+)/gu, "$1"); // replacement string
str.replace(/(?<id>\d+)/gu, (_, id) => id); // callback positional arg
const m = /(?<id>\d+)/u.exec(str);
m?.[1]; // positional index
/(?<name>\w+) = \1/u; // back-reference \1
```

**Non-capturing groups** — `(?:...)` is already non-capturing and doesn't need a name. Only plain `(...)` must be named.

**Lookahead groups** — groups inside lookaheads (`(?=...)`, `(?!...)`) still need naming even though they don't capture:

```ts
// ✓
/(?<count>\d+)(?!.*(?<trailing>\d+))/u;
```
