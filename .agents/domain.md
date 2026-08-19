# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

This repo has **no root `CONTEXT.md` and no `docs/adr/`**, and neither should be created. The equivalent already exists as the in-app docs site at `packages/app/content/docs`, rendered by `@nuxt/content` at `/docs`. Read that instead.

## Before exploring, read these

- **`packages/app/content/docs/index.md`** — the map. Names every area and what it covers, in place of a `CONTEXT-MAP.md`.
- **`packages/app/content/docs/architecture/index.md`** and the `architecture/*.md` pages it tables — the ADRs. Each page is one cross-cutting decision, single-responsibility, describing the as-built repo-wide answer to "whenever we need X, we do it this way".
- **The relevant area's `index.md` plus its feature pages** — `esbabbler`, `platform`, `posts`, `users`, `sheet-editor`, `infra`, `virrun`, and the rest. An area's overview carries its vocabulary; a feature page carries the shipped behaviour.

Read only the pages that touch the area you're about to work in. If a page you'd expect doesn't exist, **proceed silently** — don't flag its absence and don't propose creating docs upfront.

## Location carries status

A page's folder is its status, so where you found something tells you whether it is real:

| Location            | Status                                                          |
| ------------------- | --------------------------------------------------------------- |
| `<area>/*.md`       | Shipped. Describes behaviour that exists in the code today.     |
| `architecture/*.md` | Shipped, repo-wide. A standard every area is expected to apply. |
| `proposals/`        | Designed, **not implemented**. Do not describe as existing.     |
| `<area>/deferred/`  | Not yet — carries a revisit trigger.                            |
| `<area>/rejected/`  | Won't do. The only place a "why not" rationale belongs.         |
| `<area>/roadmap.md` | Open work in that area.                                         |

Never cite a `proposals/` or `deferred/` page as evidence that something is built.

## Use the docs' vocabulary

When your output names a domain concept (an issue title, a refactor proposal, a hypothesis, a test name), use the term as the docs define it — `resource`, `dataset`, `capability`, `room`, `blade`, and so on. Don't drift to synonyms.

If the concept you need isn't in the docs yet, that's a signal — either you're inventing language the project doesn't use (reconsider), or there's a real gap worth writing up.

## Writing a decision down

Adding or editing any page under `packages/app/content/docs` is governed by the repo's own **`docs` skill** — two-field frontmatter, a Mermaid diagram where the subject is a flow, plain `.md` with GFM only, and registration in both the area `index.md` and `DocsSectionGroupsMap.ts`. `content/docs.test.ts` parse-validates every diagram, so a malformed page fails `pnpm test`. Load that skill before writing; don't hand-roll an ADR file.

## Flag conflicts

If your output contradicts an existing docs page, surface it explicitly rather than silently overriding:

> _Contradicts `/docs/architecture/no-polling` — but worth reopening because…_
