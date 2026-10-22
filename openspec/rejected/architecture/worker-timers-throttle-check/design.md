# Worker timers: a real-browser throttling check

A browser test that hides a tab running a worker interval, shows it again, and compares the interval's count with the wall clock, with a main-thread interval beside it as the control.

## Why not

The check needs a hidden tab, and no run the suite has tried can produce one. Vitest's browser mode runs on the shared browser factory without Nuxt, and a probe ran in about two seconds, so the cost of the harness was never the problem. The problem is the hide step: in headless Edge, bringing a second tab to front leaves the test's own tab reporting `visible`, so the check would pass or fail for reasons unrelated to throttling. A headful run was not tried. It would need a display the CI runner may not have, so the check would run on one developer's machine and nowhere a failure is enforced.

A test that only runs where it cannot be enforced proves nothing a reader can rely on, and the cost of maintaining a browser harness for it is not repaid. The throttling property is therefore a manual check, written in `specs/architecture/worker-timers`'s Limits.

## Reopening

Revisit when a hide mechanism is verified to make a tab report `hidden` in the browser CI runs, with no display required.
