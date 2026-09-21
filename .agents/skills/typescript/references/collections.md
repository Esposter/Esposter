# Arrays, Maps and Sets

Read when reaching for a method that mutates an array, when reading-or-inserting on a `Map`, or when deciding
between a `Set` and a `.some()`. That the mutating methods are banned is `SKILL.md`'s; this page is which
enforcer catches which, the shapes that survive, and the two calls this repo already owns.

## Mutating array methods

`sort()`, `reverse()` and `splice()` are all errors — the first two from oxlint (`unicorn/no-array-sort`,
`unicorn/no-array-reverse`, the latter with its statement-form allowance switched off — a bare `items.reverse();`
is the mutation, not an exception to it), `splice` from `no-restricted-syntax`, and all three restated in
`vue/no-restricted-syntax` for the template expressions oxlint does not read. Write `toSorted`/`toReversed`/
`toSpliced` and assign the result back.

**Draining an array is taking it and putting a fresh one in its place**, never `splice(0)`.

What is left to judgement is `arr.with(index, value)` over `[...arr.slice(0, i), value, ...arr.slice(i + 1)]`.

## Read-or-insert on a `Map`

**Never hand-roll it** — `getOrCreate(map, key, () => new Set())` from `@esposter/shared`. Both hand-rolled shapes
are four lines that read as branching logic where the helper reads as one lookup: the
`let x = map.get(k); if (!x) { x = …; map.set(k, x); }` block, and the `map.get(k) ?? []` that is mutated and set
back — whose `set` is load-bearing only on the miss, so it looks redundant to the next reader.

## `new Set` only for dedup

Use `.some()` for unique arrays. `Set` only when (a) deduplication is the goal, or (b) the collection is large
enough that O(n) `.some()` hurts perf.

## What comes out of a `.filter()`

**No redundant type guards after a filtering condition** — if the predicate narrows the type
(`filter((v) => typeof v === "number")`), the result is already `number[]`; don't add `: v is number` or a cast
inside the callback. A predicate passed as a **function reference** (`filter(Boolean)`) cannot narrow, so a type
predicate is still needed there.
