# @esposter/db-mock

[![Apache-2.0 licensed][badge-license]][url-license]

It provides in-memory D1, R2 and Queues for tests, for the server environment only. It starts a [Miniflare](https://github.com/cloudflare/workers-sdk/tree/main/packages/miniflare) instance with the Esposter databases, applies their migrations and returns the Drizzle handle and the bindings, so no running Cloudflare account is needed.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs).

## Table of Contents

- 🧩 [Key Exports](#key-exports)
- 📝 [Usage](#usage)
- ⚖️ [License](#license)

---

## <a name="key-exports">🧩 Key Exports</a>

| Export         | Kind     | Purpose                                                                                                                                          |
| -------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `createMockDb` | function | Starts the file's Miniflare instance, applies the database's migrations and returns a `MockDatabase`. Calls in one file share the instance       |
| `env`          | const    | The `cloudflare:workers` stand-in. `createMockDb` copies the instance's bindings into it, so code reached through a test reads the same bindings |

The Workers test doubles are the `@esposter/db-mock/workers` entry, not the main one. Their types are the Workers globals, which only the packages that load the Workers types have, so the main entry stays free of them:

| Export                           | Kind     | Purpose                                                                                                                                              |
| -------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `openMockBuckets`                | function | Opens the R2 buckets a suite touches in one Miniflare instance. `clearMockBuckets` empties them between tests and `disposeMockBuckets` disposes them |
| `getBucket`                      | function | The R2 bucket a suite opened for a storage bucket, as the Worker binding would read it. Throws when the suite never opened it                        |
| `getJobQueue`                    | function | A job queue double that records each message sent to it in `MockJobQueueDatabase`, which the main entry exports                                      |
| `getRoomObject`, `getUserObject` | function | A room or person object stub that records each RPC in `roomObjectCalls` or `userObjectCalls` and answers from the scripted replies                   |
| `createUser`                     | function | A user row for a suite that seeds one                                                                                                                |
| `readWranglerConfiguration`      | function | A Worker's `wrangler.jsonc` as an object, read through the trailing commas the formatter keeps                                                       |

`MockDatabase` has `db` (the core database as a Drizzle handle), `coreDatabase` (its D1 binding), `getBucket(bucket)`, `getQueue(job)`, `reset()` and `dispose()`.

## <a name="usage">📝 Usage</a>

`@esposter/db-mock` is a `devDependency`. Import it only in test files. The Vitest configuration of an app that reads `cloudflare:workers` aliases that module to this package:

```ts
import { createMockDb } from "@esposter/db-mock";

let mockDatabase: MockDatabase;

beforeAll(async () => {
  mockDatabase = await createMockDb();
});

afterAll(async () => {
  await mockDatabase.dispose();
});

beforeEach(async () => {
  await mockDatabase.reset();
});
```

`reset` empties every table of both databases, the full-text tables included, and every bucket. Queues cannot be emptied, since a queue producer has no consumer in the mock.

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
