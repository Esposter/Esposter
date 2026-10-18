# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

This repo has **no root context file and no ADR folder**, and neither should be created. The equivalent already exists as the OpenSpec tree at `openspec/`, which GitHub renders. Read that instead.

## Before exploring, read these

- **`openspec/specs/`** — the map. One folder per area, each with a `README.md` naming what it covers, in place of a `CONTEXT-MAP.md`.
- **`openspec/specs/architecture/README.md`** and the capabilities it tables — the ADRs. Each is one cross-cutting decision, single-responsibility, describing, as built, how the whole repo answers one recurring need.
- **The relevant area's `README.md` plus its capabilities** — `esbabbler`, `resource`, `post`, `user`, `infra`, and the rest. An area's index carries its vocabulary; a capability's `spec.md` carries the shipped behaviour and its `design.md` how it is built.

Read only the pages that touch the area you're about to work in. If a page you'd expect doesn't exist, **proceed silently** — don't flag its absence and don't propose creating docs upfront.

## Location carries status

A folder's place is its status, so where you found something tells you whether it is real:

| Location                           | Status                                                          |
| ---------------------------------- | --------------------------------------------------------------- |
| `openspec/specs/<area>/`           | Shipped. Describes behaviour that exists in the code today.     |
| `openspec/specs/architecture/`     | Shipped, repo-wide. A standard every area is expected to apply. |
| `openspec/changes/<area>-<slug>/`  | Designed, **not implemented**. Do not describe as existing.     |
| `openspec/changes/<area>-roadmap/` | Open work in that area.                                         |
| `openspec/changes/archive/`        | Shipped changes — history, not the current behaviour.           |
| `openspec/deferred/<area>/`        | Not yet — carries a revisit trigger.                            |
| `openspec/rejected/<area>/`        | Won't do. The only place a "why not" rationale belongs.         |

Never cite an open change or a deferred idea as evidence that something is built.

## Use the specs' vocabulary

When your output names a domain concept (an issue title, a refactor proposal, a hypothesis, a test name), use the term as the specs define it — `resource`, `dataset`, `capability`, `room`, `blade`, and so on. Don't drift to synonyms.

If the concept you need isn't in the specs yet, that's a signal — either you're inventing language the project doesn't use (reconsider), or there's a real gap worth writing up.

## Writing a decision down

Adding or editing anything under `openspec/` is governed by the repo's own **`openspec` skill** — where a folder lives says whether it is built, one capability or idea per folder, a Mermaid diagram where the subject is a flow, plain GFM `.md`. The workspace tests in `scripts/src/workspace` check its links, diagram labels and citations and run `openspec validate --all --strict`, so a malformed page fails `pnpm test`. Load that skill before writing; don't hand-roll an ADR file.

## Flag conflicts

If your output contradicts an existing spec, surface it explicitly rather than silently overriding:

> _Contradicts `openspec/specs/architecture/no-polling/design.md` — but worth reopening because…_
