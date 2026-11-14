# Display Names

Read when a messaging procedure or screen needs to show a room member's name.

`displayName` is the room-specific name stored on the membership row. A procedure returns it on the screen-specific response; the frontend renders it directly. When that screen also needs the account's original name, the same response includes `name` separately. The editable setting is labelled “Display name” in the UI, and code, storage, and API fields use `displayName` too.

Do not maintain a frontend room-name overlay or wrappers that derive a room member's display name. A procedure whose screen needs that value returns it. Account-only screens use the account `name`. A list that names a member by display name follows the display name rule in `openspec/specs/esbabbler/display-names/design.md`.

A row that carries only a bare user id and no membership of its own (an audit actor, a moderation note's author) is given its name by the procedure that returns it: the membership row for that user in that room, falling back to the account name when the user has no membership there (`getRoomDisplayNameMap`). A ban's banner is named by the join in `readBans` that reads the banner's membership row.

A screen that names a user by id reads the rows its room's reads returned. `useUserStore` keeps a room's members per room, as returned, and the screen renders their `displayName`; a user who has left the room is not a member of it, so their row is kept by account only and named by their account name. Nothing builds a name from several sources. `room.readUsersByIds` returns a row for every id that has an account, a user who has left the room included: their `displayName` is their account name and `isMember` is false, so a message whose author has left is still named. An id with no account returns no row, and the screen draws that author under the placeholder. A display name change arrives as an `updateUserToRoom` `UserEvent` on the person's socket, and the handler `useUserToRoomSubscribables` registers re-reads that member's row.
