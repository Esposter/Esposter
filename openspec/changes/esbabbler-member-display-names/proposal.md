# Member display names

Gap 5 of the [gap survey](../gap-survey-2026-10-25/proposal.md).

## Why

The `ManageDisplayNames` permission exists, and the server checks it. A member who holds it can set another member's room display name through the procedure the user router already exposes. No interface lets anyone use that path. The only display name UI is the self-service field on the My Profile tab, so a role can be granted a permission the app never lets it exercise.

The check on the server is also incomplete. The [RBAC design](../../specs/esbabbler/rbac/design.md) says every procedure that names a target member must check hierarchy as well as the permission, because holding a permission and outranking the target are different questions. The display-name path checks only the permission, so a holder of the bit could rename a moderator or the owner. The gap survey saw the permission check and not the missing hierarchy check, so the path needs a guard as well as a surface.

The esbabbler [display names design](../../specs/esbabbler/display-names/design.md) admits the missing surface. The room's global-name item on the roadmap is a different feature: it changes a person's name across the app, not inside one room.

## What Changes

- The server's display-name path checks hierarchy with the same guard the moderation procedures use, so a holder of `ManageDisplayNames` can set the name of a member they outrank, and no one else's.
- The member action list gains a **Display name** item, shown to a holder of the permission for a member they outrank. The item sits in the one list that the profile's menu and the member row's menu both read, so the two never disagree.
- The item opens a dialog that reuses the self-service field, so the length limit and the empty-clears rule are the ones a member already sees.

## Recommendation

Fix the guard in the same change as the surface. The surface alone would ship a path that the RBAC rule forbids, and the guard alone would leave the bit unusable. Both belong to one change because the bit's meaning is the pair: the permission says a moderator may rename, and hierarchy says whom.

Two decisions the brief left open:

- **No audit entry.** A rename is recorded in neither the moderation log nor the audit log. Adding a value to the moderation action type touches every place its design lists, and a display name is not a sanction. The rename shows in the room's own views, which is the record the feature needs. An audit entry is a follow-up for the moderation owner if the room asks for one.
- **Last write wins.** A moderator's name and a member's own name are one field, so the later save stands. The member is not notified. The name changes at once in the moderator's list and in the renamed member's, and reaches other members on their next read of the room's members, as a self-service change does.

## Capabilities

- **esbabbler/display-names** (modified): a member with `ManageDisplayNames` sets another member's display name in a room, within hierarchy.

## Impact

- The display-name path gains one check. A holder of the bit who targets a higher-ranked member now receives the unauthorized error that the moderation procedures already return.
- The member list's context menu and the profile's overflow menu gain one item, shown only where the actor may use it.
- No schema change. The room membership row already holds the display name.
