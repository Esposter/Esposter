import type { WebhookInMessage, WebhookPayload } from "@esposter/db-schema";

import { getWebhookCreateMessageInput } from "@/services/getWebhookCreateMessageInput";
import { MessageType } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(getWebhookCreateMessageInput, () => {
  const webhook: Pick<WebhookInMessage, "roomId" | "userId"> = {
    roomId: crypto.randomUUID(),
    userId: crypto.randomUUID(),
  };
  const payload: WebhookPayload = {
    avatar_url: "url",
    content: "content",
    username: "username",
  };

  test("maps payload and webhook to create message input", () => {
    expect.hasAssertions();

    const result = getWebhookCreateMessageInput(payload, webhook);

    expect(result).toStrictEqual({
      appUser: { id: webhook.userId, image: payload.avatar_url, name: payload.username },
      message: payload.content,
      roomId: webhook.roomId,
      type: MessageType.Webhook,
    });
  });
});
