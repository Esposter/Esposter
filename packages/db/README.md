# @esposter/db

[![Apache-2.0 licensed][badge-license]][url-license]

It provides server-side helpers over D1 and R2, for the server environment only: a table client for D1 tables, and the R2 blob reads, writes and copies. The message, moderation, notification, resource and RBAC services built on them are shared by the app and the functions Worker.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs).

## Table of Contents

- 🧩 [Key Exports](#key-exports)
- 📝 [Usage](#usage)
- ⚖️ [License](#license)

---

## <a name="key-exports">🧩 Key Exports</a>

| Export              | Returns                                                                         |
| ------------------- | ------------------------------------------------------------------------------- |
| `StreamTableClient` | A client over one D1 table, built from a Drizzle D1 handle and the table's name |
| `getFilesBlobNames` | One flat list of every blob that each file owns                                 |
| `readJsonBlob`      | The JSON document in an R2 bucket, or `undefined` when nothing is saved yet     |

- **Server-only**: Do not import this package in browser code.
- The table client takes a Drizzle D1 handle, and `readJsonBlob` takes an `R2Bucket`. Pass each one from its Worker binding.

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
