# Server guards, TRPCError causes and rollback-compensated effects

Read when a tRPC router or server route guards a nullable DB result, attaches a `cause` to a `TRPCError`, or has a fire-and-forget tail on a path a caller rolls back. That the guards exist and must be used instead of hand-rolled null checks is in `SKILL.md`.

## The guards

```typescript
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";

// findFirst → throws TRPCError NOT_FOUND if null
const foo = await requireEntity(tx.query.foos.findFirst({ where: ... }), DatabaseEntityType.Foo, input.fooId);

// insert/update .returning()[0] → throws TRPCError BAD_REQUEST if undefined
const updatedFoo = requireMutation(
  (await ctx.db.update(foos).set(input).returning())[0],
  Operation.Update,
  DatabaseEntityType.Foo,
  input.fooId,
);
```

## Asserting a rejection with no nullable result to guard

The guards above cover a DB result that may be missing. When the router decides the rejection itself, reach for the constructors the guards are built on rather than assembling a `TRPCError` around an error message:

```typescript
import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { getNotFoundError } from "@@/server/trpc/guards/getNotFoundError";

// BAD_REQUEST by default; pass a code only where the rejection genuinely is not one
throw getInvalidOperationError(Operation.Update, DatabaseEntityType.Foo, input.fooId);
throw getInvalidOperationError(Operation.Create, DatabaseEntityType.Foo, input.fooId, "CONFLICT");

// Takes no code — a missing entity is always NOT_FOUND, so it is not the caller's to choose
throw getNotFoundError(DatabaseEntityType.Foo, input.fooId);
```

`new TRPCError({ code, message: new InvalidOperationError(...).message })` written out at a throw site is the anti-pattern: it re-decides the code per site, and drifts from the guards' text the moment either changes. Where one feature throws the same rejection from several places, give it a named constructor that calls these (`createInvalidBlueprintError`, `danglingProgramBindingError`) so the arguments are stated once too.

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
