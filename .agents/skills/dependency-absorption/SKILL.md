---
name: dependency-absorption
description: Apply when replacing a third-party package with code of our own, removing an adapter or wrapper library, auditing a package's upstream issue tracker, turning an absorbed seam into a workspace package, or replacing a package whose output is an interface a person sees. Esposter's absorption flow — survey, gate, upstream audit, build behind the call site, swap, residue sweep, verify — run as the dependency-admission page decides, with every upstream issue given an evidenced verdict and an adapter rebuilt as its own package that is measurably better than what it replaces.
---

# Dependency Absorption

How an absorption is run. Whether a package should be absorbed at all — the costs, the admission test, the stop list, the register of verdicts with its score, what an adapter is, the standard and the triage verdicts — is `openspec/specs/architecture/dependency-admission/design.md`, and nothing here restates it.

## Settled — do not re-propose

- **Keeping a small, stable utility because owning it means maintaining it.** Maintenance is an agent's compute, and an absorbed utility is built as ESM by our own tsdown with every upstream issue fixed and tested; a utility stays a dependency only for a reason the admission test names (`openspec/specs/architecture/dependency-admission/design.md`, "The admission test").
- **Parity with the replaced package as the goal.** An absorption is an upgrade, and the replaced package's surface is evidence of what its users needed, not a checklist (`openspec/specs/architecture/dependency-admission/design.md`, "The standard an absorption meets").
- **Porting a shape an engine has deprecated.** The replacement follows the engines' current surface and carries no debt the upstream package kept for its older users (`openspec/specs/architecture/dependency-admission/design.md`, "The standard an absorption meets").
- **Recording the triage in the commit body alone.** The next reader arrives from a stranded upstream link in our code or a search, not from `git log`; the verdicts live in the package's spec (`references/package-shape.md`).
- **Skipping the closed issues.** A closed issue is where a fix the replacement must keep, or a workaround our code still carries, is explained (`references/upstream-audit.md`).
- **Porting the upstream's code.** A port carries its structure, its dead branches and its per-request costs into our tree. The replacement is rewritten from the ground up against the upstream's behaviour and its audit.
- **Rewriting a maintained engine for its size or to test an architecture.** The load placement is measured and fixed first. An engine is rewritten only for a measured cost, a licence cost or an upstream defect we meet; a rewrite that would only test an architecture is a fully designed deferred page with its revisit trigger (`openspec/deferred/`).

## Rules

- **A package or a hook is absent only after the scoped name and the installed dist are read.** An unscoped name that 404s proves nothing (`unplugin-pwa` is `@unplugin-pwa/core` and `@unplugin-pwa/vite`), and a hook the docs omit may still fire (`nitro:build:public-assets` is Nitro's `vite:compile:before`): search the registry for the scope and grep the installed package for the name before telling the user it does not exist.
- **The upgrade is measured.** The design names what the absorption improves (the client's gzipped bytes, the runtime cost, the type safety, the size of the surface), the verify stage re-measures it with the absorb score's own measures, and the spec lists every deliberate difference from the replaced package with its reason.
- **The upstream audit runs before any code is written** — every issue, open and closed, read with its comments (`references/upstream-audit.md`).
- **The replacement is a rewrite from the ground up, never a port.**
  - It is designed from the surface's behaviour on the current engines, in our conventions, and sheds whatever only served the upstream's older users or its own internals, and whatever no design of ours needs.
  - It lands every in-scope defect fix, and every feature or pull request the audit judges worth having. A feature that is over-engineering or out of scope keeps its verdict and is not built.
  - Each fix and feature carries its regression test.
- **Every verdict carries its evidence**: a reproduction for a defect, a test for a feature, the named owner for out of scope, the answering link for a false positive (`references/upstream-audit.md`).
- **An in-scope defect's regression test fails against the upstream package first**, and names the issue in its title (`references/upstream-audit.md`).
- **An issue split across the adapter and a neighbour gets both verdicts** — the adapter's part fixed, the neighbour's part out of scope with our constraint written on the page owning our side.
- **An absorbed adapter is a workspace package** built to the `file-organization` skill's `references/new-package.md`, with its own spec area carrying the Upstream table — **except a component wrapper, which becomes a component of the app** with a capability page carrying it (`references/package-shape.md`).
- **The residue sweep lands in the commit that deletes the catalog entry** (`references/residue-sweep.md`).
- **A UI-bearing absorption runs a design survey before its first template is written** — an editor, a builder, a form engine or a chart. The procedure is `references/design-survey.md`, and the order of sources is the design-sources page's.

## Reference pages

- `references/upstream-audit.md` — when reading a package's tracker, or giving an issue its verdict.
- `references/residue-sweep.md` — when the last import of the absorbed package is about to go.
- `references/package-shape.md` — when creating the replacement package, its README or its docs section.
- `references/design-survey.md` — when the package replaced draws an interface a person sees, before its first template is written.
