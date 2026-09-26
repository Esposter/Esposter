# Display Names

Read when a surface renders a member's name, or only holds a member id.

All member name display goes through `getDisplayName(user, roomId)` from `useUserToRoomStore`. Never read `user.name` / `member.name` directly in a room context.

```ts
// respects room nickname, falls back to global name — never bare member.name
const displayName = computed(() => getDisplayName(member, room.id));
```

When you only have a member **id** (an actor/target id from a moderation log or note, possibly no longer in the loaded member list), use `getMemberName(userId)` from `useMemberStore` — it finds the member, resolves through `getDisplayName` (current room), and falls back to the raw id. Never rebuild a local `computed(() => new Map(members.value.map(({ id, name }) => [id, name])))` + `?? userId` lookup — that plain-`name` map both duplicates this primitive and bypasses nickname resolution.

The rule has **no room-scoped exceptions** — a surface that renders a member's name inside a room resolves it, including ones that read like a global profile. The profile card is the standing example: it opens over a room, so `Message/Model/User/ProfileCard/Index.vue` resolves through `getDisplayName(user, currentRoomId.value)` and the card shows the nickname, matching the message header that opened it. A surface that genuinely has no room (account settings, the global user menu) reads `user.name` directly.

Where the plumbing is not obvious:

| Location                                        | How                                                                                                                                                                                      |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mention labels and custom emoji in message body | `useMessageHtml(() => message.message, () => message.partitionKey)` — both arguments are getters, and the room is the message's partition key                                            |
| Profile card                                    | `Message/Model/User/ProfileCard/Index.vue` — `computed(() => getDisplayName(user, currentRoomId.value))`, the room coming from the route rather than a prop                              |
| Push notification title                         | `apps/functions/src/services/notification/getMessageNotificationAuthor.ts` resolves the sender's nickname once, in the Function, so the request path a member waits on never pays for it |

## `||` not `??` for nickname fallback

Nicknames are `text().notNull().default("")`. Empty string `""` is falsy — use `||` to fall back to the global name:

```ts
// || (not ??) — empty-string nickname is falsy, so fall back to global name
getUserToRoomMap(roomId)?.get(user.id)?.nickname || user.name;
```
