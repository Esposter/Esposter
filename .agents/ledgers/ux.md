# UX

Placement and reachability, carried across the surfaces built before the rules were written. Standing: a unit's
date says the rules held there on that date, and the pass resumes from the files changed since.

Nothing here is lint-checkable. A feature reachable only from settings typechecks and passes every test — it is
wrong only from a seat in front of it — so this ledger is the only thing that finds it.

## Rules

| Rule                                                                 | Owner      |
| -------------------------------------------------------------------- | ---------- |
| Point-of-need entry point beside the management one                  | `ux` skill |
| Settings panels configure and manage; creation forms move to dialogs | `ux` skill |
| One dialog shared by every surface that creates the same thing       | `ux` skill |
| Standing controls are never displaced by a transient value           | `ux` skill |
| Reference-product wording where the domain matches                   | `ux` skill |

## What a pass asks of each unit

For every feature the unit owns: **when does someone first want this?** If the only way to reach it from that
moment is a trip to settings, the entry point is missing. Then, for every settings panel the unit owns: is anything
in it a creation form rather than configuration?

## Coverage

| Unit                                             | Swept      | Notes                                                                                                                                                                                                                                    |
| ------------------------------------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| custom emoji                                     | 2026-08-21 | Create was settings-only. `Add Emoji` moved to the picker footer on `ManageEmojis` and left settings entirely — the panel manages the set and its empty state names the picker. The hover preview stopped displacing the footer controls |
| the rest of room settings — the other panels     |            |                                                                                                                                                                                                                                          |
| messaging — composer, message actions, reactions |            |                                                                                                                                                                                                                                          |
| messaging — rooms, invites, roles, moderation    |            |                                                                                                                                                                                                                                          |
| calls                                            |            |                                                                                                                                                                                                                                          |
| resource explorer — blades and the service menu  |            |                                                                                                                                                                                                                                          |
| resource editors — sheet, dashboard, flowchart   |            |                                                                                                                                                                                                                                          |
| user settings and profile                        |            |                                                                                                                                                                                                                                          |
| posts and achievements                           |            |                                                                                                                                                                                                                                          |
