---
name: readme-standards
description: Apply when creating or updating any README.md in this monorepo, including the root one. Esposter's README conventions for packages and the root.
---

# README Standards — Esposter

## Settled — do not re-propose

- **Making a README diagram interactive with markup.** GitHub sanitises rendered markdown — `<script>`, `<iframe>`, `<object>`/`<embed>` and inline `<svg>` are stripped, and an svg behind an `<img>` renders isolated, so its own scripts and anchors are dead. Pan/zoom in a README is therefore never a markup question: it exists only for the formats GitHub renders itself, which is why a repo whose diagram zooms has a `mermaid` fence — GitHub draws those in an iframe and supplies the pan/zoom widget. The most an image can offer is a link to a larger rendering, which the workspace graph already does.
- **A second copy of the workspace graph — a `<picture>` dark variant, a hosted copy under `apps/web/public/`, anything paired with the committed svg.** One artifact is the design, not an omission: `bgcolor="transparent"` plus a palette whose every fill, border and neutral was measured against both a white and a near-black page (`scripts/src/services/dependencyGraph/constants.ts`, `PackageRoleColorsMap.ts`) is what makes the single file correct in either colour scheme.
- **Dropping the `<a name>` wrapper so a heading has one anchor.** Every heading here answers to two: the explicit `name` the ToC links (`#local-development`), and the id GitHub derives from the rendered text, which strips the emoji without trimming the space it left behind and so carries a leading hyphen (`#-local-development`) — that second one is what the hover permalink copies, so a link pasted from the UI and a link from the ToC differ. Both resolve, and the split is the price of the emoji rather than a fault in the template. Removing the wrapper would move every ToC link onto the hyphenated slug, which is an artifact of one renderer's slugger and not a name anything declares — where the explicit `name` says what it is and reads the same in every renderer that honours it. Dropping the emoji instead buys the clean slug by deleting the thing the heading template exists for. It stays as it is.
- **Re-emitting the workspace graph as a mermaid fence** to collect GitHub's pan/zoom. It costs the `dot` layout and with it the runtime-edge weighting that ranks the picture by what the repo ships, the `box3d` fold, its shadow pass and the two-stop fills. The zoom is worth less than the picture it degrades.
- **Documentation and Related Documentation sections.** A README links its specs from one line under the description and names no technology. The technology links are the root README's stack tables, and the how lives in the specs. The "level up" section and the per-package related list are gone, and neither comes back.
- **Badge colours from anywhere but shields.io's named colours.** A badge takes `brightgreen` or `blue` (`references/template.md`), never a hex value.

## Template

Anchor-plus-emoji headings, a `---` after the table of contents, and the skeleton in `references/template.md`. A section a package does not need is left out rather than left empty.

## Badge Rules

A published package carries all four badges, a private one the licence badge alone, both in shields.io's named colours (`references/template.md`).

## Which packages, and which are published

Every package carries a `README.md` at its own root. Whether it is published is `private` in its `package.json`, and its npm name is that manifest's `name` — both read from the source rather than from a list here, which would rot the first time a package is added. `AGENTS.md` carries the inventory with a description per package, the one thing the tree cannot answer.

Two lists exist on purpose and are edited together: `AGENTS.md` pairs each path with its npm name for an agent resolving an import, and the root README's package table pairs each path with a repository link and a published mark for a reader arriving from npm or GitHub. Neither is the other's copy — but adding, removing or renaming a package changes both, and `scripts/src/workspace/packageInventories.test.ts` fails on a workspace member either one leaves out.

## Content Rules

Lead with what it does; one design-notes line linking the specs; Getting Started only where it is installed or run; Key Exports for what a reader calls; Commands only for an app, a plugin or a tool a person runs; `blob/main` and `tree/main` URLs (`references/content-rules.md`).

Package READMEs carry no experimental notice: the root README states it once (`openspec/specs/architecture/monorepo-tooling/design.md`, Stability).

## Reference pages

- `references/template.md` — when writing a README's skeleton or its badges.
- `references/content-rules.md` — when writing a README's description, Getting Started, design-notes line, Key Exports, commands or links.
- `references/logo-sources.md` — when adding, replacing or refreshing a logo under `.github/assets/`, or when a logo's source is in question.
- `references/verifying-examples.md` — when a README's usage or Getting Started block is written or changed, or the API it calls changes.
