# Esposter Skills — Authoring Conventions

How the skills in this directory are organised and maintained. **How to write one is itself a skill — see `skill-authoring`** (frontmatter that drives selection, one owner per topic, don't restate enforcers, generic placeholders). This file is only the index of who owns what.

**Each skill owns exactly one concern, and a given rule lives in exactly one skill** — which is what the map below is for. Everything about how one is written (the most-specific-owner tiebreak, pointers instead of copies, the two-tier layout and its budget, tight-not-fluffy) is `skill-authoring`'s, stated there in full and deliberately not repeated here.

`.agents/skills` is a symlink to `.claude/skills`, so edits to either tree apply to both automatically — no manual mirroring.

## Ownership map

Find a rule's owner here before adding it. **This map lists every skill, and must stay that way** — an absent skill is invisible to that check, so its topic gets re-created somewhere else. That is the exact failure this file exists to prevent.

If nothing fits, that may signal a missing single-responsibility skill — create one rather than overloading an existing skill, and add it here in the same change.

### Meta

- `skill-authoring` — how to write a `SKILL.md`: frontmatter/selection, one owner per topic, the enforcer rule, generic placeholders, the two-tier layout.
- `docs` — `packages/app/content/docs` conventions: the Mermaid mandate, location-carries-status, page templates, area lifecycle.
- `readme-standards` — package `README.md` template, badges, published-vs-private split.

### Cross-cutting code

- `formatting` — whitespace, blank-line placement, comment attachment/style. (Import order and line endings are tool-enforced; it points at the enforcer.)
- `file-organization` — where files/exports/constants/classes live, alias imports, constant maps, package creation, refactoring, file length.
- `naming` — identifier naming conventions (booleans, functions, variables). Framework-specific naming lives in the framework's own skill.
- `typescript` — TypeScript language rules and type patterns.
- `error-handling` — neverthrow `getResult`, tRPC guards, Azure Functions logging/retry.
- `string-utils` — `normalizeString` / `sanitizeTextHtml` boundaries.
- `zod` — schema conventions. **Shares its topic with `~/.claude/rules/zod.md`** — see "Skills vs global rules".
- `vjsf` — form schemas rendered by Vjsf: `*Form` schemas, `layout` meta, ajv keywords, discriminated-union form quirks, options/context typing.

### Vue / frontend

- `vue` — SFC semantics: macro/declaration order, template patterns, watch, refs, SSR guards.
- `vue-component-patterns` — component _authoring_: shell primitives, generics, slots, co-location, emit naming, local state init.
- `vue-page-composition` — page/list _composition_: page decomposition, granularity, `v-for` list items, action items, singleton dialogs.
- `vue-composable-patterns` — composable _authoring_: `MaybeRefOrGetter`, validation layers, resource lifecycle, async sequencing.
- `pagination` — paginated lists: the cursor read pattern, `StyledWaypoint`, search-as-you-type, the offline IndexedDB cache.
- `routing` — links/`:to`, `navigateTo`, route reads, route-synced tabs, `definePageMeta` `validate`/`key`.
- `styling` / `unocss` — attributify styling usage vs. UnoCSS config.
- `vuetify` — Vuetify 4 components, dialogs, selects, forms, lists.
- `responsive` — mobile/narrow-viewport collapse rules.
- `pinia` — store conventions.
- `tiptap` / `grapesjs` / `vue-phaserjs` / `slash-commands` — feature-library integrations.

The `vue` / `vue-component-patterns` / `vue-page-composition` / `vue-composable-patterns` boundary is **semantics vs one component vs many components vs composables**: a rule about _how an SFC is written_ is `vue`; about _how a single component is built, typed and named_ is `vue-component-patterns`; about _how a page or list is assembled from components_ is `vue-page-composition`; about _a `use*` function_ is `vue-composable-patterns`. A rule that seems to fit two goes to the more specific one and the other links to it — never state it in both.

### Backend / data

- `trpc` — routers, procedures, router tests.
- `drizzle` — Postgres schema, columns, relations.
- `azure-table` — Azure Table Storage keys, partitioning, pagination.
- `esbabbler` / `esbabbler-call` — the messaging domain, and its calls/voice internals.

### Process / tooling

- `testing` — Vitest conventions, mock/session patterns, test environments, what to test.
- `git` — commit format, safety rules, branch hygiene.
- `code-review` — the one entry point for every review: the workflow script, its two modes, what a run costs and bounds it, confidence and provenance on findings, closing a finding (`fixing-findings.md`), and the stop rule.
- `coderabbit` — review config: PR file budget, `.coderabbit.yaml` exclusions, exclude/re-enable commit pair.
- `sweeps` — repo-wide mechanical passes and the `.claude/ledgers/` tree that tracks them: when one earns a file, its metadata/coverage tables, standing vs one-shot, shrinking a sweep into an enforcer. The convention a sweep carries stays owned by its own skill.
- `oxlint` — lint rule exceptions and disable directives.
- `package-scripts` — which `pnpm` script to run, and from where.
- `context-efficiency` — how the main session spends its own context/turns: delegating wide reads, batching verification, polling vs sleeping, baselining before chasing an error.
- `run-app` — launching the dev server and driving the app in a real browser to verify UI: session seeding, Chrome/CDP, the dev-build and async-render traps.
- `build` — rolldown configs and external lists.
- `bench` — colocated `*.bench.ts` and the benchmark reporter.
- `dependency-updates` — the catalog, pinning, node bumps.
- `pulumi-infra` — `packages/infra` Azure resources.
- `claude-permissions` — `.claude/settings.local.json` rule semantics.
- `model-delegation` — what to think through in-session vs delegate to a subagent.
- `score` — the `SCORE.md` repository audit: re-scoring process, README badge sync, `compatibilityDate` bump.

Keep this map current whenever a skill is split, merged, or created.

## Skills vs global rules

Two trees carry conventions and **they can contradict each other**: this repo's `.claude/skills/` and the user's global `~/.claude/rules/*.md` (`agents`, `coding-style`, `git-workflow`, `hooks`, `patterns`, `performance`, `security`, `testing`, `zod`). Both load every session; neither announces the other.

- **Repo skills win on repo-specific facts** — this codebase's actual paths, tooling, enforcers, and domain rules. A global rule is written for every project and cannot know them.
- **Global rules win on the user's personal workflow** — how they want planning, agents, and delegation to work.
- **Never leave a bare contradiction.** When a skill must depart from a global rule, say so explicitly and scope the departure as narrowly as it is actually true (as `docs` does for parallelism). A skill that silently contradicts a global rule makes both unfollowable.
- **Don't fork a topic across both trees.** Zod is the worked example: `~/.claude/rules/zod.md` holds the cross-project convention (interface-first — `satisfies z.ZodType<T>` — plus the `z.infer` exception, since `export type X = z.infer<typeof s>` is the only form that lints clean; `interface X extends z.infer<...>` trips oxlint `import/namespace`). The `zod` skill holds only the Esposter-specific delta and **points at the global rule instead of restating it**. Follow that shape whenever a topic spans both trees — one owner per mechanism, the other links up. Forking it is what produced conflicting zod guidance before.
