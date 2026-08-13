---
title: Null vs Undefined
description: App-owned code has one absent-value form — undefined, or a domain sentinel like "" — and null survives only inside external boundary shapes.
---

# Null vs Undefined

App-owned code uses a **single absent-value form**: the domain sentinel where one exists (`""` for strings, `0` for counts with no domain meaning, a schema-carried default), and `undefined` where absence must be distinguishable from every real value. `null` is never written by app-owned code — not as a literal, not as a `| null` union member, not as a `.nullable()` Zod field.

## Why one sentinel

`undefined` is what the language itself produces for absence — missing object keys, optional parameters, `Array.prototype.find` misses, `Map.get` misses, optional chaining. `null` is a second sentinel carrying no extra meaning, and a codebase holding both forces every consumer to handle two absent forms and reintroduces the `=== null` vs `=== undefined` bug class. The reverse standardisation (all-`null`) is impossible: the language APIs above emit `undefined` unconditionally, so a null-standard codebase keeps both sentinels forever.

## Boundaries keep their shape

External systems own their types, and `null` inside them is left exactly where it lands — there is **no conversion layer** and no boundary-ingress helper. Consume the value where it arrives with the normal tools (`??` onto a sentinel, a truthiness guard) only when the surrounding code actually needs the app-owned shape; otherwise let the boundary type flow through untouched.

Boundary shapes where `null` is expected and stays:

- **Drizzle ORM** — nullable columns (timestamps like `deletedAt`) infer and return `T | null`. Prefer non-nullable columns with schema-carried sentinels (`.notNull().default(...)`) so the question never arises; only types with no empty value stay nullable.
- **better-auth** — session/user fields such as `user.image` are typed `string | null`.
- **Azure SDK / EventGrid** — payload types own their nullable members.
- **DOM and web APIs** — `querySelector`, `localStorage.getItem`, `RegExp.exec` return `T | null`; check with `=== null` or truthiness at the call site.
- **Third-party component props** — the occasional Vuetify/@vue-flow prop is typed `T | null`; pass `null` only where the prop type requires it.
- **Persisted JSON blobs** — `JSON.stringify` drops `undefined` keys, so a blob schema that already stores `null` keeps storing it (see [/docs/architecture/persisted-data-latest-shape-only](/docs/architecture/persisted-data-latest-shape-only)).

## Not lint-enforced

A bespoke ESLint gate (flagging `null` literals and `| null` type positions) was tried and removed: every legitimate boundary site above is a false positive, and carving them out costs more than the rule catches. The standard falls to review, like the hand-rolled cases in [/docs/architecture/no-polling](/docs/architecture/no-polling).
