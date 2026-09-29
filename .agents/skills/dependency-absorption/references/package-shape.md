# Package Shape

Read when creating the replacement package, its README or its docs section. The package skeleton is the `file-organization` skill's `references/new-package.md` and the README the `readme-standards` skill's; this page is what an absorbed package adds to both.

- **Unscoped and publishable**, like `azure-mock` and `keyframe-store`, under a name free on npm — the upstream name is taken by definition. `npm view <name> version` answering `E404` is the check.
- **Engines as peers.** Both engines the adapter joins are `peerDependencies`, never `dependencies`: the adapter is meaningless without the consumer's own instances, and a second copy of either splits its types (the `build` skill's `references/dependency-placement.md`).
- **A docs section** at `apps/web/content/docs/<package>/index.md` (the `docs` skill), holding:
  - how the package works, with a diagram of the path a request or event takes through it;
  - an **Upstream** table — one row per upstream issue: the issue linked, its verdict, and where that verdict is proven (the test title, or the owning page for out of scope);
  - a Sources list — the upstream repository, and the engine documentation and source each design choice leans on.
- **The precedent line.** Once the swap lands, the package joins the precedent section of `apps/web/content/docs/architecture/dependency-admission.md`.
