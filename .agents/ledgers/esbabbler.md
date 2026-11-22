# Esbabbler

The messaging module's own rules — Discord parity, display names through the one resolver, `MessageTypeOperationPermissionMap`, and the rest of the `esbabbler` skill.

| Unit                                                                         | Notes                                              |
| ---------------------------------------------------------------------------- | -------------------------------------------------- |
| `apps/web/server/services/message` — `moderation`, `thread`, `file`, `emoji` | the `call` folder is the `esbabbler-call` ledger's |

Notes on a tree several units share:

- `apps/web/app/components/Message/Content`, `Message/LeftSideBar`: calls are the `esbabbler-call` ledger's
- `apps/web/app/store/message/room`, chunk 1 of 2: dialog.ts, directMessage.test.ts, directMessage.ts, emoji.test.ts, emoji.ts, emojiDialog.ts, index.test.ts, index.ts, invite.test.ts, invite.ts, realtime.test.ts, realtime.ts, role.test.ts, role.ts, roleDialog.ts, roomInvite.test.ts: the room `call` folder is the `esbabbler-call` ledger's
- `apps/web/app/store/message/room`, chunk 2 of 2: roomInvite.ts, roomInviteDialog.ts, search.ts, userToRoom.test.ts, userToRoom.ts, webhook.test.ts, webhook.ts, webhookDialog.test.ts, webhookDialog.ts: the room `call` folder is the `esbabbler-call` ledger's
- `apps/web/app/composables/message/room`, `app/composables/message/search`, `app/composables/message/shared`: the room `call` folder is the `esbabbler-call` ledger's
- `apps/web/app/services/message/room`: the room `call` folder is the `esbabbler-call` ledger's
