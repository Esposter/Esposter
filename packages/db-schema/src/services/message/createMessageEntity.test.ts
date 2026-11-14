import type { AppUserInMessage } from "#src/schema/message/appUsersInMessage";

import { MessageType } from "#src/models/message/MessageType";
import { createMessageEntity } from "#src/services/message/createMessageEntity";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(createMessageEntity, () => {
  const createdAt = new Date(0);
  const appUser: AppUserInMessage = {
    createdAt,
    deletedAt: null,
    id: v7(),
    image: "image",
    name: "name",
    updatedAt: createdAt,
  };
  const roomId = v7();

  test("keys the entity by room id", () => {
    expect.hasAssertions();

    expect(createMessageEntity({ appUser, roomId, type: MessageType.Message, userId: v7() }).partitionKey).toBe(roomId);
  });
});
