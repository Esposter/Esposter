# Where a Failure Is Logged

Read when writing an err handler, logging a failure, or writing a notice for an expected degradation. The one-line rules are in `SKILL.md`; this page is the sinks and the one place `console.warn` stays.

- Never `catch {}` (silent swallow). Never `console.warn` — always `.orTee(console.error)`; `console.warn` handed to any handler slot is a `no-restricted-syntax` error. Two places change that sink, and both because the process writes somewhere more specific than the console: an Azure Functions handler logs through its `InvocationContext` (`context.error`) so the failure is attached to the invocation rather than the process, and `console.*` there is banned outright; `packages/virrun` writes every diagnostic to stderr through its own formatters, so a best-effort branch reports through `writeVirrunDebug` — its stated sink for a silently-degrading decision — rather than a raw `console.error` the CLI's own output contract does not allow. **The ban is on `console.warn` as an
  err handler** — a failure downgraded to a warning is a failure nobody reads. A notice that no chain produced keeps
  it: a browser without autoplay or background processors, an anonymous request on a local production build with no
  address to key a limiter on — each is an expected degradation on a path that has not failed, and `console.error`
  there would report an error where there is none.

- **`.match(noop, noop)` is the silent swallow wearing a terminator** (`no-restricted-syntax`). A branch is best-effort because the next run repairs it — a lease that goes unreleased, a temp that stays, a cache that is not written — and that is precisely what makes its failure invisible: nothing is wrong until the repair also stops happening, and by then there is no record of the first one. Best-effort is a reason to keep going, never a reason to say nothing, so the err handler names what was lost and what it costs. The ok handler stays `noop`.
