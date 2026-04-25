import { MessageIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MessageIndexedDbStoreConfiguration";
import { resetIndexedDb } from "@/services/cache/indexedDb/openIndexedDb";
import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";
import { writeIndexedDb } from "@/services/cache/indexedDb/writeIndexedDb";
import { StandardMessageEntity } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { beforeEach, describe, expect, test } from "vitest";

describe(readIndexedDb, () => {
  const message1 = new StandardMessageEntity({ partitionKey: crypto.randomUUID(), rowKey: crypto.randomUUID() });
  const message2 = new StandardMessageEntity({ partitionKey: crypto.randomUUID(), rowKey: crypto.randomUUID() });

  beforeEach(() => {
    resetIndexedDb();
  });

  test("returns empty array when no items exist for partitionKey", async () => {
    expect.hasAssertions();

    const result = await readIndexedDb(MessageIndexedDbStoreConfiguration, message1.partitionKey);

    expect(result).toHaveLength(0);
  });

  test("returns written items for the given partitionKey", async () => {
    expect.hasAssertions();

    const messages = [message1, message2];
    await writeIndexedDb(MessageIndexedDbStoreConfiguration, messages, message1.partitionKey);

    const result = await readIndexedDb(MessageIndexedDbStoreConfiguration, message1.partitionKey);

    expect(result).toHaveLength(2);
  });

  test("only returns items for the requested partitionKey", async () => {
    expect.hasAssertions();

    await writeIndexedDb(MessageIndexedDbStoreConfiguration, [message1], message1.partitionKey);
    await writeIndexedDb(MessageIndexedDbStoreConfiguration, [message2], message2.partitionKey);

    const result = await readIndexedDb(MessageIndexedDbStoreConfiguration, message1.partitionKey);

    expect(result).toHaveLength(1);
    expect(result[0]?.partitionKey).toBe(message1.partitionKey);
  });

  test("overwrites existing items on re-write", async () => {
    expect.hasAssertions();

    await writeIndexedDb(MessageIndexedDbStoreConfiguration, [message1], message1.partitionKey);
    await writeIndexedDb(MessageIndexedDbStoreConfiguration, [message1], message1.partitionKey);

    const result = await readIndexedDb(MessageIndexedDbStoreConfiguration, message1.partitionKey);

    expect(result).toHaveLength(1);
    expect(takeOne(result)).toBe(message1);
  });

  test("respects the limit from configuration", async () => {
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
});
