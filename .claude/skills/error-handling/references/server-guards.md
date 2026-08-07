# Server guards, TRPCError causes and rollback-compensated effects

Read when a tRPC router or server route guards a nullable DB result, attaches a `cause` to a `TRPCError`, or has a fire-and-forget tail on a path a caller rolls back. That the guards exist and must be used instead of hand-rolled null checks is in `SKILL.md`.

## The guards

```typescript
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";

// findFirst → throws TRPCError NOT_FOUND if null
const post = await requireEntity(tx.query.posts.findFirst({ where: ... }), DatabaseEntityType.Post, input.postId);

// insert/update .returning()[0] → throws TRPCError BAD_REQUEST if undefined
const updated = requireMutation(
  (await ctx.db.update(users).set(input).returning())[0],
  Operation.Update,
  DatabaseEntityType.User,
  ctx.getSessionPayload.user.id,
);
```

## A `cause` without a `message` rewrites what the client is told

`TRPCError` falls back to `cause.message` when no `message` is passed, so attaching the underlying failure to an otherwise-bare error (`new TRPCError({ cause: writeError, code: "CONFLICT" })`) replaces the code-shaped message the client renders with the raw upstream text — a `CONFLICT` starts reporting itself as `412`. Attach a `cause` only alongside an explicit `message`, and only when it carries something the code does not already say: where the code is definitionally the diagnosis (every retry lost the same race), the cause is noise bought at the price of the client-facing message. An inline snapshot over the thrown error catches this — the message is what it renders.

## A best-effort effect a rollback compensates is awaited

Best-effort means "its failure doesn't fail the caller" — it does not mean "nothing needs to know when it finished". The moment a **compensating cleanup deletes the artifact that effect writes**, the effect stops being fire-and-forget: a write still in flight lands after the cleanup and re-creates what the cleanup existed to remove, and the resurrected artifact is usually unreachable (its parent row is gone), so nothing ever reclaims it.

Await it in the function whose failure the rollback compensates, so the rollback cannot start before the write is durable:

```typescript
// The insert and the trail entry a rollback would delete cannot be allowed to drift apart
await writeBar({ fooId: newFoo.id });
return newFoo;
```

The cost is one round trip, and nothing else — the effect already terminates its own `Result` (`getResultAsync(...).match(noop, console.error)`), so awaiting cannot fail the caller. Sibling emits on paths with no compensating cleanup stay fire-and-forget through `getSynchronizedFunction`; the exception is per-call-site, not per-helper, and the awaited call site says which cleanup it is racing.

Ask it whenever a function has both a fire-and-forget tail and a failure path a caller rolls back through: _does the rollback delete what the tail writes?_ `waitForSynchronizedFunctions()` is a test/shutdown drain, not the fix — it waits on every in-flight effect in the process, so it makes one race a global barrier.
