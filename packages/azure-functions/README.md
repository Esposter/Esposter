# @esposter/azure-functions

[![Apache-2.0 licensed][badge-license]][url-license]

Serverless Azure Functions backend for Esposter. Handles asynchronous workloads triggered by Azure EventGrid events — push notifications, webhook delivery, and friend request notifications.

## Table of Contents

- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/) to level up.

### Architecture

Functions are triggered by **Azure EventGrid** events published by the main app — they are never called directly via HTTP from the client. Each function handles one async concern:

| Function                           | Trigger   | Description                                                                 |
| ---------------------------------- | --------- | --------------------------------------------------------------------------- |
| `processPushNotification`          | EventGrid | Sends web-push notifications to offline users when a new message is created |
| `processWebhook`                   | EventGrid | Delivers outgoing webhook payloads to registered endpoints                  |
| `pushWebhook`                      | EventGrid | Pushes webhook events to Azure WebPubSub for fan-out delivery               |
| `processFriendRequestNotification` | EventGrid | Notifies users of incoming friend requests                                  |

### Flow

```text
App (createMessage) → Azure EventGrid → processPushNotification
                                      → processWebhook
                                      → pushWebhook
```

### Dependencies

- `@azure/functions` — Azure Functions runtime
- `@azure/eventgrid` — EventGrid event parsing
- `@azure/web-pubsub` — WebPubSub real-time delivery
- `@esposter/db` + `@esposter/db-schema` — database access
- `web-push` — RFC 8030 web-push delivery

### Commands

Run from `packages/azure-functions/`:

```bash
pnpm build        # compile to dist/
pnpm test         # vitest watch mode (coverage is run from the repo root)
pnpm lint:fix     # auto-fix lint
pnpm typecheck    # type check
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
