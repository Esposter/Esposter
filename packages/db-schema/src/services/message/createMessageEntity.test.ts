import type { AppUserInMessage } from "#src/schema/appUsersInMessage";

import { MessageType, MessageTypes } from "#src/models/message/MessageType";
import { MessageTypeEntityMap } from "#src/models/message/MessageTypeEntityMap";
import { createMessageEntity } from "#src/services/message/createMessageEntity";
import { describe, expect, test } from "vitest";

describe(createMessageEntity, () => {
  const createdAt = new Date();
  const appUser: AppUserInMessage = {
    createdAt,
    deletedAt: null,
    id: crypto.randomUUID(),
    image: "image",
    name: "name",
    updatedAt: createdAt,
  };
  const roomId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const createEntity = (type: MessageType) =>
    createMessageEntity(type === MessageType.Webhook ? { appUser, roomId, type } : { appUser, roomId, type, userId });

  // MessageTypeEntityMap is the one answer to which class a message type instantiates, so every type is checked
  // Against it rather than against the two classes a hand-written branch happened to name
  test("instantiates the class MessageTypeEntityMap names for every message type", () => {
    expect.hasAssertions();

    for (const type of MessageTypes) expect(createEntity(type)).toBeInstanceOf(MessageTypeEntityMap[type]);
  });

  test("keys the entity by room id", () => {
    expect.hasAssertions();

    expect(createEntity(MessageType.Message).partitionKey).toBe(roomId);
  });
});
