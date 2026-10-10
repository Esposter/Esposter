---
title: Agent batches
description: How a large body of settled work is built at once — the main session splits it into units, a wave of agents builds them in the one shared checkout checking only the packages it touched, one fixer runs every check once, and the long runs wait in a compute queue for runners.
---

# Agent batches

A batch is how the repository builds many units of work at once, such as a whole area's proposals. The main session does the thinking: it splits the work into units, settles their design calls, writes one brief every agent reads, and reads every report. The agents do the writing, all at the same time, in the one shared checkout; a screen's edit-and-compare loop and a compute-queue runner each work in a worktree of their own, as the [compute queue](/docs/genshin/roadmap) sets out. Each agent typechecks only the packages it edited, once before its commit; the full checks run once for the whole batch, by one fixer after every report is in, and anything that takes a long run waits in a queue for a runner instead of holding an agent.

## The flow

```mermaid
flowchart TD
  M["Main session — splits the work into units,<br/>settles the calls, writes one brief"] --> W["A wave — one haiku agent per unit,<br/>all in the shared checkout on ai/queue"]
  W -->|"commits by pathspec;<br/>runs its own typecheck"| Q["ai/queue"]
  W -->|"report — built, decided,<br/>queued, needs the user"| M
  M -->|"pushes"| Q
  Q --> CI["CI on every push"]
  W -->|"every report in"| F["One fixer — barrels, tests, typecheck,<br/>lint, snapshots, once"]
  CI -->|"red"| F
  F --> Q
  W -->|"a measure owed off the game"| CQ["Compute queue — the roadmap"]
  CQ -->|"[page] lane"| RP["One page runner — the GPU,<br/>its own worktree"]
  CQ -->|"[cpu] lane"| RC["A few CPU runners —<br/>their own worktree"]
  RP -->|"meets its bar"| Q
  RC -->|"meets its bar"| Q
  RP -->|"misses"| M
  RC -->|"misses"| M
  RP -->|"next item"| CQ
  RC -->|"next item"| CQ
  M -->|"what only the user can settle,<br/>asked in one batch"| U["The user"]
  U --> M
  M -->|"the reports' open work"| W
```

## Why it runs this way

- **One checkout, never a worktree per agent.** A worktree is a full install, and a wave of them fills the machine's memory and disk before any work is written. Every agent works in the shared checkout on `ai/queue` and commits only its own paths; the bench and the runners' worktrees are a fixed few, each installed once and reused, never one per agent. A file several units need, such as an index page, a constants file or a sibling's proposal, is edited by whichever agent needs it. It re-reads the file just before each edit and changes only its own lines, the same way two sessions share a checkout ([review queue](/docs/infra/review-collector)).
- **Every check runs once, by the agent that needs it.** Why each check runs once is the `throughput` skill's (`.agents/skills/throughput/references/machine-efficiency.md`). Each agent runs that package's check once, before its commit, as the throughput skill sets out: a pass of seconds on the tsgo-backed compiler, and a standing watcher would cost more memory than the passes it saves. Its own checks and builds are scoped as `.agents/skills/throughput/references/machine-efficiency.md` sets out. The parity page and every sibling read a package's source, and the user's `nuxt dev` rebuilds every package itself. Such a build never cleans (`tsdown --no-clean`), so a build that fails on another agent's half-written file leaves the last good `dist` in place. Nothing runs against the app itself: its suite and typecheck take minutes. When every report is in, one fixer runs the full checks once, and CI on the push is the backstop. Searches and long runs are placed as `.agents/skills/throughput/SKILL.md` says.
- **Haiku builds every unit, its calls settled first.** The main session writes each unit's calls into its prompt, and a Haiku agent builds it, settling its further calls as `.agents/skills/llm-delegation/references/running-agents.md` sets out. Only taste, money, licensing and the user's eyes and ears come back as questions, and they are asked in one batch.
- **Logic now, measures later.** Rules, state, navigation and shortcuts are built in the wave, as close to the game as public sources allow. A value that must be measured off the game gets a provisional constant and a [compute queue](/docs/genshin/roadmap) item. The item gives the exact command, its inputs and outputs, and the measure with its bar. A runner on the cheapest model takes it, and a miss comes back to the main session as a call, never as a second run with a guessed value.
- **Every resource busy, none thrashing.** While the batch is open the main session keeps three things working at once: the agents on their units, the GPU on the queue's page lane, and the cores on its CPU lane. The page lane has one runner, in one reused runner worktree, so the wave's edits never reload the page under a run; the CPU lane runs a few runners in a worktree of its own, since the scripts load the packages' `dist`, which a wave's half-written files leave missing exports. Before each run a runner reads the free memory and waits under an eighth of the machine's RAM, 2 GB on the 16 GB Mac and 4 GB on the 32 GB PC, as `.agents/skills/throughput/references/machine-efficiency.md` sets out ([the compute queue](/docs/genshin/roadmap)).
- **No loop runs it.** Each agent's completion is the event that drives the next step: a report is read, its work lands, its open work becomes the next wave's units, and an item it queued starts a runner if its lane has none. A runner loops through its lane by itself until the lane is empty. Nothing is scheduled and nothing polls.

## How a batch stops

A wave ends when every report is in and the fixer has run. The next wave is built only from what the reports left open. The batch converges when a wave's reports leave only items for the compute queue and questions for the user.

## Key files

| File                                                            | What it owns                                                                  |
| :-------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| `.agents/skills/llm-delegation/references/running-agents.md`    | the batch rules an agent prompt carries: shared checkout, package checks only |
| `.agents/skills/llm-delegation/references/delegation-prompt.md` | what every agent's prompt holds                                               |
| `.agents/skills/throughput/references/machine-efficiency.md`    | every check once, searches, long runs, the GPU: the recipes                   |
| `.agents/skills/genshin-parity/references/compute-queue.md`     | a queue item, and how a runner takes one                                      |
| `apps/web/content/docs/genshin/roadmap.md`                      | the compute queue itself, under its own heading                               |
