import type { StreamTable, StreamTableEntityMap, CreateMessageInput, StandardMessageType } from "@esposter/db-schema";
import type { StreamTableClient } from "#src/models/streams/StreamTableClient";

import { createMessage } from "#src/services/message/createMessage";
import { MessageType } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

const createTableClient = (createEntityError?: Error) => {
  const messageClient = {
    createEntity: vi.fn<(entity: object) => Promise<object>>(() =>
      createEntityError ? Promise.reject(createEntityError) : Promise.resolve({}),
    ),
  };
  return {
    messageClient: messageClient as unknown as StreamTableClient<StreamTableEntityMap[StreamTable.Messages]>,
    messageMock: messageClient,
  };
};

const storeAndReadDefaults = async (messageInput: CreateMessageInput) => {
  const { messageClient, messageMock } = createTableClient();
  await createMessage(messageClient, messageInput);
  const [storedEntity] = takeOne(messageMock.createEntity.mock.calls) as [
    { mentions: unknown; message: unknown; replyRowKey: unknown },
  ];

  return { mentions: storedEntity.mentions, message: storedEntity.message, replyRowKey: storedEntity.replyRowKey };
};

describe(createMessage, () => {
  const ROOM_ID = crypto.randomUUID();
  const storedDefaults = { mentions: [], message: "", replyRowKey: "" };

  // No url in the message, so the entity needs no link-preview fetch
  const input = {
    message: "message",
    roomId: ROOM_ID,
    type: MessageType.Message,
    userId: crypto.randomUUID(),
  } as const;

  test("writes the message as one row and returns it", async () => {
    expect.hasAssertions();

    const { messageClient, messageMock } = createTableClient();
    const messageEntity = await createMessage(messageClient, input);

    expect(messageMock.createEntity).toHaveBeenCalledExactlyOnceWith(messageEntity);
  });

  test("rejects when the row write fails, so nothing is left readable", async () => {
    expect.hasAssertions();

    const { messageClient } = createTableClient(new Error("write failed"));

    await expect(createMessage(messageClient, input)).rejects.toThrow("write failed");
  });

  test.each<StandardMessageType>([
    MessageType.Call,
    MessageType.EditRoom,
    MessageType.Message,
    MessageType.PinMessage,
    MessageType.Poll,
    MessageType.System,
  ])("stores a %s message with its mentions, message and reply row key present", async (type) => {
    expect.hasAssertions();

    await expect(
      storeAndReadDefaults({
        message: undefined,
        replyRowKey: undefined,
        roomId: ROOM_ID,
        type,
        userId: crypto.randomUUID(),
      }),
    ).resolves.toStrictEqual(storedDefaults);
  });

  test("stores a webhook message with its mentions, message and reply row key present", async () => {
    expect.hasAssertions();

    await expect(
      storeAndReadDefaults({
        appUser: { id: crypto.randomUUID() },
        message: undefined,
        roomId: ROOM_ID,
        type: MessageType.Webhook,
      }),
    ).resolves.toStrictEqual(storedDefaults);
  });
});
