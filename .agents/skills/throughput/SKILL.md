---
name: throughput
description: Apply when a solve, a fit, a build, a CI run or a subagent will take a minute or more, when deciding what to do while one runs, when a turn is about to end, and when choosing the next unit of work. Esposter session throughput — every resource kept busy at once.
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
- **Fan resolved work out at once.** Every unit whose judgement calls are settled goes to a `haiku` agent in its own worktree as soon as it is recognised, so the main session's turns stay on the work only it can do (the `llm-delegation` skill, `references/running-agents.md`).
- **Mind what a running job reads.** An edit that reloads a server, rebuilds a package or rewrites a data file a run is reading kills or corrupts that run; while it runs, the session works outside what it reads, or the run gets a server or worktree of its own. Each domain names its own locks (the `genshin-parity` skill's `references/compute-queue.md` names the benches').
- **The machine works too, not only the agents.** While a batch is open the GPU runs the compute queue's page lane and the cores its CPU lane, each lane's runner looping by itself; the main session starts a lane's runner the moment its first item lands, and every run reads the free memory first, waiting under `GATE_MEMORY_SHARE` of the machine's RAM (`scripts/src/services/machine/constants.ts`) rather than swapping (the reading is in this skill's `references/machine-efficiency.md`, "Read the memory gate first").
- **Every run once, on the cheapest resource.** An agent typechecks the packages it edited once, before its commit, a search reads only what git tracks, and a long run goes to whichever of the cores, the GPU or its video engine does it cheapest (`references/machine-efficiency.md`).
- **A report frees its slot, and the session takes the next entry first.** When an agent reports, the session runs `pnpm ai:fleet:next` and launches a `haiku` agent on what it claims before anything else, so a finished agent's slot is refilled at once (`references/fleet.md`).
- **A turn ends when nothing is ready**, or every ready unit waits on the user; its report lists what is still running, what lands next, and the one batch of asks.

## Decide, don't ask

The user judges results, not method. A choice the repo's skills or specs already answer, or one with a recommended option, is taken by the session: it carries on with that option, records the choice where the owning skill or spec says to (the commit body, or the skill's own text), and names it in the report so the user can redirect. A method that fails is refined in the skill that owns it, and the result is reported.

Asking first is for the short user-only list, and nothing else:

- a fact only the user holds: an address, a key, a password, or a permission they have not granted (SSH access to another machine is the owner's call per machine, `references/game-data.md`);
- a recording, a look at the game, or any act only the user's eyes or hands can do;
- a delete, overwrite or publish outside the repo that cannot be regenerated, or a transfer of game files to a machine the owner has not set up.

An ask is one line, sent at the end of a reply with the default already taken. It never holds a unit that does not depend on its answer.

## The usage reserve

Each usage window keeps part of its end for the compute queue's runners, and what the session does at each of the window's lines is `references/usage-reserve.md`.

The reserve guards a local plan's window. A cloud session spends the account's API cloud credit instead, so it keeps working to the end of its task and never stops at a window's line; the mod's gap that shows it the reserve, and what to do under that notice, is in `references/usage-reserve.md`'s Scope paragraph.

## Deep Dives

- `references/machine-efficiency.md` — when a wave starts, when an agent is about to check, build, search or scan, and when the CPU is pinned while the GPU idles.
- `references/fleet.md` — when more than one machine works the backlog: profiles, the pulled queue, claims as refs, fleet load and sync.
- `references/usage-reserve.md` — when a usage window reaches its maintenance or wind-down line.
- `references/game-data.md` — when game data has to reach a machine, by download or by a copy between LAN machines.
