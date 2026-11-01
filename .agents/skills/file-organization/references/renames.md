# Renaming Without Re-export Aliases

Read when renaming a file or moving a function into a shared package. The rule itself is in `SKILL.md`; this page is why the alias looks
helpful and is not, and which files may re-export at all.

A re-export alias (`export { createBar as createFoo } from "./createBar"`) looks helpful but creates confusion: the
old name stays discoverable, callers assume it's canonical, and the rename never fully propagates. The barrel
(`index.ts`) that exported the old name is updated like any other import site.

The same applies to a function that **moves into a shared package**: consumers import it from the owning package
directly, never through a local file whose whole body re-exports it — one function with two importable paths means
a grep for its call sites finds the wrong half. A file re-exports only where a tool demands a file at that path: a package
barrel — the generated `index.ts`, or a hand-written subpath entry (the `build` skill, `references/barrels.md`) —
since publishing the package is its entire job, and a package's `eslint.config.js`, which is how ESLint reaches the
shared config.
