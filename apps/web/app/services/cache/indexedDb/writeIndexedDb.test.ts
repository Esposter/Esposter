import { MessageIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MessageIndexedDbStoreConfiguration";
import { RoomIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/RoomIndexedDbStoreConfiguration";
import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";
import { setupIndexedDbSuite } from "@/services/cache/indexedDb/setupIndexedDbSuite.test";
import { writeIndexedDb } from "@/services/cache/indexedDb/writeIndexedDb";
import { createMessage } from "@/services/message/message/createMessage.test";
import { createRoom } from "@/services/message/room/createRoom.test";
import { takeOne } from "@esposter/shared";
import { v7 } from "uuid";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(writeIndexedDb, () => {
  const { message1, message2, message3 } = setupIndexedDbSuite();
  const userId = v7();
  const room = createRoom("");

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("replaces existing items on re-write", async () => {
    expect.hasAssertions();

    await writeIndexedDb(MessageIndexedDbStoreConfiguration, [message1, message3], message1.roomId);
    await writeIndexedDb(MessageIndexedDbStoreConfiguration, [message1], message1.roomId);
    const result = await readIndexedDb(MessageIndexedDbStoreConfiguration, message1.roomId);

    expect(result).toHaveLength(1);
    expect(takeOne(result)).toStrictEqual(message1);
  });

  test("does not exceed limit from configuration", async () => {
    expect.hasAssertions();

    const { limit } = MessageIndexedDbStoreConfiguration;
    const messages = Array.from({ length: limit + 1 }, (_value, index) => ({
      ...createMessage(message1.roomId),
      id: index + 1,
    }));
    await writeIndexedDb(MessageIndexedDbStoreConfiguration, messages, message1.roomId);
    const result = await readIndexedDb(MessageIndexedDbStoreConfiguration, message1.roomId);

    expect(result).toHaveLength(limit);
  });

  test("does not affect other rooms", async () => {
    expect.hasAssertions();

    await writeIndexedDb(MessageIndexedDbStoreConfiguration, [message1], message1.roomId);
    await writeIndexedDb(MessageIndexedDbStoreConfiguration, [message2], message2.roomId);

    const result1 = await readIndexedDb(MessageIndexedDbStoreConfiguration, message1.roomId);
    const result2 = await readIndexedDb(MessageIndexedDbStoreConfiguration, message2.roomId);

    expect(result1).toHaveLength(1);
    expect(result2).toHaveLength(1);
    expect(takeOne(result1)).toStrictEqual(message1);
    expect(takeOne(result2)).toStrictEqual(message2);
  });

  test("stamps the partition onto items that do not already carry it", async () => {
    expect.hasAssertions();

    await writeIndexedDb(RoomIndexedDbStoreConfiguration, [room], userId);

    const result = await readIndexedDb(RoomIndexedDbStoreConfiguration, userId);

    expect(result).toHaveLength(1);
    expect(takeOne(result)).toStrictEqual(Object.assign(structuredClone(room), { viewerId: userId }));
  });

  test("reports a refused write to its caller", async () => {
    expect.hasAssertions();

    const error = new Error(" ");
    vi.spyOn(indexedDB, "open").mockImplementation(() => {
      throw error;
    });

    await expect(
      writeIndexedDb(MessageIndexedDbStoreConfiguration, [message1], message1.roomId),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);
  });
});
