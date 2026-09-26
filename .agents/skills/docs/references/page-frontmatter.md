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
