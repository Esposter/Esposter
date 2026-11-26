# Server maintenance of derived fields

## Intent

The database keeps every server-derived count and ranking equal to its inputs, and each vote and comment answers with the values it changed.

## Why

Each count is moved by hand in its own write, so a cascade, a job or a raw statement that moves a row leaves its counts wrong. The ranking is a second statement, guarded by the count it was computed from, and an account job recomputes it separately. The post count is read through a procedure named for posts alone.

## What changes

- A trigger per aggregate relation moves each target by the difference its contributing row makes, and raises the target's version.
- The ranking is a stored value computed from the count, or recomputed in the write when the database cannot compute it.
- The vote and comment writes lose their count arithmetic, and answer with the derived values they changed.
- The post-specific count read is replaced by a read of derived values by table and key.
- A migration adds the triggers and recomputes each aggregate once.

## Capabilities

- `architecture/derived-fields`, the server half of its requirements.

Nothing is BREAKING for a caller of the API. The count and ranking values are the same, the read changes its name and the one caller moves with it, and the account job's ranking recompute goes away with the stored ranking.

## Order

Built on the tags change, and before the relations-client change, since the client reads the answers this change gives. The [design](design.md) states the mechanism and the checks the build runs first.
