# Esbabbler — Feature Roadmap

## Messaging

- ~~**Threads** — one-level reply chains on any message; thread indicator badge shows reply count; thread view in a side panel~~ _(Replies already simulate this; threads add a side-panel UX that fits Slack more than a Discord-style flow-in-channel experience.)_
- ~~**Edit history** — append-only Azure Table keyed by roomId/rowKey stores previous versions; "view edits" link on edited messages~~ _(Azure Table storage cost grows with every edit across all users; marginal value on a casual platform.)_
- [x] **Polls** — `/poll` slash command creates a structured message type with options and live vote counts
- ~~**Message retention** — per-room setting (e.g. 30/90/180 days); Azure Function timer prunes Table rows by createdAt~~ _(YAGNI — store everything until storage cost is actually a problem; adds complexity for a non-issue at current scale.)_
- [x] **Emoji reactions** — per-message emoji reactions; stored in a `MessageEmojiMetadataEntity` table partitioned by roomId (rowKey `messageRowKey|userId|emoji`); create/update/delete via tRPC with real-time subscriptions
- [x] **Quote replies** — reply to a specific message inline; `replyRowKey` field on `BaseMessageEntity`; reply header shown above the composer via `Message/Model/Message/Input/ReplyHeader.vue`
- [x] **Typing indicators** — ephemeral "X is typing…" via `createTyping` tRPC + subscription; 3-second auto-clear timeout; no persistent storage

## Discovery & Navigation

- ~~**Starred messages** — per-user bookmarks stored in Azure Table keyed by userId/roomId/rowKey; dedicated "Saved" view in the sidebar~~ _(Pinned messages already cover the "save this message" use case room-wide; per-user bookmarks add infra complexity for marginal gain on a casual platform.)_
- ~~**Read receipts** — store `lastSeenRowKey` per user per room in `usersToRooms`; update on room focus/scroll; compute unread count client-side (no per-message writes)~~ _(Self-satisfaction feature with limited practical value; adds background write noise without meaningfully improving the user experience.)_
- [x] **Global search / command palette** — Ctrl+K modal to jump between rooms or search messages; Ctrl+K/Cmd+K listener added to `Searcher.vue` via `useEventListener`
- [x] **Friends system** — bidirectional friend requests (Pending/Accepted/Blocked); `friendshipKey` composite unique constraint prevents duplicate A→B / B→A rows; accepted friends are the recipient pool for the "New Message" DM picker; real-time subscriptions via `useFriendSubscribables`; see [`friends.md`](friends.md)

## Room Management

- ~~**Slowmode** — per-room `minMessageIntervalMs` setting; enforce in `createMessage` using existing `RateLimiterType` patterns~~ _(Rate limiter already covers this; redundant._)
- ~~**Invite links with expiry and usage caps** — add `expiresAt` and `maxUses` columns to the existing `invites` table; enforce on join~~ _(Expiry already implemented (24 h, computed from `createdAt`); usage caps are unnecessary configuration for a casual platform.)_

## Notifications

- ~~**Keyword notification rules** — per-user rule set per room (keywords + @mentions beyond current basic mention); check on `createMessage`; publish via existing Event Grid + Web Push~~ _(Bloat feature — mention-based notifications already cover the core use case; custom keyword rules add DB complexity for marginal gain on a casual platform.)_

## Slash Commands

- ~~**`/giphy [query]`** — fetch and send a GIF via Giphy free tier; Tiptap extension triggers a picker on `/`~~ _(Requires Giphy API registration + external dependency; not purely code-based.)_
- [x] **`/roll`** — client-side RNG posts result as a message _(RNG is intentionally client-side — no need for server-side generation on a casual platform)_
- ~~**`/remind [time] [text]`** — enqueues to Azure Storage Queue; Azure Function timer posts the reminder at the given time~~ _(Requires Azure Storage Queue for reliable delivery — extra infrastructure for a niche feature.)_

## Media

- [x] **Voice messages** — record and send audio via MediaRecorder; stored in Azure Blob
- [x] **Image and file upload** — arbitrary files and images uploaded to Azure Blob via SAS URLs; images displayed inline, other files as attachment chips; `files: FileEntity[]` array on message
- [x] **Rich link previews** — server-side OG metadata fetch on `createMessage`; title, description, image, video, siteName stored as `linkPreviewResponse` on the message; rendered by `Message/Model/Message/LinkPreview/Index.vue`
- ~~**Client-side image thumbnails** — generate a 256 px JPEG preview in-browser before upload; display thumbnail in message list to save blob egress~~ _(Premature optimization — blob egress savings are negligible at casual-platform scale; not worth the canvas/JPEG encoding complexity.)_
- ~~**Custom emoji** — per-room upload of custom emoji/stickers to Azure Blob; reuses existing SAS upload flow; small emoji Azure Table for lookup~~ _(Ongoing Azure Blob storage cost per room; complex to moderate + low payoff for a casual platform.)_
- [x] **Syntax-highlighted code blocks** — `CodeBlockLowlight` extension from `@tiptap/extension-code-block-lowlight` + `lowlight` (common languages); `useCodeBlockExtension` composable added to message input; StarterKit `codeBlock: false` to avoid conflict

## Presence & Members

- [x] **User presence** — Online/Offline/Idle/DoNotDisturb status; `isConnected` flag + status message on `userStatuses` table; status dot shown via `Message/Model/Member/StatusAvatar.vue`

## Integrations

- [x] **Inbound webhooks** — token-based HTTP endpoint per room; posts as a Webhook message type
- ~~**Outbound webhooks** — register HTTP endpoints per room; on configurable events (new message, pin), enqueue to Azure Storage Queue; Azure Function posts with retry/backoff~~ _(Developer/power-user feature requiring heavy infra — Queue + retry — for a casual social platform; low ROI.)_

## PWA / Offline

- [x] **Offline message cache** — cache last N messages per room in IndexedDB (partially working: cached messages flash then disappear on offline room switch)

## Architecture Docs

- [x] **Voice Channel** — Discord-style persistent per-room drop-in audio; WebRTC mesh for small groups; full router test suite covers join/leave/mute/signal/subscribe flows; STUN hardcoded (`stun.l.google.com:19302`); add TURN entry to `ICE_SERVERS` in `services/message/voice/constants.ts` when a server is provisioned; see [`voice-channel.md`](voice-channel.md)
- [x] **Direct Messages** — private 1:1 and group DMs as `RoomType.DirectMessage`; reuses full message infrastructure; see [`direct-messages.md`](direct-messages.md)
- [x] **Friends** — bidirectional friend requests with `friendshipKey` idempotency; friends are the DM recipient pool; real-time subscriptions (`onSendFriendRequest`, `onAcceptFriendRequest`, `onDeclineFriendRequest`, `onDeleteFriend`) keep store live; `CreateDirectMessageDialog` loads friends on mount via `readFriends()`; see [`friends.md`](friends.md)
