---
title: TodoList due reminders
description: Web-push reminders when a TodoList item's due date arrives, riding the existing scheduled-job and push subsystems.
---

# TodoList due reminders

A TodoList item with a due date pushes a web-push reminder to its owner when it comes due — the first platform feature to reuse the notification infrastructure esbabbler already runs, and the thing that turns the TodoList type from a table into an actual todo product.

## How it works

Reminder delivery adds no new Azure services: the Service Bus scheduled-message pattern (already used for [scheduled messages](/docs/esbabbler/scheduled-messages)) carries the timer, and the existing [notification pipeline](/docs/architecture/notifications) carries the notification.

- **Scheduling** — after a TodoList `saveResourceContent` persists, the server reads the prior content blob and diffs due dates, enqueueing one scheduled Service Bus message per item whose `(itemId, dueAt)` is new or changed and still in the future. The diff is fire-and-forget and best-effort: a failed enqueue logs and never fails the user's save, and an unreadable prior blob degrades to "no previous content" rather than blocking the save. Diffing keeps repeated saves from piling up duplicate reminders for an unchanged due date.
- **Fire-time verification is the consistency model** — the reminder carries only `{ resourceId, itemId, dueAt }`; there is no Postgres row backing it, so the scheduled message _is_ the state. When it fires, `SendTodoReminder` re-reads the live content blob and drops the reminder if the item was deleted or re-dated (a re-dated item enqueued its own fresh message at save time). This makes stale messages harmless, so saves never have to cancel previously enqueued ones.
- **Delivery** — the handler publishes a `TodoReminder` notification and the shared pipeline does the rest ([notifications](/docs/architecture/notifications)): `『{item}』 is due` reaches the owner's bell and every device they have subscribed. Clicking it opens the resource's Items blade (`/resource-explorer/{id}/items`). TodoLists are single-owner resources, so the recipient set is just the owner — no fan-out.

```mermaid
sequenceDiagram
  participant E as Items blade
  participant S as saveResourceContent
  participant SB as Service Bus (scheduled)
  participant F as SendTodoReminder
  participant B as Content blob
  participant EG as Event Grid
  participant P as ProcessNotification

  E->>S: save items (due dates diffed against prior blob)
  S--)SB: enqueue resourceId, itemId, dueAt scheduled at dueAt (best-effort)
  Note over SB: one scheduled message per new or changed (item, dueAt)
  SB->>F: fires at dueAt
  F->>B: re-read content blob
  Note over F,B: item gone or dueAt changed drops the reminder
  F->>EG: publishNotification — TodoReminder for the owner
  EG->>P: 『item』 is due → bell row + owner's devices
```

## Data model

None in Postgres. The TodoList item already carries `dueAt` (the Items and Calendar blades render it), and the reminder is stateless — the scheduled Service Bus message holds the whole payload and the blob re-read is the truth check. The `todo-reminders` Service Bus queue is provisioned alongside the existing `scheduled-message-jobs` queue in `packages/infra`.

## Key files

| File                                                                        | Role                                                                |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `packages/app/server/services/resource/todoList/scheduleTodoReminders.ts`   | Post-save due-date diff and per-item enqueue                        |
| `packages/app/server/services/resource/ResourceAfterSaveContentMap.ts`      | Registers the diff as TodoList's after-save hook                    |
| `packages/app/server/services/resource/runAfterSaveResourceContent.ts`      | Fires the registered hook, fire-and-forget                          |
| `packages/app/server/services/resource/saveResourceContent.ts`              | The one content write that runs the hook                            |
| `packages/db/src/services/azure/serviceBus/enqueueTodoReminder.ts`          | Schedules the Service Bus message at `dueAt`                        |
| `packages/db-schema/src/models/azure/queue/TodoReminderQueueMessage.ts`     | The `{ resourceId, itemId, dueAt }` message schema                  |
| `packages/azure-functions/src/functions/sendTodoReminder.ts`                | Queue-trigger registration for `SendTodoReminder`                   |
| `packages/azure-functions/src/handlers/sendTodoReminderHandler.ts`          | Re-reads the blob, verifies the item, and publishes                 |
| `packages/azure-functions/src/services/notification/resolveNotification.ts` | Turns the published reminder into its copy, deep link and recipient |

## Notes

- At-least-once delivery: a duplicate fire re-verifies against the blob and notifies twice in the worst case — acceptable for reminders, and cheaper than a dedup table.
- A due date toggled away and back across saves re-enqueues a reminder for the same timestamp that fire-time verification cannot distinguish from the original — an accepted duplicate (one extra push). Service Bus duplicate detection would collapse it via a deterministic message id, but requires the Standard tier; the namespaces run Basic.
- Reminder timing is exactly `dueAt` in this first cut. Lead-time offsets ("remind me 1h before") are a follow-up `dueAt`-relative field, not a reason to build preference UI now.
- TodoList items have no completion state yet (`TodoListItemType` is `Todo`-only), so the fire-time check verifies existence and due-date match; a completion state, once it exists, becomes a third drop condition.
