# Worker timers: a real-browser throttling check

## Decisions

- **The check runs in a real browser, not under fake timers.** Fake timers cannot model a background tab being throttled, so a unit test would pass whether or not the worker is doing its job. Rejected: a unit test that stubs the visibility state, because it proves the stub, not the throttling.
- **The check compares against the wall clock.** A count that matches the elapsed time within one tick is the property the worker exists for. Rejected: asserting an exact count, since the browser's scheduling jitter makes it flaky.
- **A main-thread interval runs beside the worker's.** The control shows the check would catch the drift it is for. Without it a passing worker proves nothing about the harness.

## Key files

Paths relative to `apps/web`.

| File                                     | Role                                 |
| ---------------------------------------- | ------------------------------------ |
| `app/services/shared/getWorkerTimers.ts` | the worker's timers the check drives |
| `app/workers/shared/timer.worker.ts`     | the worker the timers run in         |
