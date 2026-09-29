# Residue Sweep

Read when the last import of the absorbed package is about to go. Why the sweep exists is `apps/web/content/docs/architecture/dependency-admission.md` ("Executing an absorption"); the manifest, catalog and configuration half — a package named in a pre-bundle list or plugin match outliving its last importer with knip green — is the `build` skill's `references/dependency-placement.md`.

What that half does not reach is the residue in our own code, which names the package only in prose or not at all. Search for each:

- **The package and its tracker** — the package name, the upstream owner and repository name, and its issue URLs. Every `@TODO` citing an upstream issue is resolved by the issue's verdict: fixed, so the workaround goes; or out of scope, so the comment is rewritten to name the real owner (the `todos` skill).
- **Type shims** — a local type standing in for one the package shipped wrongly, and the comment explaining it.
- **Test-only branches in production code** — an `IS_TEST` or environment check that existed so a test double could serve what the real transport sends.
- **Casts at the seam** — `as` on a value crossing between the package and our code, which a typed replacement no longer needs.
- **Prose** — the docs pages and skills that name the package or explain a behaviour by it; the rename sweep in `AGENTS.md` "Finishing a change", step 3.

Each hit lands in the catalog entry's own commit, as the admission page's residue sweep says.
