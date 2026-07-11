---
title: Audit log filters
description: Proposal — filter the moderation audit log by action type, actor, and target.
---

# Audit Log Filters

Filter controls on the room-settings Audit Log tab: by `AdminActionType`, by actor, and by target user — Discord's audit-log filter bar.

## Scope

**Today:** `readModerationLog` returns the room's full log newest-first with cursor pagination; the tab renders it unfiltered ([/docs/esbabbler/moderation](/docs/esbabbler/moderation)).

**This adds:** optional filter inputs on the procedure and a filter bar UI. Azure Table can only filter server-side on key/simple properties, so filtering happens **server-side post-query per page**: the procedure keeps paging the partition until it fills the requested page size with matching rows (bounded by a max-scanned-rows constant to keep worst-case latency flat).

## Procedures

`readModerationLog({ roomId, cursor, type?, actorId?, targetId? })` — same auth (`ManageRoom`), new optional filters. Response unchanged (rows + next cursor); the cursor encodes the underlying Table continuation so filtered pagination stays stateless.

## UI

Filter bar above the log list: action-type select (icon + label from the existing maps in `app/services/message/moderation/`), actor and target member autocompletes (reusing the member list source). Empty state distinguishes "no log entries" from "no matches".

## Key files

| File                                                                         | Change                    |
| :--------------------------------------------------------------------------- | :------------------------ |
| `packages/app/server/trpc/routers/message/moderation.ts`                     | filter params + scan loop |
| `packages/app/app/components/Message/Model/Room/Settings/` (audit log panel) | filter bar                |

## Notes

If rooms ever need cross-partition or high-cardinality log querying, that is an Azure AI Search index question — out of scope here (the message index precedent exists if it comes up).
