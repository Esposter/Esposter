# Config migrations

Read when a compiler, lint or tooling setting is about to be switched on across the workspace, such as a new `tsconfig` flag or a stricter rule, and the code has to change for it to pass.

A config migration is two changes of different kinds, and they land differently.

1. **The code the setting forces lands on `main` directly.** The owner asks for it in the request. These are the edits made to satisfy the setting: widened declarations, call sites rewritten, a codemod's output, the regression tests for the defects the setting exposed, and a library bump whose types the new code imports, with its catalog entry, lockfile, rebuilt manifests and lifted Renovate hold. They go in one commit built on `origin/main` (with `ai/queue` level with it, or the commit would carry unreviewed work), pushed as a plain fast-forward. `main` may be red between the two pushes. Code that is valid only under the new setting is expected, and the switch lands right behind it.
2. **The setting itself goes through `ai/queue` and the review.** That means the flag, the lint rule that holds the new convention, and every spec and skill describing the convention. This commit is what a reviewer judges: the decision, not the mechanical edits. It lands with `pnpm ai:land`, and the review's fast-forward takes `main` past it.

Before the split, the whole migration is finished as one working tree, and the queue's tip is where it is whole. The local review (the `code-review` skill, both lanes), the `finishing` skill's audit, typecheck, lint and the touched suites all pass with the setting on. Then the tree is committed by pathspec, code first and setting second, so the two commits together are exactly what was verified.

When the owner has not asked for the direct push, both halves go through the queue as ordinary commits, in that order.
