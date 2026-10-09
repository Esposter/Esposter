# Page Frontmatter

Read when writing a new page's frontmatter, or a proposal's.

Every page starts with exactly:

```yaml
---
title: <short page title, no area prefix — the nav shows the tree>
description: <one sentence; drives nav tooltips and search>
---
```

Nothing else unless the renderer needs it, with one exception: **a proposal adds `model: <model id>`** — the model that wrote it, or last rewrote its substance (`model: claude-opus-5-5`) — because a spec is executed cold later and the reader weighs it by who designed it; git names the committer, not the model behind the design. No status or date fields — location carries status, git carries history.

A proposal unit may also name the fleet's three fields, each optional and read by `pnpm ai:fleet:next --kind unit` (the `throughput` skill, `references/fleet.md`):

- `needs: [game-exports, game-install, media-engine, ...]` — the capabilities a machine must hold to take the unit; name one only when a part reads the installed game or its exports;
- `touches: ["<glob>", ...]` — the folders a part edits that its Key files table does not already name, quoted so a `*` is not read as a YAML alias;
- `waiting: "<blocker>"` — set only while the unit is blocked wholly on another unit or on missing data, and removed when the blocker clears. A unit with `waiting` is not offered to any machine.

Omitted, each reads as empty, so a page with none of them is ready to take on any machine that lends its area.
