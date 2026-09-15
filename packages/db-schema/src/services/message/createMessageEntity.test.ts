import type { AppUserInMessage } from "#src/schema/appUsersInMessage";

import { MessageType } from "#src/models/message/MessageType";
import { createMessageEntity } from "#src/services/message/createMessageEntity";
import { describe, expect, test } from "vitest";

describe(createMessageEntity, () => {
  const createdAt = new Date(0);
  const appUser: AppUserInMessage = {
    createdAt,
    deletedAt: null,
    id: crypto.randomUUID(),
    image: "image",
    name: "name",
    updatedAt: createdAt,
  };
  const roomId = crypto.randomUUID();

  test("keys the entity by room id", () => {
    expect.hasAssertions();

    expect(
      createMessageEntity({ appUser, roomId, type: MessageType.Message, userId: crypto.randomUUID() }).partitionKey,
    ).toBe(roomId);
  });
});
