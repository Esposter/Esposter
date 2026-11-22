# Composables

Composable shape and, first, the primitives that already own a job: ordering overlapping async work, dirty-check saves, intervals, pan/zoom, read-or-insert, and whether a function is a composable at all or a service (`references/composables-and-services.md`). Rules: the `vue-composable-patterns` skill.

| Unit                                                       | Notes                                                                             |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `app/composables/shared`                                   | the primitives themselves — a counter here is the implementation, not a violation |
| `app/composables/resource`                                 |                                                                                   |
| `app/composables/message`                                  |                                                                                   |
| `app/composables/data`, `app/composables/file`, root files |                                                                                   |
| `app/composables/dungeons`, `app/composables/clicker`      | Phaser-driven; frame loops are not async ordering                                 |
| `app/store` as call sites                                  | shape is the `pinia` ledger's; this reads only the bookkeeping around an `await`  |
| `app/composables/ui`                                       |                                                                                   |

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

Proof the recipe can fail: it was written against a hand-kept armed-autosave count, and re-running it after that was replaced
by a flag no longer returns the site.

## The composables-and-services recipe

Two checks, and the first decides.

```bash
# a composable called from a service: it is not at setup, so it is a service or a store lookup
rg -n "\buse[A-Z]\w*\(" apps/web/app/services --glob '!*.test.*' | rg -v "use\w*Store\(|useNuxtApp\(|useRuntimeConfig\(|useRouter\(|useRoute\("
```

The second check is the scan `pnpm ai:sweep:composable-without-reactivity`: a composable with no reactive call, lifecycle hook or composable call in it, one path per line.

A hit is a finding when the function is not at setup and reads no setup-only context. The dungeons' store-reading helpers are services under `services/dungeons`, so a `use*` called from a state, an action or a Phaser callback is a hit, and the Tiptap `use*Extension` factories are named by their skill, so they are not one; A function that issues a write takes it from a store, so a callback outside setup shares the registry's queue the other call sites use.

## Exclusions

- Store _shape_ — `storeToRefs`, dot-access, CRUD verbs, keyed state — is the `pinia` ledger. A store appears here only for what it does around an `await`.
- `useAutoSearch`'s `AbortController` is a sanctioned exception, not a hand-rolled guard: `executeQuery` orders calls but does not cancel the request in flight, which is the whole point of the search input. The `pagination` skill owns it.
- Whether a composable should exist at all (pass-through, module-scope ref) is in scope here; whether the _page_ should have decomposed differently is `vue-components`.
