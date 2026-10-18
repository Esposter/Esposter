# OpenSpec Layout and Page Shapes

Read when creating a capability, a change, a roadmap item or a deferred or rejected idea and deciding where it goes, splitting a capability into sub-capabilities, or shipping a change.

## Layout

```text
openspec/
  config.yaml                       ← the spec-driven schema's rules per artifact
  specs/
    architecture/                   ← standards shared by several areas
      README.md                     ← index of the standards
      <capability>/spec.md          ← requirements and scenarios of record
      <capability>/design.md        ← as built: how it works, Key files, Notes
    <area>/                         ← one kebab-case folder per product area (`ls openspec/specs` for the current set)
      README.md                     ← what the area is, key concepts, its pages, the shipped log
      <capability>/{spec,design}.md ← one folder per implemented feature
      <capability>/<sub>/           ← sub-capabilities, once they exist, with a README.md as their index
  changes/
    <area>-<slug>/                  ← a designed, unbuilt change: proposal.md, design.md, tasks.md,
                                       specs/<area>/<capability>/spec.md, .openspec.yaml
    <area>-<name>-program/          ← the umbrella over the changes sharing its prefix
    <area>-roadmap/                 ← open work: proposal.md and tasks.md, no spec delta
    archive/                        ← shipped changes, history only
  deferred/<area>/<idea>/           ← proposal.md (what it was) and design.md (why deferred, revisit when)
  rejected/<area>/<idea>/           ← proposal.md (what it was) and design.md (why not)
```

A cross-area refactor plan is a change named `refactors-<slug>`: it is no area, so it has no roadmap, no deferred or rejected folder and no product-review pass. A mechanical sweep is not one: it designs no behaviour and lives in `.agents/ledgers/` (`sweeps` skill).

## Design template

```markdown
# <Feature Name>

One-sentence description and value.

## How it works ← prose + the mandated diagram

## Data model ← only if it owns tables/schemas

## Procedures ← | Procedure | Auth | Input | Purpose | — only if it owns procedures

## Key files ← | File | Role |

## Notes ← constraints, alternatives rejected, gotchas
```

Omit any section with nothing to say. The `spec.md` beside it holds the requirements: its `## Purpose` is one sentence on what the capability is for, and each requirement is behaviour an outsider can observe, with its scenarios.

## Changes

A change's `design.md` takes the same template plus an explicit scope: what works today against what the change adds, the cheapest viable infrastructure (reuse existing Azure resources first), and failure and retry semantics when background work is involved. A design is the conversation done in advance — trim it the moment implementation teaches you better. Its `proposal.md` is the why and the what in plain terms, and its `tasks.md` the build order, each task naming how it is verified.

**A change that borrows ends with a Sources section** in its design: an algorithm, a paper, a library's technique or another product's design it takes something from, one bullet per source, linking the source and naming the part taken (`references/links-and-sources.md`). A change is executed cold later, and whoever builds it reads the original rather than a paraphrase. When it ships, its sources go with its substance into the capability's design.

**A change becomes a program when it carries genuinely separate parts** — an algorithm, the package that holds it, the integration into the app, a follow-on phase. The program's design holds the decision, the scope and the evidence; each part is its own change named with the program's prefix, self-contained. Start with one change and split when the second responsibility appears. Parts must not contradict the program: a decision revised in one is revised in the program's scope in the same edit. **A program's spec delta holds only the requirements that span its parts**: one a part owns lives in that part's delta, and one a built capability states lives there, so a program whose parts own everything carries no delta and sets `skip_specs: true`.

**A design describes files that do not exist yet, and the citation check does not know that.** Every backticked repo path is checked to exist, so a Key files table in a change lists only the **existing** files the work touches or replaces, with the role each plays after the change. Paths the change would create go in a fenced block as a tree — which reads better for a layout anyway.

**Every change carries that table, and the table is how it is sized.** `pnpm ai:proposals:report` reads its cost off the rows — a server path, a `packages/db-schema` path, an `apps/functions` or `apps/infra` path, and a package's manifest, which is a row whenever the change adds a package — so nothing about effort is written anywhere else (`building-proposals` skill). **A change that must wait on another links that change's design in its lead**, the prose before the first section ("built on [task rows](../resource-task-rows/design.md)"), which is where the report reads what blocks it; a link further down is a reference, not a prerequisite, and a change's own program is never a blocker.

## A capability gains sub-capabilities once they exist

A capability may hold sub-capabilities — `<area>/<feature>/<sub-feature>/` with a `README.md` indexing them — when the feature has cohesive sub-features, but only once they genuinely exist: a capability splits when it grows a second responsibility, never in advance, and several specs or decisions are never consolidated into one to save a folder.

## Deferred and rejected ideas

One folder per idea, its kebab-case slug named after the idea. Its `proposal.md` says what it was, and its `design.md` carries the argument:

- **`rejected/`** — what it was, **Why not**.
- **`deferred/`** — what it was, **Why deferred**, and **Revisit when:** the concrete trigger. Optionally the **Cheaper interim** already covering the need.

GitHub's folder listing is the index of either tree.

## Roadmaps

An area's roadmap is the change `<area>-roadmap`, with `skip_specs: true`. Its `tasks.md` is prioritized top-down and checkbox-driven (`- [ ]` with nested sub-steps), grouped by horizon (`## In progress`, `## Next`, `## Later`), each item linking the change that designs it.

The Genshin roadmap's `## Manual verification` list is one line an item (the question, a link to the page that holds its source, the one fact to judge it by), its detail a decision on that page; `scripts/src/workspace/manualVerification.test.ts` enforces it, since a hundred paragraph-long questions cannot be read as a batch.

## Lifecycle map

| State                     | Location                          | Action                                                                                                       |
| ------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Idea                      | `changes/<area>-roadmap/tasks.md` | Checkbox item; read `deferred/` and `rejected/` first                                                        |
| Designed                  | `changes/<area>-<slug>/`          | Write the change; the roadmap item links its design                                                          |
| Shipped                   | `specs/<area>/<capability>/`      | Archive the change, rewrite the capability's design as built, remove the roadmap item, log it in `README.md` |
| Shipped (one-time change) | `changes/archive/`                | Archive the change, remove the roadmap item, sweep references, one shipped-log line — no capability          |
| Shipped in part           | both                              | What shipped is built into the capability; the change keeps only what is unbuilt                             |
| Won't do                  | `rejected/<area>/<idea>/`         | One folder with the rationale                                                                                |
| Deferred                  | `deferred/<area>/<idea>/`         | One folder with the rationale and the revisit trigger                                                        |

**A change shipped in part leaves two pages sharing no sentence.** The change's lead points at the capability's design rather than summarizing it, and a source both cite is worded for what each page reads off it, since `scripts/src/workspace/duplicateProse.test.ts` fails on ten words the two share. A split that copies the sources list or the summary across is the one shape that test catches by the dozen.

**A one-time change** — a rename, a migration, a mechanical sweep — has no as-built feature to describe, so when it is done it is archived, its roadmap item removed and every reference swept, and no capability is written for it; the shipped-log line in the area `README.md` is the only trace. That log is **one line per program of work, not per change** — a paragraph restating a capability listed above it on the same index is the index restating its own contents, and what belongs at that level is the standing fact no single page holds (what the whole program cost, what it did not add).

## Standards vs feature pages

When a mechanism is the repo-wide answer to a class of problem ("whenever we need X, we do it this way" — publishing, datasets, the resource model), it is a **standard** and belongs under `specs/architecture/<capability>/`, self-contained. An area's capability holds only the product-specific application (which fields, which pages, which flows). If a capability starts stating rules other areas should follow, promote them to `architecture/`.
