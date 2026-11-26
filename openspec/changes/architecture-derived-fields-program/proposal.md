# Derived fields

## Intent

Every server-derived column is declared once on its definition, so its database maintenance, its write answer, its client prediction and its types all follow from that one declaration, and a new derived value costs one declaration rather than a new mechanism.

## Why

The counts a post carries are right today only because each write that moves one moves it by hand. A path that forgets a count, such as a cascade, a job or a raw statement, leaves it wrong with nothing to notice. The client predicts a vote's mark but not its count, so a count waits for a round trip the viewer can see. Each derived value that comes next would need its own version of all of this.

## What changes

- A declaration on each derived column names its kind, its inputs and its prediction rule.
- The database maintains each aggregate by trigger and each function-kind value as a stored value, within one store.
- Each write answers with the derived values it changed, and one batched read serves the rest.
- The client holds one store of derived values and predicts a change from the row a write replaces.
- Row types keep a client from writing a derived value.
- The count lint selectors are retired with the mechanism they guarded.

## Capabilities

- `architecture/derived-fields` is new. It states the declaration, the kinds, the database maintenance, the answers, the predictions and the enforcement.
- `architecture/client-data` is modified in its count requirements.
- `post/likes` is modified in its vote-count requirement.

Nothing is BREAKING for a caller of the API. A count shows its new value earlier, and the ranking becomes a stored value computed from the count, with the same result.

## Scope

This is a program of four changes built in order: tags, relations-server, relations-client and counters. The [design](design.md) holds the decision, the kinds, the inventory and the verification each change relies on, and each change states what it delivers.
