---
name: ux
description: Esposter UX conventions — where a feature's entry point goes (point-of-need beside management, never management alone), settings panels hold configuration rather than creation, one dialog shared by every surface that creates the same thing, standing controls that a transient value may never displace, and copying the reference product's wording where the domain matches. Apply when adding any user-facing feature, deciding where an action lives, or reviewing a surface for reachability.
---

# UX Conventions

The rules here are about **reachability and placement**, not about pixels — Vuetify component choice belongs to the
`vuetify` skill and layout to `styling`. What this owns is the question those two never ask: from where can a
person actually do this thing, and is that where they were already looking?

## Every feature has two surfaces, and shipping one is shipping half

A feature that users create things with has a **management** surface and a **point-of-need** surface, and they are
never the same place:

| Surface       | Answers                                     | Lives in                     |
| ------------- | ------------------------------------------- | ---------------------------- |
| Management    | show me all of them, rename one, delete one | room or user settings        |
| Point of need | I want one _right now_                      | wherever the absence is felt |

The point of need is found by asking **when does someone first want this?** — not _where would an administrator go
to configure it_. The two answers are almost never the same, and only the second one is easy to find, which is why
features ship with management alone and then read as missing.

**Prime example — custom emoji.** Someone wants an emoji the room does not have at the exact moment they have the
picker open and cannot find it. So `Add Emoji` sits in the picker's own footer, gated on `ManageEmojis`. This is
Slack's arrangement; a settings-only version puts four navigations between the want and the act, and every one of
them is a chance to give up. Settings keeps the set and the deletes, and its empty state names the picker.

Ask it for every new feature: **a saved view, a webhook, a tag, a template** — each has a moment of first want, and
that moment is where its create action goes.

## A settings panel configures; it does not create

Settings is the app's most tempting dumping ground because everything plausibly belongs there. It is also the
surface a user visits least, so anything that lands there is the least discoverable version of itself.

- A settings panel holds **configuration and management** — the whole list, rename, delete, the room-wide toggle.
- **Creating does not belong there at all**, not even as a button. Once the point-of-need entry exists, a second
  `Add` in settings is the same action in the place nobody reaches for it, and it is the copy that goes stale.
  What the panel owes instead is an **empty state that says where adding happens** — that is the one thing only it
  can say, because it is the surface a reader lands on with nothing in the list.
- Adding a panel is a real cost: it lengthens the settings rail every reader scans, for a feature most of them will
  never configure. A new panel earns its row by being something a room **owner** manages, not by being new.

## One dialog per created thing

Two surfaces that create the same row share one component — not two forms with the same fields. Two copies drift on
the first change of validation, and the drift shows up as a create that succeeds from one entry point and fails from
the other. The dialog takes what it needs as props and lives beside the model it creates, not beside either caller.

## A transient value may take a bar, but never resize it

A hover preview, a selection count, a live validation hint — all of them come and go with the pointer. Sharing one
bar with the standing controls is the reference products' own shape and reads well, because the two are never wanted
at the same moment: while the pointer is over the grid the reader is reading the preview, not aiming at a button.
What is not allowed is the bar changing size as it swaps, or the standing controls failing to come back the instant
the transient value goes — a control that has to be hunted for again after a hover is a control that moved.

So: state the bar's height on the bar, put one thing in it at a time, and make the empty state of the transient
value the standing state rather than a gap where it was.

**Prime example — the emoji picker footer.** The hovered emoji fills the bar with its glyph and shortcode; with no
hover the same bar holds `Add Emoji` and the skin-tone control. The height is declared once on the container, so
which of the two is showing moves nothing.

## Punctuation a value is written with is chrome, not input

When a value is always read inside fixed punctuation — a shortcode's colons, a handle's `@`, a unit — the field
shows it and the model never carries it: a `prefix`/`suffix` on the input, with the same characters stripped from
anything typed or pasted so a value copied from elsewhere still lands. Asking for it instead means a field that
rejects what its own placeholder invited, and a value shown without it does not read as the thing the user will
type later.

**Prime example — the emoji name field.** The name's charset is lowercase letters, digits and underscores, so a
typed colon could only ever be an error; the field draws `:name:` with the colons fixed either side and stores the
name alone. One field serves the create dialog and the settings rename, so the rules and the chrome cannot
disagree between them.

## Copy follows the reference product where the domain matches

Esposter's messaging surfaces are modelled on Discord and Slack, so when one of them already has the feature, take
its **wording and its shape verbatim** wherever our domain word substitutes cleanly (their _workspace_ is our
_room_). Not for lack of imagination: a user arriving from either product should not have to learn that our word
for the same thing is different. Deviate where the underlying behaviour differs — and say so in a comment, because
a silent deviation reads as an oversight to the next reader comparing the two.

## Where a whole-product pass is tracked

Placement is not enforceable by lint, and the failure mode is invisible: a feature that is only reachable from
settings looks complete from every angle except a user's. The standing sweep against these rules is the
[ux ledger](../../ledgers/ux.md), one row per product area.
