---
name: docs
description: Apply when creating, updating, or referencing any documentation page, proposal, roadmap, or deferred/rejected idea. Esposter documentation conventions for apps/web/content/docs, the in-app /docs section rendered by @nuxt/content — location carries status, one feature or idea per file, the two-field frontmatter and the model a proposal adds, the Mermaid diagram mandate, plain GFM .md registered in the area index.md and DocsSectionGroupsMap.ts, prose that states magnitudes and never restates what the repo can count, docs moving with the code, and repo-wide standards in architecture/.
---

# Docs — Esposter Conventions

All documentation lives in `apps/web/content/docs/` and is rendered in the app at `/docs` by @nuxt/content. That tree is the single source of truth, kept updated as code changes — never start a parallel docs tree elsewhere in the repo. (Within it, `architecture/` is a real and mandated folder.)

**Docs are public.** They ship with the app and are readable on the deployed site, which is the point: a page nobody can open is a page nobody reads. So anything explanatory goes here rather than into `.agents/`, which holds only what a machine consumes — the boundary is settled in `apps/web/content/docs/architecture/agent-configuration.md`.

## The one status rule

**Where a page lives states whether it is built.** Never mix built and unbuilt in one page.

- `docs/<area>/` and `docs/architecture/` describe **only what exists in code today**. If you can't point at the file that implements a sentence, the sentence doesn't belong here.
- `docs/proposals/<area>/` holds designs **not yet implemented**. When one ships, rewrite it as an area feature page (present tense, as-built) and delete the proposal. **Exception — one-time changes** (renames, migrations, mechanical sweeps): these have no as-built feature to describe, so when done just delete the proposal and its roadmap item and sweep every reference — never convert them into a docs page; the shipped log line in the area `index.md` is the only trace. That log is **one line per program of work, not per change** — a paragraph restating a feature page listed above it on the same index is the index restating its own contents, and what belongs at that level is the standing fact no single page holds (what the whole program cost, what it did not add).
- `docs/<area>/deferred/` holds ideas we chose **not to build yet** (one page per idea, each with a revisit trigger); `docs/<area>/rejected/` holds ideas we decided **against** (one page per idea). Folder names are deliberately direct — never a vague umbrella like `decisions/` or `misc/`.
- `docs/<area>/roadmap.md` holds **open work** (checkbox backlog). Check `deferred/` and `rejected/` before adding a roadmap item or proposal — never re-argue a decided idea.

**Docs move with the code that changes them** — update the owning page in the same change that ships the behaviour, and cover the full lifecycle it describes (creation _and_ cleanup/teardown), not just the happy path.

## Single responsibility — one file per feature/idea

Doc files are like Vue SFCs: **one feature, proposal, or decision per file — never merge them.** Do not consolidate multiple specs into one page or multiple decisions into one file; modularity beats file count. A page may have sub-pages (nested folder with `index.md`) when a feature has cohesive sub-features (`<area>/<feature>/<sub-feature>.md`) — but only once the sub-features genuinely exist; a feature starts as one flat `<feature>.md`. Never delete or merge a doc file "to tidy up" — split when a page grows two responsibilities, and only remove a file when the idea itself is superseded (record that in a `deferred/`/`rejected/` page).

Area folders and file names are kebab-case (they become URL slugs). One topic per file; no version grab-bags.

## Format and registration

- **Plain GFM in a `.md` file** — never `.mdx`, no MDC block components, and a fence language registered in `configuration/content.ts` in the change that first uses it (`references/markdown-format.md`).
- **Mechanical follow-through.** A backticked path or code name is a claim the tree holds it, checked by `pnpm test`; a moved file, a renamed name and an added page each owe a step: `references/moves-and-renames.md`.
- **A revision re-reads the page's own summary** — the `description`, the lead and the consequences, against what the body now says (`references/revisions.md`).
- **Tests enforce the structure** — links, index coverage, diagrams, Key Files paths, proposal models and the section maps fail `pnpm test`; what they check and the three traps are `references/docs-tests.md`.

## Frontmatter

Exactly `title` and `description`, plus `model` on a proposal — no status or date fields (`references/page-frontmatter.md`).

## Writing style

Write for a new engineer reading in the browser, not for an agent grepping a repo:

- Prose first. Complete sentences; spell out a term on first use (blade, capability, reverse-ticked rowKey…). Tables only for short enumerable facts (procedures, key files).
- **Magnitudes, not measurements** — a number that moves with routine work is written as its magnitude, never today's reading (`references/repo-owned-facts.md`).
- **Every line earns its place** — link a page that already says it, by an absolute route with prose as the link text (`references/links-and-sources.md`).
- **A decision taken from outside the repo cites where it came from** in the page's `## Sources`, read before cited (`references/links-and-sources.md`).
- **Never write down what the repo can count** — record the convention that generates the fact; a hand list earns its rows only by carrying what the tree cannot (`references/repo-owned-facts.md`).
- **Never restate a version a manifest declares, or a value a constant owns — name where it lives** (`references/repo-owned-facts.md`).
- Self-contained over link-chained: a page must be understandable without following links; links add depth, never required context.
- **A `## Notes` bullet says what no section above does** — a consequence, an exception, a trade it names the cost of; never a restatement, and never an unfixed defect, which is fixed or becomes a roadmap item. Writing one: `references/notes-and-stale-prose.md`.
- Keep the **Key Files** table on feature pages — path + one-line role. It's the bridge from docs to code.
- Nothing is frozen: trim, rename, and split freely as understanding improves — but never merge files (see single-responsibility rule).
- **No deprecated or stale content, ever.** When something is superseded, delete it and fix every reference in the same change — no deprecation stubs, no "moved to X" notices. Why-not rationale lives only in `deferred/`/`rejected/` pages, and only when genuinely needed.
- **Invert a tombstone, don't just delete it.** A stale passage is usually a live rule stated as the history of what it replaced; keep the reasoning, drop the past tense and the dead identifier. Removing one: `references/notes-and-stale-prose.md`.

## Diagram mandate

Any page describing a flow, lifecycle, or interaction between **3+ parts** (components, procedures, storage,
background workers) carries a Mermaid diagram, and a diagram carries a **mechanism** — an order, a gate, or a
fan-out. The two halves fail in opposite directions and both are findings: a page that owes one and has none, and
a page whose diagram is a catalog, an inventory or a straight line drawn as boxes. Which pages are exempt, what a
node label may hold, and the two gotchas that parse cleanly and render wrong: `references/diagrams.md`.

## Standards vs feature pages

A repo-wide answer to a class of problem is a standard in `docs/architecture/`; an area page holds only its product's application (`references/page-shapes.md`).

## Deep Dives

- `references/page-shapes.md` — when creating a page and placing it in the tree: the directory layout, sidebar grouping, the feature-page and proposal templates, deferred/rejected and roadmap page bodies, and the lifecycle map.
- `references/area-passes.md` — when ideating, triaging, or sweeping a whole product area's docs, and when deciding how that sweep is committed.
- `references/diagrams.md` — when adding a diagram, judging whether a page owes one, or sweeping an area's diagrams.
- `references/moves-and-renames.md` — after moving a file, renaming a cited name, or adding a page: the sync command, the citation tests, and when a name is quoted rather than backticked.
- `references/notes-and-stale-prose.md` — when writing a `## Notes` bullet, or removing a passage describing what the repo no longer has.
- `references/markdown-format.md` — when writing a page's markdown: `.md` over `.mdx`, no MDC blocks, and fence languages.
- `references/revisions.md` — after changing a decision in the middle of a page.
- `references/docs-tests.md` — when a docs test fails, or before adding a link, a path or a top-level section.
- `references/page-frontmatter.md` — when writing a page's or a proposal's frontmatter.
- `references/repo-owned-facts.md` — when a page states a number, a count, a directory's contents, a version or a constant's value.
- `references/links-and-sources.md` — when linking another page, or citing where an outside decision came from.
