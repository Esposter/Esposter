# Writing a store mutation action

Read when a store action calls a tRPC mutation, or when picking its `useMutation` `key`. The rules — when an action is justified at all, root-declared instances, one per mutation, snapshot inside `applyOptimistic`, no hand-rolled ordering — are in `SKILL.md`.

## Shape

```typescript
// subscription owns the state change — call the mutation directly at the user action
$trpc.friend.deleteFriend.mutate(friendId);

// store action justified — optimistic local state with automatic rollback
const deleteBan = async (input: DeleteBanInput) => {
  await executeMutation(() => $trpc.message.moderation.deleteBan.mutate(input), {
    applyOptimistic: () => {
      const snapshot = [...items.value];
      storeDeleteBan(input);
      return () => {
        items.value = snapshot;
      };
    },
    // A ban is identified by the room-and-user pair, so that composite is the target — there is no `id`
    key: `${input.roomId}-${input.userId}`,
  });
};
```

A create whose result can't be predicted client-side applies in `onSuccess` instead, and that is also where store-owned selection is updated:

```typescript
const createFoo = async (input: CreateFooInput) => {
  await executeCreateFooMutation(() => $trpc.foo.createFoo.mutate(input), {
    onSuccess: (newFoo) => {
      setFoos(input.parentId, [newFoo, ...getFoos(input.parentId)]);
      setSelectedFooId(input.parentId, newFoo.id);
    },
  });
};
```

## Picking the `key`

Same key = same target, so those writes queue behind each other.

- **Per-entity operations** → the entity id or its natural composite (`key: input.id`, `` key: `${userId}-${roleId}` ``).
- **Creates with no natural key** → a per-call `Symbol("createFoo")`, since every create is independent and must not wait behind its siblings. Use a stable key plus `isExclusive` instead when duplicate fires must drop.
- **Singleton targets** → the scope's id or a stable target name.

Full rationale: `packages/app/content/docs/architecture/async-operations.md` (concurrency) and `client-data.md` (optimistic apply, in-flight guarding).
