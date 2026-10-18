---
name: dependency-absorption
description: Apply when replacing a third-party package with code of our own, removing an adapter or wrapper library, auditing a package's upstream issue tracker, or turning an absorbed seam into a workspace package. Esposter's absorption flow — survey, gate, upstream audit, build behind the call site, swap, residue sweep, verify — run as the dependency-admission page decides, with every upstream issue given an evidenced verdict and an adapter rebuilt as its own package at parity or better.
---

# Dependency Absorption

How an absorption is run. Whether a package should be absorbed at all — the three costs, the admission test, the stop list, the register of verdicts with its score, what an adapter is, the standard and the triage verdicts — is `openspec/specs/architecture/dependency-admission/design.md`, and nothing here restates it.

## Settled — do not re-propose

- **Keeping a small, stable utility because owning it means maintaining it.** Maintenance is an agent's compute, and an absorbed utility is built as ESM by our own tsdown with every upstream issue fixed and tested; a utility stays a dependency only for a reason the admission test names (`openspec/specs/architecture/dependency-admission/design.md`, "The admission test").
- **A parity gap left because our app does not call that half.** An adapter is absorbed as a package of its own, and a package missing the surface it replaced is a fork with gaps (`openspec/specs/architecture/dependency-admission/design.md`, "The standard an absorption meets").
- **Porting a shape an engine has deprecated, for parity.** Parity is with the engines' current surface, and the replacement carries no debt the upstream package kept for its older users (`openspec/specs/architecture/dependency-admission/design.md`, "The standard an absorption meets").
- **Recording the triage in the commit body alone.** The next reader arrives from a stranded upstream link in our code or a search, not from `git log`; the verdicts live in the package's spec (`references/package-shape.md`).
- **Skipping the closed issues.** A closed issue is where a fix the replacement must keep, or a workaround our code still carries, is explained (`references/upstream-audit.md`).
- **Porting the upstream's code.** A port carries its structure, its dead branches and its per-request costs into our tree. The replacement is rewritten from the ground up against the upstream's behaviour and its audit.

## Rules

- **The upstream audit runs before any code is written** — every issue, open and closed, read with its comments (`references/upstream-audit.md`).
- **The replacement is a rewrite from the ground up, never a port.**
  - It is designed from the surface's behaviour on the current engines, in our conventions, and sheds whatever only served the upstream's older users or its own internals.
  - It lands every in-scope defect fix, and every feature or pull request the audit judges worth having. A feature that is over-engineering or out of scope keeps its verdict and is not built.
  - Each fix and feature carries its regression test.
- **Every verdict carries its evidence**: a reproduction for a defect, a test for a feature, the named owner for out of scope, the answering link for a false positive (`references/upstream-audit.md`).
- **An in-scope defect's regression test fails against the upstream package first**, and names the issue in its title (`references/upstream-audit.md`).
- **An issue split across the adapter and a neighbour gets both verdicts** — the adapter's part fixed, the neighbour's part out of scope with our constraint written on the page owning our side.
- **An absorbed adapter is a workspace package** built to the `file-organization` skill's `references/new-package.md`, with its own docs section carrying the Upstream table (`references/package-shape.md`).
- **The residue sweep lands in the commit that deletes the catalog entry** (`references/residue-sweep.md`).

## Reference pages

- `references/upstream-audit.md` — when reading a package's tracker, or giving an issue its verdict.
- `references/residue-sweep.md` — when the last import of the absorbed package is about to go.
- `references/package-shape.md` — when creating the replacement package, its README or its docs section.
