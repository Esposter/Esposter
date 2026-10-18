# Engineering loops

Every piece of work in Esposter enters one of the loops below, and every loop ends by handing something to another: a product review writes the proposals a build empties, a build ships the surface the next review judges, every change goes through the same finishing audit and the same review queue, a sweep that writes one finding twice hands it to an enforcer, and every loop's lessons go into the skills every loop reads. None of the loops is scheduled. Each is started by a person's ask or by the event another loop produced, and each has a stop rule, so the whole thing converges instead of churning: **each pass of a loop should find less than the one before**.

This page is the map. Each loop is owned by the skill or page it names, and its rules live there; the one rule stated here is the order in the last section, which belongs to no single loop.

## The loops

```mermaid
flowchart TD
  ASK["a person's ask"] --> PR
  ISSUE["GitHub issue"] -->|"ai:triage:label"| TRIAGE{"triaged as"}
  TRIAGE -->|"needs design"| PR
  TRIAGE -->|"ready-for-agent"| BUILD

  subgraph product ["Product loop"]
    PR["product-review — a surface against its reference product"] -->|"a gap"| PROPOSAL["proposal · deferred · rejected page"]
    PROPOSAL -->|"ai:proposals:report"| BUILD["building-proposals — choose, verify, build"]
    BUILD -->|"ship"| SHIPPED["as-built page"]
    SHIPPED -->|"area owed a pass"| PR
  end

  subgraph change ["Change loop — every change"]
    FINISH["finishing — review, tests, docs, skills, ledgers"] --> CHECKS["the touched tests"]
    CHECKS --> QUEUE["review-queue — ai/queue"]
    QUEUE -->|"every push"| CI["CI — format, typecheck, lint, the whole suite"]
    QUEUE --> REVIEW["review — haiku reviewers over each window of ai/queue"]
    REVIEW -->|"main fast-forwards to the window's end"| CI
    REVIEW -->|"fixer fixes the findings on ai/queue"| QUEUE
    REVIEW -->|"a passed window's findings"| REVIEWISSUE["a review issue per chunk of findings"]
    REVIEWISSUE -->|"the settle job: fixed, refuted or recorded"| REVIEW
  end

  subgraph health ["Code-health loop"]
    LEDGER["sweeps — one ledger unit at a time"] -->|"a finding written twice"| ENFORCER["an enforcer — lint rule or test"]
    ENFORCER -->|"the sweep shrinks"| LEDGER
  end

  BUILD --> FINISH
  LEDGER --> FINISH
  LEDGER -->|"a fix that changes behaviour"| PROPOSAL
  FINISH -->|"an unfixed finding"| PROPOSAL
  FINISH -->|"a lesson"| SKILLS["skills — the knowledge loop"]
  REVIEW -->|"a lesson"| SKILLS
  LEDGER -->|"a rule gap"| SKILLS
  SKILLS -->|"read by every loop"| FINISH
```

- **The product loop** decides what the products should do and builds it. The product review holds each surface against its reference product and triages every gap into a [proposal](../../../changes/), a deferred or a rejected page (`product-review` skill). A build takes the cheapest valuable proposal, re-verifies it, builds it and ships it as an as-built page (`building-proposals` skill); a whole area's proposals at once go out as an [agent batch](../agent-batches/design.md). The ship moves the surface the last review judged, so the area is owed a pass. `pnpm ai:proposals:report` computes both halves from the tree and git: the size of each open proposal, and which areas are owed a pass.
- **The change loop** is what every change goes through, whatever loop it came from. The finishing audit asks what the change owes beyond its code: both review lanes, tests, docs and diagrams, skills, ledgers and enforcers (`finishing` skill, and "Finishing a change" in `AGENTS.md`). The session runs only the tests of what it touched, and leaves format, typecheck, lint and the whole suite to CI on the push. The session does not watch that run unless the user asks for verification; when it does, it fixes a red typecheck or lint itself (`running-checks` skill, "Watching the push's run, when asked"). It commits to one queue branch, `ai/queue`, and the [review](../../infra/review/design.md) reads that queue a window at a time: `main` fast-forwards to each window's end, and a fixer fixes what the reviewers found on the queue. Findings the fixer defers become one GitHub issue per run, labelled for an agent to pick up.
- **The code-health loop** covers simplifying, refactoring and optimizing code that already works. A sweep carries one settled convention across old code, one ledger unit per commit (`sweeps` skill). The quality ledger and the runtime-efficiency ledger are sweeps too. A finding a sweep writes twice becomes an enforcer, so the sweep shrinks rather than repeats. A fix that would change behaviour leaves the sweep and becomes a proposal.
- **The knowledge loop** keeps the other loops from repeating themselves. A convention a session discovers or corrects goes into the skill that owns it (`skill-authoring` skill). A regression a review re-finds is added to its append-only list of causes, and each round's meta pass asks what the round's own evidence says about the review's instructions (`code-review` skill). The skill sweep re-reads the whole skill tree until a pass finds nothing (`skill-sweep` skill).
- **Issues** reach the loops through triage. `pnpm ai:triage:label` gives an issue one of the tracker's roles. A `ready-for-agent` issue is built like a proposal and closed when it ships; an issue that needs a design decision is read by the next product-review pass of its area.

## Where work enters

| The work                                                   | Enters at                                                                                              |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| A session starting, or picking work back up                | `resuming` skill and `pnpm ai:resume`                                                                  |
| What is missing from a product, or whether an area is done | `product-review` skill                                                                                 |
| What to build next, or the low-hanging fruit               | `building-proposals` skill and `pnpm ai:proposals:report`                                              |
| A feature asked for with no proposal                       | `building-proposals` skill: the written-record check, then the build                                   |
| A defect                                                   | fixed in the change that finds it, with a regression test that fails without the fix (`testing` skill) |
| Simplifying or cleaning up code in hand                    | `code-review` skill, quality lane                                                                      |
| A refactor too large for one change                        | a `refactors-<slug>` change, built by `building-proposals`                                             |
| A settled convention that old code predates                | `sweeps` skill, one ledger per convention                                                              |
| Making something faster or cheaper                         | `runtime-efficiency` skill for where the work runs, `bench` skill for measuring it                     |
| A convention learned or corrected                          | `skill-authoring` skill                                                                                |
| A dependency update                                        | `dependency-updates` skill                                                                             |
| A GitHub issue                                             | `pnpm ai:triage:label`, then the loop its role names                                                   |

## How each loop stops

Every loop has a stop rule that its owner states. Together, they are what makes the system converge:

- **Product review** stops for an area once a full pass finds nothing new and changes no decision. It starts again only when something moves under that area: a ship, a changed reference product, a deferred page's trigger firing, or a reported gap.
- **A build** stops when the proposal has shipped. The build loop as a whole is empty when `pnpm ai:proposals:report` lists no open proposal.
- **A code review** stops at a round whose confirmed findings are all minor.
- **A sweep** stops when a resume reports nothing, and an enforcer can take it over entirely.
- **The skill sweep** stops when a full pass over the tree finds nothing.

A loop that finds as much on one pass as it did on the last is not converging. The fix for that is in its owner's questions, not another pass.

## What runs next when nothing is asked

A session that finishes a unit of work does not stop to ask whether to go on. It takes up the first of these that exists, runs it to its own stop rule, commits and pushes it, and reads the list again, until the list is empty or the user redirects it. Each one is read off a command rather than a list someone keeps:

1. **This machine's leftovers.** `pnpm ai:resume` lists what an earlier session left on this machine: uncommitted paths, unpushed commits, worktrees, its own stale claims, dead holds, missing plugins. Each one is finished, recorded or released before anything else, since every later step builds on the tree and the claims they hold (`resuming` skill).
2. **Something red.** A failing review run (`review-queue` skill), since every later piece of work lands on top of it.
3. **This repository's follow-ups**, when the follow-ups plugin is installed: the owner wrote each one down, or accepted a session writing it, so it outranks work a session would pick for itself. The plugin's drain skill works them one change at a time to its own stop rule ([TodoList agent follow-ups](../../resource/todolist-agent-follow-ups/design.md)).
4. **An area owed a product-review pass**, as `pnpm ai:proposals:report` lists it, so the specs match the shipped surface before anything is built from them.
5. **The cheapest valuable proposal** that the same report lists (`building-proposals` skill).
6. **An open ledger row**, as `pnpm ai:sweep:ledger-coverage` dates them (`sweeps` skill); the skills' own rows are the skill sweep.

Beside every step, never one of them: **the machine's compute queue.** Once the leftovers are clear, the session claims entries with `pnpm ai:fleet:next`, and a `haiku` agent takes each one it claims, claiming again as each agent reports, until the closing pass below. The runners keep going through every later step, and a pause the session takes for any of them, a usage window's end or a stop on one lane, leaves them running: only the user stops the queue (the `genshin-parity` skill's `references/compute-queue.md`, "Keeping it busy").

Last of all, never before: **the closing pass**, which brings `main` up to everything the session landed. A session runs it before it stops — the list above is empty, its usage window is ending, or the user calls time. It takes no new fleet entry from then on, lets the agents already in flight land, fixes whatever CI on `ai/queue` turns red until every job is green, and only then runs the review by hand: `pnpm ai:review`, its fix and its settle, which fast-forward `main` ([review](../../infra/review/design.md), "Running it by hand"). Through that pass the session lands fixes, refactors and simplifications of what is on `ai/queue` and no new capability (the review page's Decisions), since every commit landed mid-pass is one more for the review to read before `main` can reach the fixes.

No step on this list waits for approval, since each one ends in a queue push, which spends nothing and is reviewed by the review window that carries it. What still asks first is whatever spends something outside the queue: opening a pull request, a paid service, or a destructive change to shared infrastructure.

## Key files

| File                                         | Role                                                                 |
| -------------------------------------------- | -------------------------------------------------------------------- |
| `.agents/skills/product-review/SKILL.md`     | the product review: gaps into proposals, deferred and rejected pages |
| `.agents/skills/building-proposals/SKILL.md` | the build: choosing, verifying, building and shipping a proposal     |
| `.agents/skills/finishing/SKILL.md`          | the audit every change passes before it is done                      |
| `.agents/skills/code-review/SKILL.md`        | the two review lanes, the stop rule and the meta pass                |
| `.agents/skills/sweeps/SKILL.md`             | sweeps, ledgers and handing a repeated finding to an enforcer        |
| `.agents/skills/review-queue/SKILL.md`       | the session's side of the review queue                               |
| `.agents/skills/resuming/SKILL.md`           | a session's leftovers brought back in sync before new work           |
| `.agents/skills/skill-authoring/SKILL.md`    | where a lesson goes, and how a skill is kept                         |
| `scripts/src/proposals/report/index.ts`      | sizes every open proposal and lists the areas owed a pass            |
| `scripts/src/sweeps/ledgerCoverage/index.ts` | dates every ledger row from commit trailers                          |
| `scripts/src/triage/index.ts`                | labels an issue with its triage role                                 |
