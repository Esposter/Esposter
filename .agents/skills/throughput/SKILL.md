---
name: throughput
description: Apply when a solve, a fit, a build, a CI run or a subagent will take a minute or more, when deciding what to do while one runs, when a turn is about to end, and when choosing the next unit of work. Esposter session throughput — every resource kept busy at once: the main session on the next unit while long runs go in the background, haiku agents on resolved work, the user's ear and eye asked in one batch, and a ready list that never runs dry while the backlog is open.
---

# Throughput — Nothing Idles While Work Is Ready

Time and effort are the limit, so every resource the session holds works at once: the main session, `haiku` subagents, background commands, and the user's ear and eye. A solve that runs half an hour is half an hour of the session's own work done beside it, never half an hour waited. Who runs which kind of work is the `llm-delegation` skill; how a check runs and is waited on is the `running-checks` skill.

## Settled — do not re-propose

- **Waiting on a run with nothing else started** — a foreground solve, a sleep loop, a turn spent watching an agent. Its completion notifies the session; the time before it belongs to the next unit.
- **Ending a turn to report while independent work is still ready.** The report goes out with the work still running, and names what runs and what is queued.
- **A question to the user that blocks the rest of the turn.** Asks of the user's ear or eye are batched at the end of a reply, and everything not waiting on the answer carries on.

## Rules

- **A run of a minute or more starts in the background**, and the same turn picks up the next unit that does not depend on it. A step whose input is that run's result waits for its notification and is never run ahead on a guess.
- **Keep a ready list.** Before starting a long run, name the next units that do not depend on it: the next open question of another pass, a proposal in another area, a written spec a `haiku` agent can take, the docs and tests a landed change still owes. The backlog is read off the open handoff's next steps, the area's roadmap and `pnpm ai:proposals:report`.
- **Fan resolved work out at once.** Every unit whose judgement calls are settled goes to a `haiku` agent in the shared checkout as soon as it is recognised, so the main session's turns stay on the work only it can do (the `llm-delegation` skill, `references/running-agents.md`).
- **Mind what a running job reads.** An edit that reloads a server, rebuilds a package or rewrites a data file a run is reading kills or corrupts that run; while it runs, the session works outside what it reads, or the run gets a server or worktree of its own. Each domain names its own locks (the `genshin-parity` skill names the parity page's).
- **The machine works too, not only the agents.** While a batch is open the GPU runs the compute queue's page lane and the cores its CPU lane, each lane's runner looping by itself; the main session starts a lane's runner the moment its first item lands, and every run reads the free memory first, waiting under an eighth of the machine's RAM (2 GB on the 16 GB Mac, 4 GB on the 32 GB PC) rather than swapping (`genshin-parity`'s `references/compute-queue.md`).
- **Every run once, on the cheapest resource.** An agent typechecks the packages it edited once, before its commit, a search reads only what git tracks, and a long run goes to whichever of the cores, the GPU or its video engine does it cheapest (`references/machine-efficiency.md`).
- **A turn ends when nothing is ready**, or every ready unit waits on the user; its report lists what is still running, what lands next, and the one batch of asks.

## The usage reserve

The plan's usage is spent by the session and its agents, while a compute-queue run spends the machine and only needs a cheap `haiku` runner to start it. So each usage window keeps some of its end for the runners, and a session never runs dry with long runs still owed. The `genshin-mods` cache-and-handoff mod reads the five-hour and the weekly window against their tiers, and puts the reserve into the session's system prompt naming the window and its reset time. The lines are `FIVE_HOUR_MAINTENANCE_PERCENTAGE`, `FIVE_HOUR_WIND_DOWN_PERCENTAGE` and `WEEKLY_WIND_DOWN_PERCENTAGE` in the mod's `constants.ts`: the five-hour window's maintenance tier starts at 90% used and its wind-down at 97%, and the weekly window has no maintenance tier and winds down at 90%. Where both windows have crossed a line, the stricter state wins, so wind-down beats maintenance.

### Maintenance

The five-hour window resets within hours, so its unused end is lost, and `haiku` stretches it furthest because limits weigh a token by its family. From its maintenance line until the window resets, the session:

1. Starts no new feature, design or proposal.
2. Spends the rest of the window on `haiku` agents for cleanup: fixes the findings of a code review of the window's own recent commits; drains an open sweep ledger (the `sweeps` skill); brings the docs and skills in line with the code changed this window (the Key-files sweep in `AGENTS.md`'s finishing steps); fixes CI's typecheck and lint reds; and lands the refactors, simplifications and optimisations the compute queue's runs surfaced.
3. Writes a finding that needs judgement down as a follow-up (the `follow-ups` plugin's capture skill), not decided on `haiku`.
4. Keeps the compute queue's runners going.

### Wind-down

The weekly window stays strict because a lockout lasts days. From a window's wind-down line until it resets, the session:

1. Starts nothing new that thinks or builds: no implementation agent, no workflow, no proposal.
2. Sends each running implementation agent its wrap-up: commit what builds, then end on a handoff spec that a `haiku` agent can build cold.
3. Writes every open item down with what it takes to resume it cold: the paths, what is done, the calls already made, the next step. Genshin work goes on its roadmap, a handoff spec into its proposal page, never only the scratchpad. Anything else goes in as a follow-up through the `follow-ups` plugin's capture skill.
4. Commits the edit in hand and the records just written by pathspec, and pushes the queue.
5. Cleans up the page servers, shells, monitors and worktrees nothing still uses.
6. Keeps the compute queue's runners going, one per lane, until the window resets and the reserve lifts by itself.

## Deep Dives

- `references/machine-efficiency.md` — when a wave starts, when an agent is about to check, build, search or scan, and when the CPU is pinned while the GPU idles.
- `references/fleet.md` — when more than one machine works the backlog: profiles, the pulled queue, claims as refs, fleet load, sync, and game data over the LAN.
