---
name: ux
description: Apply when adding any user-facing feature, laying out a page or panel, deciding where an action lives or whether it confirms, or reviewing a surface for reachability. Esposter UX conventions — every feature's create action at the point of need with management in settings, a settings panel configuring rather than creating, one dialog per created thing, standing controls a transient value never displaces, no second entry point — a scene's prop included — to what the chrome already opens, a management surface only where its actions can succeed, an act the app can undo asking nothing and a dialog closing with its write, punctuation a value is read inside drawn as field chrome, the reference product's wording, layout and interaction followed where the domain matches, and a layout looked up in the reference product and the design language before it is written.
---

# UX Conventions

The rules here are about **reachability and placement**, not about pixels — component choice belongs to the
`ui-library` skill and layout to `styling`. What this owns is the question those two never ask: from where can a
person actually do this thing, and is that where they were already looking?

## Every feature has two surfaces, and shipping one is shipping half

A created thing's create action lives where the want is first felt, and its management in settings; a want met one click away needs no second copy, and a scene's prop is an entry point too (`references/point-of-need.md`).

## A settings panel configures; it does not create

Settings holds configuration and management, never a create that lives at the point of need, and its empty state says where adding happens (`references/settings-panels.md`).

## One dialog per created thing

Two surfaces that create the same row share one component — not two forms with the same fields. Two copies drift on
the first change of validation, and the drift shows up as a create that succeeds from one entry point and fails from
the other. The dialog takes what it needs as props and lives beside the model it creates, not beside either caller.

## Chrome around a value — `references/control-chrome.md`

A transient value may share a bar with the standing controls, but the bar never resizes and the controls come
back the instant it goes; punctuation a value is always read inside is field chrome (drawn beside the input, sized to
the value) and never part of the model. **Building a shared bar or a punctuated field** is that page.

## A write's feedback — `references/write-feedback.md`

What the reader sees after acting is decided by the write, never by the call site: an act the app can undo asks
nothing and offers the undo, an optimistic write's dialog closes on the answer, and a write that waits for the server
holds its dialog pending until it lands and keeps it open on failure. **Deciding whether an act confirms, when its
dialog closes, or how an undo is offered** is that page.

## A management surface exists only where its actions can succeed

A surface behind a gate carries the permission its own writes require, the container's gate is the union of what it holds, and an ownership guard gates on ownership (`references/gated-surfaces.md`).

## Follow the reference product where the domain matches

Where Discord or Slack already has the feature, take its wording, layout and interaction, substituting only our domain word; a deviation is better and says so in a comment (`references/reference-product.md`).

## Where a whole-product pass is tracked

Placement is not enforceable by lint, and the failure mode is invisible: a feature that is only reachable from
settings looks complete from every angle except a user's. The standing sweep against these rules is
`.agents/ledgers/ux.md`, one row per product area.

## Reference pages

- `references/visual-design-sources.md` — when laying out a new surface, or judging whether one looks right: the reference screen, the design language and what a first draft gets wrong.
- `references/reference-screenshots.md` — when building from a handed-over screenshot of the reference product.
- `references/point-of-need.md` — when placing a feature's create action, or deciding whether another entry point is owed.
- `references/settings-panels.md` — when adding a settings panel, or deciding whether a create belongs in one.
- `references/gated-surfaces.md` — when a surface sits behind a permission or ownership gate.
- `references/reference-product.md` — when a feature already exists in the reference product, or a surface deviates from it.
