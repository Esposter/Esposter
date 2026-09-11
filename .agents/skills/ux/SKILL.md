---
name: ux
description: Esposter UX conventions — where a feature's entry point goes (point-of-need beside management, never management alone — unless the first want is administrative, or the act is already one click from where the want is felt), settings panels hold configuration rather than creation once a point of need exists outside them, one dialog shared by every surface that creates the same thing, standing controls that a transient value may never displace, a management surface existing only where its own actions can succeed, punctuation a value is written with being field chrome rather than input, and following the reference product's wording, layout and interaction where the domain matches, deviating only for a demonstrably better arrangement, said out loud — plus deep dives on chrome around a value (a bar a transient value shares without resizing, punctuation drawn as field chrome) and on a handed-over screenshot being the specification (strings verbatim, what is in the frame and nothing else). Apply when adding any user-facing feature, deciding where an action lives, or reviewing a surface for reachability.
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

**Two surfaces is what the answer usually is, not what the rule demands.** The rule is that the want is met from
where it is felt; two surfaces is the shape that takes whenever the want is felt somewhere settings is not. Two
cases collapse it back to one, and both are settled below rather than argued per feature: a want that only ever
happens while configuring the room has no second place to put anything ("A feature whose first want is
administrative has no second surface"), and a want already met one click from where it is felt is met ("A second
entry point a click away is not a missing one"). Neither is a licence to ship management alone:
each one has to be argued for the feature in hand, in the terms those sections set.

## A settings panel configures; it does not create

Settings is the app's most tempting dumping ground because everything plausibly belongs there. It is also the
surface a user visits least, so anything that lands there is the least discoverable version of itself.

- A settings panel holds **configuration and management** — the whole list, rename, delete, the room-wide toggle.
- **Creating does not belong there at all once it lives at the point of need**, not even as a button — a second
  `Add` in settings is the same action in the place nobody reaches for it, and it is the copy that goes stale. Where
  there is no point of need outside settings, this rule has nothing to move and the create stays (below).
  What the panel owes instead is an **empty state that says where adding happens** — that is the one thing only it
  can say, because it is the surface a reader lands on with nothing in the list.
- Adding a panel is a real cost: it lengthens the settings rail every reader scans, for a feature most of them will
  never configure. A new panel earns its row by being something a room **owner** manages, not by being new.

### A feature whose first want is administrative has no second surface

Some things are only ever reached for while configuring the room: a webhook, a word filter, an attachment cap. There
is no moment in the message list where a reader wants a webhook, and the reference product keeps that creation in
settings too — so settings **is** the point of need, and asking where else it should go invents a surface nobody
would look at.

What still bites there is the shape: it is a one-click action rather than a form (Discord's `New Webhook` creates
the row and the row renames itself), and the panel still owes the empty state. The test is whether a moment of first
want exists outside settings at all — not whether the create happens to live in one.

## One dialog per created thing

Two surfaces that create the same row share one component — not two forms with the same fields. Two copies drift on
the first change of validation, and the drift shows up as a create that succeeds from one entry point and fails from
the other. The dialog takes what it needs as props and lives beside the model it creates, not beside either caller.

## Chrome around a value — `references/control-chrome.md`

A transient value may share a bar with the standing controls, but the bar never resizes and the controls come
back the instant it goes; punctuation a value is always read inside is field chrome (`prefix`/`suffix`, sized to
the value) and never part of the model. **Building a shared bar or a punctuated field** is that page.

## A management surface exists only where its actions can succeed

A panel, tab or menu entry whose every control is rejected server-side is worse than a missing one: the reader
finds the thing they were looking for and then cannot use it, and the error arrives from a read they never asked
for. So a surface listed behind a permission gate carries **the permission its own writes require**, and the gate
on the container is the **union of what it holds** rather than a second list beside it — otherwise a reader who
may manage exactly one thing cannot reach the surface that manages it.

Where the guard is ownership rather than a permission, the entry is gated on ownership; a confirm dialog that
refuses afterwards is not the gate, it is the second one.

**Prime example — room settings.** Every panel except the reader's own profile names a `RoomPermission`, the
dialog's own gate is derived from that map, and Delete is drawn only for the room owner, because deleting is
guarded by `ownedBy` and no permission can express it.

## Follow the reference product where the domain matches

Esposter's messaging surfaces are modelled on Discord and Slack, so when one of them already has the feature, take
its **wording, its layout and its interaction** wherever our domain word substitutes cleanly (their _workspace_ is
our _room_). Someone arriving from either should not have to learn a new word for the same thing, or hunt for a
control whose shape they already know.

**The copy is the smallest half, and the half this gets applied to.** The reference product has usually shipped
the same feature over the same data model with a materially better arrangement of it — Discord's channel
permissions are the standing example: the roles, members and per-entry overrides we already store, laid out as a
list you add an entry to and edit in place rather than a form that asks what kind of thing you are adding first.
Our version holding identical state and reading worse is a finding here, with every word on the screen correct.

**Deviating needs no permission — a better layout is a better layout.** It needs to be _better_ rather than merely
different, and to be said out loud: a comment naming what the reference does and why this does not. A silent
deviation reads as an oversight to the next reader comparing the two, and it is the one that gets "fixed" back.

### A second entry point a click away is not a missing one

The point-of-need rule asks whether the want can be met from where it is felt, not whether every surface carries
the action. Where creating is already one click from wherever the reader is standing — a card on the area's home,
an entry in its own menu — a third copy on the list beside them is not reachability, it is a control to keep in
sync with the other two. The reference product having one there is not enough on its own: what matters is the
distance from the want to the act, and a click is not a distance.

The finding is a **trip**: settings, another product area, a navigation the reader did not ask for. Count the
clicks before adding the button.

### A screenshot of the reference product is the specification — `references/reference-screenshots.md`

Strings verbatim with only the domain noun substituted, what is in the frame and nothing else, a control we cannot
back left out rather than mocked, and a string that would be false here treated as a missing feature. **Building
from a handed-over screenshot** is that page.

## Where a whole-product pass is tracked

Placement is not enforceable by lint, and the failure mode is invisible: a feature that is only reachable from
settings looks complete from every angle except a user's. The standing sweep against these rules is
`.agents/ledgers/ux.md`, one row per product area.
