import type { CompositeKey } from "@esposter/azure";
import type { AzureTable, AzureTableEntityMap, CustomTableClient } from "@esposter/db-schema";

import { createMessage } from "#src/services/message/createMessage";
import { getReverseTickedTimestamp, MessageType } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

// The two clients as the sole seam this service has: the ascending index is written first and must be taken back
// When the entity write rejects, which is what these assert.
const createTableClients = (createEntityError?: Error) => {
  const messageAscendingClient = {
    createEntity: vi.fn<(entity: CompositeKey) => Promise<object>>(() => Promise.resolve({})),
    deleteEntity: vi.fn<() => Promise<object>>(() => Promise.resolve({})),
  };
  const messageClient = {
    createEntity: vi.fn<() => Promise<object>>(() =>
      createEntityError ? Promise.reject(createEntityError) : Promise.resolve({}),
    ),
  };
  return {
    messageAscendingClient: messageAscendingClient as unknown as CustomTableClient<
      AzureTableEntityMap[AzureTable.MessagesAscending]
    >,
    messageAscendingMock: messageAscendingClient,
    messageClient: messageClient as unknown as CustomTableClient<AzureTableEntityMap[AzureTable.Messages]>,
    messageMock: messageClient,
  };
};

describe(createMessage, () => {
  const ROOM_ID = crypto.randomUUID();

  // No url in the message, so the entity needs no link-preview fetch
  const input = {
    message: "message",
    roomId: ROOM_ID,
    type: MessageType.Message,
    userId: crypto.randomUUID(),
  } as const;

  test("writes the index row before the entity", async () => {
    expect.hasAssertions();

    const { messageAscendingClient, messageAscendingMock, messageClient, messageMock } = createTableClients();
    const messageEntity = await createMessage(messageClient, messageAscendingClient, input);

    // The order is the behaviour, not an implementation detail: it is what makes a rejection mean nothing is
    // Readable, so asserting only the index arguments would pass just as well against the reverse order
    expect(takeOne(messageAscendingMock.createEntity.mock.invocationCallOrder)).toBeLessThan(
      takeOne(messageMock.createEntity.mock.invocationCallOrder),
    );
    // The index is keyed by the real timestamp, the entity by its reverse tick — the two must address one message
    expect(messageAscendingMock.createEntity).toHaveBeenCalledExactlyOnceWith(
      { partitionKey: ROOM_ID, rowKey: getReverseTickedTimestamp(messageEntity.rowKey) },
      undefined,
    );
    expect(messageEntity.partitionKey).toBe(ROOM_ID);
  });

  // Ascending reads join through the index and skip what they cannot match — they must, since a soft delete leaves
  // The same shape — so an index row whose entity never lands is a row every page reads and discards forever
  test("removes the index row again when the entity write fails", async () => {
    expect.hasAssertions();

    const createMessageEntityError = new Error("Table write failed");
    const { messageAscendingClient, messageAscendingMock, messageClient } =
      createTableClients(createMessageEntityError);

    await expect(
      createMessage(messageClient, messageAscendingClient, input),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Table write failed]`);
    // The row taken back is the row written, not merely some row
    const [indexEntity] = takeOne(messageAscendingMock.createEntity.mock.calls);

    expect(messageAscendingMock.deleteEntity).toHaveBeenCalledExactlyOnceWith(ROOM_ID, indexEntity.rowKey);
  });
});
