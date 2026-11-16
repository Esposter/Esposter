# Optimistic by construction

## Why

The [client data standard](../../specs/architecture/client-data/design.md) already calls a write that waits for the server before the screen reflects it a bug. It holds that rule in prose and in a list of exceptions, and the prose leaks in two places:

- **A step after the write.** An optimistic write changes the store at once, but anything sequenced after its `await` still waits for the answer. That includes a dialog closing, a row moving to another group, an edit mode ending, a field clearing, and a navigation to a page the client already knows. A ticked todo moved under Completed a round trip late this way, and an audit of the app found around eighty such places.
- **An exception wide enough to hold anything.** A content save carries a version token, and that alone let every resource content save, every awaited dialog and every store action that hands back `isSuccessful` wait for the server.

## What changes

Optimism moves from a rule a reader must remember to a shape the compiler holds, as [live queries](../archive/2026-11-15-infra-cloudflare-live-queries/design.md) made liveness a declaration every procedure must carry:

1. **An optimistic write is not awaitable.** `executeMutation` called with `applyOptimistic` returns nothing, so no code can be sequenced after its answer. The rollback closure, the alert, and a `reconcile` callback for a value the server issues are all that run on the answer.
2. **A write that waits names its reason.** The only other form takes `awaitedBecause`, one value of a closed `AwaitedReason` set. That makes every wait visible by name and leaves no third form to forget.
3. **Dialogs answer optimistically by default.** `useDialogAnswer` closes the dialog when its write is sent. A dialog that must wait carries `awaited-because`, and `is-optimistic` is deleted.
4. **Content stores keep their success to themselves.** `saveContent` takes the rollback and returns nothing, so no store action can hand `isSuccessful` to a caller.
5. **A create names its own id.** Every create a reader sees in a list whose row the server keys by a text id takes a client-generated id, so its row is drawn at once, without a placeholder swapped for the server's row. A message keeps its placeholder, since its room numbers it.

Every site the audit found is converted, and every wait that is left is one the server alone can answer.

## Out of scope

- Room messages, reactions, typing and calls, which already apply at once and are echoed by their objects' events.
- Reads. A query's loading state is the read's, and [live queries](../../specs/architecture/cloudflare-services/design.md) keep it current.
