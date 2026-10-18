# Package Shape

Read when creating the replacement package, its README or its docs section. The package skeleton is the `file-organization` skill's `references/new-package.md` and the README the `readme-standards` skill's; this page is what an absorbed package adds to both.

- **Unscoped and publishable**, like `azure-mock` and `keyframe-store`, under a name free on npm — the upstream name is taken by definition. `npm view <name> version` answering `E404` is the check.
- **Engines as peers.** Both engines the adapter joins are `peerDependencies`, never `dependencies`: the adapter is meaningless without the consumer's own instances, and a second copy of either splits its types (the `build` skill's `references/dependency-placement.md`).
- **A spec area** at `openspec/specs/<package>/` (the `openspec` skill), holding:
  - how the package works, with a diagram of the path a request or event takes through it;
  - an **Upstream** table — one row per upstream issue: the issue linked, its verdict, and where that verdict is proven (the test title, or the owning page for out of scope);
  - a Sources list — the upstream repository, and the engine documentation and source each design choice leans on.
- **A utility absorbed into `@esposter/shared` is no package**, so its capability is `openspec/specs/shared/<name>/`, listed on that area's `README.md`, and code absorbed into one app is a capability in the area of what runs it (the dev query log's highlighter is `openspec/specs/architecture/sql-highlight/design.md`). Either holds the same three parts; only a package gets a top-level area.
- **A component wrapper is no package either.** It becomes a component of the app that mounts it, its capability in the area of what it serves (the chart is `openspec/specs/architecture/charts/design.md`), with the same three parts. It takes the engine's options unchanged and hands out the engine's instance, so it carries no event or method of its own that the engine already has (`openspec/specs/architecture/dependency-admission/design.md`, "The standard an absorption meets").
- **The precedent line.** Once the swap lands, the package joins the precedent section of `openspec/specs/architecture/dependency-admission/design.md`.
