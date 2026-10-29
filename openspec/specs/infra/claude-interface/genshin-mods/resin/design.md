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
- `/resin off` hides the row, the toasts and the usage reserve's section.

## Usage reserve

A plan's usage windows are spent by the session and its agents, and a compute run that is still owed needs some of a window left to start. So each limit window has a maintenance line, and the mod reads the five-hour and the weekly window against it. The lines are the constants `FIVE_HOUR_MAINTENANCE_PERCENTAGE` and `WEEKLY_MAINTENANCE_PERCENTAGE` in `constants.ts`, with `PACE_FLOOR_PERCENTAGE` the share under which a window is never read for its pace, and the map that holds each window's line is `RateLimitKindUsageWindowMap.ts`. The weekly window has a maintenance line because a week's spend is mostly agents launched on the session's own model, each re-reading a large cached context, and the weekly window's lockout lasts days, so its line moves the cleanup onto cheap agents while the window still has room. A fixed line cannot see the rate a window is spent at, so a window with half its allowance spent, and spent ahead of an even pace, the share of its length elapsed, starts the reserve early, since a week spent fast reaches the line with days still to run before its reset and runs dry in them. The mod keeps a usage reserve in the session from the first line a window passes, or the pace rule's, until that window resets.

The reserve is for a local plan's windows only. A cloud session spends cloud credit rather than the window's percentage, so the reserve is not meant to hold there: the session neither gets its system section nor is refused a launch while it runs in the cloud. The mod does not check for a cloud session yet, so until it does, a cloud session still reads the local windows. Making the mod skip a cloud session needs a reliable signal that the session runs in the cloud, which this page does not name, so the check is an open item for the mod to settle before it ships.

```mermaid
flowchart TD
  M["Engine measurement<br/>reads the five-hour and weekly windows"] --> P{"A window past its line<br/>or half spent ahead of an even pace<br/>with a reset time?"}
  P -->|yes| Q{"Reserve already on?"}
  Q -->|no| ON["Reserve starts"]
  ON --> T["Toast names the window and its reset, once"]
  ON --> S["System section naming the window, its line and its reset"]
  Q -->|yes| HOLD["Reserve holds, no second toast"]
  P -->|no, reserve on| OFF["Reserve lifts<br/>the section stops being sent and the gate opens"]
  P -->|no, reserve off| NONE["Nothing shown"]
  ON --> G["Launch gate on Workflow"]
  G --> D["Denied with the reserve's summary and what to do"]
```

- **What starts it** — each measurement the engine pushes reads the limit windows. A window starts the reserve past its maintenance line, or with half its allowance spent ahead of an even pace, and when both windows qualify the five-hour one is named. A toast names it with its reset time in local time, once, as it starts. Nothing is shown when the reserve ends.
- **What the session is told** — one system section naming the window, the line it has passed and its reset time, then the instruction to spend the rest of the window on cleanup agents on `haiku`. The throughput skill's "The usage reserve" section spells out what that means. The text holds still while the reserve names the same window at the same line, so it does not break the prompt cache. It is sent only while the resin mod is on.
- **What is refused at launch** — the section only describes the reserve, and a workflow already launched never reads it, so while a reserve holds and the resin mod is on, a `tool.call` hook on `Workflow` denies the launch. The denial opens with the reserve's summary sentence, then says to launch a `haiku` agent instead for cleanup or a compute runner whose judgement is settled, and otherwise to write the unit down as a follow-up and leave it for after the reset. An agent launch is the [delegation guard](../delegation/design.md)'s, which refuses one not on `haiku` whether or not a reserve holds, so a haiku agent passes. The gate stops at the window's reset time without waiting for the next measurement, and a failure of the hook lets the launch through, as the ward's does.
- **What lifts it** — the window's reset drops its reading under the line, and the next measurement clears the reserve, so the section simply stops being sent. No button or command does this.

The steps a session follows under a reserve are the repository's own, in the [throughput](https://github.com/Esposter/Esposter/blob/main/.agents/skills/throughput/SKILL.md) skill's "The usage reserve" section.

## Key files

| File                                                                      | Role                                                                           |
| :------------------------------------------------------------------------ | :----------------------------------------------------------------------------- |
| `packages/genshin-mods/src/services/resin/getResinFigures.ts`             | Usage and the clock into the row's figures and warnings                        |
| `packages/genshin-mods/src/services/resin/getCacheRemainingMs.ts`         | The time left on the cache                                                     |
| `packages/genshin-mods/src/services/resin/RateLimitKindUsageWindowMap.ts` | The limit windows the reserve is read off, each with its line                  |
| `packages/genshin-mods/src/services/resin/getReserveWindow.ts`            | The window the reserve names, with its reset time                              |
| `packages/genshin-mods/src/services/resin/getReserveSummary.ts`           | The sentence the reserve's section and its toast open with                     |
| `packages/genshin-mods/src/services/resin/reserveText.ts`                 | The reserve's system section                                                   |
| `packages/genshin-mods/src/services/resin/registerReserveGate.ts`         | The `tool.call` hook on `Workflow` that denies the launch under a reserve      |
| `packages/genshin-mods/src/services/resin/formatResetsAt.ts`              | The reset time in local time, for the toast and the section                    |
| `packages/genshin-mods/src/services/registerLifecycle.ts`                 | The warning timer armed at each turn's end, the renewal, the reserve's reading |
| `packages/genshin-mods/src/services/band/registerBand.ts`                 | The row and the warm, compact and handoff actions                              |
| `packages/genshin-mods/src/services/constants.ts`                         | The cache's lifetime, the thresholds and the warm and handoff questions        |

## Notes

- The cache's lifetime is the engine's choice, an hour on a subscription and five minutes on some API plans. The engine does not report it, so it is the mod's one constant, `CACHE_LIFETIME_MS`.
- A window the engine reports with no reset time does not start a reserve, since both the reserve's section and its lift depend on that time.
- The reserve belongs to the account's usage window rather than to the conversation, so a `/clear` or a resume keeps it until the next measurement reads the window again.
- The published cache mod also compacts by itself past a threshold. That is left to the engine's own auto-compact, which already reads the window, so the mod adds no second policy beside it.
