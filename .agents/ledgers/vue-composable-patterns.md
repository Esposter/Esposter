# Composables

Composable shape and, first, the primitives that already own a job: ordering overlapping async work, dirty-check saves, intervals, pan/zoom, read-or-insert. Rules: the `vue-composable-patterns` skill.

| Unit                                                       | Swept      | Notes                                                                             |
| ---------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------- |
| `app/composables/shared`                                   | 2026-09-13 | the primitives themselves — a counter here is the implementation, not a violation |
| `app/composables/resource`                                 |            |                                                                                   |
| `app/composables/message`                                  |            |                                                                                   |
| `app/composables/data`, `app/composables/file`, root files |            |                                                                                   |
| `app/composables/dungeons`, `app/composables/clicker`      |            | Phaser-driven; frame loops are not async ordering                                 |
| `app/store` as call sites                                  |            | shape is the `pinia` ledger's; this reads only the bookkeeping around an `await`  |

## The find recipe

Hand-rolled bookkeeping does not have one spelling, so the recipe is two greps and a read — neither is decidable on its own, and the second is the one that catches the shape that keeps recurring.

```bash
# a flag or counter maintained by hand around async work
rg -n "(is[A-Z]\w*(Pending|Loading|Saving)|\w*Count)\.value\s*(=|\+=|-=)" apps/web/app --glob '!*.test.*'
# bookkeeping that spans a call rather than living in it (the leading (?!for ) drops loop counters)
rg -n "^\s*let (is|has)[A-Z]\w* = (false|0|undefined);" apps/web/app/composables apps/web/app/store --glob '!*.test.*'
```

Both over-report by design: a badge count, a spinner flag around one linear `await`, and a loop accumulator all
match and none is a finding. **A hit is a finding only when the value orders two calls against each other, or
survives past the call that set it.** Two clean negatives worth knowing before reading a hit: `useUploadImage`'s
`isLoading`, set, awaited and cleared in a finalizer with nobody else reading it; and the `let isSuccessful = false`
that an `executeMutation` caller sets from `onSuccess`, which is the established way to get an outcome back out of
a callback and is the majority of what the second grep returns.

Proof the recipe can fail: it was written against `armedAutosaveCount`, and re-running it after that was replaced
by a flag no longer returns the site.

## Exclusions

- Store _shape_ — `storeToRefs`, dot-access, CRUD verbs, keyed state — is the `pinia` ledger. A store appears here only for what it does around an `await`.
- `useAutoSearch`'s `AbortController` is a sanctioned exception, not a hand-rolled guard: `executeQuery` orders calls but does not cancel the request in flight, which is the whole point of the search input. The `pagination` skill owns it.
- Whether a composable should exist at all (pass-through, module-scope ref) is in scope here; whether the _page_ should have decomposed differently is `vue-components`.

## Next enforceable

- A `useMutation` call with no `key` is decidable from the call site — the `pinia` ledger already names it.
- `createSharedComposable` and a module-scope `ref` in a composable file are both greppable and could be lint rules rather than sweep rows.
- A count that is incremented and decremented on the same ref inside one composable is close to decidable, but only where the pair **brackets one asynchronous operation** — incremented where it starts and decremented where it settles. Monotonicity is not the test: a domain total (members in a room, items in a cart) moves both ways too, and a rule keyed on that alone classifies one as async bookkeeping. What separates them is whether the two writes name the same operation.
