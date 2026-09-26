---
title: No Polling
description: Polling for state change is banned repo-wide — every wait is event-driven or awaits an explicit completion handle.
---

# No Polling

Waiting for something by repeatedly checking whether it happened yet — `expect.poll`, `vi.waitFor`, an interval that re-reads until a value flips, a loop draining a queue on a timer — is **banned everywhere in this repository**: app code, server code, Azure Functions, and tests. Polling converts a completion signal we already own into a timing guess; the guess is flaky under load, wastes cycles when idle, and hides the real dependency (the code no longer says _what_ it is waiting for, only _how often it checks_).

Every wait must be one of:

- **An awaited promise** — the operation hands back its own completion. Fire-and-forget work is still awaitable on demand: `getSynchronizedFunction` tracks every in-flight call and `waitForSynchronizedFunctions()` drains them deterministically (this is how tests assert on view-count telemetry without racing it).
- **An event or callback** — emitters (`messageEventEmitter`), tRPC subscriptions, Web PubSub, watchers. The producer tells the consumer; the consumer never asks.
- **A scheduled delivery** — work that must happen _at a time_ is enqueued for that time (Service Bus scheduled messages, EventGrid) rather than discovered by a consumer loop asking "anything yet?".

Periodic _work_ on a fixed cadence is not polling: the clicker game tick, the autosave interval, and animation timers run **because time passed**, not to check whether something else finished. The test is the purpose of the timer — "do the thing every N seconds" is scheduling; "check every N seconds whether the thing happened" is polling and gets rewritten around the signal that already exists.

If a dependency genuinely exposes no signal — no promise, no event, no webhook — that is an integration-design problem to fix at the boundary (add the completion handle, subscribe to the service's events), never a license to poll around it.

**An exception granted to an interactive command does not transfer to an unattended one.** A bounded wait can be right when a person is watching and has nothing else to wait on — a terminal cannot subscribe to a webhook. The moment the same code runs inside a runner, the premise is gone: the runner _is_ a webhook consumer, and the wait stops being a convenience and becomes a job holding a concurrency group. So the caller's context is part of the rule. The [review collector](/docs/infra/review-collector/runner) is the worked case — the cycle asks and exits, and the answer arrives as the event it always was.

The mechanical surfaces are lint-enforced: `expect.poll`, `vi.waitFor` and `vi.waitUntil` are `no-restricted-properties` errors in `oxlint.config.ts`, and a bare `waitFor`/`waitUntil` is a `no-restricted-globals` one. Hand-rolled check-on-a-timer loops match no rule, so those fall to review under this standard.
