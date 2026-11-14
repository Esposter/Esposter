import type { WebhookInMessage } from "@esposter/db-schema";

import { v7 } from "uuid";
import { describe } from "vitest";

export const createWebhook = (overrides: Partial<WebhookInMessage> = {}): WebhookInMessage => ({
  createdAt: new Date(0),
  creatorId: v7(),
  deletedAt: null,
  id: v7(),
  isActive: true,
  name: "name",
  roomId: v7(),
  token: "token",
  updatedAt: new Date(0),
  userId: v7(),
  ...overrides,
});

describe.todo("createWebhook");
