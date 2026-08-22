# UX

Placement and reachability, carried across the surfaces built before the rules were written. Standing: a unit's
date says the rules held there on that date, and the pass resumes from the files changed since.

Nothing here is lint-checkable. A feature reachable only from settings typechecks and passes every test — it is
wrong only from a seat in front of it — so this ledger is the only thing that finds it.

The reference-product rule widened from wording to layout and interaction on 2026-08-21. It resets no row: the
one dated unit was swept by copying the reference product's arrangement wholesale, which is what the wider rule
asks for.

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

| Unit                                             | Swept      | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| custom emoji                                     | 2026-08-21 | Create was settings-only. `Add Emoji` moved to the picker footer on `ManageEmojis` and left settings entirely — the panel manages the set and its empty state names the picker. The hover preview stopped displacing the footer controls                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| the rest of room settings — the other panels     | 2026-08-22 | Invites was creation with no management left over and already had its point-of-need twin, so the panel left settings and the header's `Add Friends` became `Invite People`. Webhooks dropped its name form for Discord's one-click `New Webhook` — the row it creates already renames in place. Four panels were listed to members whose every control rejects, Webhooks' own read included, and Delete to non-owners: the gate map now covers every panel but Profile, the dialog's own gate is derived from it, and a test holds the coverage. The rule is in `ux`. Discord's own Invites panel is management — a list, a revoke, a pause — which needs data we do not have, so it is raised rather than rebuilt |
| messaging — composer, message actions, reactions |            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| messaging — rooms, invites, roles, moderation    |            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| calls                                            |            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| resource explorer — blades and the service menu  |            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| resource editors — sheet, dashboard, flowchart   |            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| user settings and profile                        |            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| posts and achievements                           |            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

## Open findings

- **The Invites panel Discord actually ships is management, and we have no data for it** — a list of the room's
  active links, a revoke per row and a pause for all of them. Ours only created, so it left settings; the
  management half needs two procedures and a room field and is specified in
  [invite management](/docs/proposals/esbabbler/invite-management), which also carries the `ManageInvites`
  permission nothing reads.
- **Neither the Members nor the Bans panel can be searched**, and both paginate a whole room. Discord searches both.
  Adding it needs a server-side predicate on the read, so it is a feature rather than a placement fix.
