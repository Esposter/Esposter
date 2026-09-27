---
name: ux
description: Apply when adding any user-facing feature, laying out a page or panel, deciding where an action lives or whether it confirms, or reviewing a surface for reachability. Esposter's UX conventions — where a person can do a thing from: a create action at the point of need with management in settings, one dialog per created thing, no second entry point to what the chrome already opens, a management surface only where its actions can succeed, every delete confirming, and the reference product's wording and layout followed where the domain matches.
---

# UX Conventions

The rules here are about **reachability and placement**, not about pixels — component choice belongs to the
`ui-library` skill and layout to `styling`. What this owns is the question those two never ask: from where can a
person actually do this thing, and is that where they were already looking?

## Settled — do not re-propose

- **Resolving `executeMutation` at the optimistic apply**, so the dialog could infer the mode. Every awaiting caller
  and test reads that promise as "the server answered", and one declared prop states the fact at the site for less.
- **A deferred-commit undo** (hide the row, wait out the toast, then send) for writes the server cannot reverse, such
  as a message delete. A tab closed inside the window silently drops the write, and the server has no restore to
  fall back on. What has no server-side undo confirms.
- **An undoable delete acting on click**, the undo its only guard. A reader cannot tell which kind a Delete is until it
  has gone, and only "every delete asks" is a rule `restrictedDeleteSyntaxes` can hold
  (`apps/web/content/docs/architecture/rejected/no-confirm-for-undoable-deletes.md`).
- **Inline error text inside a dialog.** The toast plus a dialog left open is the app's one failure surface, so a
  dialog adds no second place a rejection can appear.

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

What the reader sees after acting is decided by the write, never by the call site: every delete asks first, an undo
the app can offer is shown once the write lands, an optimistic write's dialog closes on the answer, and a write that
waits for the server holds its dialog pending until it lands and keeps it open on failure. **Deciding whether an act confirms, when its
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
- `references/control-chrome.md` — when a bar shares space with a transient value, or a field shows a value inside fixed punctuation.
- `references/write-feedback.md` — when deciding whether an act confirms, when its dialog closes, or how an undo is offered.
