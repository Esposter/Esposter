# Esposter Skills — Authoring Conventions

How the skills in this directory are organised and maintained.

## Principles

- **Single responsibility** — each skill owns exactly one concern. A given rule lives in exactly one skill.
- **No overlap** — when a rule could fit two skills, it belongs to the most specific owner. Other skills reference it with a one-line pointer ("See the `formatting` skill") rather than restating it.
- **Pointers, not duplication** — cross-reference; never copy. Duplicated guidance drifts out of sync and hides the canonical rule, which is what makes a rule hard to find.
- **Tight, not fluffy** — one line per rule where possible. Cut redundant prose and example values that will rot.
- **Mirror both trees** — every change applies identically to `.claude/skills/` and `.agents/skills/`.

## Ownership map

Find a rule's owner here before adding it. If nothing fits, that may signal a missing single-responsibility skill — create one rather than overloading an existing skill.

- `formatting` — whitespace, blank-line placement, comment attachment/style, import grouping, line endings.
- `file-organization` — where files/exports/constants/classes live, constant maps, package creation, refactoring, file length.
- `naming` — identifier naming conventions (booleans, functions, variables, Vue, tRPC, Pinia).
- `typescript` — TypeScript language rules and type patterns.
- `vue` / `vue-component-patterns` / `vue-composable-patterns` — Vue SFC semantics, component architecture, composable patterns respectively.
- `styling` / `unocss` — attributify styling usage vs. UnoCSS config.
- Domain skills (`drizzle`, `trpc`, `zod`, `pinia`, `error-handling`, `testing`, `azure-table`, `esbabbler`, `tiptap`, `vuetify`, …) own their domain's rules only.

Keep this map current whenever a skill is split, merged, or created.
