# @esposter/db

[![Apache-2.0 licensed][badge-license]][url-license]

It provides Azure client factories for Table Storage, Blob Storage, Service Bus and AI Search, for the server environment only. The server-side domain services built on them include the message, moderation, resource and RBAC services, which the app and the Azure Functions share.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs).

## Table of Contents

- 🧩 [Key Exports](#key-exports)
- 📝 [Usage](#usage)
- ⚖️ [License](#license)

---

## <a name="key-exports">🧩 Key Exports</a>

| Export                | Returns                                                           |
| --------------------- | ----------------------------------------------------------------- |
| `getContainerClient`  | A `ContainerClient`, container created and its properties synced  |
| `getServiceBusSender` | A cached `ServiceBusSender` for an `AzureQueue`                   |
| `getTableClient`      | A `TableClient` typed by `AzureTableEntityMap`, table provisioned |

- **Server-only**: Do not import this package in browser code.
- Every factory takes a **connection string**.

## <a name="usage">📝 Usage</a>

```ts
import { getFilesBlobNames } from "@esposter/db";

// One flat list of every blob that each file owns. A delete publishes this list.
const blobNames = getFilesBlobNames("prefix", [{ filename: "photo.png", id: "file-id" }]);
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
