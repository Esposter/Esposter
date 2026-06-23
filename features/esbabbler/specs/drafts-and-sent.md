# Esbabbler — Drafts & Sent

Route `/messages/draftsandsent`: a cross-room view of unsent drafts, scheduled jobs, and sent messages.

## Status

Client-side draft consolidation, server-backed scheduled-job listing, and Search-backed sent-message consolidation are implemented. Sent messages reuse the existing Azure AI Search messages index as the cross-room read model; Azure Table Storage remains the source of truth for message writes. **Remaining: scheduled-jobs listing/cancel UI polish.**

## Tabs

| Tab       | Source                            | Ordering                                                               | Status      |
| --------- | --------------------------------- | ---------------------------------------------------------------------- | ----------- |
| Drafts    | Local draft storage keyed by room | Draft update time, falling back to room updated time for legacy drafts | Implemented |
| Scheduled | `scheduledMessageJobsInMessage`   | `runAt ASC`, grouped by Today/Yesterday/date                           | Implemented |
| Sent      | Azure AI Search messages index    | Sent time descending, grouped by Today/Yesterday/date                  | Implemented |

## Sidebar

- `Drafts & sent` is a top-level message sidebar item.
- Draft count uses `mdi-pencil` immediately followed by the number; scheduled count uses `mdi-clock-outline` immediately followed by the number.
- Room list items with drafts show a right-side `mdi-pencil` indicator and bold the room name instead of appending `- Draft`.

## Row Actions

- Draft rows: hover action bar — delete draft, edit draft, schedule message, send message. Delete opens the shared delete confirmation dialog.
- Scheduled rows: hover action bar — edit scheduled message, reschedule message, send message, more. More menu — cancel schedule, save to drafts, delete message. Delete opens the shared delete confirmation dialog.

## Sent-Message Backend

1. `message.readMySentMessages({ offset, limit })` queries the messages Search index with `userId` and non-deleted filters, ordered by `createdAt DESC`.
2. Returns total count, offset pagination metadata, deserialized message entities, and room metadata per row.
3. The client groups rows by Today/Yesterday/date and links each row back to its source room/message.

See [scheduled-messages.md](scheduled-messages.md) for the scheduled-job data model and worker.
