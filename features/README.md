# Features

Planning and design documents for Esposter features, refactors, and roadmaps. Conventions are defined in the `feature-specs` skill — read it before adding or restructuring anything here.

---

## Structure

Each feature area is a thin index (`README.md`) over many small topic files. No version-numbered grab-bags; organize by topic.

```text
features/
  README.md
  <area>/
    README.md            ← thin index: Now · Shipped · Decisions · Reference
    roadmap.md           ← prioritized, granular, checkbox backlog (living implementation file)
    architecture.md      ← optional: key file map, data flows, DB schema (AI reference)
    specs/<name>.md      ← design spec for one cohesive feature
    out-of-scope/<name>.md ← won't-do decision (one per file)
    deferred/<name>.md     ← not-yet decision (one per file, with a revisit trigger)
    reference/<name>.md    ← completed design records worth keeping
  refactors/<name>.md    ← cross-cutting code migrations (not user-visible features)
```

### Area README sections

| Section        | Purpose                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------- |
| `## Now`       | One line naming the active feature → pointer to `roadmap.md`. **Where an agent starts.** |
| `## Shipped`   | Chronological done log, one terse line per feature → links to the detail file.           |
| `## Decisions` | Links to `out-of-scope/` and `deferred/`. Grep here before adding a roadmap item.        |
| `## Reference` | Links to `architecture.md`, `roadmap.md`, `reference/`, `specs/`, relevant skills.       |

The granular, prioritized, checkbox backlog lives in each area's **`roadmap.md`** — that is the file to update while implementing. The README only logs what shipped.

### Principles

- Every line earns its place; if it repeats another file, delete it and link instead.
- Prefer more small topic files over fewer large ones. Completed docs are not frozen — merge/trim freely.
- A dropped/deferred idea is recorded once in the decision registry; roadmaps link, never re-argue.

---

## Feature Areas

| Area                                            | Now                                                 | Description                                                    |
| ----------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------- |
| [`esbabbler/`](esbabbler/README.md)             | Scheduled-jobs UI → [roadmap](esbabbler/roadmap.md) | Messaging, calls, rooms, moderation, DMs                       |
| [`fileTableEditor/`](fileTableEditor/README.md) | — (mature)                                          | CSV/JSON/XLSX table editor with computed columns               |
| [`infra/`](infra/README.md)                     | — (migration complete)                              | Azure Pulumi infrastructure, cost, security, naming            |
| [`virrun/`](virrun/README.md)                   | Phase 0 design → [roadmap](virrun/roadmap.md)       | In-memory virtual runner: run any repo's real toolchain in RAM |
| [`vue-phaserjs/`](vue-phaserjs/README.md)       | — (mature)                                          | Phaser game engine Vue integration                             |
| [`refactors/`](#refactors)                      | null-removal (planned)                              | Cross-cutting code migrations                                  |

---

## Refactors

Cross-cutting technical migrations, not user-visible features. One doc per migration:

- [`refactors/null-removal.md`](refactors/null-removal.md) — eliminate `null` in favour of `undefined` (planned, phased; Drizzle/Azure boundaries carved out).
- [`refactors/comment-cleanup.md`](refactors/comment-cleanup.md) — repo-wide comment-style sweep ledger (resume-where-left-off by sweep date).

---

## Cross-Cutting Architecture

Design decisions spanning multiple feature areas live in [`/architecture/`](../architecture/) at the repo root, not in any single area's `architecture.md`.

| File                | What it covers                                                                                           |
| ------------------- | -------------------------------------------------------------------------------------------------------- |
| `azure-services.md` | All Azure services (Blob, Table, Functions, EventGrid, WebPubSub, LiveKit) and the real-time layer model |
| `file-uploads.md`   | Two-step SAS pattern, all upload procedures, why `octetInputParser` was removed                          |
