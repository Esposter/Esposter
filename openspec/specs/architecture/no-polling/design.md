# No Polling

Waiting for something by repeatedly checking whether it happened yet — `expect.poll`, `vi.waitFor`, an interval that re-reads until a value flips, a loop draining a queue on a timer — is **banned everywhere in this repository**: app code, server code, the realtime and jobs Workers, and tests. Polling converts a completion signal we already own into a timing guess; the guess is flaky under load, wastes cycles when idle, and hides the real dependency (the code no longer says _what_ it is waiting for, only _how often it checks_).

Every wait must be one of:

- **An awaited promise** — the operation hands back its own completion. Fire-and-forget work is still awaitable on demand: `getSynchronizedFunction` tracks every in-flight call and `waitForSynchronizedFunctions()` drains them deterministically (this is how tests assert on view-count telemetry without racing it).
- **An event or callback** — a typed event pushed over a socket, a queue message, watchers. The producer tells the consumer; the consumer never asks.
- **A scheduled delivery** — work that must happen _at a time_ is enqueued for that time (an alarm on the owning object, or a queue's delay) rather than discovered by a consumer loop asking "anything yet?".

Periodic _work_ on a fixed cadence is not polling: the clicker game tick, the autosave interval, and animation timers run **because time passed**, not to check whether something else finished. A managed service's own schedule is the service's, not a timer this repo runs; replacing it with push indexing on write is a separate decision. The test is the purpose of the timer — "do the thing every N seconds" is scheduling; "check every N seconds whether the thing happened" is polling and gets rewritten around the signal that already exists.

A sync on a timer is polling even when the period is minutes: a timer that asks whether the remote moved is the same check as one that asks whether a test flipped. The queue is driven by the events that move the remote instead:

- **A commit starts nothing.** Landing a commit on `ai/queue` is not a trigger: the agent lands its commits with its own loop (the `review-queue` skill), an explicit action it takes when it has something to land, and nothing polls for the commits it has not yet landed.
- **The cache warning is one timer.** Each turn's end arms one timer for the prompt cache's expiry instant. The warning it shows is owned by the [resin](../../infra/claude-interface/genshin-mods/resin/design.md) mod, which warns five minutes before expiry.

If a dependency genuinely exposes no signal — no promise, no event, no webhook — that is an integration-design problem to fix at the boundary (add the completion handle, subscribe to the service's events), never a license to poll around it.

A gauge with no signal, such as the free memory, is read once rather than waited on: the work is sized to the reading (`getMemoryBoundedShardCount` bounds a map's AnimeStudio runs by it before any starts), or a shut gate is answered at once and the caller decides what comes next (`readMemoryGateShortfall` in `ai:worktree:create`). A local file has a signal, so a hold that ends on its file's deletion watches the folder (`holdFleetEntry`) rather than checking it on a timer.

**An exception granted to an interactive command does not transfer to an unattended one.** A bounded wait can be right when a person is watching and has nothing else to wait on — a terminal cannot subscribe to a webhook. The moment the same code runs inside a runner, the premise is gone: the runner _is_ a webhook consumer, and the wait stops being a convenience and becomes a job holding a concurrency group. So the caller's context is part of the rule. The [review](../../infra/review/design.md) workflow is one such unattended runner.

The mechanical surfaces are lint-enforced: `expect.poll`, `vi.waitFor` and `vi.waitUntil` are `no-restricted-properties` errors in `oxlint.config.ts`, and a bare `waitFor`/`waitUntil` is a `no-restricted-globals` one. A hand-rolled check-on-a-timer loop awaits inside itself, so it carries a `no-await-in-loop` directive, and `sequential-loops/require-loop-shape` accepts no polling shape for its reason: one is argued in the sequential-loops page's table first. A wait outside a loop, such as a recursive retry, is `sequential-loops/no-async-self-call`'s; the rest fall to review under this standard.
