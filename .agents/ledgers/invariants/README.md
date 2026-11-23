# Invariants

The question is the `invariants` skill's: is a rule that must hold in many places held by the shape of the code, or by an argument or call its callers remember to pass? The ladder and the test are `.agents/skills/invariants/SKILL.md` and `openspec/specs/architecture/enforcement-ladder/design.md`.

## Areas

The areas and their units are the shared [area list](../areas/), and `pnpm ai:sweep:status invariants` says where each unit stands. It holds a note on no unit, so it keeps no area file of its own.

## The find recipe

Run from the repository root. A hit is a candidate, not a defect: it is a write whose invariant an argument or call at its own site holds, and the question is whether one primitive owns that invariant instead.

```bash
git grep -n "invalidateTags(" -- apps packages scripts ':!*.test.ts'
git grep -n -E "\.value(\+\+|--| \+= 1| -= 1)" -- apps packages scripts ':!*.test.ts'
git grep -n "dismissNotification(" -- apps packages scripts ':!*.test.ts'
```

The first lists the tag invalidations a write makes by hand, which `useMutation`'s `invalidates` and the resource write primitive (`useResourceWrite`) own. The second lists a pending count raised and lowered at a call site, which `trackPending` owns when the write is awaited. The third lists a notice withdrawn by a write's own error arm, which the resource write primitive owns for its writes. Each hit is read: a hit inside its owning primitive is the primitive, and any other is either moved onto the primitive or recorded under open findings below.

## Exclusions

Excluded: `CHANGELOG.md` (lerna output).

## Open findings

- `apps/web/app/store/resource/index.ts` (`unpublishResource`) and `apps/web/app/store/post/index.ts` (`updatePost`) raise a pending count at issue and lower it when the queued mutate settles, so the count spans the overlay queue. `trackPending` wraps a write that starts when it is called, so it cannot own these until the overlay reports when a queued write settles, and every `writeOptimistic` call site would then have a settlement to handle or drop. Owner call.
- `apps/web/app/store/resource/index.ts` (`unpublishResource`) withdraws its optimistic notice in its own `onError`. It is a publication write, not a Resources write, so it does not go through `useResourceWrite`. Lifting the notice into a shared write primitive waits for a second publication write that shows one.
- `apps/web/app/components/Resource/Create/Form.vue` creates a resource through `executeMutation` without `invalidates`, while `CacheTag.Resources` documents a create as one of the writes it covers. The only cache the tag reaches is the Recents read, which holds visits, so nothing cached goes stale today. Owner call: name the tag on the create or drop "create" from `CacheTag`.
