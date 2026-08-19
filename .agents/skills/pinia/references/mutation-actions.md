# Writing a store mutation action

Read when a store action calls a tRPC mutation, or when picking its `useMutation` `key`. The rules — when an action is justified at all, root-declared instances, one per mutation, no hand-rolled ordering — are in `SKILL.md`.

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
