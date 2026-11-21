# Resin

Part of [Genshin mods](../README.md). In the game, resin is the capacity that refills on a clock and is spent on what matters. A session has the same: its prompt cache, its context window and its usage limits. Resin shows all three at a glance and makes the usual answers to them one press each.

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
- Five minutes before the cache expires, a toast says so, once per expiry and never while a turn is running, since the turn renews the cache itself. The toast is one timer armed at each turn's end for that instant, not a check on a clock.
- `/resin off` hides the row and the toasts.

## Key files

| File                                                              | Role                                                                    |
| :---------------------------------------------------------------- | :---------------------------------------------------------------------- |
| `packages/genshin-mods/src/services/resin/getResinFigures.ts`     | Usage and the clock into the row's figures and warnings                 |
| `packages/genshin-mods/src/services/resin/getCacheRemainingMs.ts` | The time left on the cache                                              |
| `packages/genshin-mods/src/services/registerLifecycle.ts`         | The warning timer armed at each turn's end, and the renewal             |
| `packages/genshin-mods/src/services/band/registerBand.ts`         | The row and the warm, compact and handoff actions                       |
| `packages/genshin-mods/src/services/constants.ts`                 | The cache's lifetime, the thresholds and the warm and handoff questions |

## Notes

- The cache's lifetime is the engine's choice, an hour on a subscription and five minutes on some API plans. The engine does not report it, so it is the mod's one constant, `CACHE_LIFETIME_MS`.
- The published cache mod also compacts by itself past a threshold. That is left to the engine's own auto-compact, which already reads the window, so the mod adds no second policy beside it.
- **Overturned: a usage reserve.** Each limit window was read against a maintenance line, and past it the session was sent a cleanup section and a workflow was refused unless its agents were all haiku. The owner removed it so that a window is worked to its end on normal work, which leaves the mod reading no window. The workflow check the reserve carried is the [delegation guard](../delegation/design.md)'s, and it runs in every session.
