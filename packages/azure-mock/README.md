# azure-mock

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

Mock Azure service classes for local development and testing. Provides in-memory implementations of Azure Table Storage, Blob Storage, Queue Storage, and EventGrid clients that mirror the real Azure SDK interfaces.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i -D azure-mock
```

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/modules/azure-mock.html) to level up.

### Available Mocks

| Class                          | Azure Equivalent           | Description                   |
| ------------------------------ | -------------------------- | ----------------------------- |
| `MockTableClient`              | `TableClient`              | In-memory Azure Table Storage |
| `MockBlobServiceClient`        | `BlobServiceClient`        | In-memory Azure Blob Storage  |
| `MockQueueClient`              | `QueueClient`              | In-memory Azure Queue Storage |
| `MockEventGridPublisherClient` | `EventGridPublisherClient` | No-op EventGrid publisher     |

### Usage

```ts
import { MockTableClient } from "azure-mock";

const mockTableClient = new MockTableClient("", "tableName");

await mockTableClient.upsertEntity({ partitionKey: "pk", rowKey: "rk", value: 42 });
const entity = await mockTableClient.getEntity("pk", "rk");
```

Replace real Azure clients with their mock equivalents by swapping them in your test setup or local `.env` configuration.

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/azure-mock/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/azure-mock/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/azure-mock/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/azure-mock.svg
