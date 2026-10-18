---
name: openspec
description: Apply when creating, updating or referencing any spec, design, proposal, roadmap, or deferred or rejected idea under openspec/, when creating, validating or archiving an OpenSpec change, or when a scenario fails its check. Esposter's spec of record — where a folder lives says whether it is built, one capability or idea per folder, specs moving with the code, a Mermaid diagram for any flow, plain GFM .md, magnitudes in place of anything the repo can count. The team's /opsx commands and stage map are the team kit's openspec skill, linked here rather than copied.
---

# OpenSpec in Esposter

`openspec/` is the one place a feature is described: what is built, what is designed and waiting, and what was deferred or rejected. GitHub renders it, diagrams included, so there is no docs site and no parallel tree anywhere else in the repo. The team's commands (`/opsx:*`) and stage map come from the team kit's `openspec` skill, installed on every machine, which owns them. This skill holds only what is specific to this repository. Anything explanatory goes here rather than into `.agents/`, which holds only what a machine consumes (`openspec/specs/architecture/agent-configuration/design.md`).

## Settled — do not re-propose

- **An in-app docs site.** The specs are read on GitHub, which draws their diagrams. A site rendering the same tree is a second build of the same text, and a second copy that can disagree with the specs.
- **A folder of changes per product.** The CLI reads `openspec/changes/` flat and refuses a nested change, so a change carries its area as its id's prefix (`<area>-<slug>`) and in `affected_areas`. The specs, deferred and rejected trees are per-area folders already.
- **Pinning the CLI to the version the team kit's setup checks.** The catalog takes the newest release, as for every dependency (the `dependency-updates` skill); the kit's check is the kit's to bump.
- **Exact counts of the tree, on the reading that adding a package or a workflow is a deliberate act.** Nobody treats that act as a prose edit, so the count goes stale like any other measurement (`references/repo-owned-facts.md`).

## The one status rule

**Where a folder lives states whether it is built.** Never mix built and unbuilt in one folder.

- `openspec/specs/<area>/<capability>/` describes **only what exists in code today**: `spec.md`, the requirements and scenarios of record, and `design.md`, how it works. If you cannot point at the file that implements a sentence, the sentence does not belong here. The area's `README.md` is its index.
- `openspec/changes/<area>-<slug>/` is designed and **not yet built**: `proposal.md`, `design.md`, `tasks.md` and a spec delta under `specs/<area>/<capability>/`. A program (`<area>-<name>-program/`) is the umbrella over the changes sharing its prefix.
- `openspec/changes/<area>-roadmap/` is the area's **open work**, its `tasks.md` a checkbox backlog. Check `deferred/` and `rejected/` before adding an item or a change — never re-argue a decided idea.
- `openspec/deferred/<area>/<idea>/` holds ideas chosen **not to build yet**, each with a revisit trigger; `openspec/rejected/<area>/<idea>/` holds ideas decided **against**. The CLI does not read either tree, so a deferred idea revived is moved into `changes/`.
- `openspec/changes/archive/` holds shipped changes. It is history: nothing rewrites it, and the prose checks skip it.

**Specs move with the code that changes them** — update the owning `design.md` and `spec.md` in the same change that ships the behaviour, and cover the full lifecycle it describes (creation _and_ cleanup or teardown), not just the happy path.

## Process

1. Start a change: `pnpm exec openspec new change <area>-<slug> --description "<one sentence>"`, then write the four artifacts and the metadata (`references/change-metadata.md`).
2. Validate: `pnpm exec openspec validate <id> --strict --no-interactive`.
3. Check the scenarios: `pnpm -C scripts exec vitest run src/services/openspec`. Every scenario reads as an optional GIVEN, one WHEN and one THEN, with AND after any of them.
4. Each task names the test it writes first, and each scenario is that test's name in the suite it lands in.
5. Once it ships: `pnpm exec openspec archive <id> --yes`. The archive merges the deltas into `openspec/specs/`, and the capability's `design.md` is rewritten as built in the same change (`references/page-shapes.md`, "Lifecycle map").

## Rules

- A requirement describes behaviour an outsider can observe. File paths, class names and library choices belong in `design.md`.
- A decision in `design.md` names the alternative it rejected and the reason it lost. A decision that overturns a settled one names the old direction as rejected, so it cannot quietly return.
- **One capability, change or idea per folder — never merged.** A feature starts as one capability and gains sub-capabilities only once they exist (`references/page-shapes.md`). A folder is removed only when its idea is superseded, never to tidy up — the supersession is recorded in `deferred/` or `rejected/`. Folder names are kebab-case.
- **A list of N peer features is N capabilities plus a derived index, never one page.** The character kits are one capability each under `specs/genshin/kits/`, with the framework and the table in its `README.md`.

## Format

- **Plain GFM in a `.md` file**, no frontmatter (`references/markdown-format.md`). A change's metadata is its `.openspec.yaml` (`references/change-metadata.md`).
- **Mechanical follow-through.** A backticked path or code name is a claim the tree holds it, checked by the workspace tests; a moved file, a renamed name and an added page each owe a step (`references/moves-and-renames.md`).
- **A revision re-reads the page's own summary** — the lead and the consequences, against what the body now says (`references/revisions.md`).
- **Tests enforce the structure** — links, diagram labels, cited paths, the change's model and the Manual verification shape fail `pnpm test` in `scripts` (`references/spec-tests.md`).

## Writing style

Write for a new engineer reading on GitHub, not for an agent grepping a repo:

- Prose first. Complete sentences; spell out a term on first use. Tables only for short enumerable facts (procedures, key files).
- **Magnitudes, not measurements** — a number that moves with routine work is written as its magnitude, never today's reading (`references/repo-owned-facts.md`).
- **Every line earns its place** — link a page that already says it, by a relative path with prose as the link text (`references/links-and-sources.md`).
- **A decision taken from outside the repo cites where it came from** in the design's `## Sources`, read before cited (`references/links-and-sources.md`).
- **Never write down what the repo can count**, and **never restate a version a manifest declares, or a value a constant owns — name where it lives** (`references/repo-owned-facts.md`).
- Self-contained over link-chained: a page must be understandable without following links; links add depth, never required context.
- **A `## Notes` bullet says what no section above does** — a consequence, an exception, a trade it names the cost of; never a restatement, and never an unfixed defect, which is fixed or becomes a roadmap item (`references/notes-and-stale-prose.md`).
- Keep the **Key files** table in every design — path and one-line role. It is the bridge from the spec to the code, and how a change is sized.
- **No deprecated or stale content, ever.** When something is superseded, delete it and fix every reference in the same change — no deprecation stubs, no "moved to X" notices. Why-not rationale lives only in `deferred/` and `rejected/`.
- **Invert a tombstone, don't just delete it.** A stale passage is usually a live rule stated as the history of what it replaced; keep the reasoning, drop the past tense and the dead identifier (`references/notes-and-stale-prose.md`).

## Diagram mandate

**A design describing an interaction between three or more parts carries a Mermaid diagram, and the diagram carries a mechanism** — an order, a gate or a fan-out, never a catalog or a straight line drawn as boxes (`references/diagrams.md`).

## Standards vs feature pages

A repo-wide answer to a class of problem is a standard under `specs/architecture/`; an area's capability holds only its product's application (`references/page-shapes.md`).

## Deep Dives

- `references/page-shapes.md` — when creating a capability, a change, a roadmap item or a deferred or rejected idea and placing it in the tree: the layout, the design and proposal shapes, and the lifecycle map.
- `references/change-metadata.md` — when writing a change's `.openspec.yaml`: the model that wrote it and the fleet's fields.
- `references/area-passes.md` — when ideating, triaging, or sweeping a whole product area's specs, and when deciding how that sweep is committed.
- `references/diagrams.md` — when adding a diagram, judging whether a page owes one, or sweeping an area's diagrams.
- `references/moves-and-renames.md` — after moving a file, renaming a cited name, or adding a page: the sync command, the citation tests, and when a name is quoted rather than backticked.
- `references/notes-and-stale-prose.md` — when writing a `## Notes` bullet, or removing a passage describing what the repo no longer has.
- `references/markdown-format.md` — when writing a page's markdown: plain GFM, no frontmatter, and fence languages.
- `references/revisions.md` — after changing a decision in the middle of a page.
- `references/spec-tests.md` — when a spec test fails, or before adding a link, a path or a diagram.
- `references/repo-owned-facts.md` — when a page states a number, a count, a directory's contents, a version or a constant's value.
- `references/links-and-sources.md` — when linking another page, or citing where an outside decision came from.
