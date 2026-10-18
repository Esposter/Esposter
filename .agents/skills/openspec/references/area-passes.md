# Working an area's specs

Read when ideating, triaging, or sweeping a whole product area's specs, and when deciding how that sweep is committed.

## One area at a time

Where fan-out is earned at all is the `llm-delegation` skill's call. **Spec ideation and triage never earn it**, for two concrete reasons:

- **Triage needs one head.** Deciding implement/deferred/rejected across an area requires holding every idea in view at once and checking each against `deferred/`+`rejected/`. Split across agents, they duplicate ideas, re-argue decided ones, and produce inconsistent buckets.
- **Conflicting writes.** Agents working one area touch the same `README.md` and roadmap `tasks.md`, so they clobber each other's edits.

So ideation, triage, and the per-area pass run in the main session, **one product area at a time, to completion**. Research and verification — grepping code to confirm what a page claims — stay in the session too (the `llm-delegation` skill, "In a session"), or a `haiku` agent's map when the area is too broad to grep. The one thing that may fan out is edits to disjoint areas that share no index or roadmap; each agent then gets the area to finish, never a slice of one.

## The per-area pass

Modularize by area, and take each area through its **full lifecycle in one sequential pass**:

1. **Refactor** — split consolidated capabilities into single-responsibility folders per the layout in `references/page-shapes.md`, fix links, promote repo-wide rules to `architecture/`.
2. **Ideate exhaustively** — enumerate every new feature that could possibly make sense for the area, not just obvious ones. How the gaps are found — against the area's reference product, with the open proposals re-verified and convergence as the stop rule — is the `product-review` skill's loop.
3. **Triage every idea** into exactly one bucket, and **every to-implement idea gets a full spec**:
   - **Implement** → write a full change `changes/<area>-<name>/` (one change per feature — modular, never a combined plan), then add a checkbox to the area's roadmap `tasks.md` linking its design. The roadmap is only the prioritized index over the changes; the changes ARE the plan. A bare checkbox with no change is an unfinished triage.
   - **Deferred** → `deferred/<area>/<idea>/` with rationale + revisit trigger.
   - **Rejected** → `rejected/<area>/<idea>/` with rationale.

Only when an area's lifecycle is complete move to the next area. Depth over breadth — that focus is the point.

Spec sessions produce **specs, not code**: the deliverable of ideation/triage is the complete set of changes. Implementation happens later in separate sessions (possibly a different model) that pick up one change, build it, then archive it into the capability's spec and design — the loop the `building-proposals` skill owns. A change must therefore be self-contained enough for a cold implementation session to execute without this conversation's context.

## Commits, not review windows

A spec sweep is never sized to a review window — the review cuts its windows at a file cap (`openspec/specs/infra/review/design.md`, step 4). Commit by area and by step (capabilities, then decided ideas), never by squeezing several topics into one file: the single-responsibility rule always wins over file count. A large deletion (retiring an old tree) is its own commit.
