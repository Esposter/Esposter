# Client predictions for derived fields

## Intent

The viewer sees a vote's count and a reply's effect on the posts above it at the moment they act, and the server's answer settles what they see.

## Why

The client moves a vote's mark at once but its count only after a round trip, and it moves nothing for a reply. The count store is written for posts alone, so every other derived value would need a store of its own.

## What changes

- One store holds every derived value, and every display of one reads through it.
- The overlay's write predicts each derived value a recorded row changes, from the row it replaces.
- A removal predicts its change only from a held, current count, and a copy waits for its answer when its source is not held.
- A refused write drops its predictions and reads its values back.
- The count lint selectors are retired, since the readonly types refuse the same writes.
- The client-data count requirement and the vote requirement in the likes spec are modified to the prediction rule.

## Capabilities

- `architecture/derived-fields`, the client half of its requirements.
- `architecture/client-data`, with its count requirement and its vote-mark requirement modified.
- `post/likes`, with its vote requirement modified.

Nothing is BREAKING for a caller of the API. A count shows its new value earlier, and a refusal reads it back as it does today.

## Order

Built on the server maintenance change, since the answers it gives are what this change settles against. The [design](design.md) states the predictor's rules and the store's key files.
