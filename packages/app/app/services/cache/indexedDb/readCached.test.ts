import { MessageCacheStoreConfiguration } from "@/services/cache/indexedDb/configurations/MessageCacheStoreConfiguration";
import { readCached } from "@/services/cache/indexedDb/readCached";
import { resetCacheDatabase } from "@/services/cache/indexedDb/openCacheDatabase";
import { writeCached } from "@/services/cache/indexedDb/writeCached";
import { getMockSession } from "@@/server/trpc/context.test";
import { StandardMessageEntity } from "@esposter/db-schema";
import { afterEach, describe, expect, test } from "vitest";

describe(readCached, () => {
  const partitionKey = "partitionKey";
  const rowKey = "rowKey";
  const message = "message";

  afterEach(async () => {
    await resetCacheDatabase();
    const databases = await indexedDB.databases();
    await Promise.all(
      databases
        .filter((database): database is IDBDatabaseInfo & { name: string } => database.name !== undefined)
        .map(
          (database) =>
            new Promise<void>((resolve, reject) => {
              const request = indexedDB.deleteDatabase(database.name);
              request.onsuccess = () => {
                resolve();
              };
              request.onerror = () => {
                reject(request.error ?? new Error("Failed to delete database"));
              };
              request.onblocked = () => {
                resolve();
              };
            }),
        ),
    );
  });

  test("returns empty array when no cached items", async () => {
    expect.hasAssertions();

    const items = await readCached(MessageCacheStoreConfiguration, partitionKey);

    expect(items).toHaveLength(0);
  });

  test("returns cached items for the correct partition", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    await writeCached(
      MessageCacheStoreConfiguration,
      [new StandardMessageEntity({ message, partitionKey, rowKey, userId })],
      partitionKey,
    );
    const items = await readCached(MessageCacheStoreConfiguration, partitionKey);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ partitionKey, rowKey });
  });

  test("does not return items from a different partition", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    await writeCached(
      MessageCacheStoreConfiguration,
      [new StandardMessageEntity({ message, partitionKey, rowKey, userId })],
      partitionKey,
    );
    const items = await readCached(MessageCacheStoreConfiguration, " ");

    expect(items).toHaveLength(0);
  });

  test("respects the store limit", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const limit = MessageCacheStoreConfiguration.limit;
    const messages = Array.from(
      { length: limit + 10 },
      (_, index) => new StandardMessageEntity({ message, partitionKey, rowKey: `${rowKey}-${index}`, userId }),
    );
    await writeCached(MessageCacheStoreConfiguration, messages, partitionKey);
    const items = await readCached(MessageCacheStoreConfiguration, partitionKey);

    expect(items).toHaveLength(limit);
  });
});
