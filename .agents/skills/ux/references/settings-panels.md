# Settings Panels

Read when adding a settings panel, or deciding whether a create action belongs in one. The one-line rule is in `SKILL.md`; this page is its full statement and the administrative case.

## A feature whose first want is administrative has no second surface

Some things are only ever reached for while configuring the room: a webhook, a word filter, an attachment cap. There
is no moment in the message list where a reader wants a webhook, and the reference product keeps that creation in
settings too — so settings **is** the point of need, and asking where else it should go invents a surface nobody
would look at.

What still bites there is the shape: it is a one-click action rather than a form (Discord's `New Webhook` creates
the row and the row renames itself), and the panel still owes the empty state. The test is whether a moment of first
want exists outside settings at all — not whether the create happens to live in one.

## A settings panel configures; it does not create

Settings is the app's most tempting dumping ground because everything plausibly belongs there. It is also the
surface a user visits least, so anything that lands there is the least discoverable version of itself.

- A settings panel holds **configuration and management** — the whole list, rename, delete, the room-wide toggle.
- **Creating does not belong there at all once it lives at the point of need**, not even as a button — a second
  `Add` in settings is the same action in the place nobody reaches for it, and it is the copy that goes stale. Where
  there is no point of need outside settings, this rule has nothing to move and the create stays (the administrative
  case, on this page).
  What the panel owes instead is an **empty state that says where adding happens** — that is the one thing only it
  can say, because it is the surface a reader lands on with nothing in the list.
- Adding a panel is a real cost: it lengthens the settings rail every reader scans, for a feature most of them will
  never configure. A new panel earns its row by being something a room **owner** manages, not by being new.
