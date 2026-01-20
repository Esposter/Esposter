import type { AppUser } from "@/schema/appUsers";

import { MessageType } from "@/models/message/MessageType";
import { StandardMessageEntity } from "@/models/message/StandardMessageEntity";
import { WebhookMessageEntity } from "@/models/message/WebhookMessageEntity";
import { createMessageEntity } from "@/services/message/createMessageEntity";
import { describe, expect, test, vi } from "vitest";

const rowKey = "rowKey";

vi.mock(import("@/services/azure/table/getReverseTickedTimestamp"), () => ({
  getReverseTickedTimestamp: () => rowKey,
}));

describe(createMessageEntity, () => {
  const createdAt = new Date();
  const appUser: AppUser = {
    createdAt,
    deletedAt: null,
    id: crypto.randomUUID(),
    image: "image",
    name: "name",
    updatedAt: createdAt,
  };
  const roomId = crypto.randomUUID();
  const userId = crypto.randomUUID();

  test("creates", () => {
    expect.hasAssertions();

    const newMessageEntity = createMessageEntity({ appUser, roomId, type: MessageType.Message, userId });

    expect(newMessageEntity).toBeInstanceOf(StandardMessageEntity);
    expect(newMessageEntity).toStrictEqual(expect.objectContaining({ partitionKey: roomId, rowKey }));
  });

  test("creates webhook", () => {
    expect.hasAssertions();

    const newMessageEntity = createMessageEntity({ appUser, roomId, type: MessageType.Webhook });

    expect(newMessageEntity).toBeInstanceOf(WebhookMessageEntity);
    expect(newMessageEntity).toStrictEqual(expect.objectContaining({ partitionKey: roomId, rowKey }));
  });
});
