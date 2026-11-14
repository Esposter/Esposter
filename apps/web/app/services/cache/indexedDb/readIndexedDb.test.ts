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

  test("returns empty array when no items exist for the room", async () => {
    expect.hasAssertions();

    const result = await readIndexedDb(MessageIndexedDbStoreConfiguration, message1.roomId);

    expect(result).toHaveLength(0);
  });

  test("only returns items for the requested room", async () => {
    expect.hasAssertions();

    await writeIndexedDb(MessageIndexedDbStoreConfiguration, [message1], message1.roomId);
    await writeIndexedDb(MessageIndexedDbStoreConfiguration, [message2], message2.roomId);

    const result = await readIndexedDb(MessageIndexedDbStoreConfiguration, message1.roomId);

    expect(result).toHaveLength(1);
    expect(takeOne(result)).toStrictEqual(message1);
  });

  test("reports a refused read to its caller", async () => {
    expect.hasAssertions();

    const error = new Error(" ");
    vi.spyOn(indexedDB, "open").mockImplementation(() => {
      throw error;
    });

    await expect(
      readIndexedDb(MessageIndexedDbStoreConfiguration, message1.roomId),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);
  });
});
