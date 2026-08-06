---
name: docs
description: Esposter documentation conventions for packages/app/content/docs (the in-app /docs section rendered by @nuxt/content) — the Mermaid diagram mandate parse-validated by content/docs.test.ts (a syntax error fails pnpm test; no semicolons in labels), location-carries-status (area vs proposals vs deferred/rejected), plain .md with GFM only, the two-field frontmatter, feature-page template, registering pages in index.md and DocsSectionGroupsMap.ts, repo-wide standards belong in architecture/, and one-area-at-a-time working. Apply when creating, updating, or referencing any documentation page, proposal, roadmap, or deferred/rejected idea.
---

# Docs — Esposter Conventions

All documentation lives in `packages/app/content/docs/` and is rendered in the app at `/docs` by @nuxt/content. That tree is the single source of truth, kept updated as code changes — never start a parallel docs tree elsewhere in the repo. (Within it, `architecture/` is a real and mandated folder; see the layout below.)

## The one status rule

**Where a page lives states whether it is built.** Never mix built and unbuilt in one page.

- `docs/<area>/` and `docs/architecture/` describe **only what exists in code today**. If you can't point at the file that implements a sentence, the sentence doesn't belong here.
- `docs/proposals/<area>/` holds designs **not yet implemented**. When one ships, rewrite it as an area feature page (present tense, as-built) and delete the proposal. **Exception — one-time changes** (renames, migrations, mechanical sweeps): these have no as-built feature to describe, so when done just delete the proposal and its roadmap item and sweep every reference — never convert them into a docs page; the shipped log line in the area `index.md` is the only trace.
- `docs/<area>/deferred/` holds ideas we chose **not to build yet** (one page per idea, each with a revisit trigger); `docs/<area>/rejected/` holds ideas we decided **against** (one page per idea). Folder names are deliberately direct — never a vague umbrella like `decisions/` or `misc/`.
- `docs/<area>/roadmap.md` holds **open work** (checkbox backlog).

## Single responsibility — one file per feature/idea

Doc files are like Vue SFCs: **one feature, proposal, or decision per file — never merge them.** Do not consolidate multiple specs into one page or multiple decisions into one file; modularity beats file count. A page may have sub-pages (nested folder with `index.md`) when a feature has cohesive sub-features (`<area>/<feature>/<sub-feature>.md`) — but only once the sub-features genuinely exist; a feature starts as one flat `<feature>.md`. Never delete or merge a doc file "to tidy up" — split when a page grows two responsibilities, and only remove a file when the idea itself is superseded (record that in a decision page).

## Directory layout

```text
packages/app/content/docs/
  index.md                    ← landing: what Esposter is + map of the docs
  architecture/
    index.md                  ← index of cross-cutting topics
    <topic>.md                ← as-built system explanation shared by multiple areas
  <area>/                     ← one kebab-case directory per product area (`ls content/docs` for the current set)
    index.md                  ← what the area is, key concepts, terse chronological shipped log
    <feature>.md              ← one page per implemented feature (or <feature>/ folder with index.md + sub-feature pages)
    deferred/
      index.md                ← one-line list of every deferred idea
      <idea>.md               ← one not-yet idea per page, with revisit trigger
    rejected/
      index.md                ← one-line list of every rejected idea
      <idea>.md               ← one won't-do idea per page
    roadmap.md                ← open work only (omit for mature areas with none)
  proposals/
    <area>/<name>.md          ← unimplemented design spec, one folder per area
    refactors/<name>.md       ← cross-area one-time sweeps (not an area — no index/roadmap/deferred)
```

Area folders and file names: kebab-case (they become URL slugs). One topic per file; no version grab-bags.

**Sidebar grouping**: sections with many flat feature pages get logical subheader groups in the in-app left sidebar via `packages/app/app/services/docs/DocsSectionGroupsMap.ts` (section slug → group title → page slugs; declaration order is display order). When adding a feature page to a mapped section (architecture, esbabbler, platform, virrun), add its slug to the right group — unmapped slugs render ungrouped at the top. `roadmap`/`deferred`/`rejected` group automatically under a trailing "Planning" subheader; sections with few pages need no map entry (alphabetical is enough).

**Mechanical follow-through.** After a rename, grep the whole docs tree for the old term. After adding a page, register it in **both** the area `index.md` table and `DocsSectionGroupsMap.ts`.

**File format is always `.md`, never `.mdx`.** MDX is the React ecosystem's format; @nuxt/content parses MDC syntax (`::component` blocks, `{.class}` props) inside plain `.md`, and `.md` stays readable on GitHub/editors/grep. Settled — don't revisit.

**Write plain GFM markdown — no MDC syntax yet.** MDC callouts (`::note`/`::tip`/`::warning`, as the Nuxt docs use) require prose components registered in our docs renderer, which don't exist. If they land later, adopt MDC sparingly for callouts only; never for layout.

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
- **Magnitudes, not measurements.** State a number only at a granularity that is _stable_. Anything that moves with routine work — test files, stores, routers, profiling figures — is written as its magnitude ("several hundred test files", "milliseconds into whole seconds"), never as today's exact reading: the precise figure carries no decision value beyond its magnitude and is wrong by the next merge. A number that moves only by deliberate act — the package count, a configured limit, a score — may be exact, because changing it is already the kind of change someone updates the prose for. This applies to every hand-written file in the repo, not only pages under `content/docs`: `SCORE.md`, `AGENTS.md` and the READMEs rot exactly the same way.
- **Every line earns its place.** If another page already says it, link instead (`/docs/architecture/resources` — absolute route paths, no `.md` suffix, so links work in-app).
- **Never write down what the repo can count.** File counts, per-type tallies, "N packages", an exhaustive list of a directory's contents, a table whose every row is `X` → `path/X` — all restate what one `ls`/`find` answers, and all rot silently, because nothing fails when they drift. Record the **convention that generates** the fact (`src/azure/resources/<ARM type>/`) and let the reader run the command. A hand-maintained list is worth it only when every row carries something the tree cannot: a role, a purpose, a caveat — which is exactly why the Key Files table stays.
- Self-contained over link-chained: a page must be understandable without following links; links add depth, never required context.
- Keep the **Key Files** table on feature pages — path + one-line role. It's the bridge from docs to code.
- Nothing is frozen: trim, rename, and split freely as understanding improves — but never merge files (see single-responsibility rule).
- **No deprecated or stale content, ever.** When something is superseded, delete it and fix every reference in the same change — no deprecation stubs, no "moved to X" notices. Why-not rationale lives only in `deferred/`/`rejected/` pages, and only when genuinely needed.

## Diagram mandate

Any page describing a flow, lifecycle, or interaction between 3+ parts (components, procedures, storage, background workers) MUST carry a Mermaid diagram — `flowchart` for data/navigation flows, `stateDiagram-v2` for lifecycles, `sequenceDiagram` for request/event ordering. Prose says _why_; the diagram is the alignment artifact for _what talks to what_. Label edges with the procedure/event that drives them.

Exemptions: `index.md` pages, `deferred/`/`rejected/` pages, `roadmap.md`, and static inventories (key-file tables, component lists). Never add a diagram as decoration.

Every diagram is parse-validated by `packages/app/content/docs.test.ts` (`mermaid.parse` over all ` ```mermaid ` blocks), so a syntax error fails `pnpm test`. Gotcha: `;` is a mermaid statement separator even inside message/note text — never use a semicolon in labels or notes (use `—` or a comma).

## Code fences

Fence languages are bundled grammars, listed in `configuration/content.ts` (`build.markdown.highlight.langs` — that list **replaces** the module defaults). A language missing from it renders as plain text with only a dev-server warning, so add the language there in the same change that first uses it. Use the short alias — `ts`, never `typescript` — so one fence language means one spelling.

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

## Deferred + rejected pages (`<area>/deferred/<idea>.md`, `<area>/rejected/<idea>.md`)

One page per idea (kebab-case slug named after the idea); each folder carries an `index.md` listing every page in one line. Page body:

- **`rejected/`** — what it was, **Why not**.
- **`deferred/`** — what it was, **Why deferred**, and **Revisit when:** the concrete trigger. Optionally the **Cheaper interim** already covering the need.

Check both folders before adding a roadmap item or proposal — never re-argue a decided idea.

## Roadmap pages

Prioritized top-down, checkbox-driven (`- [ ]` with nested sub-steps), grouped by horizon (`## In progress`, `## Next`, `## Later`).

## Lifecycle

| State                     | Location                     | Action                                                                                   |
| ------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------- |
| Idea                      | `<area>/roadmap.md`          | Checkbox item; grep `deferred/` + `rejected/` first                                      |
| Designed                  | `proposals/<area>/<name>.md` | Write the proposal; roadmap item links to it                                             |
| Shipped                   | `<area>/<feature>.md`        | Rewrite proposal as an as-built page; delete proposal + roadmap item; log in `index.md`  |
| Shipped (one-time change) | —                            | Delete proposal + roadmap item, sweep references, one shipped-log line — no feature page |
| Won't do                  | `<area>/rejected/<idea>.md`  | One page with rationale                                                                  |
| Deferred                  | `<area>/deferred/<idea>.md`  | One page with rationale + revisit trigger                                                |

**Docs move with the code that changes them** — update the owning page in the same change that ships the behaviour, and cover the full lifecycle it describes (creation _and_ cleanup/teardown), not just the happy path.

## One area at a time

The repo-wide default is to parallelize independent work (see `~/.claude/rules/agents.md`). **Docs ideation and triage are the narrow exception**, for two concrete reasons — not as a blanket ban on subagents:

- **Triage needs one head.** Deciding implement/deferred/rejected across an area requires holding every idea in view at once and checking each against `deferred/`+`rejected/`. Split across agents, they duplicate ideas, re-argue decided ones, and produce inconsistent buckets.
- **Conflicting writes.** Agents working one area touch the same `index.md`, `roadmap.md`, and `DocsSectionGroupsMap.ts`, so they clobber each other's edits.

So: ideation, triage, and the per-area pass run in the main session, **one product area at a time, to completion**. Depth over breadth — that focus is the point.

Genuinely independent docs work **may** fan out: read-only research/verification (grepping code to confirm what a page claims), and edits to disjoint areas that share no index file. Give each agent the area to finish, never a slice of one.

Modularize by area, and take each area through its **full lifecycle in one sequential pass**:

1. **Migrate** — move/rewrite that area's existing docs into `packages/app/content/docs/<area>/` per the layout above.
2. **Refactor** — split consolidated pages to single-responsibility files, fix links, promote repo-wide rules to `architecture/`.
3. **Ideate exhaustively** — enumerate every new feature that could possibly make sense for the area, not just obvious ones.
4. **Triage every idea** into exactly one bucket, and **every to-implement idea gets a full spec**:
   - **Implement** → write a full proposal page `proposals/<area>/<name>.md` (one spec per feature — modular, never a combined plan page), then add a `roadmap.md` checkbox linking to it. The roadmap is only the prioritized index over the specs; the specs ARE the plan. A bare checkbox with no spec is an unfinished triage.
   - **Deferred** → `<area>/deferred/<idea>.md` with rationale + revisit trigger
   - **Rejected** → `<area>/rejected/<idea>.md` with rationale

Only when an area's lifecycle is complete (and the PR budget below permits) move to the next area. This focus per product is the point — depth over breadth.

Docs sessions produce **specs, not code**: the deliverable of ideation/triage is the complete proposal set. Implementation happens later in separate sessions (possibly a different model) that pick up one proposal, build it, then rewrite the proposal as an as-built feature page (the Lifecycle table below). A proposal must therefore be self-contained enough for a cold implementation session to execute without this conversation's context.

## Batch size — PR review budget

Docs sweeps hit the PR file budget fast. See the `coderabbit` skill for the budget and how to measure it.

Chunk by area/folder (e.g. "feature pages this PR, decision pages next"), never by squeezing multiple topics into one file — the single-responsibility rule always wins over file count. Don't start an area you can't finish inside the budget, and give large deletions (retiring an old tree) their own PR.

## Standards vs feature pages

When a mechanism is the repo-wide answer to a class of problem ("whenever we need X, we do it this way" — publishing, datasets, resource model), it is a **standard** and belongs in `docs/architecture/<topic>.md`, self-contained. Area feature pages hold only the product-specific application (which fields, which pages, which flows). If a feature page starts stating rules other areas should follow, promote them to `architecture/`.
