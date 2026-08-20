# Writing a store mutation action

Read when a store action calls a tRPC mutation, or when picking its `useMutation` `key`. Whether the action is justified at all, and the rule that `key` is required on every call, are in `SKILL.md`.

## Wiring the instance

- **Declare every instance at the store root** — `const { executeMutation } = useMutation()`. Never inside an action (detached effect scope leak).
- **One `useMutation()` instance per mutation**, via destructure renames (`executeCreateFooMutation`, plus `isPending: isCreateFooPending` / `getIsPending: getIsFooPending` when consumed), so one action's queue and pending state can't hold up another's. **Two mutations that end the same row share one instance instead**, named for the target — the rule and the test for which case you are in are in `packages/app/content/docs/architecture/async-operations.md` § A key queues only within one `useMutation()` instance.
- **Never hand-roll the alert/rollback/pending wiring** — it surfaces errors via `createAlert` unless you pass `onError`, and runs writes to one `key` one at a time so two actions writing different fields of the same entity both land. Destructure `isPending` only where a control consumes it; the in-flight guard decision tree lives in `packages/app/content/docs/architecture/client-data.md` § In-flight guarding.
- **`applyOptimistic`** applies the change immediately and **returns its rollback**, which runs automatically on failure.
- **`onSuccess`** is for server-generated results that can't be predicted client-side (a created entity with its id).

## A store never orders its own async work

No promise chained onto the previous one, no `Map<id, Promise>` of in-flight reads, no generation counter or `isSaving` flag. That ordering lives in the primitive, keyed by target; a store that seems to need its own needs the right `key`. Protection applied by hand is protection that gets forgotten.

**A read that must not be issued twice at once passes `isExclusive: true` to `executeQuery`.** Concurrent callers **join** one request and all get the data — a read is never dropped, which would leave the joiner rendering an empty list. It joins only what is still in flight, so read-once semantics stay a separate cache flag the action checks first, and an invalidating re-read omits the opt-in so it cannot join the answer it just invalidated.

## Where the snapshot is taken, and what it covers

**`applyOptimistic` runs when the write is _sent_, so take the snapshot inside the callback.** A queued write must roll back to what the write ahead of it stored, not to the state the user saw when they clicked. For the same reason, anything else the payload reads from live state — a version token, a create-or-update branch — is read inside the `mutate` callback rather than before the call.

**A rollback undoes its own write, never the list.** Snapshot the one entity the write touched and unwind that; `items.value = snapshot` is wrong even when taken at send time. Writes keyed per entity do not queue against each other, and the same lists also receive subscription pushes, so reinstating a whole-list copy resurrects rows a concurrent delete removed and drops rows that arrived mid-flight. Restore through the store's own `store*` CRUD helper rather than by index: a rejected delete that lands its row back at the end of an ordered list is a cosmetic loss, a dropped subscription row is a correctness one.

## Shape

```typescript
// subscription owns the state change — no store action; the caller awaits the mutation at the user
// action. Never a floating statement: errorLink alerts the rejection but still propagates it, so an
// un-awaited call leaves an unhandled rejection behind the toast
await $trpc.foo.deleteFoo.mutate(id);

// store action justified — optimistic local state with automatic rollback
const deleteFoo = async (input: DeleteFooInput) => {
  await executeMutation(() => $trpc.foo.deleteFoo.mutate(input), {
    applyOptimistic: () => {
      // The one row this write removes, not a copy of the list: a rejected delete must not undo the
      // Delete running beside it under another key, nor drop a row a subscription delivered meanwhile.
      // Built once and then searched with. Constructing it inside the callback rebuilds the same predicate
      // For every row, and `unicorn/no-array-callback-reference` reports the inline call as a bare reference
      const getIsDeletedFoo = getIsEntityIdEqualComparator<Foo>(FooKeyPath, input);
      const deletedFoo = items.value.find(getIsDeletedFoo);
      storeDeleteFoo(input);
      return () => {
        if (deletedFoo) storeCreateFoo(deletedFoo);
      };
    },
    // A foo is identified by the parent-and-child pair, so that composite is the target — there is no `id`
    key: `${input.parentId}-${input.childId}`,
  });
};
```

A create whose result can't be predicted client-side applies in `onSuccess` instead, and that is also where store-owned selection is updated:

```typescript
const createFoo = async (input: CreateFooInput) => {
  await executeCreateFooMutation(() => $trpc.foo.createFoo.mutate(input), {
    // no natural key yet — the id only exists once the server answers, and creates must not queue
    // behind their siblings
    key: Symbol("createFoo"),
    onSuccess: (newFoo) => {
      setFoos(input.parentId, [newFoo, ...getFoos(input.parentId)]);
      setSelectedFooId(input.parentId, newFoo.id);
    },
  });
};
```

## Picking the `key`

Same key = same target, so those writes queue behind each other.

- **Per-entity operations** → the entity id or its natural composite (`key: input.id`, `` key: `${parentId}-${childId}` ``).
- **Creates with no natural key** → a per-call `Symbol("createFoo")`, since every create is independent and must not wait behind its siblings. Use a stable key plus `isExclusive` instead when duplicate fires must drop.
- **Singleton targets** → the scope's id or a stable target name.

Full rationale: `packages/app/content/docs/architecture/async-operations.md` (concurrency) and `packages/app/content/docs/architecture/client-data.md` (optimistic apply, in-flight guarding).
