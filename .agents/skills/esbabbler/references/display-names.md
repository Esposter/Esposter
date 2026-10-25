# Display Names

Read when a messaging procedure or screen needs to show a room member's name.

`displayName` is the room-specific name stored on the membership row. A procedure returns it on the screen-specific response; the frontend renders it directly. When that screen also needs the account's original name, the same response includes `name` separately. The editable setting is labelled “Display name” in the UI, and code, storage, and API fields use `displayName` too.

Do not maintain a frontend room-name overlay or wrappers that derive a room member's display name. A procedure whose screen needs that value returns it. Account-only screens use the account `name`. A list that names a member by display name follows the display name rule in `openspec/specs/esbabbler/display-names/design.md`.

A row that carries only a bare user id and no membership of its own (an audit actor, a moderation note's author) is given its name by the procedure that returns it: the membership row for that user in that room, falling back to the account name when the user has no membership there (`getRoomDisplayNameMap`). A ban's banner is named by the join in `readBans` that reads the banner's membership row.

A screen that names a room member by id reads the member rows its room's reads returned. `useUserStore` keeps them per room, as returned, and the screen renders their `displayName`; nothing builds a name from several sources. `room.readMembersByIds` returns members only, so a user who has left the room is named by the account where a row needs a name. A display name change arrives on `onUpdateUserToRoom`, which re-reads that member's row.
