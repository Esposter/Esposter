# Tasks

Build order. Section 1 closes the server gap before any surface reaches it, so no build of the interface is ever reachable without the guard. Section 2 is the surface, and section 3 the sweep.

## 1. Guard

- [x] 1.1 Test first, in the service's test file: a holder of `ManageDisplayNames` sets the name of a member below them and it is written, sets the name of an equal or higher member and receives the unauthorized error, and sets the name of the owner and receives the same error. A self-edit needs no permission.
      Verify: the cases fail on the current service, which writes the name for an equal or higher member, and pass once the guard is added.
- [x] 1.2 Call `assertIsManageable` from the display-name path when the target is another member, after the permission check and before the write.
      Verify: the guard is called once per request, and the service's test passes with no other change to the path.
- [x] 1.3 Test first on the router: a `targetUserId` with no display name is refused by the input rule, and a valid targeted write returns the updated row to the caller.
      Verify: the router test passes, and no other test of the input rule exists to duplicate.

## 2. Surface

- [x] 2.1 Add the display-name value to `MemberDialogType`, and a Display name item to `useMemberActionItems` shown only to a holder of the permission, for a member the holder may manage, and never for the holder's own row. Test first in the composable's test file: the item appears for a permitted holder of a lower-ranked member, and is absent for a plain member, for the owner and for the holder's own row.
      Verify: the composable test names match the spec delta's scenarios, and the item is present in both the profile menu and the row menu.
- [x] 2.2 Write `ActionDialog/DisplayName.vue` over `DisplayNameField`, with the save calling `userToRoom.updateUserToRoom` with `targetUserId`. An empty save clears the display name to the account name. Test first: a save sends the target's id and the typed name, and an empty save sends an empty name.
      Verify: the dialog test passes, and the length limit is the one the self-service field enforces.
- [x] 2.3 Mount the dialog through the member dialog host, as the kick and ban dialogs are, so it is a singleton on the members panel.
      Verify: opening the dialog from the row and from the profile mounts one dialog, and closing it leaves the caller's row showing the name the server resolved on the read-back, while other members see it on their next read.

## 3. Sweep and specs

- [x] 3.1 Rewrite the display names design's line that admits the surface is missing, and its Key files, to name the dialog and the guard. Confirm the RBAC design's member-targeting rule needs no edit.
      Verify: a search for "not wired" across `openspec/specs/esbabbler/` finds no display name sentence, and the display names Key files name the new dialog.
- [x] 3.2 At archive, move the display names capability's design to its as-built form and remove the esbabbler roadmap's mention of a moderator's rename, if one is listed.
      Verify: `openspec validate` passes with the archive, and the roadmap holds no open item for this change.
