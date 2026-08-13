# azure-mock

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

Mock Azure service classes for local development and testing. Provides in-memory implementations of Azure Table Storage, Blob Storage, Service Bus, and EventGrid clients that mirror the real Azure SDK interfaces.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i -D azure-mock @azure/core-http-compat @azure/core-rest-pipeline @azure/data-tables @azure/eventgrid @azure/service-bus @azure/storage-blob
```

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/api/modules/azure-mock.html) to level up.

### Available Mocks

| Class                          | Azure Equivalent           | Description                                  |
| ------------------------------ | -------------------------- | -------------------------------------------- |
| `MockTableClient`              | `TableClient`              | In-memory Azure Table Storage                |
| `MockContainerClient`          | `ContainerClient`          | In-memory blob container, listing and paging |
| `MockBlobClient`               | `BlobClient`               | In-memory blob read, copy and delete         |
| `MockBlockBlobClient`          | `BlockBlobClient`          | In-memory block blob upload and download     |
| `MockBlobBatchClient`          | `BlobBatchClient`          | In-memory batched blob deletion              |
| `MockSearchClient`             | `SearchClient`             | In-memory Azure AI Search index              |
| `MockQueueClient`              | `QueueClient`              | In-memory Azure Storage Queue                |
| `MockServiceBusSender`         | `ServiceBusSender`         | In-memory Azure Service Bus                  |
| `MockWebPubSubServiceClient`   | `WebPubSubServiceClient`   | In-memory Azure Web PubSub                   |
| `MockEventGridPublisherClient` | `EventGridPublisherClient` | In-memory EventGrid publisher                |

Each client's state lives in an exported `Mock*Database` map (`MockTableDatabase`, `MockContainerDatabase`, …), so a test resets by clearing the one it seeded.

### Usage

```ts
import { MockTableClient } from "azure-mock";

const mockTableClient = new MockTableClient("", "tableName");

await mockTableClient.upsertEntity({ partitionKey: "pk", rowKey: "rk", value: 42 });
const entity = await mockTableClient.getEntity("pk", "rk");
```

Replace real Azure clients with their mock equivalents by swapping them in your test setup or local `.env` configuration.

### Commands

Run from `packages/azure-mock/`:

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
[badge-npm-version]: https://img.shields.io/npm/v/azure-mock/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/azure-mock/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/azure-mock/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/azure-mock.svg
