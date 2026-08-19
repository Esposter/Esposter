# Azure Functions: logging, retry and dead-letter replay

Read when writing or changing an Azure Functions handler, its dead-letter replay, or a handler that enumerates its own work from a query. The `console.*` ban in favour of `context.error` is stated in `SKILL.md`; this page covers the two phases and what a replay must do.

Handlers receive an `InvocationContext`. Log through it — `context.error(...)` / `context.log(...)`. When a service needs to log, `context` is its **first** parameter (`sendPushNotification`, `sendWebPushNotifications`, `createAndBroadcastMessage`).

Which steps may fail the caller is the repo-wide **persist then notify** standard (`/docs/architecture/persist-then-notify`) — guards and the primary write are fatal, everything after the notify is best-effort. In `packages/app/server` that tail is lint-enforced (the `persist-then-notify` oxlint plugin errors on an unwrapped `await` after an `emit`), so don't re-prescribe it here — this section covers only what the linter can't: a handler adds one mechanic on top — EventGrid delivery is at-least-once, so here a throw is a _retry request_, and the two phases get different loggers.

## Fatal path — rethrow to trigger retry

Top-level handler wrapper. `logAndRethrow` logs then rethrows, so the failure is retried. Use for genuinely retryable steps (input `.parse()`, the persist/create step):

```typescript
return getResultAsync(async () => {
  const input = someSchema.parse(event.data);
  const newMessage = await createAndBroadcastMessage(context, input);
  // ...
}).match(noop, logAndRethrow(context, AzureFunction.ProcessWebhook));
```

## Best-effort path — log through `context`, never rethrow

Rethrowing here asks for a redelivery that reruns the handler from the top, and a message's fresh time-based `rowKey` makes that rerun a **duplicate** rather than an overwrite. Log and swallow — through `context.error`, not `console.error`, so the failure is attached to the invocation:

```typescript
await getResultAsync(() => webPubSubServiceClient.group(newMessage.partitionKey).sendToAll(newMessage)).match(
  noop,
  (error) => {
    context.error(`Failed to broadcast message ${newMessage.partitionKey}/${newMessage.rowKey}: `, error);
  },
);
```

Canonical: `createAndBroadcastMessage` (broadcast) and `processWebhookHandler` (push dispatch).

## Past the retries — automatic replay, capped, then quarantined

When retries are exhausted the delivery dead-letters, and recovery from there is automatic and event-triggered, never a script someone remembers to run (`/docs/architecture/no-manual-recovery`). A replay handler:

- **Validates before republishing.** A payload that fails its schema can never succeed — quarantine it immediately instead of spending the attempt budget on it.
- **Carries the attempt count on the event id** (`<eventId>|<attempt>`), the only field republished verbatim into the next dead-letter payload. Anything attached to the stored artifact instead — blob metadata, name, prefix — is lost the moment a failed replay is dead-lettered into a brand-new blob, so that counter restarts at zero every cycle and loops forever (`packages/app/content/docs/infra/eventgrid-dead-letter.md`).
- **Quarantines past the cap** — move the payload under a prefix the trigger's filter excludes, then `context.error(...)`. Never leave a poison payload where the trigger can pick it up again.

## A handler that enumerates its own work bounds it in time and in width

Delivery is at-least-once and a dead-lettered payload can be replayed hours later, so an event carrying a _query_ (a prefix, a filter) rather than a fixed list re-runs that query against a world that moved on. Two bounds, both on the handler:

- **In time** — the publisher stamps its own instant into the payload and the handler filters on it (`createdBefore`). Otherwise a replay acts on rows/blobs written _after_ the effect was decided, which is how an idempotent-looking delete wipes something that was recreated in between. Marking the function idempotent is what authorizes that replay, so the bound is what makes the marking true.
- **In width** — fan out in waves of a named cap, never one combinator over the whole enumeration. An unbounded fan-out throttles the account, one rejection fails the batch, and the retry repeats it identically — the work never completes and eventually dead-letters.
