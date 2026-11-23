# Composables

Composable shape and, first, the primitives that already own a job: ordering overlapping async work, dirty-check saves, intervals, pan/zoom, read-or-insert, and whether a function is a composable at all or a service (`references/composables-and-services.md`). Rules: the `vue-composable-patterns` skill.

| Unit                              | Notes                                                                             |
| --------------------------------- | --------------------------------------------------------------------------------- |
| `apps/web/app/composables/shared` | the primitives themselves — a counter here is the implementation, not a violation |

Notes on a tree several units share:

- `apps/web/app/composables/dungeons`, `app/composables/clicker`: Phaser-driven; frame loops are not async ordering
- `apps/web/app/store` as call sites: shape is the `pinia` ledger's; this reads only the bookkeeping around an `await`

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

## The post-await id-guard recipe

A late write whose guard compares the open resource's id, not the opening it was issued under, lands in a sheet closed and reopened with the same id. One grep finds the guard, and the id it compares is the store's current one.

```bash
# the open resource's id compared with a value read earlier, the shape a late write's guard takes
git grep -nE "currentResourceId\.value *[!=]==|[!=]== *currentResourceId\b" -- apps/web/app ':!*.test.*'
```

The scan runs wider than this ledger's Scope, since the blueprint import that fell into the same shape sits in `services/resource`. A hit is a finding when the id is read before an `await` and the write it guards lands after it; the fix takes `getOpening()` where the operation is issued, as the paste and the blueprint import now do. Not findings: `checkIsLoaded` and the reset comparisons, which are synchronous id checks with no write behind an await, and the blueprint and note exports, which download the content held now, the same resource's content whichever opening holds it. Proof the scan can fail: at the paste's parent commit it returns the guard the fix replaced.

## The post-await open-target recipe

A write that lands after an await on whatever resource, board or survey is open **when it lands**, not the one its operation was issued for. The id-guard recipe above finds a guard that compares an id; these writes have nothing to compare, because the writer takes no id and writes the open state (`insertElement`, `addFileUrl`, a board's `editState`). Two greps and a read:

```bash
# writers of the open resource's state: no id argument, so each writes whatever is open when it runs
git grep -nE "(insertElement|removeElements|pasteClipboardText|pasteText|addFileUrl|commitOperations)[^A-Za-z]|webpageEditor\.value\.[a-zA-Z]+ = |editState\.value = " -- apps/web/app ':!*.test.*'
# uploads and deletes: the resource id is read when the call is made, so one made after an await names the open resource of that moment
git grep -nE "(uploadFile|deleteFile)\(" -- apps/web/app ':!*.test.*'
```

A hit is a finding when an `await` comes before it in the same function and the state it writes was not taken before that await. The fix takes `getOpening()` where the operation is issued and checks it before the write, as the sheet paste does (`usePasteRangeFromClipboard.ts`). A late delete names the resource it was issued for, since `useDeleteResourceFile` takes that id as an argument. Not findings: a write whose target is passed in or captured (`useInsertNoteImages` writes the editor it is handed, a keyed store writes the slice it names), and a call with no await before it, which reads its id as it is issued. Why the id-guard recipe missed these: nothing compares an id, so the grep has no guard to find. Proof the recipe can fail: at `0614b56916` the first grep returns the whiteboard image insert, the cut, the context-menu paste, the survey upload and the webpage share image.

## Exclusions

- Store _shape_ — `storeToRefs`, dot-access, CRUD verbs, keyed state — is the `pinia` ledger. A store appears here only for what it does around an `await`.
- `useAutoSearch`'s `AbortController` is a sanctioned exception, not a hand-rolled guard: `executeQuery` orders calls but does not cancel the request in flight, which is the whole point of the search input. The `pagination` skill owns it.
- Whether a composable should exist at all (pass-through, module-scope ref) is in scope here; whether the _page_ should have decomposed differently is `vue-components`.
