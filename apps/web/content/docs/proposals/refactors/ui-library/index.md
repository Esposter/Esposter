---
title: UI library
description: Proposals for the UI library — the gaps the built library still has, each one a self-contained spec a unit or a feature takes up when it needs it.
model: claude-opus-5-5
---

# UI Library

The [UI library](/docs/architecture/ui-library) and its [design language](/docs/architecture/design-language) are built: every interface in the app is drawn from them. What remains are gaps, each a spec of its own that a unit or a feature takes up whenever it needs one, in any order:

- [Event calendar keyboard](/docs/proposals/refactors/ui-library/event-calendar-keyboard) — the event calendar walked and rescheduled without a pointer.
- [Social preview image](/docs/proposals/refactors/ui-library/social-preview-image) — a shared link previews with an image drawn in the tokens.
