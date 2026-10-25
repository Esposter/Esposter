# Server guards and TRPCError causes

Read when a tRPC router or server route guards a nullable DB result, or attaches a `cause` to a `TRPCError`. That the guards exist and must be used instead of hand-rolled null checks is in `SKILL.md`.

## The guards

Tested once in `server/trpc/guards/` and used everywhere: `requireEntity` turns a `findFirst` that may be `null` into a `TRPCError` `NOT_FOUND`, and `requireMutation` turns a `.returning()[0]` that may be `undefined` into a `BAD_REQUEST`.

```ts
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { requireMutation } from "#server/trpc/guards/requireMutation";

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

The guards on this page cover a DB result that may be missing. When the router decides the rejection itself, reach for the constructors the guards are built on rather than assembling a `TRPCError` around an error message:

```ts
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";

// BAD_REQUEST by default; pass a code only where the rejection genuinely is not one
throw getInvalidOperationError(Operation.Update, DatabaseEntityType.Foo, input.fooId);
throw getInvalidOperationError(Operation.Create, DatabaseEntityType.Foo, input.fooId, "CONFLICT");

// Takes no code — a missing entity is always NOT_FOUND, so it is not the caller's to choose
throw getNotFoundError(DatabaseEntityType.Foo, input.fooId);
```

`new TRPCError({ code, message: new InvalidOperationError(...).message })` written out at a throw site is the anti-pattern: it re-decides the code per site, and drifts from the guards' text the moment either changes. Where one feature throws the same rejection from several places, give it a named constructor that calls these (`getInvalidBlueprintError`, `getDanglingProgramBindingError`) so the arguments are stated once too.

## `UNAUTHORIZED` is the one code thrown bare, and has no constructor

`throw new TRPCError({ code: "UNAUTHORIZED" })` with no message is correct and is what every ownership, membership and permission check in the tree does. There is nothing to say: the caller failed a check, and wording _which_ check describes the permission model to the one caller who should not be reading it. A constructor would exist only to attach that sentence, so there is none — the absence is the rule, not a gap someone forgot to fill.

`getForbiddenError(reason)` is its opposite and that is why it takes a string: a `FORBIDDEN` names a **condition the caller can act on** — "Must join call first", "Must be admitted to join this call" — so the reason is the whole point of the error. Choose between the two by asking whether the caller can do anything with the answer.

## A `cause` without a `message` rewrites what the client is told

`TRPCError` falls back to `cause.message` when no `message` is passed, so attaching the underlying failure to an otherwise-bare error (`new TRPCError({ cause: writeError, code: "CONFLICT" })`) replaces the code-shaped message the client renders with the raw upstream text — a `CONFLICT` starts reporting itself as `412`. Attach a `cause` only alongside an explicit `message`, and only when it carries something the code does not already say: where the code is definitionally the diagnosis (every retry lost the same race), the cause is noise bought at the price of the client-facing message. An inline snapshot over the thrown error catches this — the message is what it renders.
