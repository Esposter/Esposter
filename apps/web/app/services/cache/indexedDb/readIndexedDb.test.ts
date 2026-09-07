import { MessageIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MessageIndexedDbStoreConfiguration";
import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";
import { setupIndexedDbSuite } from "@/services/cache/indexedDb/setupIndexedDbSuite.test";
import { writeIndexedDb } from "@/services/cache/indexedDb/writeIndexedDb";
import { takeOne } from "@esposter/shared";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(readIndexedDb, () => {
  const { message1, message2 } = setupIndexedDbSuite();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns empty array when no items exist for partitionKey", async () => {
    expect.hasAssertions();

    const result = await readIndexedDb(MessageIndexedDbStoreConfiguration, message1.partitionKey);

    expect(result).toHaveLength(0);
  });

  test("only returns items for the requested partitionKey", async () => {
    expect.hasAssertions();

    await writeIndexedDb(MessageIndexedDbStoreConfiguration, [message1], message1.partitionKey);
    await writeIndexedDb(MessageIndexedDbStoreConfiguration, [message2], message2.partitionKey);

    const result = await readIndexedDb(MessageIndexedDbStoreConfiguration, message1.partitionKey);

    expect(result).toHaveLength(1);
    expect(takeOne(result)).toStrictEqual(message1.toJSON());
  });

  test("reports a refused read to its caller", async () => {
    expect.hasAssertions();

    const error = new Error("error");
    vi.spyOn(indexedDB, "open").mockImplementation(() => {
      throw error;
    });

    await expect(
      readIndexedDb(MessageIndexedDbStoreConfiguration, message1.partitionKey),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: ${error.message}]`);
  });
});
