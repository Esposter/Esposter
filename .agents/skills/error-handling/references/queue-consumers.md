# Queue consumers: logging, retry and dead-letter replay

Read when writing or changing a queue consumer's job handler in the functions Worker, its dead-letter replay, or a handler that enumerates its own work from a query. The `console.*` sink is `references/logging-sinks.md`; this page covers the two phases and what a replay must do.

A job handler takes its message body and nothing else: `QueueJobHandlerMap` maps each `QueueJob` to a `(body: unknown) => Promise<void>`. `handleQueueBatch` (`apps/functions/src/services/queue/handleQueueBatch.ts`) is the one place a batch's messages are settled, through `getResultAsync`: a handler that resolves acknowledges its message, and one that throws retries it. The failure is logged there with `console.error`, so a handler logs only what it knows and never rethrows what the batch handler already settles.

Which steps may fail the caller is the repo-wide **persist then notify** standard (`openspec/specs/architecture/persist-then-notify/design.md`) — guards and the primary write are fatal, everything after the notify is best-effort. In `apps/web/server` that tail is lint-enforced (the `persist-then-notify` oxlint plugin errors on an unwrapped `await` after an `emit`), so don't re-prescribe it here — this page covers only what the linter can't: a queue adds one mechanic on top — queue delivery is at-least-once, so here a throw is a _retry request_, and the two phases differ in whether a failure throws at all.

## Fatal path — a throw is a retry request

A job's retryable steps — the body's `.parse()`, the persist step — are plain `await`s with no wrapper of their own. A throw there reaches `handleQueueBatch`, which retries that one message and leaves the rest of the batch alone. Canonical: `processWebhookHandler` parses its body and persists its message this way.

## Best-effort path — log through `console.error`, never throw

Rethrowing here asks for a redelivery that reruns the handler from the top, and a message's fresh time-based `rowKey` makes that rerun a **duplicate** rather than an overwrite. Log and swallow:

```ts
await getResultAsync(() => publishToServer({ message: newMessage, type: PublishEventType.Message })).match(
  noop,
  (error) => {
    console.error(`Failed to broadcast message ${newMessage.partitionKey}/${newMessage.rowKey}: `, error);
  },
);
```

Canonical: `createAndBroadcastMessage` (the broadcast) and `processWebhookHandler` (the notification after its message is persisted).

## Past the retries — the dead-letter queue

When retries are exhausted, the message goes to its job's dead-letter queue, after the count `QueueJobMaxRetriesMap` gives for the job. A dead-lettered message is a failure landed in durable storage, and a recovery path for it is push-triggered, capped and quarantining, never a script someone remembers to run (`openspec/specs/architecture/no-manual-recovery/design.md`). A replay handler:

- **Validates before sending again.** A payload that fails its schema can never succeed — leave it in the dead-letter queue instead of spending the retry budget on it.
- **Carries the attempt count in the body.** A re-sent message is a new message whose attempts restart at zero, so a counter kept only on the message restarts at zero every cycle and loops forever.
- **Quarantines past the cap** — a payload that has exhausted its attempts stays in a queue no consumer reads, and `console.error` names it. Never re-send a poison payload to a queue a consumer reads.

## A handler that enumerates its own work bounds it in time and in width

Delivery is at-least-once and a dead-lettered message can be replayed hours later, so a message carrying a _query_ (a prefix, a filter) rather than a fixed list re-runs that query against a world that moved on. Two bounds, both on the handler:

- **In time** — the publisher stamps its own instant into the payload and the handler filters on it (`createdBefore`, `processBlobDeletionHandler`). Otherwise a replay acts on rows/blobs written _after_ the effect was decided, which is how an idempotent-looking delete wipes something that was recreated in between. Marking a job idempotent — a nonzero entry in `QueueJobMaxRetriesMap` — is what authorizes its redelivery, so the bound is what makes the marking true.
- **In width** — fan out in waves of a named cap, never one combinator over the whole enumeration. An unbounded fan-out throttles the account, one rejection fails the message, and the retry repeats it identically — the work never completes and eventually dead-letters.
