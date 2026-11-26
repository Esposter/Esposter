# Event counters and values across stores

## Intent

Every counter a write steps, and every value the server assigns, moves through one helper, and the one value that crosses a store boundary converges to its source whenever its write fails.

## Why

The counters move in their own write paths, each with its own arithmetic, and a failed write after a message can leave the mention counts of a room behind with nothing to repair them. The database cannot maintain a value held in another store, so the repair has to come from the source.

## What changes

- A counter step and an assigned value are each written by one helper, with the version raised.
- The mention count clears to zero at once when the room is read, and is restored on a refusal.
- A failed mention write enqueues a reconcile that recounts the room's mention counts and last message time from its messages.
- The storage counter and the view count are answer-only, as their tags state.

## Capabilities

- `architecture/derived-fields`, the counter, assigned and cross-store requirements.

Nothing is BREAKING. The counts keep their values, and the mention reset is the one change a reader sees, at the moment of the read rather than after its answer.

## Order

Last of the program's four changes, built on the helpers the server change adds. The [design](design.md) states the helpers and the reconcile's bounds.
