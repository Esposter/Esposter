# UX

Placement and reachability, carried across the surfaces built before the rules were written. Standing: a unit's
date says the rules held there on that date, and the pass resumes from the files changed since.

Nothing here is lint-checkable. A feature reachable only from settings typechecks and passes every test — it is
wrong only from a seat in front of it — so this ledger is the only thing that finds it.

## Rules

| Rule                                                                       | Owner      |
| -------------------------------------------------------------------------- | ---------- |
| Point-of-need entry point beside the management one                        | `ux` skill |
| Settings panels configure and manage; creation forms move to dialogs       | `ux` skill |
| One dialog shared by every surface that creates the same thing             | `ux` skill |
| Standing controls are never displaced by a transient value                 | `ux` skill |
| Reference-product wording, layout and interaction where the domain matches | `ux` skill |
| A management surface exists only where its actions can succeed             | `ux` skill |

## What a pass asks of each unit

For every feature the unit owns: **when does someone first want this?** If the only way to reach it from that
moment is a trip to settings, the entry point is missing. Then, for every settings panel the unit owns: is anything
in it a creation form rather than configuration?

Then the question the first two do not ask: **does the reference product ship this, and is its arrangement better
than ours?** Reachability can be right while the surface a reader arrives at is still the worse version of a screen
Discord or Slack already solved — the same state, the same permissions, a worse layout. That is a finding here, and
a better arrangement of our own is an acceptable answer to it, as long as a comment says what it departed from.

## Coverage

| Unit                                             | Swept      | Notes                                                                                      |
| ------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------ |
| custom emoji                                     | 2026-08-21 |                                                                                            |
| the rest of room settings — the other panels     | 2026-08-22 | which panels a member may see is a gate map with a test over it                            |
| messaging — composer, message actions, reactions | 2026-08-22 | a dialog's composer entry and its slash command share one execute switch and one icon      |
| messaging — rooms, invites, roles, moderation    | 2026-08-22 | the role toggle is one component over one composable, so no surface reads hierarchy itself |
| calls                                            | 2026-08-22 |                                                                                            |
| resource explorer — blades and the service menu  | 2026-08-22 | the reference product here is the Azure portal                                             |
| resource editors — sheet, dashboard, flowchart   | 2026-08-22 | the sheet's Settings blade is its data-source configuration and nothing else               |
| user settings and profile                        | 2026-08-22 | the settings dialog and `/user/settings` render the same cards rather than two forms       |
| posts and achievements                           | 2026-08-22 | the reference products here are Reddit and GitHub                                          |

## Open findings

- **The invite dialog has no friends list** — Discord's offers the people you could invite directly, so inviting
  one does not go through copying a link and pasting it somewhere else. The panel half of this gap is closed; this
  half is a picker over the friends list, and it is a feature rather than a placement fix.
