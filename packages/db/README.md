# @esposter/db

[![Apache-2.0 licensed][badge-license]][url-license]

Azure client factories and the server-side domain services built on them — server environment only. Covers Azure Table Storage, Blob Storage, Queue Storage, Service Bus, AI Search and Web PubSub, plus the message, moderation, resource and RBAC services shared by the app and the Azure Functions.

## Table of Contents

- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/api/modules/_esposter_db.html) to level up.

### Client Factories

Every Azure client is reached through a `get*` factory taking the connection string; the app wraps each in a
`use*` composable that supplies it from runtime config.

| Export                      | Returns                                                           |
| --------------------------- | ----------------------------------------------------------------- |
| `getTableClient`            | A `TableClient` typed by `AzureTableEntityMap`, table provisioned |
| `getContainerClient`        | A `ContainerClient`, container created and its properties synced  |
| `getQueueClient`            | A `QueueClient` for an `AzureQueue`                               |
| `getServiceBusSender`       | A cached `ServiceBusSender` for an `AzureQueue`                   |
| `getWebPubSubServiceClient` | A `WebPubSubServiceClient` for an `AzureWebPubSubHub`             |

`getTableClient` and `getContainerClient` provision on first use and memoize the promise, so the create call
is paid once per process rather than once per request (`createProvisionedClientCache`).

Around them sit the domain services: message creation and mention targeting, moderation logging and automod,
resource purging, blob SAS minting and cloning, Azure Table entity marshalling (`serializeEntity`,
`deserializeEntity`) and the RBAC reads `checkHasPermission` / `getPermissions`. The filter vocabulary those
services build their queries from — clause serialization, key casing, service limits — is `@esposter/azure`.

### Architecture Notes

- **Server-only**: this package must not be imported in browser code.
- Depends on `@esposter/db-schema` for Drizzle relation and schema definitions, and its Azure enums and
  constants — this package never re-declares them.
- Every factory here takes a **connection string**, in the app and in the Azure Functions alike — the app is hosted outside Azure and has no managed identity to use, and the Functions' own identity covers the host's storage bindings rather than the clients this package builds. Moving off keys is an app-side migration, tracked as a proposal on the infra roadmap.

### Commands

Run from `packages/db/`:

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
