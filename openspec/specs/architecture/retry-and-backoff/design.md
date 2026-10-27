# Retry and Backoff

A read that failed for a transient reason is worth asking again after a wait that grows, so the server is not hit at the moment it is already failing. The wait is one formula, in one place, so every retry in the repo paces itself the same way. The primitives are `getExponentialBackoffDelayMs` and `createExponentialBackoff` in `packages/shared/src/util/time`, which `@esposter/shared` exports beside `sleep`.

## The formula

```mermaid
flowchart LR
  Attempt["zero-based attempt"] --> Delay["min(base × 2^attempt, max)"]
  Delay --> Sleep["sleep before the next attempt"]
```

`getExponentialBackoffDelayMs(attempt, baseDelayMs, maxDelayMs)` is the only place the doubling and the cap are written. The attempt is zero-based, so the first wait after one failure is `base`, the next `2 × base`, and every wait from the point the cap is reached is `max`.

Every caller passes its own base and max, because each owns how long its surface can wait. The batched refresh and the Genshin start happen to share 1 second and 30 seconds today, declared as `BATCHED_REFRESH_BASE_DELAY_MS` and `BATCHED_REFRESH_MAX_DELAY_MS` in `apps/web/app/services/shared/constants.ts` and as `GENSHIN_START_RETRY_BASE_DELAY_MS` and `GENSHIN_START_RETRY_MAX_DELAY_MS` in `apps/web/app/services/genshin/constants.ts`, and that is a coincidence of two callers, not a default the shared helper imposes.

## The wrapper

`createExponentialBackoff(baseDelayMs, maxDelayMs)` returns `executeWithBackoff(operation)`. The wait is taken before an attempt, not after a failure: a call made after a failure sleeps first, and then runs the operation. A success resets the count, so the next call runs at once. A failure rethrows the error, so the caller decides what it means.

The wrapper never gives up. It has no cap on the number of attempts, because a caller that needs a cap owns that decision: the batched refresh stops after five retries (`MAX_RETRIES` in `apps/web/app/services/shared/createBatchedRefresh.ts`), and the Genshin start retries until it takes, behind a page that can cut the wait short.

## Who retries, and who does not

| Caller                                | Retries                                                              | Why                                                                                                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cursor pagination                     | a page read, through `executeWithBackoff`                            | the waypoint re-arms even when the read fails, so retries are paced rather than spun                                                                                            |
| Batched refresh                       | a re-read of the keys marked as changed, capped at 5 (`MAX_RETRIES`) | the read is the only path to an exact count, so a failed one recovers without the next change; see [batched refresh](../batched-refresh/design.md)                              |
| Genshin start                         | the start of a save lease, with `getGenshinStartRetryDelayMs`        | the loading screen is held meanwhile, so the page's retry can cut the wait short, and the delay is the same formula                                                             |
| Mutations (every `useMutation` write) | never                                                                | a write is not idempotent in general; a retry can apply a change twice, so a failed write is rolled back and reported, as [client data](../client-data/design.md) says          |
| Azure conditional writes              | a lost race, re-reading the version                                  | a different mechanism: it retries because another writer won, not because the server is failing, so it does not wait; see [conditional writes](../conditional-writes/design.md) |

A read that is not listed here does not retry. Adding one is a decision for its owner, and it lands here.

## Testing

The wrapper's tests spy on `setTimeout` and assert the delays it schedules, with small bases so the suite stays fast. Nothing waits on a real clock: a test that needs a retry to happen advances the fake timers it controls (see [no polling](../no-polling/design.md)).
