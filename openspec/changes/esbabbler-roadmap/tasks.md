# Esbabbler — Roadmap

Prioritized top-down. Every item links a full proposal; the specs are the plan, this is the index. Grep [deferred](../../deferred/esbabbler/) + [rejected](../../rejected/esbabbler/) before adding anything.

## Next

- [ ] [Nickname global-name subtitle](../../specs/esbabbler/nicknames/design.md) — a member's real account name under their nickname wherever the two differ: the member list, the settings members panel and the @-mention list
- [ ] [Room member names read as returned](../../specs/esbabbler/nicknames/design.md) — decide whether call-site account-name fallbacks (`?? user.name`) are allowed under the display-names reference; then delete the `getRoomMemberName` wrapper and inline `getRoomMemberMap(roomId)?.get(userId)?.displayName` at its ten call sites (ListItemHoverCard, UserListItem, Invite/Row, Role List, MemberEditor, useCallParticipantTiles, useCallRoomParticipantMap, useCreator, useRoomPlaceholder, useMessageHtml), and sweep `emoji/design.md`, which still names the wrapper; the wrapper's definition and its export in `apps/web/app/store/message/user/index.ts` go with it, and the comment above them names no wrapper. The nicknames design still names `getDisplayName`, which no longer exists, and needs the same rewrite.
