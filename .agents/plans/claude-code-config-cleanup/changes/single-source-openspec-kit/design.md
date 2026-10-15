## Context

The kit ships to product repos through two routes: the plugin (hooks and skills, installed as a pinned snapshot with only its own folder), and `/opsx-setup` (copies templates into a repo). This repo dogfoods both. Any single location that both routes can reach is a choice between the plugin and the template.

## Goals / Non-Goals

**Goals:**

- One authored file per shipped OpenSpec artifact.
- A check that fails on any derived copy that differs from its source.

**Non-Goals:**

- Removing the committed `.claude/commands/opsx/` and `.claude/skills/openspec-*` generated files. They come from the machine-global OpenSpec profile and are kept by `tighten-openspec-practice`.
- Changing what the lint checks.

## Decisions

1. **The lint's authored source is the plugin copy.** Installed plugins run hooks through `${CLAUDE_PLUGIN_ROOT}`, which does not exist outside the plugin. The template and this repo's copies are derived from it. Rejected: making the template authoritative, because a plugin install would then need a second copy anyway.
2. **The schema's authored source is `templates/openspec/schemas/team-bdd/`.** No plugin hook reads the schema, so `/opsx-setup` is the only consumer. Rejected: moving the schema into the plugin, which adds a file no hook uses.
3. **Derived copies are checked, not generated at commit time.** A check that compares bytes keeps the change small and matches the existing hash check. Rejected: a pre-commit generator, which the repo's hook rules rule out (a hook protects; it does not nag).

## Risks / Trade-offs

- [Three copies remain] The lint still exists in three places on disk. The change reduces edits to one; it cannot reduce files while the plugin must be self-contained. Stated so no one expects the count to reach one.
- [Setup regression] `/opsx-setup` must now copy the schema; a repo set up before this change keeps its old copy until its next update. The check catches the drift on the next `/opsx-setup`.
