# @esposter/db

[![Apache-2.0 licensed][badge-license]][url-license]

Azure client factories and the server-side domain services built on them, server environment only, covering Azure Table Storage, Blob Storage, Service Bus and AI Search, plus the message, moderation, resource and RBAC services shared by the app and the Azure Functions.

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

- **Server-only**: this package must not be imported in browser code.
- Every factory takes a **connection string**.

## <a name="usage">📝 Usage</a>

```ts
import { getFilesBlobNames } from "@esposter/db";

// Every blob each file owns, flattened into the one list a delete publishes
const blobNames = getFilesBlobNames("prefix", [{ filename: "photo.png", id: "file-id" }]);
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=038758
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
