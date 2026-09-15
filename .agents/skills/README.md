# Esposter Skills — Authoring Conventions

How the skills in this directory are organised and maintained. **How to write one is itself a skill — see `skill-authoring`** (frontmatter that drives selection, one owner per topic, don't restate enforcers, generic placeholders). This file holds only what no single skill's frontmatter can say: the boundaries between skills, and how the repo tree relates to the user's global rules.

**Each skill owns exactly one concern, and a given rule lives in exactly one skill.** Everything about how one is written (the most-specific-owner tiebreak, pointers instead of copies, the two-tier layout and its budget, tight-not-fluffy) is `skill-authoring`'s, stated there in full and deliberately not repeated here.

`.claude` is a symlink alias of `.agents` (`apps/web/content/docs/architecture/agent-configuration.md`), so a skill edited under either path is the same file.

## Finding a rule's owner

The listing of every skill is the `description` in each `SKILL.md` — Claude Code loads all of them at the start of a session, and `pnpm ai:sweep:skill-docs` holds each one to its shape — so there is no roster here to keep current. Find the owner by reading the descriptions; if nothing fits, that signals a missing single-responsibility skill — create one rather than overloading an existing skill.

The one boundary the descriptions alone do not settle is between the Vue skills, because the same rule can be read four ways. `vue` / `vue-component-patterns` / `vue-page-composition` / `vue-composable-patterns` is **semantics vs one component vs many components vs composables**: a rule about _how an SFC is written_ is `vue`; about _how a single component is built, typed and named_ is `vue-component-patterns`; about _how a page or list is assembled from components_ is `vue-page-composition`; about _a `use*` function_ is `vue-composable-patterns`. A rule that seems to fit two goes to the more specific one and the other links to it — never state it in both.

## Skills vs global rules

Two trees carry conventions and **they can contradict each other**: this repo's `.agents/skills/` and the user's global `~/.claude/rules/*.md` (`agents`, `coding-style`, `git-workflow`, `hooks`, `patterns`, `performance`, `security`, `testing`, `zod`). Both load every session; neither announces the other.

- **Repo skills win on repo-specific facts** — this codebase's actual paths, tooling, enforcers, and domain rules. A global rule is written for every project and cannot know them.
- **Global rules win on the user's personal workflow** — how they want planning, agents, and delegation to work.
- **Never leave a bare contradiction.** When a skill must depart from a global rule, say so explicitly and scope the departure as narrowly as it is actually true (as `docs` does for parallelism). A skill that silently contradicts a global rule makes both unfollowable.
- **Don't fork a topic across both trees.** Zod is the worked example: `~/.claude/rules/zod.md` holds the cross-project convention (interface-first — `satisfies z.ZodType<T>` — plus the `z.infer` exception, since `export type X = z.infer<typeof s>` is the only form that lints clean; `interface X extends z.infer<...>` trips oxlint `import/namespace`). The `zod` skill holds only the Esposter-specific delta and **points at the global rule instead of restating it**. Follow that shape whenever a topic spans both trees — one owner per mechanism, the other links up. Forking it is what produced conflicting zod guidance before.
