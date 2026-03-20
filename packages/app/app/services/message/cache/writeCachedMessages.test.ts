import { MESSAGE_CACHE_LIMIT } from "@/services/message/cache/constants";
import { readCachedMessages } from "@/services/message/cache/readCachedMessages";
import { writeCachedMessages } from "@/services/message/cache/writeCachedMessages";
import { StandardMessageEntity } from "@esposter/db-schema";
import { afterEach, describe, expect, test } from "vitest";

describe(writeCachedMessages, () => {
  const partitionKey = "partitionKey";
  const rowKey = "rowKey";
  const message = "message";
  const userId = crypto.randomUUID();

  afterEach(async () => {
    const databases = await indexedDB.databases();
    for (const database of databases) if (database.name) indexedDB.deleteDatabase(database.name);
  });

  test("writes and reads back messages", async () => {
    expect.hasAssertions();

    await writeCachedMessages(partitionKey, [new StandardMessageEntity({ message, partitionKey, rowKey, userId })]);
    const messages = await readCachedMessages(partitionKey);

    expect(messages).toHaveLength(1);
  });

  test("replaces existing messages for the same room", async () => {
    expect.hasAssertions();

    const message1 = new StandardMessageEntity({ message, partitionKey, rowKey: "0", userId });
    const message2 = new StandardMessageEntity({ message: " ", partitionKey, rowKey: "1", userId });
    await writeCachedMessages(partitionKey, [message1]);
    await writeCachedMessages(partitionKey, [message2]);
    const messages = await readCachedMessages(partitionKey);

    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({ message: " ", rowKey: "1" });
  });

  test("filters out loading messages", async () => {
    expect.hasAssertions();

    const normalMessage = new StandardMessageEntity({ message, partitionKey, rowKey, userId });
    const loadingMessage = new StandardMessageEntity({
      isLoading: true,
      message: " ",
      partitionKey,
      rowKey,
      userId,
    });
    await writeCachedMessages(partitionKey, [normalMessage, loadingMessage]);
    const messages = await readCachedMessages(partitionKey);

    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({ message });
  });

  test("trims to MESSAGE_CACHE_LIMIT", async () => {
    expect.hasAssertions();

    const messages = Array.from(
      { length: MESSAGE_CACHE_LIMIT + 10 },
      (_, index) => new StandardMessageEntity({ message, partitionKey, rowKey: String(index), userId }),
    );
    await writeCachedMessages(partitionKey, messages);
    const cachedMessages = await readCachedMessages(partitionKey);

    expect(cachedMessages).toHaveLength(MESSAGE_CACHE_LIMIT);
  });
});
