# Writing a store mutation action

Read when a store action calls a tRPC mutation, or when picking its `useMutation` `key`. The rules — when an action is justified at all, root-declared instances, one per mutation, snapshot inside `applyOptimistic`, no hand-rolled ordering — are in `SKILL.md`.

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
      const snapshot = [...items.value];
      storeDeleteFoo(input);
      return () => {
        items.value = snapshot;
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

Full rationale: `packages/app/content/docs/architecture/async-operations.md` (concurrency) and `client-data.md` (optimistic apply, in-flight guarding).
