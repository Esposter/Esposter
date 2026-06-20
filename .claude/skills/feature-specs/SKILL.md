---
name: feature-specs
description: Feature Specs — Esposter conventions for the features/ and root architecture/ directories. Apply when creating, updating, or referencing files in features/ or root architecture/.
---

# Feature Specs — Esposter Conventions

## Core Principles

- **Every line earns its place.** If a line repeats something another file already says, delete it and link instead. Docs are deduped aggressively.
- **Organize by topic, not by version.** One file per cohesive feature/decision. Never create version grab-bags (`v1.md`, `v2.md` …) that accumulate unrelated items.
- **Prefer more small files over fewer large ones.** When something grows, split it into another topic file rather than letting one file sprawl.
- **Nothing is frozen.** Merge, trim, rename, and dedupe completed docs freely as understanding improves — they are not immutable history.
- **Decide once.** A dropped or deferred idea is recorded in the decision registry (below) exactly once, with its rationale. Roadmaps link to it; they never re-argue it.

## Directory Layout

```text
architecture/
  README.md                ← index for global architecture decisions
  <topic>.md               ← cross-cutting architecture shared by multiple areas

features/
  README.md                ← index of all areas + their current "Now"
  <area>/
    README.md              ← thin index: Now · Shipped · Decisions · Reference
    roadmap.md             ← prioritized, granular, checkbox backlog (the living implementation file)
    architecture.md        ← AI reference: key files, data flows, DB tables
    specs/<name>.md        ← design spec for one cohesive feature
    out-of-scope/<name>.md ← won't-do decision (one per file)
    deferred/<name>.md     ← not-yet decision (one per file, includes a revisit trigger)
    reference/<name>.md    ← completed design records worth keeping (migrations, refactors)
  refactors/<name>.md      ← cross-cutting code changes, not user-visible features
```

## Area `README.md` — the thin index

The area README is a map, not a content store. Detail lives in the linked files. Sections (omit any that are empty):

- `## Now` — one line naming the genuinely active feature, then a pointer to `roadmap.md`. **This is how an agent finds the focus**, but the working detail lives in `roadmap.md`, not here.
- `## Shipped` — chronological done log, one terse line per feature, linking to the spec/reference/architecture file that holds the detail. Do not paste the detail here.
- `## Decisions` — two links: `out-of-scope/` (won't do) and `deferred/` (not yet). The instruction "grep here before adding a roadmap item" lives here.
- `## Reference` — links to `architecture.md`, `roadmap.md`, `reference/`, and `specs/`.

## Roadmap File (`roadmap.md`)

The living implementation backlog — the file an agent reads and edits while building. Omit it for an area with no active or planned work (mature/complete areas).

- **Prioritized, top-down.** Top = next up. Order so early items stay local/user-visible and later items add background/cross-process work.
- **Checkbox-driven and granular.** Use `- [ ]` per feature with nested `- [ ]` sub-items for the concrete implementation steps (migration, procedure, mutation, component, edge cases). The roadmap _can and should_ hold implementation detail — unlike the thin README.
- **Group by horizon**, e.g. `## In progress`, `## Next — low-hanging fruit`, `## Later — larger or multi-area`. Favour low-hanging fruit that extends something already shipped without new infrastructure.
- **Sweep when shipped.** When a feature is fully checked off, collapse it to one line under `## Shipped` in the README and delete it from `roadmap.md`. The roadmap holds only open work.
- Grep `out-of-scope/` + `deferred/` before adding an item, so a decided idea is not re-proposed.

## Decision Registry (`out-of-scope/` + `deferred/`)

One file per decision, lean. The folder name carries the status — do not repeat it inside, and do not add version/date metadata.

- `out-of-scope/<name>.md` — a one-line description of the idea, then `## Why not`.
- `deferred/<name>.md` — the idea, `## Why deferred`, and `## Revisit when` (the concrete trigger that reopens it). Optionally `## Cheaper interim` if something already covers the need.

Before adding any roadmap item, check these folders so a previously-decided idea is not re-proposed.

## Spec File Template

```markdown
# <Area> — <Feature Name>

One-sentence description of the feature and its value.

## Overview

What it does and why. 2–5 sentences max.

## Data Model Changes

Schema additions (Drizzle table, Azure Table column, Zod schema). Only if there are DB/model changes.

## Procedures / API

tRPC procedure signatures and auth requirements (table form). Only if new procedures are needed.

| Procedure | Auth | Input | Purpose |
| --------- | ---- | ----- | ------- |

## Components

New or modified Vue components. Bullet list, file path + one-line role.

## Key Files

| File | Role |
| ---- | ---- |

## Constraints / Notes

Decisions made, alternatives rejected with rationale. Keep short.

## End-To-End Plan

Only when the feature crosses frontend, API, background work, infrastructure, or billing boundaries. Cover current support status, rollout order, cheapest viable infrastructure, reuse of existing resources, failure/retry behavior, and what remains unsupported until later phases.
```

Omit any section that has nothing to say — empty sections add noise.

Before implementing cross-cutting features, write or update the spec enough to answer:

- What works in the frontend today, and what remains local-only/hidden until backend support exists?
- Which tRPC procedures, DB rows, background workers, queues, timers, and infrastructure resources are required?
- Can existing Pulumi-managed Azure resources be reused instead of adding a new service?
- What is the cheapest viable Azure option, and what alternatives were rejected?
- What are the retry, idempotency, cancellation, and failure semantics?

## Lifecycle

| State       | Location                 | Action                                                                                                             |
| ----------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Planning    | `specs/<name>.md`        | Create the spec (if non-trivial); add a checkbox item in `roadmap.md`                                              |
| In progress | `roadmap.md`             | Move the item to `## In progress` + name it in the README `## Now`; break it into sub-tasks; keep the spec updated |
| Shipped     | `## Shipped` in README   | Collapse to one terse line linking the spec/reference; delete it from `roadmap.md`; trim the spec if outdated      |
| Won't do    | `out-of-scope/<name>.md` | One file with the rationale; link from `## Decisions`                                                              |
| Deferred    | `deferred/<name>.md`     | One file with rationale + revisit trigger; link from `## Decisions`                                                |

## Architecture Files

### Feature-area `architecture.md`

AI-assisted development reference for that feature only — not user docs. Include:

- Key file map (component → file path → one-line role)
- Data flows (sequence diagrams or arrow notation)
- DB schema table (key fields only; link to full schema in db-schema package)

Keep it current. Stale architecture files mislead AI assistants more than no file at all.

### Root `/architecture/` folder

Design decisions spanning multiple feature areas go here instead of any single feature's `architecture.md`. Current examples: Azure services and the file upload SAS pattern. When a decision would be copy-pasted into multiple feature architecture files, extract it here.

## Naming Rules

- Feature area folders: camelCase (`fileTableEditor`, `esbabbler`, `vue-phaserjs`)
- All doc files: kebab-case (`computed-columns.md`, `cross-process-event-bridge.md`)
- One topic per file; no version-numbered grab-bag files
