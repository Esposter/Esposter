---
title: Resin
description: Proposal — a band row of what the session is spending (time left on the prompt cache, the context it would re-send cold, the context window, the five-hour and weekly limits, the cost so far) with one-press warm, compact and handoff, and a warning before the cache goes cold.
model: claude-opus-5-5
---

# Resin

Part of [Claude Code mods](/docs/proposals/infra/claude-mods). In the game, resin is the capacity that refills on a clock and is spent on what matters. A session has the same: its prompt cache, its context window and its usage limits. Resin shows all three at a glance and makes the usual responses to them one press each.

## The row

Shown once the session has had a reply:

- **Cache:** minutes until the prompt cache expires, counted from the last request. The engine sets an hour on this account, so the count starts at sixty and resets with every reply. Beside it is how much context a cold cache would re-send at full price.
- **Context:** tokens used against the window, as the engine reports them.
- **Limits:** the five-hour and weekly windows' percentages, when the account reports them.
- **Cost:** what the session would have cost on API billing, the engine's own total.

Each figure takes the band's warning colour past a threshold (the cache under ten minutes, the context or a limit past eighty percent). The count redraws once a minute.

## The buttons

- **Warm** sends the smallest request that renews the cache: a one-word side question through a fork of the session. The fork re-sends the conversation's prefix, so the cache is renewed, and it adds no row to the transcript.
- **Compact** runs the engine's own compaction.
- **Handoff** is the whole relay in one press. A fork writes a handoff of the session: the goal, what is done, what is next, the files and decisions that matter, and the open questions. The mod then clears the conversation and sends that handoff as the first prompt of the fresh one. The person is left in a new context window already carrying on, with nothing to copy or paste.

Five minutes before the cache expires, a toast says so and names the three buttons. It fires once per expiry, and not at all while a turn is running, since the turn renews the cache itself.

## Failure

A fork that fails leaves the conversation as it was. For Handoff that means the clear never happens, because clearing waits for the handoff text, so a failed handoff loses nothing. The toast reports the reason the engine gives. Figures the engine does not have yet (no reply, no limits reported) are left out of the row rather than shown as zero.

## State and switching

| State            | Holds                                                             |
| :--------------- | :---------------------------------------------------------------- |
| `lastResponseAt` | When the cache was last renewed: a reply or a warm                |
| `now`            | The minute clock the countdown redraws from                       |
| `isHandingOff`   | True while a handoff is being written, which disables the buttons |
| `isEnabled`      | `/resin on` or `off`, kept in the store                           |

The countdown, the thresholds and the token and percentage formatting are pure functions and are what the tests cover.

## Files

All new, under `packages/genshin-mods`:

```text
src/resin/registerResin.ts           the minute clock, the toast and the three buttons
src/resin/getResinReadout.ts         usage and the clock into the row's figures and warnings
src/resin/getResinReadout.test.ts
src/resin/constants.ts               the cache lifetime, the thresholds, the handoff question
```

## Notes

- The cache's lifetime is the engine's choice, an hour on a subscription and five minutes on some API plans. The engine does not report it, so it is the mod's one constant, written where the countdown reads it.
- The published cache mod also compacts by itself past a threshold. That is left to the engine's own auto-compact, which already reads the window, so the mod adds no second policy beside it.
