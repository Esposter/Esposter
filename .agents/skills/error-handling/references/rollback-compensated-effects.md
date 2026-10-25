# A best-effort effect a rollback compensates

Read when a function has a fire-and-forget tail and a failure path a caller rolls back through. The effect terminates its own `Result` as `SKILL.md` requires; this page is the await.

Best-effort means "its failure doesn't fail the caller" — it does not mean "nothing needs to know when it finished". The moment a **compensating cleanup deletes the artifact that effect writes**, the effect stops being fire-and-forget: a write still in flight lands after the cleanup and re-creates what the cleanup existed to remove, and the resurrected artifact is usually unreachable (its parent row is gone), so nothing ever reclaims it.

Await it in the function whose failure the rollback compensates, so the rollback cannot start before the write is durable:

```ts
// The insert and the trail entry a rollback would delete cannot be allowed to drift apart
await writeBar({ fooId: newFoo.id });
return newFoo;
```

The cost is one round trip, and nothing else — the effect already terminates its own `Result` (`getResultAsync(...).match(noop, console.error)`), so awaiting cannot fail the caller. Sibling emits on paths with no compensating cleanup stay fire-and-forget through `getSynchronizedFunction`; the exception is per-call-site, not per-helper, and the awaited call site says which cleanup it is racing.

Ask it whenever a function has both a fire-and-forget tail and a failure path a caller rolls back through: _does the rollback delete what the tail writes?_ `waitForSynchronizedFunctions()` is a test/shutdown drain, not the fix — it waits on every in-flight effect in the process, so it makes one race a global barrier.
