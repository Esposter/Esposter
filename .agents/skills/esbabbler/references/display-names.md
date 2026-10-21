# Display Names

Read when a messaging procedure or screen needs to show a room member's name.

`displayName` is the room-specific name stored on the membership row. A procedure returns it on the screen-specific response; the frontend renders it directly. When that screen also needs the account's original name, the same response includes `name` separately. The editable setting may call it “Nickname” in the UI, while code, storage, and API fields use `displayName`.

Do not maintain a frontend room-name overlay or `getMemberName`/`getDisplayName` wrappers to derive a room member's display name. A procedure whose screen needs that value returns it. Account-only screens use the account `name`.

A row that carries only a bare user id and no membership of its own (an audit actor, a moderation note's author, a ban's banner, a reactor) is given its name by the procedure that returns it: the membership row for that user in that room, falling back to the account name when the user has no membership there (`getRoomDisplayNameMap`).

A screen that names a room member by id reads the member rows its room's reads returned. `useUserStore` keeps them per room, as returned, and the screen renders their `displayName`; nothing builds a name from several sources. `room.readMembersByIds` returns members only, so a user who has left the room is named by the account where a row needs a name. A nickname change arrives on `onUpdateUserToRoom`, which re-reads that member's row.
