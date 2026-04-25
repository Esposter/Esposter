import { MessageIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MessageIndexedDbStoreConfiguration";
import { resetIndexedDb } from "@/services/cache/indexedDb/openIndexedDb";
import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";
import { writeIndexedDb } from "@/services/cache/indexedDb/writeIndexedDb";
import { StandardMessageEntity } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { afterEach, describe, expect, test } from "vitest";

describe(writeIndexedDb, () => {
  const message1 = new StandardMessageEntity({ partitionKey: crypto.randomUUID(), rowKey: crypto.randomUUID() });
  const message2 = new StandardMessageEntity({ partitionKey: crypto.randomUUID(), rowKey: crypto.randomUUID() });

  afterEach(async () => {
    await resetIndexedDb();
  });

  test("writes items for a given partitionKey successfully", async () => {
    expect.hasAssertions();

    const messages = [message1, message2];
    await writeIndexedDb(MessageIndexedDbStoreConfiguration, messages, message1.partitionKey);
    const result = await readIndexedDb(MessageIndexedDbStoreConfiguration, message1.partitionKey);

    expect(result).toHaveLength(2);
  });

  test("replaces existing items on re-write", async () => {
    expect.hasAssertions();

    await writeIndexedDb(MessageIndexedDbStoreConfiguration, [message1, message2], message1.partitionKey);
    await writeIndexedDb(MessageIndexedDbStoreConfiguration, [message1], message1.partitionKey);
    const result = await readIndexedDb(MessageIndexedDbStoreConfiguration, message1.partitionKey);

    expect(result).toHaveLength(1);
    expect(takeOne(result)).toStrictEqual(message1);
  });

  test("does not exceed limit from configuration", async () => {
    expect.hasAssertions();

    const { limit } = MessageIndexedDbStoreConfiguration;
    const messages = Array.from(
      { length: limit + 10 },
      (_) => new StandardMessageEntity({ partitionKey: message1.partitionKey, rowKey: crypto.randomUUID() }),
    );
    await writeIndexedDb(MessageIndexedDbStoreConfiguration, messages, message1.partitionKey);
    const result = await readIndexedDb(MessageIndexedDbStoreConfiguration, message1.partitionKey);

    expect(result).toHaveLength(limit);
  });

  test("does not affect other partitionKeys", async () => {
    expect.hasAssertions();

    await writeIndexedDb(MessageIndexedDbStoreConfiguration, [message1], message1.partitionKey);
    await writeIndexedDb(MessageIndexedDbStoreConfiguration, [message2], message2.partitionKey);

    const result1 = await readIndexedDb(MessageIndexedDbStoreConfiguration, message1.partitionKey);
    const result2 = await readIndexedDb(MessageIndexedDbStoreConfiguration, message2.partitionKey);

    expect(result1).toHaveLength(1);
    expect(result2).toHaveLength(1);
    expect(takeOne(result1)).toStrictEqual(message1);
    expect(takeOne(result2)).toStrictEqual(message2);
  });
});
