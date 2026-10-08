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
- **Fan resolved work out at once.** Every unit whose judgement calls are settled goes to a `haiku` agent in its own worktree as soon as it is recognised, so the main session's turns stay on the work only it can do (the `llm-delegation` skill, `references/running-agents.md`).
- **Mind what a running job reads.** An edit that reloads a server, rebuilds a package or rewrites a data file a run is reading kills or corrupts that run; while it runs, the session works outside what it reads, or the run gets a server or worktree of its own. Each domain names its own locks (the `genshin-parity` skill names the parity page's).
- **A turn ends when nothing is ready**, or every ready unit waits on the user; its report lists what is still running, what lands next, and the one batch of asks.
