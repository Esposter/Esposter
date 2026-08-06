# Working an area's docs

Read when ideating, triaging, or sweeping a whole product area's documentation, and when splitting that sweep into PRs.

## One area at a time

The repo-wide default is to parallelize independent work (see `~/.claude/rules/agents.md`). **Docs ideation and triage are the narrow exception**, for two concrete reasons — not as a blanket ban on subagents:

- **Triage needs one head.** Deciding implement/deferred/rejected across an area requires holding every idea in view at once and checking each against `deferred/`+`rejected/`. Split across agents, they duplicate ideas, re-argue decided ones, and produce inconsistent buckets.
- **Conflicting writes.** Agents working one area touch the same `index.md`, `roadmap.md`, and `DocsSectionGroupsMap.ts`, so they clobber each other's edits.

So ideation, triage, and the per-area pass run in the main session, **one product area at a time, to completion**. Genuinely independent docs work **may** fan out: read-only research/verification (grepping code to confirm what a page claims), and edits to disjoint areas that share no index file. Give each agent the area to finish, never a slice of one.

## The per-area pass

Modularize by area, and take each area through its **full lifecycle in one sequential pass**:

1. **Migrate** — move/rewrite that area's existing docs into `packages/app/content/docs/<area>/` per the layout in `page-shapes.md`.
2. **Refactor** — split consolidated pages to single-responsibility files, fix links, promote repo-wide rules to `architecture/`.
3. **Ideate exhaustively** — enumerate every new feature that could possibly make sense for the area, not just obvious ones.
4. **Triage every idea** into exactly one bucket, and **every to-implement idea gets a full spec**:
   - **Implement** → write a full proposal page `proposals/<area>/<name>.md` (one spec per feature — modular, never a combined plan page), then add a `roadmap.md` checkbox linking to it. The roadmap is only the prioritized index over the specs; the specs ARE the plan. A bare checkbox with no spec is an unfinished triage.
   - **Deferred** → `<area>/deferred/<idea>.md` with rationale + revisit trigger.
   - **Rejected** → `<area>/rejected/<idea>.md` with rationale.

Only when an area's lifecycle is complete (and the PR budget below permits) move to the next area. Depth over breadth — that focus is the point.

Docs sessions produce **specs, not code**: the deliverable of ideation/triage is the complete proposal set. Implementation happens later in separate sessions (possibly a different model) that pick up one proposal, build it, then rewrite the proposal as an as-built feature page. A proposal must therefore be self-contained enough for a cold implementation session to execute without this conversation's context.

## Batch size — PR review budget

Docs sweeps hit the PR file budget fast. See the `coderabbit` skill for the budget and how to measure it.

Chunk by area/folder (e.g. "feature pages this PR, decision pages next"), never by squeezing multiple topics into one file — the single-responsibility rule always wins over file count. Don't start an area you can't finish inside the budget, and give large deletions (retiring an old tree) their own PR.
