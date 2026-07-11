---
title: Resilient achievement plugin
description: Proposal — achievement processing failures must never fail the mutation that triggered them.
---

# Resilient Achievement Plugin

Make `achievementPlugin` best-effort. Today it runs after `next()` succeeds and its own database writes go unguarded — if an achievement upsert throws (transient DB error, constraint edge), the whole procedure call returns an error to the client **after the actual mutation already committed**. The user's message/post/save went through, but they see a failure and may retry, duplicating the action.

## Scope

**Today:** the plugin's loop of finds/inserts/updates (`requireMutation` throws on missed writes) executes inline in the request; any throw propagates to the caller.

**This adds:** an error boundary around the entire post-mutation block. No behavioral change on the happy path.

## How it works

- Wrap the definition loop + emit in `getResultAsync` (the repo's no-try/catch standard); on failure, log with enough context (path, userId, definition name) and return the original `result` regardless.
- Progress lost to a swallowed failure self-heals for counter achievements (next trigger increments again — one increment is lost, thresholds are approximate anyway) and is retried naturally for `amount: 1` conditions (next qualifying call unlocks).
- Keep processing synchronous — the write amplification is a couple of indexed queries and only for matching paths; moving to EventGrid would buy latency at the cost of losing typed raw-input access and adding at-least-once duplicate handling. Not worth it at this scale; note it as the escalation path if plugin latency ever shows in traces.

## Key files

Paths relative to `packages/app`.

| File                                            | Change                     |
| ----------------------------------------------- | -------------------------- |
| `server/trpc/plugins/achievementPlugin.ts`      | error boundary + logging   |
| `server/trpc/plugins/achievementPlugin.test.ts` | failure-isolation coverage |

## Notes

- The one-lost-increment tradeoff is deliberate: achievement counters are motivational, not financial. Correctness lives with the primary mutation.
