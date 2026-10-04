---
title: Resin
description: A band row of what the session is spending — time left on the prompt cache and what a cold cache would re-send, the context window, the five-hour and weekly limits, the cost so far — with one-press warm, compact and handoff, and a warning before the cache goes cold.
---

# Resin

Part of [Genshin mods](/docs/infra/claude-interface/genshin-mods). In the game, resin is the capacity that refills on a clock and is spent on what matters. A session has the same: its prompt cache, its context window and its usage limits. Resin shows all three at a glance and makes the usual answers to them one press each.

## The row

Shown once the session has sent a request, and gone again after a `/clear` or a resume:

- **cache** — minutes until the prompt cache expires, counted from when the last request or warm was sent rather than from its reply, since that is when the cache was read, and how much context a cold cache would re-send at full price.
- **context** — tokens used against the window, as the engine reports them.
- **5h** and **7d** — the limit windows' percentages, when the account reports them.
- **cost** — what the session would have cost on API billing, the engine's own total.

A figure takes the warning colour past its threshold — the cache under ten minutes, the context or a limit at four-fifths — and a figure the engine has not measured yet is left out rather than shown as zero. The countdown redraws once a minute.

## How to use it

Each is a button, or with the band focused a key: `w`, `c` and `h`.

- **Warm** renews the cache: a one-word side question through a fork of the session, which re-sends the conversation's prefix and adds no row to the transcript.
- **Compact** runs the engine's own compaction.
- **Handoff** is the whole relay in one press. A fork writes a handoff of the session — the goal, what is done, what is next, the files and decisions that matter, the open questions — then the mod clears the conversation and sends the handoff as the first prompt of the fresh one. The buttons give way to a note while it is written, and the clear waits for the handoff, so a fork that fails clears nothing and a toast says why. A clear or submit that fails after the fork is toasted the same way, and the buttons come back either way.
- Five minutes before the cache expires, a toast says so, once per expiry and never while a turn is running, since the turn renews the cache itself.
- `/resin off` hides the row and the toast.

## Key files

| File                                                              | Role                                                                    |
| :---------------------------------------------------------------- | :---------------------------------------------------------------------- |
| `packages/genshin-mods/src/services/resin/getResinFigures.ts`     | Usage and the clock into the row's figures and warnings                 |
| `packages/genshin-mods/src/services/resin/getCacheRemainingMs.ts` | The time left on the cache                                              |
| `packages/genshin-mods/src/services/registerLifecycle.ts`         | The minute clock, the warning toast, the renewal on each request        |
| `packages/genshin-mods/src/services/band/registerBand.ts`         | The row and the warm, compact and handoff actions                       |
| `packages/genshin-mods/src/services/constants.ts`                 | The cache's lifetime, the thresholds and the warm and handoff questions |

## Notes

- The cache's lifetime is the engine's choice, an hour on a subscription and five minutes on some API plans. The engine does not report it, so it is the mod's one constant, `CACHE_LIFETIME_MS`.
- The published cache mod also compacts by itself past a threshold. That is left to the engine's own auto-compact, which already reads the window, so the mod adds no second policy beside it.
