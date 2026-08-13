import type { AppUserInMessage } from "@/schema/appUsersInMessage";

import { MessageEntityMap } from "@/models/message/MessageEntityMap";
import { MessageType, MessageTypes } from "@/models/message/MessageType";
import { createMessageEntity } from "@/services/message/createMessageEntity";
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

  // MessageEntityMap is the one answer to which class a message type instantiates, so every type is checked
  // Against it rather than against the two classes a hand-written branch happened to name
  test("instantiates the class MessageEntityMap names for every message type", () => {
    expect.hasAssertions();

    for (const type of MessageTypes) expect(createEntity(type)).toBeInstanceOf(MessageEntityMap[type]);
  });

  test("keys the entity by room id", () => {
    expect.hasAssertions();

    expect(createEntity(MessageType.Message).partitionKey).toBe(roomId);
  });
});
