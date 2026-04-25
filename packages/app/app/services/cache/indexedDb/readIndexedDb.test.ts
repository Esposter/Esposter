import { MemberIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MemberIndexedDbStoreConfiguration";
import { MessageIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MessageIndexedDbStoreConfiguration";
import { resetIndexedDb } from "@/services/cache/indexedDb/openIndexedDb";
import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";
import { writeIndexedDb } from "@/services/cache/indexedDb/writeIndexedDb";
import { beforeEach, describe, expect, test } from "vitest";

describe(readIndexedDb, () => {
  const id = crypto.randomUUID();

  beforeEach(() => {
    resetIndexedDb();
  });

  test("returns empty array when no items exist for partitionKey", async () => {
    expect.hasAssertions();

    const result = await readIndexedDb(MemberIndexedDbStoreConfiguration, PARTITION_KEY_A);

    expect(result).toHaveLength(0);
  });

  test("returns written items for the given partitionKey", async () => {
    expect.hasAssertions();

    const messages = [createMessage(PARTITION_KEY_A, "row-1"), createMessage(PARTITION_KEY_A, "row-2")];
    await writeIndexedDb(MessageIndexedDbStoreConfiguration, messages, PARTITION_KEY_A);

    const result = await readIndexedDb(MessageIndexedDbStoreConfiguration, PARTITION_KEY_A);

    expect(result).toHaveLength(2);
  });

  test("only returns items for the requested partitionKey", async () => {
    expect.hasAssertions();

    await writeIndexedDb(
      MessageIndexedDbStoreConfiguration,
      [createMessage(PARTITION_KEY_A, "row-1")],
      PARTITION_KEY_A,
    );
    await writeIndexedDb(
      MessageIndexedDbStoreConfiguration,
      [createMessage(PARTITION_KEY_B, "row-2")],
      PARTITION_KEY_B,
    );

    const result = await readIndexedDb(MessageIndexedDbStoreConfiguration, PARTITION_KEY_A);

    expect(result).toHaveLength(1);
    expect(result[0]?.partitionKey).toBe(PARTITION_KEY_A);
  });

  test("overwrites existing items on re-write", async () => {
    expect.hasAssertions();

    const original = [createMessage(PARTITION_KEY_A, "row-1", "original")];
    const updated = [createMessage(PARTITION_KEY_A, "row-1", "updated")];
    await writeIndexedDb(MessageIndexedDbStoreConfiguration, original, PARTITION_KEY_A);
    await writeIndexedDb(MessageIndexedDbStoreConfiguration, updated, PARTITION_KEY_A);

    const result = await readIndexedDb(MessageIndexedDbStoreConfiguration, PARTITION_KEY_A);

    expect(result).toHaveLength(1);
    expect(result[0]?.content).toBe("updated");
  });

  test("respects the limit from configuration", async () => {
    expect.hasAssertions();

    const { limit } = MessageIndexedDbStoreConfiguration;
    const messages = Array.from({ length: limit + 10 }, (_, index) => createMessage(PARTITION_KEY_A, `row-${index}`));
    await writeIndexedDb(MessageIndexedDbStoreConfiguration, messages, PARTITION_KEY_A);

    const result = await readIndexedDb(MessageIndexedDbStoreConfiguration, PARTITION_KEY_A);

    expect(result).toHaveLength(limit);
  });
});
