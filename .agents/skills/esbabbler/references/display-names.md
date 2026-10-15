# Display Names

Read when a messaging procedure or screen needs to show a room member's name.

`displayName` is the room-specific name stored on the membership row. A procedure returns it on the screen-specific response; the frontend renders it directly. When that screen also needs the account's original name, the same response includes `name` separately. The editable setting may call it “Nickname” in the UI, while code, storage, and API fields use `displayName`.

Do not maintain a frontend room-name overlay or `getMemberName`/`getDisplayName` wrappers to derive a room member's display name. A procedure whose screen needs that value returns it. Account-only screens use the account `name`.
