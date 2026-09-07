---
title: Null vs Undefined
description: App-owned code has one absent-value form — undefined, or a domain sentinel like "" — and null survives only inside external boundary shapes.
---

# Null vs Undefined

App-owned code uses a **single absent-value form**: the domain sentinel where one exists (`""` for strings, `0` for counts with no domain meaning, a schema-carried default), and `undefined` where absence must be distinguishable from every real value. `null` is never written by app-owned code — not as a literal, not as a `| null` union member, not as a `.nullable()` Zod field. Every `null` in the repo therefore belongs to one of the boundary shapes below, and a type that keeps one says which boundary it came from, because the next reader cannot see that from the type.

## Why one sentinel

`undefined` is what the language itself produces for absence — missing object keys, optional parameters, `Array.prototype.find` misses, `Map.get` misses, optional chaining. `null` is a second sentinel carrying no extra meaning, and a codebase holding both forces every consumer to handle two absent forms and reintroduces the `=== null` vs `=== undefined` bug class. The reverse standardisation (all-`null`) is impossible: the language APIs above emit `undefined` unconditionally, so a null-standard codebase keeps both sentinels forever.

## Boundaries keep their shape

External systems own their types, and `null` inside them is left exactly where it lands — there is **no conversion layer** and no boundary-ingress helper. Consume the value where it arrives with the normal tools (`??` onto a sentinel, a truthiness guard) only when the surrounding code actually needs the app-owned shape; otherwise let the boundary type flow through untouched.

Boundary shapes where `null` is expected and stays:

- **Drizzle ORM** — nullable columns (timestamps like `deletedAt`) infer and return `T | null`, and an absent one-to-one relation loaded through `with` is `null` too, which is why `ResourceWithPublication.publication` keeps it. Prefer non-nullable columns with schema-carried sentinels (`.notNull().default(...)`) so the question never arises; only types with no empty value stay nullable.
- **better-auth** — session/user fields such as `user.image` are typed `string | null`.
- **Azure SDK / EventGrid** — payload types own their nullable members.
- **DOM and web APIs** — `querySelector`, `localStorage.getItem`, `RegExp.exec` return `T | null`; check with `=== null` or truthiness at the call site.
- **Third-party component props** — the occasional Vuetify/@vue-flow prop is typed `T | null`; pass `null` only where the prop type requires it.
- **Persisted JSON blobs** — `JSON.stringify` drops `undefined` keys, so a blob schema that already stores `null` keeps storing it (see [persisted data — latest shape only](/docs/architecture/persisted-data-latest-shape-only)). The spreadsheet cell is the case that matters: `ColumnValue` is `boolean | null | number | string`, where `null` is the empty cell and `""` a cell holding the empty string — they sort, filter and count apart, and a dropped key is not a readable empty cell.

## "Not loaded yet" is a flag, never a sentinel

The tempting exception is a read that has to distinguish **"not loaded yet"** from **"loaded, and there is no row"**, since `useQuery` seeds its `data` as `undefined` and that looks like the sentinel being spent. It is not an exception: `useQuery` returns `isPending` alongside `data`, and the pending state is that flag's job. A read whose row is absent answers `undefined` like any other, and the consumer gates on `isPending` rather than inventing a third value:

```vue
<!-- The form renders once the read has answered, whether or not a row came back -->
<WordFilterForm v-if="!isPending" :filter />
```

Reaching for `null` here buys nothing and costs the standard: the sentinel says "loaded, empty" only to a reader who already knows the convention, where `isPending` says it in the type.

## Not lint-enforced

A gate flagging `null` literals and `| null` type positions makes a false positive of every legitimate boundary site above, and carving them out costs more than the rule catches. The standard falls to review, like the hand-rolled cases in [no polling](/docs/architecture/no-polling).
