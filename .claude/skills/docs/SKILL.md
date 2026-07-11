---
name: docs
description: Esposter documentation conventions for packages/app/content/docs (the in-app /docs section rendered by @nuxt/content). Apply when creating, updating, or referencing any documentation page, proposal, decision, or roadmap.
---

# Docs — Esposter Conventions

All documentation lives in `packages/app/content/docs/` and is rendered in the app at `/docs` by @nuxt/content. There is no separate `features/` or `architecture/` tree — the docs section is the single source of truth, kept updated as code changes.

## The one status rule

**Where a page lives states whether it is built.** Never mix built and unbuilt in one page.

- `docs/<area>/` and `docs/architecture/` describe **only what exists in code today**. If you can't point at the file that implements a sentence, the sentence doesn't belong here.
- `docs/proposals/<area>/` holds designs **not yet implemented**. When one ships, rewrite it as an area feature page (present tense, as-built) and delete the proposal.
- `docs/<area>/decisions/` holds ideas we **rejected or deferred** — one page per idea.
- `docs/<area>/roadmap.md` holds **open work** (checkbox backlog).

## Single responsibility — one file per feature/idea

Doc files are like Vue SFCs: **one feature, proposal, or decision per file — never merge them.** Do not consolidate multiple specs into one page or multiple decisions into one file; modularity beats file count. A page may have sub-pages (nested folder with `index.md`) when a feature has cohesive sub-features (e.g. `file-table-editor/computed-columns/aggregation.md`). Never delete or merge a doc file "to tidy up" — split when a page grows two responsibilities, and only remove a file when the idea itself is superseded (record that in a decision page).

## Directory layout

```text
packages/app/content/docs/
  index.md                    ← landing: what Esposter is + map of the docs
  architecture/
    index.md                  ← index of cross-cutting topics
    <topic>.md                ← as-built system explanation shared by multiple areas
  <area>/                     ← esbabbler · platform · file-table-editor · virrun · vue-phaserjs · infra
    index.md                  ← what the area is, key concepts, terse chronological shipped log
    <feature>.md              ← one page per implemented feature (or <feature>/ folder with index.md + sub-feature pages)
    decisions/
      index.md                ← one-line list of every decision page
      <idea>.md               ← one rejected/deferred idea per page
    roadmap.md                ← open work only (omit for mature areas with none)
  proposals/
    <area>/<name>.md          ← unimplemented design spec
```

Area folders and file names: kebab-case (they become URL slugs). One topic per file; no version grab-bags.

## Frontmatter

Every page starts with exactly:

```yaml
---
title: <short page title, no area prefix — the nav shows the tree>
description: <one sentence; drives nav tooltips and search>
---
```

Nothing else unless the renderer needs it. No status/date/author fields — location carries status, git carries history.

## Writing style

Write for a new engineer reading in the browser, not for an agent grepping a repo:

- Prose first. Complete sentences; spell out a term on first use (blade, capability, reverse-ticked rowKey…). Tables only for short enumerable facts (procedures, key files).
- **Every line earns its place.** If another page already says it, link instead (`/docs/architecture/resources` — absolute route paths, no `.md` suffix, so links work in-app).
- Self-contained over link-chained: a page must be understandable without following links; links add depth, never required context.
- Keep the **Key Files** table on feature pages — path + one-line role. It's the bridge from docs to code.
- Nothing is frozen: trim, rename, and split freely as understanding improves — but never merge files (see single-responsibility rule).

## Diagram mandate

Any page describing a flow, lifecycle, or interaction between 3+ parts (components, procedures, storage, background workers) MUST carry a Mermaid diagram — `flowchart` for data/navigation flows, `stateDiagram-v2` for lifecycles, `sequenceDiagram` for request/event ordering. Prose says _why_; the diagram is the alignment artifact for _what talks to what_. Label edges with the procedure/event that drives them.

Exemptions: `index.md` pages, `decisions.md`, `roadmap.md`, and static inventories (key-file tables, component lists). Never add a diagram as decoration.

## Feature page template

```markdown
# <Feature Name>

One-sentence description and value.

## How it works ← prose + the mandated diagram

## Data model ← only if it owns tables/schemas

## Procedures ← | Procedure | Auth | Input | Purpose | — only if it owns procedures

## Key files ← | File | Role |

## Notes ← constraints, alternatives rejected, gotchas
```

Omit any section with nothing to say.

## Proposals

Same template plus an explicit scope: what works today vs what the proposal adds, cheapest viable infrastructure (reuse existing Azure resources first), and failure/retry semantics when background work is involved. A proposal is the design conversation done in advance — trim it the moment implementation teaches you better.

## Decisions (`<area>/decisions/<idea>.md`)

One page per rejected or deferred idea (kebab-case slug named after the idea), plus a `decisions/index.md` listing every page in one line each. Page body:

- **Rejected** — what it was, why not.
- **Deferred** — what it was, why not now, and **Revisit when:** the concrete trigger. Optionally the cheaper interim already covering the need.

Check this folder before adding a roadmap item or proposal — never re-argue a decided idea.

## Roadmap pages

Prioritized top-down, checkbox-driven (`- [ ]` with nested sub-steps), grouped by horizon (`## In progress`, `## Next`, `## Later`). When an item ships: add one terse line to the area `index.md` shipped log, write/refresh the feature page, delete the roadmap item.

## Lifecycle

| State    | Location                     | Action                                                                                  |
| -------- | ---------------------------- | --------------------------------------------------------------------------------------- |
| Idea     | `<area>/roadmap.md`          | Checkbox item; grep `decisions.md` first                                                |
| Designed | `proposals/<area>/<name>.md` | Write the proposal; roadmap item links to it                                            |
| Shipped  | `<area>/<feature>.md`        | Rewrite proposal as an as-built page; delete proposal + roadmap item; log in `index.md` |
| Won't do | `<area>/decisions/<idea>.md` | One page with rationale                                                                 |
| Deferred | `<area>/decisions/<idea>.md` | One page with rationale + revisit trigger                                               |

## Sequential per-area work — never parallelize

**Never fan out to parallel subagents for docs/feature work.** Parallel agents each re-read the same context cold and exhaust the token budget on reading before doing any real work. All work happens in the main session, **one product area at a time, to completion, before touching the next area**.

Modularize by area, and take each area through its **full lifecycle in one sequential pass**:

1. **Migrate** — move/rewrite that area's existing docs into `packages/app/content/docs/<area>/` per the layout above.
2. **Refactor** — split consolidated pages to single-responsibility files, fix links, promote repo-wide rules to `architecture/`.
3. **Ideate exhaustively** — enumerate every new feature that could possibly make sense for the area, not just obvious ones.
4. **Triage every idea** into exactly one bucket, and **every to-implement idea gets a full spec**:
   - **Implement** → write a full proposal page `proposals/<area>/<name>.md` (one spec per feature — modular, never a combined plan page), then add a `roadmap.md` checkbox linking to it. The roadmap is only the prioritized index over the specs; the specs ARE the plan. A bare checkbox with no spec is an unfinished triage.
   - **Deferred** → `decisions/<idea>.md` with rationale + revisit trigger
   - **Out of scope / rejected** → `decisions/<idea>.md` with rationale

Only when an area's lifecycle is complete (and the PR budget below permits) move to the next area. This focus per product is the point — depth over breadth.

Docs sessions produce **specs, not code**: the deliverable of ideation/triage is the complete proposal set. Implementation happens later in separate sessions (possibly a different model) that pick up one proposal, build it, then rewrite the proposal as an as-built feature page (the Lifecycle table below). A proposal must therefore be self-contained enough for a cold implementation session to execute without this conversation's context.

## Batch size — PR review budget

Docs work lands in PRs reviewed by CodeRabbit free tier (hard cap ~150 files). Keep every chunk of work to **~100 changed files** (`git status --porcelain -uall | wc -l`) so there is buffer for lockfiles and stragglers. Before starting a sweep, count what's already dirty; when the budget is reached, stop and hand back for compaction/PR — don't start a new area you can't finish inside the budget. Large deletions (retiring an old tree) are their own PR. Chunk by area/folder (e.g. "feature pages this PR, decision pages next"), never by squeezing multiple topics into one file — the single-responsibility rule always wins over file count.

## Standards vs feature pages

When a mechanism is the repo-wide answer to a class of problem ("whenever we need X, we do it this way" — publishing, datasets, resource model), it is a **standard** and belongs in `docs/architecture/<topic>.md`, self-contained. Area feature pages hold only the product-specific application (which fields, which pages, which flows). If a feature page starts stating rules other areas should follow, promote them to `architecture/`.
