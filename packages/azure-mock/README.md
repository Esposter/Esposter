# azure-mock

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

It provides mock Azure service classes for local development and testing. They are in-memory implementations of the Azure Table Storage, Blob Storage, Service Bus and EventGrid clients, and they mirror the real Azure SDK interfaces.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🧩 [Key Exports](#key-exports)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

Install the package and its Azure peer packages as dev dependencies:

```bash
pnpm i -D azure-mock @azure/core-http-compat @azure/core-rest-pipeline @azure/data-tables @azure/eventgrid @azure/search-documents @azure/storage-blob @azure/storage-queue
```

### Usage

```ts
import { MockTableClient } from "azure-mock";

const mockTableClient = new MockTableClient("", "tableName");

await mockTableClient.upsertEntity({ partitionKey: "pk", rowKey: "rk", value: 42 });
const entity = await mockTableClient.getEntity("pk", "rk");
```

Replace each real Azure client with its mock equivalent. Make the replacement in your test setup or in your local `.env` configuration.

## <a name="key-exports">🧩 Key Exports</a>

| Class                          | Azure Equivalent           | Description                                                                                |
| ------------------------------ | -------------------------- | ------------------------------------------------------------------------------------------ |
| `MockBlobBatchClient`          | `BlobBatchClient`          | In-memory batched blob deletion                                                            |
| `MockBlobClient`               | `BlobClient`               | In-memory blob read, copy and delete                                                       |
| `MockBlockBlobClient`          | `BlockBlobClient`          | In-memory block blob upload and download                                                   |
| `MockContainerClient`          | `ContainerClient`          | In-memory blob container, listing and paging                                               |
| `MockEventGridPublisherClient` | `EventGridPublisherClient` | In-memory EventGrid publisher                                                              |
| `MockQueueClient`              | `QueueClient`              | In-memory Azure Storage Queue                                                              |
| `MockSearchClient`             | `SearchClient`             | In-memory Azure AI Search index                                                            |
| `MockTableClient`              | `TableClient`              | In-memory Azure Table Storage                                                              |
| `MockWebPubSubServiceClient`   | `WebPubSubServiceClient`   | In-memory group membership: `group().addUser` and `removeUser`; `sendToAll` reaches nobody |

Each client stores its state in an exported `Mock*Database` map, such as `MockTableDatabase` or `MockContainerDatabase`. To reset a test, clear the map that the test seeded.

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/azure-mock/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/azure-mock/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/azure-mock/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/azure-mock.svg
