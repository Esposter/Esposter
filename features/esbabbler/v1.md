# Esbabbler — Feature Roadmap

## Messaging

- [ ] **Threads** — one-level reply chains on any message; thread indicator badge shows reply count; thread view in a side panel
- [ ] **Edit history** — append-only Azure Table keyed by roomId/rowKey stores previous versions; "view edits" link on edited messages
- [ ] **Polls** — `/poll` slash command creates a structured message type with options and live vote counts
- [ ] **Message retention** — per-room setting (e.g. 30/90/180 days); Azure Function timer prunes Table rows by createdAt

## Discovery & Navigation

- [ ] **Starred messages** — per-user bookmarks stored in Azure Table keyed by userId/roomId/rowKey; dedicated "Saved" view in the sidebar
- [ ] **Read receipts** — store `lastSeenRowKey` per user per room in `usersToRooms`; update on room focus/scroll; compute unread count client-side (no per-message writes)
- [ ] **Global search / command palette** — Ctrl+K modal to jump between rooms or search messages; builds on existing `searchMessages`

## Room Management

- [ ] **Slowmode** — per-room `minMessageIntervalMs` setting; enforce in `createMessage` using existing `RateLimiterType` patterns
- [ ] **Invite links with expiry and usage caps** — add `expiresAt` and `maxUses` columns to the existing `invites` table; enforce on join

## Notifications

- [ ] **Keyword notification rules** — per-user rule set per room (keywords + @mentions beyond current basic mention); check on `createMessage`; publish via existing Event Grid + Web Push

## Slash Commands

- [ ] **`/giphy [query]`** — fetch and send a GIF via Giphy free tier; Tiptap extension triggers a picker on `/`
- [ ] **`/roll`** — server-side RNG posts result as a message
- [ ] **`/remind [time] [text]`** — enqueues to Azure Storage Queue; Azure Function timer posts the reminder at the given time

## Media

- [x] **Voice messages** — record and send audio via MediaRecorder; stored in Azure Blob
- [ ] **Client-side image thumbnails** — generate a 256 px JPEG preview in-browser before upload; display thumbnail in message list to save blob egress
- [ ] **Custom emoji** — per-room upload of custom emoji/stickers to Azure Blob; reuses existing SAS upload flow; small emoji Azure Table for lookup

## Integrations

- [x] **Inbound webhooks** — token-based HTTP endpoint per room; posts as a Webhook message type
- [ ] **Outbound webhooks** — register HTTP endpoints per room; on configurable events (new message, pin), enqueue to Azure Storage Queue; Azure Function posts with retry/backoff

## PWA / Offline

- [ ] **Offline message cache** — cache last N messages per room in IndexedDB; pre-cache avatars and custom emoji; background sync on reconnect
