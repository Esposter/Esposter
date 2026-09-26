---
name: readme-standards
description: Apply when creating or updating any README.md in this monorepo, including the root one. Esposter README conventions — the anchor+emoji heading template, badges driven by each manifest's published-vs-private split, the typedoc module-page link and its slug read off the generated output, when Getting Started is omitted, the two package inventories edited together, and GitHub blob/tree URL rules.
---

# README Standards — Esposter

## Settled — do not re-propose

- **Making a README diagram interactive with markup.** GitHub sanitises rendered markdown — `<script>`, `<iframe>`, `<object>`/`<embed>` and inline `<svg>` are stripped, and an svg behind an `<img>` renders isolated, so its own scripts and anchors are dead. Pan/zoom in a README is therefore never a markup question: it exists only for the formats GitHub renders itself, which is why a repo whose diagram zooms has a `mermaid` fence — GitHub draws those in an iframe and supplies the pan/zoom widget. The most an image can offer is a link to a larger rendering, which the workspace graph already does.
- **A second copy of the workspace graph — a `<picture>` dark variant, a hosted copy under `apps/web/public/`, anything paired with the committed svg.** One artifact is the design, not an omission: `bgcolor="transparent"` plus a palette whose every fill, border and neutral was measured against both a white and a near-black page (`scripts/src/services/dependencyGraph/constants.ts`, `PackageRoleColorsMap.ts`) is what makes the single file correct in either colour scheme.
- **Dropping the `<a name>` wrapper so a heading has one anchor.** Every heading here answers to two: the explicit `name` the ToC links (`#local-development`), and the id GitHub derives from the rendered text, which strips the emoji without trimming the space it left behind and so carries a leading hyphen (`#-local-development`) — that second one is what the hover permalink copies, so a link pasted from the UI and a link from the ToC differ. Both resolve, and the split is the price of the emoji rather than a fault in the template. Removing the wrapper would move every ToC link onto the hyphenated slug, which is an artifact of one renderer's slugger and not a name anything declares — where the explicit `name` says what it is and reads the same in every renderer that honours it. Dropping the emoji instead buys the clean slug by deleting the thing the heading template exists for. It stays as it is.
- **Re-emitting the workspace graph as a mermaid fence** to collect GitHub's pan/zoom. It costs the `dot` layout and with it the runtime-edge weighting that ranks the picture by what the repo ships, the `box3d` fold, its shadow pass and the two-stop fills — and the root README is typedoc's index page, where a fence is a code block rather than a diagram. The zoom is worth less than the picture it degrades.

## Template

Anchor-plus-emoji headings, a `---` after the table of contents, and a skeleton copied from a sibling README (`references/template.md`).

## Badge Rules

A published package carries all four badges, a private one the licence badge alone (`references/template.md`).

## Which packages, and which are published

Every package carries a `README.md` at its own root. Whether it is published is `private` in its `package.json`, and its npm name is that manifest's `name` — both read from the source rather than from a list here, which would rot the first time a package is added. `AGENTS.md` carries the inventory with a description per package, the one thing the tree cannot answer.

Two lists exist on purpose and are edited together: `AGENTS.md` pairs each path with its npm name for an agent resolving an import, and the root README's package table pairs each path with a repository link and a published mark for a reader arriving from npm or GitHub. Neither is the other's copy — but adding, removing or renaming a package changes both, and nothing checks that it did.

## Content Rules

Lead with what it does; Getting Started only where it is installed or run; the documentation sentence linking the typedoc module page read off the generated output; the package's own scripts; `blob/main` and `tree/main` URLs, never relative (`references/content-rules.md`).

## Reference pages

- `references/template.md` — when writing a README's skeleton or its badges.
- `references/content-rules.md` — when writing a README's description, Getting Started, docs link, commands or links.
