# Esposter Skills — Authoring Conventions

How the skills in this directory are organised and maintained. **How to write one is itself a skill — see `skill-authoring`** (frontmatter that drives selection, one owner per topic, don't restate enforcers, generic placeholders). This file holds only what no single skill's frontmatter can say: the boundaries between skills, and why this directory is the only source of the repository's conventions.

**Each skill owns exactly one concern, and a given rule lives in exactly one skill.** Everything about how one is written (the most-specific-owner tiebreak, pointers instead of copies, the two-tier layout and its budget, tight-not-fluffy) is `skill-authoring`'s, stated there in full and deliberately not repeated here.

`.claude` is a symlink alias of `.agents` (`openspec/specs/architecture/agent-configuration/design.md`), so a skill edited under either path is the same file.

## Finding a rule's owner

The listing of every skill is the `description` in each `SKILL.md` — Claude Code loads all of them at the start of a session, and `pnpm ai:sweep:skill-docs` holds each one to its shape — so there is no roster here to keep current. Find the owner by reading the descriptions; if nothing fits, that signals a missing single-responsibility skill — create one rather than overloading an existing skill.

Three boundaries the descriptions alone do not settle: the Vue skills, recreation tooling against a domain's recreation skill, and `openspec` against the skills. The first is between the Vue skills, because the same rule can be read four ways. `vue` / `vue-component-patterns` / `vue-page-composition` / `vue-composable-patterns` is **semantics vs one component vs many components vs composables**: a rule about _how an SFC is written_ is `vue`; about _how a single component is built, typed and named_ is `vue-component-patterns`; about _how a page or list is assembled from components_ is `vue-page-composition`; about _a `use*` function_ is `vue-composable-patterns`. A rule that seems to fit two goes to the more specific one and the other links to it — never state it in both.

The second is between `recreation-tooling` and a domain's recreation skill, such as the `genshin-parity` skill, which both speak of tools: **protocol vs tools**. How any recreation's unknowns are listed, made separable and answered, and when a stalled loop builds a tool, is `recreation-tooling`; which tool answers which unknown in one domain, and the rules for its sources, is that domain's skill.

The third is between `openspec` and the skills: **features vs conventions**. What one feature does — built, designed, deferred or rejected — is a spec under `openspec/` (the `openspec` skill); how any code is written, whatever the feature, is a skill. A spec that starts stating a rule other features should follow has found a convention, which moves to its skill and leaves a pointer.

## One source of conventions

This directory is the only source of the repository's conventions. A rule lives in the skill that owns it, written so that a reader on any machine has everything it needs. A skill that leans on a file outside the repository is not portable, so none does.
