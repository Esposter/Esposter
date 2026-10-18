# Worker timers: a real-browser throttling check

## Why

The worker-timers page marks two upstream issues, #413 and #65, as in-scope defects. Both are about the background-tab throttling the worker exists to avoid. The page's only proof for them is a manual check in a real browser, because no unit test environment throttles a background tab. A verdict with no runnable proof cannot fail, so the page's own rule that each verdict rests on a test or a source line is not met for them.

## What Changes

A browser check, run by the suite, that hides a tab running a worker-timers interval, shows it again and compares the interval's count against the wall clock.

- A tab hidden for a fixed span and shown again has its worker interval keep its count against the wall clock.
- The same check runs a main-thread interval beside it, which drifts, so the check can tell the two apart.

## Capabilities

- **architecture/worker-timers** (modified)

## Impact

- A browser harness the suite does not have yet. No browser test runner is installed, so the choice of runner is the first decision of the change.
