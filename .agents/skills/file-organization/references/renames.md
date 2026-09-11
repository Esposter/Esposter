# Renaming Without Re-export Aliases

Read when renaming a file or moving a function into a shared package. The rule itself is in `SKILL.md` — delete
the old file, update every import site, never leave a re-export alias; this page is why the alias looks helpful
and is not, and which two files may re-export at all.

When renaming a file (`createFoo.ts` → `createBar.ts`), **delete the old file** — never leave a re-export alias
(`export { createBar as createFoo } from "./createBar"`). Update all import sites to the new path/name directly,
and the barrel (`index.ts`) if it exported the old name. The alias pattern looks helpful but creates confusion: the
old name stays discoverable, callers assume it's canonical, and the rename never fully propagates.

The same applies to a function that **moves into a shared package**: consumers import it from the owning package
directly, never through a local file whose whole body re-exports it — one function with two importable paths means
a grep for its call sites finds the wrong half. Two files are allowed to re-export, both because a tool demands a
file at that path: a package barrel (`index.ts`), since publishing the package is its entire job, and a package's
`eslint.config.js`, which is how ESLint reaches the shared config.
