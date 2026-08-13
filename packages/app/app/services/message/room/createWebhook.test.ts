import type { WebhookInMessage } from "@esposter/db-schema";

import { describe } from "vitest";

export const createWebhook = (overrides: Partial<WebhookInMessage> = {}): WebhookInMessage => ({
  createdAt: new Date(0),
  creatorId: crypto.randomUUID(),
  deletedAt: null,
  id: crypto.randomUUID(),
  isActive: true,
  name: "name",
  roomId: crypto.randomUUID(),
  token: "token",
  updatedAt: new Date(0),
  userId: crypto.randomUUID(),
  ...overrides,
});

describe.todo("createWebhook");
