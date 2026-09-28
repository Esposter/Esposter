---
title: Deferred
description: Infrastructure ideas waiting on a trigger.
---

# Deferred

- [Drift detection](/docs/infra/deferred/drift-detection) — scheduled refresh/preview; needs source-of-truth first
- [Own Live2D renderer](/docs/infra/deferred/own-live2d-renderer) — a transparent window of the plugin's own rendering the character's model; needs the desktop viewer's socket to fall short of the stage
- [Pulumi preview in CI](/docs/infra/deferred/pulumi-preview-ci) — PR plan comments; needs multi-operator infra
- [Search index capacity](/docs/infra/deferred/search-index-capacity) — the Free-SKU ceiling under message search, and what happens when it binds
- [Console worktree sessions](/docs/infra/deferred/console-worktree-sessions) — a session in its own git worktree; needs an install cheap enough for one per session
- [Console split sessions](/docs/infra/deferred/console-split-sessions) — two sessions side by side; needs the workflow comparison to show them read at once
- [Console cross-session messages](/docs/infra/deferred/console-cross-session-messages) — a session reading and messaging another; needs parallel sessions that coordinate
- [Console session archive](/docs/infra/deferred/console-session-archive) — archiving sessions and filtering the sessions tab; needs a list longer than a glance
