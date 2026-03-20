import { resetMessageCacheDatabase } from "@/services/message/cache/openMessageCacheDatabase";
import { readCachedMessages } from "@/services/message/cache/readCachedMessages";
import { writeCachedMessages } from "@/services/message/cache/writeCachedMessages";
import { StandardMessageEntity } from "@esposter/db-schema";
import { afterEach, describe, expect, test } from "vitest";

describe(readCachedMessages, () => {
  const partitionKey = "partitionKey";
  const rowKey = "rowKey";
  const message = "message";
  const userId = crypto.randomUUID();

  afterEach(async () => {
    await resetMessageCacheDatabase();
    const databases = await indexedDB.databases();
    for (const database of databases) if (database.name) indexedDB.deleteDatabase(database.name);
  });

  test("returns empty array when no cached messages", async () => {
    expect.hasAssertions();

    const messages = await readCachedMessages(partitionKey);

    expect(messages).toHaveLength(0);
  });

  test("returns cached messages for the correct room", async () => {
    expect.hasAssertions();

    await writeCachedMessages(partitionKey, [new StandardMessageEntity({ message, partitionKey, rowKey, userId })]);
    const messages = await readCachedMessages(partitionKey);

    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({ partitionKey, rowKey });
  });

  test("does not return messages from a different room", async () => {
    expect.hasAssertions();

    await writeCachedMessages(partitionKey, [new StandardMessageEntity({ message, partitionKey, rowKey, userId })]);
    const messages = await readCachedMessages(" ");

    expect(messages).toHaveLength(0);
  });
});
