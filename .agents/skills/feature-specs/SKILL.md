# Feature Specs — Esposter Conventions

Apply when creating, updating, or referencing files in the `features/` directory or root `architecture/` directory.

---

## Directory Layout

```
architecture/
  README.md                ← index for global architecture decisions
  <topic>.md               ← cross-cutting architecture shared by multiple areas

features/
  <area>/
    architecture.md        ← AI reference: key files, data flows, DB tables
    <vN>.md                ← active roadmap (checkbox list, current version)
    specs/
      <feature-name>.md    ← spec for a single planned feature
    completed/
      <name>.md            ← frozen after all items shipped; never edit
  refactors/
    <name>.md              ← technical migrations, not user-visible features
```

---

## Spec File Template

```markdown
# <Area> — <Feature Name>

One-sentence description of the feature and its value.

---

## Overview

What it does and why. 2–5 sentences max.

---

## Data Model Changes

Schema additions (Drizzle table, Azure Table column, Zod schema). Only include if there are DB or model changes.

---

## Procedures / API

tRPC procedure signatures and auth requirements (table form). Only include if new procedures are needed.

| Procedure | Auth | Input | Purpose |
| --------- | ---- | ----- | ------- |

---

## Components

New or modified Vue components. Bullet list, file path + one-line role.

---

## Key Files

| File | Role |
| ---- | ---- |

---

## Constraints / Notes

Decisions made, alternatives rejected with rationale. Keep short.
```

Omit any section that has nothing to say — empty sections add noise.

---

## Roadmap File Conventions

- File name: `v<N>.md` at the area root (e.g. `esbabbler/v5.md`)
- Each item: `- [ ] **Name** — one-line description` (pending) or `- [x] **Name** — ...` (done)
- Dropped items: `- ~~**Name**~~ — reason dropped` (strikethrough + rationale)
- Group items under `##` headings by theme
- Link to detailed specs: `Spec: [\`specs/feature-name.md\`](specs/feature-name.md)`

---

## Lifecycle

| State       | Location                                    | Action                                            |
| ----------- | ------------------------------------------- | ------------------------------------------------- |
| Planning    | `specs/<name>.md`                           | Create file; write minimal spec                   |
| In progress | `specs/<name>.md`                           | Keep spec updated as design evolves               |
| Shipped     | `completed/<name>.md`                       | Move (don't copy) with clean name; no edits after |
| Abandoned   | deleted or `completed/` with rationale note | Document why in the file before archiving         |

---

## Architecture Files

### Feature-area `architecture.md`

An AI-assisted development reference for that feature only — not user docs. Include:

- Key file map (component → file path → one-line role)
- Data flows (sequence diagrams or arrow notation)
- DB schema table (key fields only; link to full schema in db-schema package)

Keep it current. Stale architecture files mislead AI assistants more than no file at all.

### Root `/architecture/` folder

Design decisions that span multiple feature areas go here instead of any single feature's `architecture.md`. Current examples are Azure services and the file upload SAS pattern. When a decision would be copy-pasted into multiple feature architecture files, extract it here instead.

---

## Naming Rules

- Feature area folders: camelCase (`fileTableEditor`, `esbabbler`, `vue-phaserjs`)
- Spec files: kebab-case (`computed-columns`, `null-removal`)
- Completed files: drop `(completed)` suffix — just `v1.md`, `clipboard.md`
- Test roadmaps: `testing.md` (not `v1 (completed).test.md`)
