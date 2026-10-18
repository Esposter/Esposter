# Worker timers: a real-browser throttling check

## Decisions

- **The check runs in a real browser, not under fake timers.** Fake timers cannot model a background tab being throttled, so a unit test would pass whether or not the worker is doing its job. Rejected: a unit test that stubs the visibility state, because it proves the stub, not the throttling.
- **The check compares against the wall clock.** A count that matches the elapsed time within one tick is the property the worker exists for. Rejected: asserting an exact count, since the browser's scheduling jitter makes it flaky.
- **A main-thread interval runs beside the worker's.** The control shows the check would catch the drift it is for. Without it a passing worker proves nothing about the harness.
- **#413 and #65 hold no verdict until this check runs.** The worker-timers page's rows read `In scope — recorded`, a state the dependency-admission triage does not define, because its proof is a test that does not exist yet. Once task 2.1 passes, both rows become `In scope — defect` and name the scenario's test, the triage's own proof. Rejected: adding a pending verdict to dependency-admission, since it would let a verdict stand with no test behind it; and marking the rows `In scope — defect` now, since the triage requires the test to be seen failing first.

## Key files

Paths relative to `apps/web`.

| File                                     | Role                                 |
| ---------------------------------------- | ------------------------------------ |
| `app/services/shared/getWorkerTimers.ts` | the worker's timers the check drives |
| `app/workers/shared/timer.worker.ts`     | the worker the timers run in         |
