---
name: docs
description: Esposter documentation conventions for packages/app/content/docs (the in-app /docs section rendered by @nuxt/content) — location-carries-status (area vs proposals vs deferred/rejected vs roadmap) and the one-time-change exception, single responsibility (one feature/idea per file, never merge), the two-field frontmatter, the Mermaid diagram mandate parse-validated by content/docs/index.test.ts (a syntax error fails pnpm test; no semicolons in labels), plain .md with GFM only (never .mdx, no MDC block components), fence languages registered in configuration/content.ts, registering every new page in the area index.md and, in a mapped section, DocsSectionGroupsMap.ts, the writing-style rules (prose first, magnitudes not measurements, never write down what the repo can count or restate a version a manifest declares, Key Files table, no deprecated content), docs moving with the code, and repo-wide standards belonging in architecture/ — plus deep dives on the directory layout, page templates and lifecycle, and how a per-area ideation/triage pass is run and chunked into PRs. Apply when creating, updating, or referencing any documentation page, proposal, roadmap, or deferred/rejected idea.
---

# Docs — Esposter Conventions

All documentation lives in `packages/app/content/docs/` and is rendered in the app at `/docs` by @nuxt/content. That tree is the single source of truth, kept updated as code changes — never start a parallel docs tree elsewhere in the repo. (Within it, `architecture/` is a real and mandated folder.)

**Docs are public.** They ship with the app and are readable on the deployed site, which is the point: a page nobody can open is a page nobody reads. So anything explanatory goes here rather than into `.agents/`, which holds only what a machine consumes — the boundary is settled in `/docs/architecture/agent-configuration`.

## The one status rule

**Where a page lives states whether it is built.** Never mix built and unbuilt in one page.

- `docs/<area>/` and `docs/architecture/` describe **only what exists in code today**. If you can't point at the file that implements a sentence, the sentence doesn't belong here.
- `docs/proposals/<area>/` holds designs **not yet implemented**. When one ships, rewrite it as an area feature page (present tense, as-built) and delete the proposal. **Exception — one-time changes** (renames, migrations, mechanical sweeps): these have no as-built feature to describe, so when done just delete the proposal and its roadmap item and sweep every reference — never convert them into a docs page; the shipped log line in the area `index.md` is the only trace.
- `docs/<area>/deferred/` holds ideas we chose **not to build yet** (one page per idea, each with a revisit trigger); `docs/<area>/rejected/` holds ideas we decided **against** (one page per idea). Folder names are deliberately direct — never a vague umbrella like `decisions/` or `misc/`.
- `docs/<area>/roadmap.md` holds **open work** (checkbox backlog). Check `deferred/` and `rejected/` before adding a roadmap item or proposal — never re-argue a decided idea.

**Docs move with the code that changes them** — update the owning page in the same change that ships the behaviour, and cover the full lifecycle it describes (creation _and_ cleanup/teardown), not just the happy path.

## Single responsibility — one file per feature/idea

Doc files are like Vue SFCs: **one feature, proposal, or decision per file — never merge them.** Do not consolidate multiple specs into one page or multiple decisions into one file; modularity beats file count. A page may have sub-pages (nested folder with `index.md`) when a feature has cohesive sub-features (`<area>/<feature>/<sub-feature>.md`) — but only once the sub-features genuinely exist; a feature starts as one flat `<feature>.md`. Never delete or merge a doc file "to tidy up" — split when a page grows two responsibilities, and only remove a file when the idea itself is superseded (record that in a `deferred/`/`rejected/` page).

Area folders and file names are kebab-case (they become URL slugs). One topic per file; no version grab-bags.

## Format and registration

- **File format is always `.md`, never `.mdx`.** MDX is the React ecosystem's format; @nuxt/content parses MDC syntax (`::component` blocks, `{.class}` props) inside plain `.md`, and `.md` stays readable on GitHub/editors/grep. Settled — don't revisit.
- **Write plain GFM markdown — no MDC block components.** A `::note`/`::tip`/`::warning` block (as the Nuxt docs use) needs a prose component registered in our renderer, and none is. If they land later, adopt them for callouts only, never for layout. MDC's **inline attribute** form is a different thing and does work, since @nuxt/content parses it by default — it is used for exactly one link, the TypeDoc output that has to open in a new tab, and there is no reason to reach for it elsewhere.
- **Fence languages are bundled grammars**, listed in `configuration/content.ts` (`build.markdown.highlight.langs` — that list **replaces** the module defaults). A language missing from it renders as plain text with only a dev-server warning, so add the language there in the same change that first uses it. Use the short alias — `ts`, never `typescript` — so one fence language means one spelling.
- **Mechanical follow-through.** After a rename, grep the whole docs tree for the old term. After adding a page, register it in the area `index.md` table. A **top-level feature page in a section the sidebar map already covers** also needs an entry in `packages/app/app/services/docs/DocsSectionGroupsMap.ts` — a section with few enough pages carries no map entry at all, and `roadmap`/`deferred`/`rejected` group themselves.
- **Tests enforce the structural half of that**, so a stale tree fails `pnpm test` rather than waiting on an audit. `packages/app/content/docs/index.test.ts` owns what belongs to the content tree: every `/docs/…` link resolves to a page, every index page links the pages beside it, every Mermaid diagram parses, and every repo path in a **Key Files** table exists. The sidebar map is checked beside itself, in `packages/app/app/services/docs/DocsSectionGroupsMap.test.ts` — it and the pages of a mapped section must agree in both directions. A Key Files token counts as a path when its first segment names a repo-root entry or it carries an app-relative prefix (`app/`, `shared/`, `server/`, …), and it must exist under the repo root or under `packages/app` — so the hundreds of identifier tokens in the same tables (`useQuery`, `--no-cache`) are left alone. Consequences when writing: a link to a page you are about to add fails until it exists, `app/shared/models/…` fails because shared models live at `packages/app/shared`, and an elided path (`packages/infra/.../foo.ts`) is a broken path — write it in full.

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
- **Every line earns its place.** If another page already says it, link instead (`/docs/architecture/resources` — absolute route paths, no `.md` suffix, so links work in-app). The link **text** is prose naming the page, never the route repeated (`[resources](/docs/architecture/resources)`): a route reads as punctuation mid-sentence, and the reader already sees where it goes on hover.
- **Never write down what the repo can count.** File counts, per-type tallies, "N packages", an exhaustive list of a directory's contents, a table whose every row is `X` → `path/X` — all restate what one `ls`/`find` answers, and all rot silently, because nothing fails when they drift. Record the **convention that generates** the fact (`src/azure/resources/<ARM type>/`) and let the reader run the command. A hand-maintained list is worth it only when every row carries something the tree cannot: a role, a purpose, a caveat — which is exactly why the Key Files table stays.
- **Never restate a version a manifest declares — name the field.** `engines.node`, `packageManager` and the `pnpm-workspace.yaml` catalog are where a version lives, and `update:node` rewrites them there; a copy in prose is not one of the places it rewrites, so it goes stale in silence and then tells a contributor to install the wrong runtime. Write "the version `engines.node` asks for", never the number. Enforced for node and pnpm by `packages/app/content/docs/getToolchainVersionRestatements.test.ts`, over every hand-written page in the repo. The same reasoning covers any value a constant already owns — a path segment, a limit, a threshold: state where it is declared, and if the page genuinely needs the number, say which command prints it.
- Self-contained over link-chained: a page must be understandable without following links; links add depth, never required context.
- **A trailing summary is not a note.** A `## Notes` bullet earns its place by stating something no section above does — a consequence, an exception, a pointer to a decision recorded elsewhere. A bullet that restates the page's own rule in shorter words is the page disagreeing with itself the moment either copy is edited, so it is deleted rather than kept in sync.
- Keep the **Key Files** table on feature pages — path + one-line role. It's the bridge from docs to code.
- Nothing is frozen: trim, rename, and split freely as understanding improves — but never merge files (see single-responsibility rule).
- **No deprecated or stale content, ever.** When something is superseded, delete it and fix every reference in the same change — no deprecation stubs, no "moved to X" notices. Why-not rationale lives only in `deferred/`/`rejected/` pages, and only when genuinely needed.
- **Invert a tombstone, don't just delete it.** Most stale passages are not dead weight — they are a live rule stated as the history of what it replaced ("X used to be per-call-site; it is now a flag", "the explorer replaced DocumentPicker", "v1 was mesh WebRTC"). Deleting the sentence takes the reasoning with it, which is why these survive pass after pass and get re-added. Keep the reasoning, drop the past tense and the dead identifier: state the rule in the present, with the why the history was carrying. A "Deleted routes:" list or a bare "Y was removed — do not reintroduce" has no reasoning to save and is simply deleted.

## Diagram mandate

Any page describing a flow, lifecycle, or interaction between 3+ parts (components, procedures, storage, background workers) MUST carry a Mermaid diagram — `flowchart` for data/navigation flows, `stateDiagram-v2` for lifecycles, `sequenceDiagram` for request/event ordering. Prose says _why_; the diagram is the alignment artifact for _what talks to what_. Label edges with the procedure/event that drives them.

Exemptions: `index.md` pages, `deferred/`/`rejected/` pages, `roadmap.md`, and static inventories (key-file tables, component lists). Never add a diagram as decoration.

**The exemption is about the page's shape, not its length.** A short page describing one small flow still owes a diagram; a long page that is a list of rules owes none. When auditing an area, the question to ask each page is "does the prose name three parts and say what passes between them?" — if it does, a missing diagram is a finding, however tidy the page reads. Pages that only _feel_ exempt are the ones this survey keeps rediscovering, so record the verdict per page rather than per area.

Every diagram is parse-validated by `packages/app/content/docs/index.test.ts` (`mermaid.parse` over all ` ```mermaid ` blocks), so a syntax error fails `pnpm test`. Two gotchas, both of which parse cleanly and fail only when rendered: `;` is a mermaid statement separator even inside message/note text — never use a semicolon in a label or note (use `—` or a comma) — and a label is one quoted string on one line, so a break inside it is written `<br/>` — a backslash-n draws those two characters into the box, and a real newline is swallowed and renders as one run-on line. Both of those are checked too, so they fail `pnpm test` rather than only the rendered page.

## Standards vs feature pages

When a mechanism is the repo-wide answer to a class of problem ("whenever we need X, we do it this way" — publishing, datasets, resource model), it is a **standard** and belongs in `docs/architecture/<topic>.md`, self-contained. Area feature pages hold only the product-specific application (which fields, which pages, which flows). If a feature page starts stating rules other areas should follow, promote them to `architecture/`.

## Deep Dives

- `references/page-shapes.md` — when creating a page and placing it in the tree: the directory layout, sidebar grouping, the feature-page and proposal templates, deferred/rejected and roadmap page bodies, and the lifecycle map.
- `references/area-passes.md` — when ideating, triaging, or sweeping a whole product area's docs, and when splitting that sweep into PRs.
