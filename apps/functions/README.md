# @esposter/functions

[![Apache-2.0 licensed][badge-license]][url-license]

Serverless Azure Functions backend for Esposter, handling asynchronous workloads triggered by Azure EventGrid events, Service Bus queues, and timers — notification delivery, webhook delivery, scheduled message jobs, and resource purging.

## Table of Contents

- 📖 [Documentation](#documentation)
- ⌨️ [Commands](#commands)
- 🔗 [Related Documentation](#related)
- ⚖️ [License](#license)

---

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://github.com/Esposter/Esposter/tree/main/openspec/specs) to level up.

### Architecture

Most functions are triggered by **Azure EventGrid** events published by the main app; the rest run on Service Bus queues or timers. `PushWebhook` is the one publicly routed HTTP trigger. Each function handles one async concern:

| Function                      | Trigger                              | Description                                                                      |
| ----------------------------- | ------------------------------------ | -------------------------------------------------------------------------------- |
| `DeleteAccount`               | EventGrid                            | Sweeps every store a deleted account is keyed to, its user row last              |
| `DeleteOrphanedProfileImage`  | EventGrid (storage system topic)     | Deletes a profile image that lands after its account is gone, on `BlobCreated`   |
| `ExportUserData`              | EventGrid                            | Builds a user's data-export archive, marking the export row failed when it fails |
| `ProcessBlobDeletion`         | EventGrid                            | Deletes blobs durably once their owning row is gone                              |
| `ProcessNotification`         | EventGrid                            | Delivers every notification — resolves recipients, writes bell rows, pushes      |
| `ProcessScheduledMessageJob`  | Service Bus (`ScheduledMessageJobs`) | Delivers `/schedule` and `/remind` messages at their due time                    |
| `ProcessWebhook`              | EventGrid                            | Posts the message a pushed webhook carried into its room, then notifies          |
| `PurgeDeletedResources`       | Timer                                | Purges recycle-bin resources past their retention window                         |
| `PurgeSurveyResources`        | EventGrid                            | One-time run removing the survey resources, started by one published event       |
| `PushWebhook`                 | HTTP (`POST webhooks/{id}/{token}`)  | Accepts inbound webhook pushes, validating the token from the url                |
| `ReconcileStorageLedgerEntry` | EventGrid (storage system topic)     | Charges a user's storage counter the blob's real size on `BlobCreated`           |
| `ReplayDeadLetterEvent`       | EventGrid                            | Replays dead-lettered events it can route, quarantining the rest                 |
| `SendTodoReminder`            | Service Bus (`TodoReminders`)        | Publishes a `TodoReminder` notification when a TodoList item comes due           |

### Flow

The two paths that chain through EventGrid — a message the app creates, and one a webhook pushes in. The Service Bus and timer triggers in the table above are entered on their own schedules, not from this chain.

```mermaid
flowchart LR
  APP["App — createMessage"] -->|"notification event"| EG["Azure EventGrid"]
  PUSH["PushWebhook"] -->|"webhook event"| EG
  EG -->|"webhook event"| PW["ProcessWebhook"]
  PW -->|"notification event"| EG
  EG -->|"notification event"| PN["ProcessNotification"]
```

## <a name="commands">⌨️ Commands</a>

Run from `apps/functions/`:

```bash
pnpm build        # compile to dist/
pnpm lint         # lint (check only)
pnpm lint:fix     # auto-fix lint
pnpm test         # vitest watch mode (coverage is run from the repo root)
pnpm typecheck    # type check
```

## <a name="related">🔗 Related Documentation</a>

- [Azure Blob Storage](https://learn.microsoft.com/azure/storage/blobs/storage-blobs-introduction)
- [Azure Event Grid](https://learn.microsoft.com/azure/event-grid/overview)
- [Azure Functions](https://learn.microsoft.com/azure/azure-functions/functions-overview)
- [Azure Service Bus](https://learn.microsoft.com/azure/service-bus-messaging/service-bus-messaging-overview)
- [Azure Table Storage](https://learn.microsoft.com/azure/storage/tables/table-storage-overview)
- [Azure Web PubSub](https://learn.microsoft.com/azure/azure-web-pubsub/overview)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [PostgreSQL](https://www.postgresql.org/docs/current/)
- [Vitest](https://vitest.dev/guide/)
- [Zod](https://zod.dev/)

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
