# Where a Failure Is Logged

Read when writing an err handler, logging a failure, or writing a notice for an expected degradation. The one-line rules are in `SKILL.md`; this page is the sinks and the one place `console.warn` stays.

- Never `catch {}` (silent swallow). Never `console.warn` — always `.orTee(console.error)`; `console.warn` handed to any handler slot is a `no-restricted-syntax` error. The console is the sink for every err handler, including a queue consumer's: a Worker has no logger beyond it, and `handleQueueBatch` (`apps/jobs/src/services/queue/handleQueueBatch.ts`) logs each failed message with `console.error`. **The ban is on `console.warn` as an
  err handler** — a failure downgraded to a warning is a failure nobody reads. A notice that no chain produced keeps
  it: a browser without autoplay or background processors, an anonymous request on a local production build with no
  address to key a limiter on — each is an expected degradation on a path that has not failed, and `console.error`
  there would report an error where there is none.

- **`.match(noop, noop)` is the silent swallow wearing a terminator** (`no-restricted-syntax`). A branch is best-effort because the next run repairs it — a lease that goes unreleased, a temp that stays, a cache that is not written — and that is precisely what makes its failure invisible: nothing is wrong until the repair also stops happening, and by then there is no record of the first one. Best-effort is a reason to keep going, never a reason to say nothing, so the err handler names what was lost and what it costs. The ok handler stays `noop`.

- **A fallback that becomes nothing names its failure.** `.unwrapOr(undefined)`, `.unwrapOr(false)` or an empty list, and a `.match` err arm that returns such a sentinel, are where a failure reads as "there was nothing", so each one logs the failure (`.orTee(console.error)` before the fallback, or `console.error` in the arm) or carries a comment beside it naming why the failure is the expected answer. An arm that rethrows the failures it does not expect, or reads the error it is given and hands it on or records it, passes the failure on and needs neither. `error-handling/no-uncommented-fallback` enforces it across the tree; the rule reads a comment for its place (within the call's lines or on the line above), and this page says what it must name.
